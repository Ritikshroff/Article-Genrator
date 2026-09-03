# ─────────────────────────────────────────────────────────────
# routers/articles_router.py
# Full CRUD + workflow endpoints for articles
# ─────────────────────────────────────────────────────────────

from datetime import datetime, timezone
from typing import Optional

from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status

from models import User, Article
from auth import get_current_user, require_editor
from schemas import (
    ArticleCreate,
    ArticleUpdate,
    ArticleResponse,
    ArticleListItem,
    ArticleListResponse,
    ReviewAction,
)

router = APIRouter(prefix="/articles", tags=["Articles"])


# ── Helpers ───────────────────────────────────────────────────

def _article_to_response(article: Article) -> ArticleResponse:
    return ArticleResponse(
        id=str(article.id),
        title=article.title,
        publication=article.publication,
        status=article.status,
        created_by_id=article.created_by_id,
        created_by_name=article.created_by_name,
        reviewed_by_id=article.reviewed_by_id,
        reviewed_by_name=article.reviewed_by_name,
        press_release=article.press_release,
        news_data=article.news_data,
        seo_data=article.seo_data,
        impact_data=article.impact_data,
        interview_data=article.interview_data,
        review_data=article.review_data,
        social_data=article.social_data,
        creative_data=article.creative_data,
        editor_notes=article.editor_notes,
        created_at=article.created_at,
        updated_at=article.updated_at,
    )


def _article_to_list_item(article: Article) -> ArticleListItem:
    return ArticleListItem(
        id=str(article.id),
        title=article.title,
        publication=article.publication,
        status=article.status,
        created_by_name=article.created_by_name,
        reviewed_by_name=article.reviewed_by_name,
        created_at=article.created_at,
        updated_at=article.updated_at,
    )


async def _get_article_or_404(article_id: str) -> Article:
    try:
        obj_id = PydanticObjectId(article_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid article ID format")
    article = await Article.get(obj_id)
    if article is None:
        raise HTTPException(status_code=404, detail="Article not found")
    return article


def _check_own_article(article: Article, user: User) -> None:
    """Raise 403 if author tries to access another user's article."""
    if user.role == "editor":
        return  # Editors can access everything
    if article.created_by_id != str(user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only access your own articles",
        )


# ── REVIEW QUEUE (Editor only) ─── must be before /{id} ──────

@router.get("/review/queue", response_model=ArticleListResponse)
async def get_review_queue(current_user: User = Depends(require_editor)):
    """Get all articles with status 'submitted' awaiting editor review."""
    articles = await Article.find(
        Article.status == "submitted"
    ).project(ArticleListItem).sort("-created_at").to_list()

    return ArticleListResponse(
        articles=articles,
        total=len(articles),
    )


# ── CREATE ────────────────────────────────────────────────────

@router.post("", response_model=ArticleResponse, status_code=status.HTTP_201_CREATED)
async def create_article(
    body: ArticleCreate,
    current_user: User = Depends(get_current_user),
):
    """Save a newly generated article as draft."""
    if current_user.role == "editor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Editors do not have permission to generate or save new articles.",
        )
    article = Article(
        title=body.title,
        publication=body.publication,
        status="draft",
        created_by_id=str(current_user.id),
        created_by_name=current_user.full_name,
        press_release=body.press_release,
        news_data=body.news_data,
        seo_data=body.seo_data,
        impact_data=body.impact_data,
        interview_data=body.interview_data,
        review_data=body.review_data,
        social_data=body.social_data,
        creative_data=body.creative_data,
    )
    await article.insert()
    return _article_to_response(article)


# ── LIST ──────────────────────────────────────────────────────

@router.get("", response_model=ArticleListResponse)
async def list_articles(
    publication: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    current_user: User = Depends(get_current_user),
):
    """
    List articles.
    - Authors: own articles only.
    - Editors: all articles.
    """
    query_filters = {}

    # Authors can only see their own
    if current_user.role == "author":
        query_filters["created_by_id"] = str(current_user.id)

    if publication:
        query_filters["publication"] = publication
    if status_filter:
        query_filters["status"] = status_filter

    articles = await Article.find(query_filters).project(ArticleListItem).sort("-updated_at").to_list()

    return ArticleListResponse(
        articles=articles,
        total=len(articles),
    )


# ── READ ──────────────────────────────────────────────────────

@router.get("/{article_id}", response_model=ArticleResponse)
async def get_article(
    article_id: str,
    current_user: User = Depends(get_current_user),
):
    """Get a single article with all sections."""
    article = await _get_article_or_404(article_id)
    _check_own_article(article, current_user)
    return _article_to_response(article)


# ── UPDATE ────────────────────────────────────────────────────

@router.put("/{article_id}", response_model=ArticleResponse)
async def update_article(
    article_id: str,
    body: ArticleUpdate,
    current_user: User = Depends(get_current_user),
):
    """
    Update article content.
    - Authors: own drafts or revision_requested only.
    - Editors: any article.
    """
    article = await _get_article_or_404(article_id)
    _check_own_article(article, current_user)

    # Authors can only edit drafts or revision-requested articles
    if current_user.role == "author" and article.status not in ("draft", "revision_requested"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only edit draft or revision-requested articles",
        )

    update_data = body.model_dump(exclude_unset=True)
    update_data["updated_at"] = datetime.now(timezone.utc)

    # If author re-edits a revision_requested article, reset to draft
    if current_user.role == "author" and article.status == "revision_requested":
        update_data["status"] = "draft"

    await article.set(update_data)
    return _article_to_response(article)


# ── DELETE ────────────────────────────────────────────────────

@router.delete("/{article_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_article(
    article_id: str,
    current_user: User = Depends(get_current_user),
):
    """
    Delete an article.
    - Authors: own drafts only.
    - Editors: any article.
    """
    article = await _get_article_or_404(article_id)
    _check_own_article(article, current_user)

    if current_user.role == "author" and article.status != "draft":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Authors can only delete their own draft articles",
        )

    await article.delete()


# ── SUBMIT FOR REVIEW ─────────────────────────────────────────

@router.post("/{article_id}/submit", response_model=ArticleResponse)
async def submit_for_review(
    article_id: str,
    current_user: User = Depends(get_current_user),
):
    """Author submits a draft article for editor review."""
    article = await _get_article_or_404(article_id)
    _check_own_article(article, current_user)

    if article.status not in ("draft", "revision_requested"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot submit an article with status '{article.status}'",
        )

    await article.set({
        "status": "submitted",
        "updated_at": datetime.now(timezone.utc),
    })
    return _article_to_response(article)


# ── EDITOR REVIEW ─────────────────────────────────────────────

@router.post("/{article_id}/review", response_model=ArticleResponse)
async def review_article(
    article_id: str,
    body: ReviewAction,
    current_user: User = Depends(require_editor),
):
    """Editor approves or requests revision on a submitted article."""
    article = await _get_article_or_404(article_id)

    if article.status != "submitted":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Can only review articles with status 'submitted', got '{article.status}'",
        )

    new_status = "approved" if body.action == "approve" else "revision_requested"

    await article.set({
        "status": new_status,
        "reviewed_by_id": str(current_user.id),
        "reviewed_by_name": current_user.full_name,
        "editor_notes": body.notes or "",
        "updated_at": datetime.now(timezone.utc),
    })
    return _article_to_response(article)
