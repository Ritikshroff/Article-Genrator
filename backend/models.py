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
    email: Optional[str] = None
    hashed_password: str
    full_name: str
    role: Literal["author", "editor"] = "author"
    team: str = "Editorial"
    can_review_pr: bool = False
    can_edit_ai_draft: bool = False
    can_approve: bool = False
    can_publish: bool = False
    can_access_monitoring: bool = False
    is_active: bool = True
    last_login_at: Optional[datetime] = None
    last_active_at: Optional[datetime] = None
    total_logins: int = 0
    total_active_seconds: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "users"
        indexes = [
            "email",
            "role",
            "last_active_at",
        ]


class ActivityLog(Document):
    """Event log capturing user activity, generations, reviews, and sessions."""

    user_id: str
    user_name: str
    user_role: Literal["author", "editor"]
    event_type: Literal[
        "login",
        "heartbeat",
        "generate_ai",
        "save_draft",
        "submit_review",
        "review_approve",
        "review_revision",
        "export_publive",
    ]
    publication: Optional[str] = None
    duration_seconds: Optional[int] = None
    details: Optional[dict] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "activity_logs"
        indexes = [
            "user_id",
            "event_type",
            "publication",
            [("created_at", -1)],
        ]


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

    # Author feedback / quality rating (1-5 stars, submitted by the article's own author)
    author_rating: Optional[int] = None        # 1 = poor … 5 = excellent
    author_rating_note: Optional[str] = None   # optional short comment from author
    author_rated_at: Optional[datetime] = None

    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "articles"
        indexes = [
            "created_by_id",
            "status",
            "publication",
            [("created_at", -1)],
        ]
