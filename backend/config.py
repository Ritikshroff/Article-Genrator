# ─────────────────────────────────────────────────────────────
# config.py
# Central configuration for FastAPI backend
# ─────────────────────────────────────────────────────────────

import os
from pathlib import Path

# MongoDB
MONGO_URI: str = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME: str = os.getenv("DB_NAME", "cybermedia_copilot")

# JWT Authentication
SECRET_KEY: str = os.getenv("SECRET_KEY", "cybermedia-ai-copilot-secret-key-2026-very-secure")
ALGORITHM: str = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("TOKEN_EXPIRE_MINUTES", "480"))  # 8 hours

# CORS — allowed origins (Next.js frontend)
ALLOWED_ORIGINS: list[str] = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Gemini API Key (shared with frontend)
GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
