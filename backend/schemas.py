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
    full_name: str
    role: Literal["author", "editor"]
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


class ArticleResponse(BaseModel):
    id: str
    title: str
    publication: str
    status: str
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
    status: str
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
    rating: int          # Must be 1–5 (validated in the router)
    note: Optional[str] = None
