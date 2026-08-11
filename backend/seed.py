# ─────────────────────────────────────────────────────────────
# seed.py
# Pre-seed default users on first startup (idempotent)
# ─────────────────────────────────────────────────────────────

from models import User
from auth import hash_password


DEFAULT_USERS = [
    {
        "username": "editor1",
        "full_name": "Chief Editor",
        "password": "CyberMedia@2026",
        "role": "editor",
    },
    {
        "username": "author1",
        "full_name": "Author One",
        "password": "Author@2026",
        "role": "author",
    },
    {
        "username": "author2",
        "full_name": "Author Two",
        "password": "Author@2026",
        "role": "author",
    },
]


async def seed_users() -> None:
    """Insert default users if they don't already exist."""
    for user_data in DEFAULT_USERS:
        existing = await User.find_one(User.username == user_data["username"])
        if existing is None:
            user = User(
                username=user_data["username"],
                hashed_password=hash_password(user_data["password"]),
                full_name=user_data["full_name"],
                role=user_data["role"],
            )
            await user.insert()
            print(f"  ✓ Seeded user: {user_data['username']} ({user_data['role']})")
        else:
            print(f"  · User already exists: {user_data['username']}")
