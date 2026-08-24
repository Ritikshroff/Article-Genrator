# ─────────────────────────────────────────────────────────────
# models.py
# Beanie ODM Document models — User & Article
# ─────────────────────────────────────────────────────────────

from datetime import datetime, timezone
from typing import Optional, Literal

from beanie import Document, Indexed
from pydantic import Field


class User(Document):
    """CyberMedia internal user (pre-seeded, no signup)."""

    username: Indexed(str, unique=True)
    hashed_password: str
    full_name: str
    role: Literal["author", "editor"] = "author"
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "users"


class Article(Document):
    """Saved editorial article with all generated sections."""

    title: str
    publication: str
    status: Literal[
        "draft",
        "submitted",
        "approved",
        "revision_requested",
        "published",
    ] = "draft"

    # Ownership
    created_by_id: str  # User document id as string
    created_by_name: str  # Denormalised for listing
    reviewed_by_id: Optional[str] = None
    reviewed_by_name: Optional[str] = None

    # Original input
    press_release: str

    # Generated sections — stored as flexible dicts (JSON blobs)
    news_data: Optional[dict] = None
    seo_data: Optional[dict] = None
    impact_data: Optional[dict] = None
    interview_data: Optional[dict] = None
    review_data: Optional[dict] = None
    social_data: Optional[dict] = None
    creative_data: Optional[dict] = None  # Image metadata (title, prompt — no base64 in DB)

    # Editor workflow
    editor_notes: Optional[str] = None

    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "articles"
