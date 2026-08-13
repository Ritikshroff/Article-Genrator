# ─────────────────────────────────────────────────────────────
# main.py
# FastAPI application entry point
# CyberMedia AI Editorial Copilot — Backend API
# ─────────────────────────────────────────────────────────────

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import ALLOWED_ORIGINS
from database import init_db
from seed import seed_users

from routers.auth_router import router as auth_router
from routers.articles_router import router as articles_router
from routers.users_router import router as users_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: init DB + seed users. Shutdown: cleanup."""
    print("🚀 Starting CyberMedia AI Copilot Backend...")
    try:
        await init_db()
        print("✓ MongoDB connected & Beanie initialised")
        await seed_users()
        print("✓ Default users seeded")
    except Exception as e:
        print(f"⚠️ Database connection warning during startup: {e}")
        print("Backend service starting in standalone mode...")
    print("─" * 50)
    yield
    print("👋 Shutting down backend...")


app = FastAPI(
    title="CyberMedia AI Editorial Copilot API",
    description="Backend API for the CyberMedia multi-brand AI article generation platform",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────
app.include_router(auth_router)
app.include_router(articles_router)
app.include_router(users_router)


# ── Root & Health check ───────────────────────────────────────
@app.get("/", tags=["System"])
async def root():
    return {"message": "CyberMedia AI Copilot Backend API is running", "status": "healthy"}


@app.get("/health", tags=["System"])
async def health_check():
    return {"status": "healthy", "service": "CyberMedia AI Copilot Backend"}
