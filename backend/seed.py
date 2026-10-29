# ─────────────────────────────────────────────────────────────
# seed.py
# Pre-seed default users on first startup (idempotent)
# Configured as per Sudhesh Sir's Access Matrix (No Cross Access)
# ─────────────────────────────────────────────────────────────

from models import User, Article
from auth import hash_password, verify_password


DEFAULT_USERS = [
    # ── Super Admin Access (Sudesh, Dhaval, Ritik & Admin) ──
    # Access to all publications, stories, and ASED Monitoring Tool
    {
        "username": "sudesh",
        "email": "sudesh@cybermedia.co.in",
        "full_name": "Sudesh Prasad",
        "password": "SudeshPrasad@123",
        "role": "admin",
        "team": "Leadership",
        "can_review_pr": True,
        "can_edit_ai_draft": True,
        "can_approve": True,
        "can_publish": True,
        "can_access_monitoring": True,
        "allowed_publications": ["Dataquest", "Voice&Data", "PCQuest", "CIOL"],
    },
    {
        "username": "sudeshp",
        "email": "sudeshp@cybermedia.co.in",
        "full_name": "Sudesh Prasad",
        "password": "SudeshPrasad@123",
        "role": "admin",
        "team": "Leadership",
        "can_review_pr": True,
        "can_edit_ai_draft": True,
        "can_approve": True,
        "can_publish": True,
        "can_access_monitoring": True,
        "allowed_publications": ["Dataquest", "Voice&Data", "PCQuest", "CIOL"],
    },
    {
        "username": "dhaval",
        "email": "dhaval@cybermedia.co.in",
        "full_name": "Dhaval Gupta",
        "password": "Dhaval@CyberMedia2026",
        "role": "admin",
        "team": "Leadership",
        "can_review_pr": True,
        "can_edit_ai_draft": True,
        "can_approve": True,
        "can_publish": True,
        "can_access_monitoring": True,
        "allowed_publications": ["Dataquest", "Voice&Data", "PCQuest", "CIOL"],
    },
    {
        "username": "ritik",
        "email": "ritik@cybermedia.co.in",
        "full_name": "Ritik",
        "password": "Ritik@CyberMedia2026",
        "role": "admin",
        "team": "Leadership",
        "can_review_pr": True,
        "can_edit_ai_draft": True,
        "can_approve": True,
        "can_publish": True,
        "can_access_monitoring": True,
        "allowed_publications": ["Dataquest", "Voice&Data", "PCQuest", "CIOL"],
    },
    {
        "username": "admin",
        "email": "admin@cybermedia.co.in",
        "full_name": "Executive Admin",
        "password": "Admin@CyberMedia2026",
        "role": "admin",
        "team": "Leadership",
        "can_review_pr": True,
        "can_edit_ai_draft": True,
        "can_approve": True,
        "can_publish": True,
        "can_access_monitoring": True,
        "allowed_publications": ["Dataquest", "Voice&Data", "PCQuest", "CIOL"],
    },

    # ── Voice&Data Team (No Cross Access) ────────────────────
    # Shubhendu (Editor), Ayushi (Author)
    {
        "username": "shubhendup",
        "email": "shubhendup@cybermedia.co.in",
        "full_name": "Shubhendu Parth",
        "password": "ShubhenduParth@123",
        "role": "editor",
        "team": "Voice&Data",
        "can_review_pr": True,
        "can_edit_ai_draft": True,
        "can_approve": True,
        "can_publish": True,
        "can_access_monitoring": False,
        "allowed_publications": ["Voice&Data"],
    },
    {
        "username": "ayushis",
        "email": "ayushis@cybermedia.co.in",
        "full_name": "Ayushi S",
        "password": "AyushiS@123",
        "role": "author",
        "team": "Voice&Data",
        "can_review_pr": False,
        "can_edit_ai_draft": False,
        "can_approve": False,
        "can_publish": False,
        "can_access_monitoring": False,
        "allowed_publications": ["Voice&Data"],
    },

    # ── Dataquest and CIOL Team (No Cross Access) ────────────
    # Shrikanth Govindrajan (Editor), Deepali, Nikitha, Manisha, Preeti (Authors)
    {
        "username": "shrikanthg",
        "email": "shrikanthg@cybermedia.co.in",
        "full_name": "Shrikanth Govindrajan",
        "password": "ShrikanthG@123",
        "role": "editor",
        "team": "Dataquest & CIOL",
        "can_review_pr": True,
        "can_edit_ai_draft": True,
        "can_approve": True,
        "can_publish": True,
        "can_access_monitoring": False,
        "allowed_publications": ["Dataquest", "CIOL"],
    },
    {
        "username": "deepalij",
        "email": "deepalij@cybermedia.co.in",
        "full_name": "Deepali Jain",
        "password": "DeepaliJain@123",
        "role": "author",
        "team": "Dataquest & CIOL",
        "can_review_pr": False,
        "can_edit_ai_draft": False,
        "can_approve": False,
        "can_publish": False,
        "can_access_monitoring": False,
        "allowed_publications": ["Dataquest", "CIOL"],
    },
    {
        "username": "nikithas",
        "email": "nikithas@cybermedia.co.in",
        "full_name": "Nikitha S",
        "password": "NikithaS@123",
        "role": "author",
        "team": "Dataquest & CIOL",
        "can_review_pr": False,
        "can_edit_ai_draft": False,
        "can_approve": False,
        "can_publish": False,
        "can_access_monitoring": False,
        "allowed_publications": ["Dataquest", "CIOL"],
    },
    {
        "username": "manishas",
        "email": "manishas@cybermedia.co.in",
        "full_name": "Manisha S",
        "password": "ManishaS@123",
        "role": "author",
        "team": "Dataquest & CIOL",
        "can_review_pr": False,
        "can_edit_ai_draft": False,
        "can_approve": False,
        "can_publish": False,
        "can_access_monitoring": False,
        "allowed_publications": ["Dataquest", "CIOL"],
    },
    {
        "username": "preetia",
        "email": "preetia@cybermedia.co.in",
        "full_name": "Preeti A",
        "password": "PreetiA@123",
        "role": "author",
        "team": "Dataquest, CIOL & PCQ",
        "can_review_pr": False,
        "can_edit_ai_draft": False,
        "can_approve": False,
        "can_publish": False,
        "can_access_monitoring": False,
        "allowed_publications": ["Dataquest", "CIOL", "PCQuest"],
    },

    # ── PCQ Team (No Cross Access) ───────────────────────────
    # Ashok Pandey (Editor), Neha, Harsh, Amay, Preeti (Authors)
    {
        "username": "ashokpa",
        "email": "ashokpa@cybermedia.co.in",
        "full_name": "Ashok Pandey",
        "password": "AshokPA@123",
        "role": "editor",
        "team": "PCQuest",
        "can_review_pr": True,
        "can_edit_ai_draft": True,
        "can_approve": True,
        "can_publish": True,
        "can_access_monitoring": False,
        "allowed_publications": ["PCQuest"],
    },
    {
        "username": "nehaj",
        "email": "nehaj@cybermedia.co.in",
        "full_name": "Neha Joshi",
        "password": "NehaJoshi@123",
        "role": "author",
        "team": "PCQuest",
        "can_review_pr": False,
        "can_edit_ai_draft": False,
        "can_approve": False,
        "can_publish": False,
        "can_access_monitoring": False,
        "allowed_publications": ["PCQuest"],
    },
    {
        "username": "harshs",
        "email": "harshs@cybermedia.co.in",
        "full_name": "Harsh Sharma",
        "password": "HarshSharma@123",
        "role": "author",
        "team": "PCQuest",
        "can_review_pr": False,
        "can_edit_ai_draft": False,
        "can_approve": False,
        "can_publish": False,
        "can_access_monitoring": False,
        "allowed_publications": ["PCQuest"],
    },
    {
        "username": "amays",
        "email": "amays@cybermedia.co.in",
        "full_name": "Amay S",
        "password": "AmayS@123",
        "role": "author",
        "team": "PCQuest",
        "can_review_pr": False,
        "can_edit_ai_draft": False,
        "can_approve": False,
        "can_publish": False,
        "can_access_monitoring": False,
        "allowed_publications": ["PCQuest"],
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
                allowed_publications=user_data.get("allowed_publications", []),
            )
            await user.insert()
            print(f"  ✓ Seeded user: {user_data['username']} ({user_data['role']}) -> {user_data.get('allowed_publications')}")
        else:
            # Update fields if missing or changed
            update_data = {}
            if not verify_password(user_data["password"], existing.hashed_password):
                update_data["hashed_password"] = hash_password(user_data["password"])
            if existing.email != user_data.get("email"):
                update_data["email"] = user_data.get("email")
            if existing.full_name != user_data["full_name"]:
                update_data["full_name"] = user_data["full_name"]
            if existing.role != user_data["role"]:
                update_data["role"] = user_data["role"]
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
            if getattr(existing, "allowed_publications", None) != user_data.get("allowed_publications", []):
                update_data["allowed_publications"] = user_data.get("allowed_publications", [])

            if update_data:
                await existing.set(update_data)
                print(f"  ✓ Updated existing user: {user_data['username']} ({update_data.keys()})")
            else:
                print(f"  · User already up-to-date: {user_data['username']}")

    # ── Safe & Targeted Cleanup of Deprecated Test Accounts ────────
    # Strictly scoped only to legacy test accounts: editor1, author1, author2
    dummy_usernames = ["editor1", "author1", "author2"]
    for d_username in dummy_usernames:
        dummy_user = await User.find_one(User.username == d_username)
        if dummy_user:
            d_id = str(dummy_user.id)
            del_articles = await Article.find(
                {"$or": [
                    {"created_by_id": d_id},
                    {"created_by_name": dummy_user.full_name},
                ]}
            ).delete()
            await dummy_user.delete()
            print(f"  🗑️ Cleaned dummy user: {d_username} (and {getattr(del_articles, 'deleted_count', 0)} associated test articles)")
