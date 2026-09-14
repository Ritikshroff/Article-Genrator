# ─────────────────────────────────────────────────────────────
# config.py
# Central configuration for FastAPI backend
# ─────────────────────────────────────────────────────────────

import os
from pathlib import Path

try:
    from dotenv import load_dotenv
    _env_file = Path(__file__).resolve().parent / ".env"
    if _env_file.exists():
        load_dotenv(dotenv_path=_env_file)
except ImportError:
    pass

MONGO_URI: str = os.getenv("MONGO_URI") or os.getenv("MONGODB_URI") or os.getenv("MONGODB_URL") or ""
if not MONGO_URI:
    raise ValueError(
        "MongoDB URI not configured. Please set MONGODB_URI in backend/.env or as an environment variable."
    )

DB_NAME: str = os.getenv("DB_NAME", "cybermedia_editorial")

# JWT Authentication
SECRET_KEY: str = os.getenv("SECRET_KEY", "")
if not SECRET_KEY:
    raise ValueError(
        "SECRET_KEY not configured. Please set SECRET_KEY in backend/.env or as an environment variable."
    )

ALGORITHM: str = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("TOKEN_EXPIRE_MINUTES", "480"))  # 8 hours

# CORS — allowed origins (Next.js frontend)
_cors_env = os.getenv("CORS_ORIGINS", "")
if _cors_env:
    ALLOWED_ORIGINS: list[str] = [o.strip() for o in _cors_env.split(",") if o.strip()]
else:
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3002",
        "http://127.0.0.1:3002",
        "https://editorial.cybermedia.in",
        "http://editorial.cybermedia.in",
        "https://editorial.cybermedia.co.in",
        "http://editorial.cybermedia.co.in",
        "*",
    ]

# Gemini API Key (shared with frontend)
GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
