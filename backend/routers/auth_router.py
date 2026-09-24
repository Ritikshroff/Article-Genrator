# ─────────────────────────────────────────────────────────────
# routers/auth_router.py
# Authentication endpoints — login & current user
# ─────────────────────────────────────────────────────────────

from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, status, Depends

from models import User, ActivityLog
from auth import verify_password, create_access_token, get_current_user
from schemas import LoginRequest, TokenResponse, UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest):
    """Authenticate with username or email + password strictly against MongoDB User collection."""
    login_id = body.username.strip().lower()
    user = await User.find_one(
        {"$or": [
            {"username": login_id},
            {"email": login_id},
        ]}
    )
    if user is None or not verify_password(body.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated",
        )

    # Record login session timestamp & count
    now = datetime.now(timezone.utc)
    user.last_login_at = now
    user.last_active_at = now
    user.total_logins = (getattr(user, "total_logins", 0) or 0) + 1
    await user.save()

    # Log login activity
    log = ActivityLog(
        user_id=str(user.id),
        user_name=user.full_name,
        user_role=user.role,
        event_type="login",
        created_at=now,
    )
    await log.insert()

    token = create_access_token(data={"sub": str(user.id), "role": user.role})

    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=str(user.id),
            username=user.username,
            email=user.email,
            full_name=user.full_name,
            role=user.role,
            team=user.team,
            can_review_pr=user.can_review_pr,
            can_edit_ai_draft=user.can_edit_ai_draft,
            can_approve=user.can_approve,
            can_publish=user.can_publish,
            can_access_monitoring=getattr(user, "can_access_monitoring", False),
            is_active=user.is_active,
            created_at=user.created_at,
        ),
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Return the currently authenticated user's profile."""
    return UserResponse(
        id=str(current_user.id),
        username=current_user.username,
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role,
        team=current_user.team,
        can_review_pr=current_user.can_review_pr,
        can_edit_ai_draft=current_user.can_edit_ai_draft,
        can_approve=current_user.can_approve,
        can_publish=current_user.can_publish,
        can_access_monitoring=getattr(current_user, "can_access_monitoring", False),
        is_active=current_user.is_active,
        created_at=current_user.created_at,
    )
