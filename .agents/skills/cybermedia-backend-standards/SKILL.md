---
name: cybermedia-backend-standards
description: >
  Coding standards, architecture rules, and conventions for the CyberMedia
  AI Editorial Copilot FastAPI backend. Activate when making ANY change to
  the backend codebase — new routes, models, schemas, services, or reviews.
---

# CyberMedia Backend — Agent & Developer Standards

## Stack
- **Framework**: FastAPI 0.115.12
- **Language**: Python 3.12
- **ODM**: Beanie 1.29.0 (MongoDB via Motor 3.7.0)
- **Auth**: JWT via `python-jose`, bcrypt password hashing
- **Process manager**: Gunicorn + Uvicorn workers (2 workers, systemd)
- **Entrypoint**: `main.py` with variable named `app` — DO NOT rename

---

## Directory Structure (enforce this)
```
backend/
  main.py               ← FastAPI app init, middleware, router registration ONLY
  config.py             ← All env vars and constants — no business logic
  database.py           ← Beanie init only
  models.py             ← Beanie Document models (DB layer)
  schemas.py            ← Pydantic request/response models (API layer)
  auth.py               ← JWT encode/decode, dependency functions
  seed.py               ← DB seed for default users (run once on startup)
  routers/
    __init__.py
    articles_router.py  ← Article CRUD + workflow endpoints
    auth_router.py      ← Login endpoint
    users_router.py     ← User management
    inbound_email_router.py ← Email webhook
  services/
    __init__.py
    email_listener.py   ← Background IMAP polling
    email_parser.py     ← Email → PR extraction
    pr_classifier.py    ← PR classification logic
  requirements.txt      ← Top-level pinned dependencies (12 packages)
  venv/                 ← Ops-managed — DO NOT delete or recreate
```

---

## Models (`models.py`) Rules

### Use `Literal` types for all enum-like fields
```python
# ✅ Correct
status: Literal["draft", "submitted", "approved", "revision_requested", "published"] = "draft"
role: Literal["author", "editor"] = "author"

# ❌ Wrong
status: str = "draft"
```

### Timestamps always use timezone-aware UTC
```python
from datetime import datetime, timezone
created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
```

### Never store sensitive data in models
- No raw passwords (always `hashed_password`)
- No base64 image data in DB (store metadata/prompts only — `creative_data`)

---

## Schemas (`schemas.py`) Rules

### Response schemas must match model type strictness
```python
# models.py has: status: Literal[...]
# schemas.py MUST have:
class ArticleResponse(BaseModel):
    status: Literal["draft", "submitted", "approved", "revision_requested", "published"]
    # ❌ NOT: status: str  — this loses type safety at the API boundary
```

### Use Pydantic validators — never validate in routers
```python
# ❌ Wrong — validation in router
@router.post("/feedback")
async def submit_feedback(body: AuthorFeedback):
    if not 1 <= body.rating <= 5:  # business rule in router
        raise HTTPException(...)

# ✅ Correct — validation in schema
class AuthorFeedback(BaseModel):
    rating: int = Field(ge=1, le=5)  # Pydantic enforces automatically
    note: Optional[str] = None
```

### Use `model_dump(exclude_unset=True)` for PATCH-style updates
```python
update_data = body.model_dump(exclude_unset=True)
await article.set(update_data)
```

---

## Routers Rules

### Route ordering — specific before dynamic
```python
# ✅ Correct — /review/queue must be before /{article_id}
@router.get("/review/queue")   # exact path first
@router.get("/{article_id}")   # dynamic path second
```

### Always use helper functions for repeated access patterns
```python
# ✅ Already established — always use these
article = await _get_article_or_404(article_id)
_check_own_article(article, current_user)
```

### HTTP status codes — use semantic codes
```python
@router.post("", status_code=status.HTTP_201_CREATED)   # creation
@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)  # deletion
# Default 200 for GET/PUT — no need to specify
```

### Role enforcement — use dependency injection
```python
# ✅ Correct — enforce at route level with Depends()
async def get_review_queue(current_user: User = Depends(require_editor)):

# ✅ Also correct — enforce inside route for mixed-role endpoints
if current_user.role == "editor":
    raise HTTPException(status_code=403, ...)
```

---

## Config Rules

### NEVER hardcode credentials as fallback defaults
```python
# ❌ WRONG — credentials in source code
DEFAULT_MONGO = "mongodb://username:password@host:port/..."
MONGO_URI = os.getenv("MONGO_URI") or DEFAULT_MONGO

# ✅ Correct — fail loudly if env var is missing
MONGO_URI = os.getenv("MONGO_URI") or os.getenv("MONGODB_URI")
if not MONGO_URI:
    raise ValueError("MONGO_URI environment variable is required")
```

### All secrets come from environment variables only
- `MONGO_URI` / `MONGODB_URI` — MongoDB connection string
- `SECRET_KEY` — JWT signing secret
- `GEMINI_API_KEY` — AI API key
- These live in `.env` on the server (chmod 600) — never in source code

---

## Error Handling Rules

### Always use `HTTPException` with meaningful detail messages
```python
raise HTTPException(
    status_code=status.HTTP_403_FORBIDDEN,
    detail="You can only access your own articles",
)
```

### Never let unhandled exceptions reach the client in production
Wrap external calls (DB, email, AI) in try/except and raise `HTTPException`.

---

## RBAC (Role-Based Access Control) Rules

| Operation | Author | Editor |
|-----------|--------|--------|
| Create article | ✅ | ❌ |
| View own articles | ✅ | ✅ (all) |
| Edit article | ✅ (draft/revision only) | ✅ |
| Delete article | ✅ (own drafts only) | ✅ |
| Submit for review | ✅ (own articles) | ❌ |
| Review/approve | ❌ | ✅ |
| Rate quality | ✅ (own articles) | ❌ |

**This table is the source of truth — any new endpoint must enforce these rules.**

---

## Deployment Rules (CRITICAL)

### After any backend change, restart the service:
```bash
# As apicybermedia26
cd ~/public_html/editorial-backend-api/
source venv/bin/activate
pip install -r requirements.txt   # only if requirements.txt changed
deactivate
sudo systemctl restart editorial-fastapi.service
sudo systemctl status editorial-fastapi.service
```

### The entrypoint MUST stay `main:app`
The systemd unit `editorial-fastapi.service` has `ExecStart` pointing to `main:app`.
- File must be named `main.py`
- FastAPI instance must be named `app`
- If either changes, ops must update the systemd unit

### The venv is ops-managed — never recreate it
```
editorial-backend-api/venv/   ← DO NOT delete or run python -m venv here
```
Add new packages to `requirements.txt` and run `pip install -r requirements.txt` inside the venv.

---

## What NOT to do
- ❌ Do not hardcode any credentials, URLs, or secrets in source code
- ❌ Do not validate business rules in routers — use Pydantic schemas
- ❌ Do not use `str` where `Literal[...]` is more appropriate in schemas
- ❌ Do not define routes without role enforcement
- ❌ Do not commit `.env` — it is in `.gitignore` for a reason
- ❌ Do not delete or modify `venv/`, `.env`, or `requirements-lock.txt`
- ❌ Do not bind the server to `0.0.0.0` — loopback only (`127.0.0.1:8019`)
- ❌ Do not store base64 image data in MongoDB — store prompts/metadata only
