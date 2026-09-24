# ─────────────────────────────────────────────────────────────
# schemas.py
# Pydantic request / response models for the API
# ─────────────────────────────────────────────────────────────

from datetime import datetime
from typing import Optional, Literal, Annotated, Union

from pydantic import BaseModel, Field, BeforeValidator


# ── Auth ──────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"


class UserResponse(BaseModel):
    id: str
    username: str
    email: Optional[str] = None
    full_name: str
    role: Literal["author", "editor"]
    team: Optional[str] = "Editorial"
    can_review_pr: bool = False
    can_edit_ai_draft: bool = False
    can_approve: bool = False
    can_publish: bool = False
    can_access_monitoring: bool = False
    is_active: bool
    created_at: datetime


# ── Articles ──────────────────────────────────────────────────

class ArticleCreate(BaseModel):
    title: str
    publication: str
    press_release: str
    news_data: Optional[dict] = None
    seo_data: Optional[dict] = None
    impact_data: Optional[dict] = None
    interview_data: Optional[dict] = None
    review_data: Optional[dict] = None
    social_data: Optional[dict] = None
    creative_data: Optional[dict] = None


class ArticleUpdate(BaseModel):
    title: Optional[str] = None
    publication: Optional[str] = None
    news_data: Optional[dict] = None
    seo_data: Optional[dict] = None
    impact_data: Optional[dict] = None
    interview_data: Optional[dict] = None
    review_data: Optional[dict] = None
    social_data: Optional[dict] = None
    creative_data: Optional[dict] = None


ArticleStatus = Literal[
    "draft",
    "submitted",
    "approved",
    "revision_requested",
    "published",
]


class ArticleResponse(BaseModel):
    id: str
    title: str
    publication: str
    status: ArticleStatus
    created_by_id: str
    created_by_name: str
    reviewed_by_id: Optional[str] = None
    reviewed_by_name: Optional[str] = None
    press_release: str
    news_data: Optional[dict] = None
    seo_data: Optional[dict] = None
    impact_data: Optional[dict] = None
    interview_data: Optional[dict] = None
    review_data: Optional[dict] = None
    social_data: Optional[dict] = None
    creative_data: Optional[dict] = None
    editor_notes: Optional[str] = None
    author_rating: Optional[int] = None
    author_rating_note: Optional[str] = None
    author_rated_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class ArticleListItem(BaseModel):
    id: Annotated[str, BeforeValidator(str)] = Field(alias="_id", serialization_alias="id")
    title: str
    publication: str
    status: ArticleStatus
    created_by_name: str
    reviewed_by_name: Optional[str] = None
    author_rating: Optional[int] = None
    created_at: datetime
    updated_at: datetime


class ArticleListResponse(BaseModel):
    articles: list[ArticleListItem]
    total: int


class ReviewAction(BaseModel):
    action: Literal["approve", "request_revision"]
    notes: Optional[str] = None


class AuthorFeedback(BaseModel):
    rating: int = Field(..., ge=1, le=5, description="Author rating between 1 and 5")
    note: Optional[str] = None


# ── Analytics & Monitoring ───────────────────────────────────

class HeartbeatRequest(BaseModel):
    duration_seconds: int = Field(default=60, ge=1, le=3600)
    current_path: Optional[str] = None


class EventLogRequest(BaseModel):
    event_type: Literal[
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


class UserProductivityStats(BaseModel):
    user_id: str
    full_name: str
    username: str
    email: Optional[str] = None
    role: Literal["author", "editor"]
    team: str
    last_login_at: Optional[datetime] = None
    last_active_at: Optional[datetime] = None
    total_logins: int
    total_active_minutes: int
    status: Literal["active_today", "active_this_week", "inactive"]
    articles_drafted: int
    articles_submitted: int
    articles_approved: int
    articles_revision_requested: int
    avg_quality_rating: Optional[float] = None
    estimated_hours_saved: float


class AnalyticsOverviewResponse(BaseModel):
    total_registered_users: int
    active_users_today: int
    active_users_this_week: int
    adoption_rate_pct: float
    total_articles_generated: int
    total_articles_approved: int
    approval_rate_pct: float
    total_hours_saved: float
    publication_breakdown: dict[str, int]
    recent_activity: list[dict]
    team_productivity: list[UserProductivityStats]

