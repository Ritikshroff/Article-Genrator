# ─────────────────────────────────────────────────────────────
# main.py
# FastAPI application entry point
# AI Stack for Edit desk (ASED) — Backend API
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
from routers.inbound_email_router import router as inbound_email_router
from routers.analytics_router import router as analytics_router
from services.email_listener import imap_poller
import asyncio

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: init DB + seed users. Shutdown: cleanup."""
    print("🚀 Starting AI Stack for Edit desk (ASED) Backend...")
    try:
        await init_db()
        print("✓ MongoDB connected & Beanie initialised")
        await seed_users()
        print("✓ Default users seeded in MongoDB")
        if imap_poller.is_configured():
            asyncio.create_task(imap_poller.start_polling_loop())
            print("✓ IMAP Email Listener started in background")
    except Exception as e:
        print(f"❌ MongoDB connection error on startup: {e}")
        raise e
    print("─" * 50)
    yield
    print("👋 Shutting down backend...")
    imap_poller.stop()


app = FastAPI(
    title="AI Stack for Edit desk (ASED) API",
    description="Backend API for the CyberMedia AI Stack for Edit desk (ASED) platform",
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
app.include_router(inbound_email_router)
app.include_router(analytics_router)


# ── Root & Health check ───────────────────────────────────────
@app.get("/", tags=["System"])
async def root():
    return {"message": "AI Stack for Edit desk (ASED) Backend API is running", "status": "healthy"}


@app.get("/health", tags=["System"])
async def health_check():
    return {"status": "healthy", "service": "AI Stack for Edit desk (ASED) Backend"}
