# ─────────────────────────────────────────────────────────────
# database.py
# Motor async client + Beanie ODM initialisation
# ─────────────────────────────────────────────────────────────

from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie

from config import MONGO_URI, DB_NAME


async def init_db() -> None:
    """Initialise Motor client and Beanie document models."""
    # Lazy import to avoid circular imports
    from models import User, Article

    uri = MONGO_URI
    if "directConnection" not in uri:
        delimiter = "&" if "?" in uri else "?"
        uri += f"{delimiter}directConnection=true"

    client = AsyncIOMotorClient(uri, serverSelectionTimeoutMS=5000, directConnection=True)
    db = client[DB_NAME]

    await init_beanie(
        database=db,
        document_models=[User, Article],
    )
