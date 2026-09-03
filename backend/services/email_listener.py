import os
import asyncio
import imaplib
import email
from email.header import decode_header
from typing import Dict, Any, Optional

from services.email_parser import parse_inbound_pr_payload
from services.pr_classifier import classify_pr_content

class IMAPEmailPoller:
    """
    Background IMAP Listener Service for auto-ingesting incoming PR emails.
    Logs into Outlook/Exchange/IMAP server, fetches UNSEEN messages, extracts PRs,
    and forwards them to the AI generation pipeline.
    """

    def __init__(self):
        self.server = os.getenv("IMAP_SERVER", "outlook.office365.com")
        self.port = int(os.getenv("IMAP_PORT", "993"))
        self.user = os.getenv("IMAP_USER", "")
        self.password = os.getenv("IMAP_PASSWORD", "")
        self.enabled = os.getenv("ENABLE_IMAP_POLLER", "false").lower() == "true"
        self.running = False

    def is_configured(self) -> bool:
        return bool(self.enabled and self.user and self.password)

    def decode_mime_words(self, header_val: str) -> str:
        if not header_val:
            return ""
        decoded = []
        for word, enc in decode_header(header_val):
            if isinstance(word, bytes):
                decoded.append(word.decode(enc or "utf-8", errors="ignore"))
            else:
                decoded.append(str(word))
        return "".join(decoded)

    def fetch_unread_emails(self):
        """Fetch and process unread PR emails synchronously."""
        if not self.is_configured():
            return []

        processed = []
        try:
            mail = imaplib.IMAP4_SSL(self.server, self.port)
            mail.login(self.user, self.password)
            mail.select("inbox")

            status, messages = mail.search(None, "UNSEEN")
            if status != "OK" or not messages[0]:
                mail.logout()
                return []

            email_ids = messages[0].split()
            print(f"[IMAPPoller] Found {len(email_ids)} new unread email(s).")

            for e_id in email_ids:
                res, msg_data = mail.fetch(e_id, "(RFC822)")
                if res != "OK":
                    continue

                raw_email = msg_data[0][1]
                msg = email.message_from_bytes(raw_email)

                subject = self.decode_mime_words(msg.get("Subject", ""))
                sender = self.decode_mime_words(msg.get("From", ""))

                body_text = ""
                body_html = ""
                file_bytes = None
                file_name = None

                if msg.is_multipart():
                    for part in msg.walk():
                        content_type = part.get_content_type()
                        disp = str(part.get("Content-Disposition", ""))

                        if "attachment" in disp:
                            fn = part.get_filename()
                            if fn:
                                file_name = self.decode_mime_words(fn)
                                file_bytes = part.get_payload(decode=True)
                        elif content_type == "text/plain" and not body_text:
                            body_text = part.get_payload(decode=True).decode("utf-8", errors="ignore")
                        elif content_type == "text/html" and not body_html:
                            body_html = part.get_payload(decode=True).decode("utf-8", errors="ignore")
                else:
                    body_text = msg.get_payload(decode=True).decode("utf-8", errors="ignore")

                pr_text, source = parse_inbound_pr_payload(
                    file_name=file_name,
                    file_bytes=file_bytes,
                    body_text=body_text,
                    body_html=body_html
                )

                if len(pr_text) > 100:
                    processed.append({
                        "subject": subject,
                        "sender": sender,
                        "source": source,
                        "pr_text": pr_text
                    })

            mail.logout()
        except Exception as err:
            print(f"[IMAPPoller] Error checking IMAP mailbox: {err}")

        return processed

    async def start_polling_loop(self, interval_seconds: int = 60):
        """Asynchronous loop for polling mailbox every N seconds."""
        if not self.is_configured():
            print("[IMAPPoller] Poller disabled or unconfigured. (Set ENABLE_IMAP_POLLER=true & IMAP credentials in .env)")
            return

        self.running = True
        print(f"[IMAPPoller] Started background polling loop for user: {self.user}")

        while self.running:
            try:
                emails = await asyncio.to_thread(self.fetch_unread_emails)
                for item in emails:
                    print(f"[IMAPPoller] Ingested PR from {item['sender']} | Subject: {item['subject']} | Source: {item['source']}")
            except Exception as e:
                print(f"[IMAPPoller] Loop error: {e}")
            await asyncio.sleep(interval_seconds)

    def stop(self):
        self.running = False

imap_poller = IMAPEmailPoller()
