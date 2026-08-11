# ─────────────────────────────────────────────────────────────
# routers/users_router.py
# User management endpoints (Editor only)
# ─────────────────────────────────────────────────────────────

from fastapi import APIRouter, Depends, HTTPException

from models import User
from auth import require_editor
from schemas import UserResponse
from beanie import PydanticObjectId

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("", response_model=list[UserResponse])
async def list_users(current_user: User = Depends(require_editor)):
    """List all users (Editor only)."""
    users = await User.find_all().to_list()
    return [
        UserResponse(
            id=str(u.id),
            username=u.username,
            full_name=u.full_name,
            role=u.role,
            is_active=u.is_active,
            created_at=u.created_at,
        )
        for u in users
    ]


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: str, current_user: User = Depends(require_editor)):
    """Get a single user's details (Editor only)."""
    try:
        obj_id = PydanticObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID format")
    
    user = await User.get(obj_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    return UserResponse(
        id=str(user.id),
        username=user.username,
        full_name=user.full_name,
        role=user.role,
        is_active=user.is_active,
        created_at=user.created_at,
    )
