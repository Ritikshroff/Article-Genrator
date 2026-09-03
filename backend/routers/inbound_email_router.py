import os
from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends, Request
from pydantic import BaseModel

from models import Article, User
from auth import get_current_user
from services.email_parser import parse_inbound_pr_payload
from services.pr_classifier import classify_pr_content
from services.email_listener import imap_poller

router = APIRouter(prefix="/api/v1/inbound-email", tags=["Inbound Email Automation"])

class WebhookEmailPayload(BaseModel):
    subject: Optional[str] = ""
    sender: Optional[str] = ""
    recipient: Optional[str] = ""
    body_text: Optional[str] = ""
    body_html: Optional[str] = ""

@router.get("/status")
def get_inbound_status():
    """Returns the status of email ingestion services."""
    return {
        "imap_poller_enabled": imap_poller.enabled,
        "imap_user": imap_poller.user if imap_poller.enabled else None,
        "webhook_endpoint": "/api/v1/inbound-email/webhook",
        "parse_upload_endpoint": "/api/v1/inbound-email/parse-upload",
        "supported_formats": ["PDF (.pdf)", "Word (.docx)", "Text (.txt)", "Email HTML Body"]
    }

@router.post("/parse-upload")
async def parse_and_classify_file(
    file: Optional[UploadFile] = File(None),
    text_content: Optional[str] = Form(None),
    subject: Optional[str] = Form("")
):
    """
    Direct endpoint to parse an uploaded PR file (PDF, DOCX, TXT) or raw text
    and auto-classify publication and topic type.
    """
    file_bytes = None
    file_name = None

    if file:
        file_bytes = await file.read()
        file_name = file.filename

    pr_text, source_type = parse_inbound_pr_payload(
        file_name=file_name,
        file_bytes=file_bytes,
        body_text=text_content,
        body_html=None
    )

    if not pr_text or len(pr_text.strip()) < 50:
        raise HTTPException(
            status_code=400,
            detail="Could not extract valid press release content. File or text may be empty or unreadable."
        )

    # Run AI Classification
    classification = await classify_pr_content(pr_text, email_subject=subject or file_name or "")

    return {
        "success": True,
        "source": source_type,
        "extracted_pr_text": pr_text,
        "character_count": len(pr_text),
        "word_count": len(pr_text.split()),
        "classification": classification
    }

@router.post("/webhook")
async def handle_inbound_email_webhook(
    request: Request,
    subject: Optional[str] = Form(None),
    from_email: Optional[str] = Form(None),
    to_email: Optional[str] = Form(None),
    body_text: Optional[str] = Form(None),
    body_html: Optional[str] = Form(None),
    attachment: Optional[UploadFile] = File(None)
):
    """
    Inbound Webhook Endpoint for receiving PR emails (compatible with SendGrid, Mailgun, or direct HTTP POST).
    Automatically extracts PR, classifies magazine, and auto-saves draft to MongoDB for Editorial Review.
    """
    file_bytes = None
    file_name = None

    if attachment:
        file_bytes = await attachment.read()
        file_name = attachment.filename

    # If payload comes as JSON instead of Form
    if not body_text and not body_html and not file_bytes:
        try:
            json_body = await request.json()
            subject = subject or json_body.get("subject", "")
            from_email = from_email or json_body.get("sender", json_body.get("from", ""))
            body_text = json_body.get("body_text", json_body.get("text", ""))
            body_html = json_body.get("body_html", json_body.get("html", ""))
        except Exception:
            pass

    pr_text, source_type = parse_inbound_pr_payload(
        file_name=file_name,
        file_bytes=file_bytes,
        body_text=body_text,
        body_html=body_html
    )

    if not pr_text or len(pr_text.strip()) < 50:
        return {
            "status": "ignored",
            "reason": "Payload contained no readable press release text (less than 50 chars)."
        }

    # Run AI Classification
    classification = await classify_pr_content(pr_text, email_subject=subject or "")

    pub = classification.get("publication", "DATAQUEST").upper()
    topic = classification.get("topicType", "News")

    # Create headline fallback
    headline = subject.strip() if subject and len(subject.strip()) > 10 else f"Automated Draft: {pr_text[:60].strip()}..."

    # Auto-save draft directly into MongoDB as "submitted" (Awaiting Editorial Review)
    article = Article(
        title=headline,
        publication=pub,
        press_release=pr_text,
        news_data={
            "headline": headline,
            "subheading": f"Auto-ingested via {source_type} ({from_email or 'Inbound Email'})",
            "body": pr_text,
            "topic_type": topic,
            "source_type": source_type,
            "sender": from_email or "Unknown Inbound Sender"
        },
        seo_data={
            "meta_title": headline[:60],
            "meta_description": pr_text[:160]
        },
        social_data={},
        review_data={},
        creative_data={},
        created_by=f"Automated Email Ingestion ({from_email or 'Webhook'})",
        status="submitted"
    )

    await article.insert()

    return {
        "status": "success",
        "article_id": str(article.id),
        "publication": pub,
        "topic_type": topic,
        "source": source_type,
        "message": f"Successfully created draft article '{headline[:40]}...' awaiting review."
    }
