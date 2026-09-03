import io
import re
from typing import Optional, Tuple
from bs4 import BeautifulSoup

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract clean text from PDF file bytes."""
    try:
        import pypdf
        reader = pypdf.PdfReader(io.BytesIO(file_bytes))
        extracted_text = []
        for page in reader.pages:
            t = page.extract_text()
            if t:
                extracted_text.append(t)
        return "\n\n".join(extracted_text).strip()
    except Exception as e:
        print(f"[EmailParser] Error extracting PDF text: {e}")
        return ""

def extract_text_from_docx(file_bytes: bytes) -> str:
    """Extract clean text from DOCX Word file bytes."""
    try:
        import docx
        doc = docx.Document(io.BytesIO(file_bytes))
        paragraphs = [p.text.strip() for p in doc.paragraphs if p.text.strip()]
        return "\n\n".join(paragraphs).strip()
    except Exception as e:
        print(f"[EmailParser] Error extracting DOCX text: {e}")
        return ""

def clean_html_email_body(html_content: str) -> str:
    """Strip HTML markup, corporate disclaimers, and signatures from email body."""
    if not html_content:
        return ""
    try:
        soup = BeautifulSoup(html_content, "html.parser")
        
        # Remove script and style elements
        for script in soup(["script", "style", "footer"]):
            script.decompose()

        text = soup.get_text(separator="\n")
        
        # Clean up whitespace and disclaimers
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        clean_text = "\n".join(chunk for chunk in chunks if chunk)
        
        # Remove common email disclaimers
        disclaimer_keywords = [
            "This email and any files transmitted with it are confidential",
            "UNSUBSCRIBE", "Click here to unsubscribe", "PRIVACY POLICY"
        ]
        for kw in disclaimer_keywords:
            if kw in clean_text:
                clean_text = clean_text.split(kw)[0].strip()

        return clean_text
    except Exception as e:
        print(f"[EmailParser] Error cleaning HTML body: {e}")
        return html_content

def parse_inbound_pr_payload(
    file_name: Optional[str] = None,
    file_bytes: Optional[bytes] = None,
    body_text: Optional[str] = None,
    body_html: Optional[str] = None
) -> Tuple[str, str]:
    """
    Inspects incoming payload and extracts press release text.
    Returns: (extracted_pr_text, source_type)
    """
    if file_name and file_bytes:
        ext = file_name.lower().split(".")[-1] if "." in file_name else ""
        if ext == "pdf":
            text = extract_text_from_pdf(file_bytes)
            if len(text) > 100:
                return text, f"PDF Attachment ({file_name})"
        elif ext in ["docx", "doc"]:
            text = extract_text_from_docx(file_bytes)
            if len(text) > 100:
                return text, f"Word Attachment ({file_name})"
        elif ext == "txt":
            try:
                text = file_bytes.decode("utf-8", errors="ignore").strip()
                if len(text) > 100:
                    return text, f"Text Attachment ({file_name})"
            except Exception:
                pass

    # Fallback to email body
    if body_html:
        clean_body = clean_html_email_body(body_html)
        if len(clean_body) > 100:
            return clean_body, "Email Body (HTML)"

    if body_text and len(body_text.strip()) > 100:
        return body_text.strip(), "Email Body (Text)"

    return "", "Unknown"
