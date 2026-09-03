# ─────────────────────────────────────────────────────────────
# config.py
# Central configuration for FastAPI backend
# ─────────────────────────────────────────────────────────────

import os
from pathlib import Path

DEFAULT_MONGO = "mongodb://cmrslpx1b:l%40HdEvS%23)TR%267dC@api.srvr2px.cyberads.io:27017/?authSource=admin&readPreference=primary&ssl=false&directConnection=true"
MONGO_URI: str = os.getenv("MONGO_URI") or os.getenv("MONGODB_URI") or os.getenv("MONGODB_URL") or DEFAULT_MONGO
DB_NAME: str = os.getenv("DB_NAME", "cybermedia_editorial")

# JWT Authentication
SECRET_KEY: str = os.getenv("SECRET_KEY", "cybermedia-ai-copilot-secret-key-2026-very-secure")
ALGORITHM: str = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("TOKEN_EXPIRE_MINUTES", "480"))  # 8 hours

# CORS — allowed origins (Next.js frontend)
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
