# ─────────────────────────────────────────────────────────────
# seed.py
# Pre-seed default users on first startup (idempotent)
# ─────────────────────────────────────────────────────────────

from models import User
from auth import hash_password, verify_password


DEFAULT_USERS = [
    # ── Test / Development Users ─────────────────────────────
    {
        "username": "editor1",
        "email": "editor1@cybermedia.co.in",
        "full_name": "Chief Editor",
        "password": "EditorOne@123",
        "role": "editor",
        "team": "Editorial",
        "can_review_pr": True,
        "can_edit_ai_draft": True,
        "can_approve": True,
        "can_publish": True,
    },
    {
        "username": "author1",
        "email": "author1@cybermedia.co.in",
        "full_name": "Author One",
        "password": "AuthorOne@123",
        "role": "author",
        "team": "Editorial",
        "can_review_pr": False,
        "can_edit_ai_draft": False,
        "can_approve": False,
        "can_publish": False,
    },
    {
        "username": "author2",
        "email": "author2@cybermedia.co.in",
        "full_name": "Author Two",
        "password": "AuthorTwo@123",
        "role": "author",
        "team": "Editorial",
        "can_review_pr": False,
        "can_edit_ai_draft": False,
        "can_approve": False,
        "can_publish": False,
    },

    # ── CyberMedia Editorial Team Roster ─────────────────────
    {
        "username": "deepalij",
        "email": "deepalij@cybermedia.co.in",
        "full_name": "Deepali Jain",
        "password": "DeepaliJain@123",
        "role": "editor",
        "team": "Editorial",
        "can_review_pr": False,
        "can_edit_ai_draft": False,
        "can_approve": False,
        "can_publish": False,
    },
    {
        "username": "shrikanthg",
        "email": "shrikanthg@cybermedia.co.in",
        "full_name": "Shrikanth G",
        "password": "ShrikanthG@123",
        "role": "editor",
        "team": "Editorial",
        "can_review_pr": True,
        "can_edit_ai_draft": True,
        "can_approve": True,
        "can_publish": True,
    },
    {
        "username": "ashokpa",
        "email": "ashokpa@cybermedia.co.in",
        "full_name": "Ashok P A",
        "password": "AshokPA@123",
        "role": "editor",
        "team": "Editorial",
        "can_review_pr": True,
        "can_edit_ai_draft": True,
        "can_approve": True,
        "can_publish": True,
    },
    {
        "username": "shubhendup",
        "email": "shubhendup@cybermedia.co.in",
        "full_name": "Shubhendu Parth",
        "password": "ShubhenduParth@123",
        "role": "editor",
        "team": "Editorial",
        "can_review_pr": True,
        "can_edit_ai_draft": True,
        "can_approve": True,
        "can_publish": True,
    },
    {
        "username": "sudeshp",
        "email": "sudeshp@cybermedia.co.in",
        "full_name": "Sudesh Prasad",
        "password": "SudeshPrasad@123",
        "role": "editor",
        "team": "Editorial",
        "can_review_pr": True,
        "can_edit_ai_draft": True,
        "can_approve": True,
        "can_publish": True,
        "can_access_monitoring": True,
    },
    {
        "username": "ayushis",
        "email": "ayushis@cybermedia.co.in",
        "full_name": "Ayushi S",
        "password": "AyushiS@123",
        "role": "author",
        "team": "Editorial",
        "can_review_pr": False,
        "can_edit_ai_draft": False,
        "can_approve": False,
        "can_publish": False,
    },
    {
        "username": "manishas",
        "email": "manishas@cybermedia.co.in",
        "full_name": "Manisha S",
        "password": "ManishaS@123",
        "role": "author",
        "team": "Editorial",
        "can_review_pr": False,
        "can_edit_ai_draft": False,
        "can_approve": False,
        "can_publish": False,
    },
    {
        "username": "harshs",
        "email": "harshs@cybermedia.co.in",
        "full_name": "Harsh Sharma",
        "password": "HarshSharma@123",
        "role": "author",
        "team": "Editorial",
        "can_review_pr": False,
        "can_edit_ai_draft": False,
        "can_approve": False,
        "can_publish": False,
    },
    {
        "username": "preetia",
        "email": "preetia@cybermedia.co.in",
        "full_name": "Preeti A",
        "password": "PreetiA@123",
        "role": "author",
        "team": "Editorial",
        "can_review_pr": False,
        "can_edit_ai_draft": False,
        "can_approve": False,
        "can_publish": False,
    },
    {
        "username": "nehaj",
        "email": "nehaj@cybermedia.co.in",
        "full_name": "Neha Joshi",
        "password": "NehaJoshi@123",
        "role": "author",
        "team": "Editorial",
        "can_review_pr": False,
        "can_edit_ai_draft": False,
        "can_approve": False,
        "can_publish": False,
    },
    {
        "username": "amays",
        "email": "amays@cybermedia.co.in",
        "full_name": "Amay S",
        "password": "AmayS@123",
        "role": "author",
        "team": "Editorial",
        "can_review_pr": False,
        "can_edit_ai_draft": False,
        "can_approve": False,
        "can_publish": False,
    },
    {
        "username": "nikithas",
        "email": "nikithas@cybermedia.co.in",
        "full_name": "Nikitha S",
        "password": "NikithaS@123",
        "role": "author",
        "team": "Editorial",
        "can_review_pr": False,
        "can_edit_ai_draft": False,
        "can_approve": False,
        "can_publish": False,
    },
]


async def seed_users() -> None:
    """Insert or update default users idempotently."""
    for user_data in DEFAULT_USERS:
        existing = await User.find_one(User.username == user_data["username"])
        if existing is None:
            user = User(
                username=user_data["username"],
                email=user_data.get("email"),
                hashed_password=hash_password(user_data["password"]),
                full_name=user_data["full_name"],
                role=user_data["role"],
                team=user_data.get("team", "Editorial"),
                can_review_pr=user_data.get("can_review_pr", False),
                can_edit_ai_draft=user_data.get("can_edit_ai_draft", False),
                can_approve=user_data.get("can_approve", False),
                can_publish=user_data.get("can_publish", False),
                can_access_monitoring=user_data.get("can_access_monitoring", False),
            )
            await user.insert()
            print(f"  ✓ Seeded user: {user_data['username']} ({user_data['role']})")
        else:
            # Update fields if missing or changed
            update_data = {}
            if not verify_password(user_data["password"], existing.hashed_password):
                update_data["hashed_password"] = hash_password(user_data["password"])
            if existing.email != user_data.get("email"):
                update_data["email"] = user_data.get("email")
            if getattr(existing, "team", None) != user_data.get("team", "Editorial"):
                update_data["team"] = user_data.get("team", "Editorial")
            if getattr(existing, "can_review_pr", None) != user_data.get("can_review_pr", False):
                update_data["can_review_pr"] = user_data.get("can_review_pr", False)
            if getattr(existing, "can_edit_ai_draft", None) != user_data.get("can_edit_ai_draft", False):
                update_data["can_edit_ai_draft"] = user_data.get("can_edit_ai_draft", False)
            if getattr(existing, "can_approve", None) != user_data.get("can_approve", False):
                update_data["can_approve"] = user_data.get("can_approve", False)
            if getattr(existing, "can_publish", None) != user_data.get("can_publish", False):
                update_data["can_publish"] = user_data.get("can_publish", False)
            if getattr(existing, "can_access_monitoring", None) != user_data.get("can_access_monitoring", False):
                update_data["can_access_monitoring"] = user_data.get("can_access_monitoring", False)
            if update_data:
                await existing.set(update_data)
                print(f"  ✓ Updated existing user: {user_data['username']}")
            else:
                print(f"  · User already up-to-date: {user_data['username']}")
