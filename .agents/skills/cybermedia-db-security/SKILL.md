---
name: cybermedia-db-security
description: >
  Critical database safety, MongoDB preservation, and destruction prevention rules
  for CyberMedia AI Editorial Copilot. Activate whenever touching database models,
  seed scripts, queries, migrations, or server maintenance commands.
---

# CyberMedia Database Safety & Security Protocol

> [!CAUTION]
> **CRITICAL DIRECTIVE: NEVER DROP, BULK-DELETE, OR OVERWRITE LIVE MONGODB DATA.**
> The backend connects to an **external live database cluster** (`api.srvr2px.cyberads.io:27017`).
> It is **NOT** a disposable local dummy database. Accidental drops or bulk deletes can cause permanent, irreversible data loss of editorial articles, audit logs, and user credentials.

---

## 1. Absolute Prohibitions (Never Run These)

The following commands, methods, and patterns are **STRICTLY PROHIBITED** from ever being executed autonomously by any AI agent:

| Prohibited Operation | Prohibited Code / Command | Why It Is Dangerous |
| :--- | :--- | :--- |
| **Drop Database** | `db.dropDatabase()`, `client.drop_database()` | Wipes the entire database permanently. |
| **Drop Collection** | `Collection.drop()`, `User.get_motor_collection().drop()` | Destroys all documents and indexes in that collection. |
| **Bulk Unfiltered Delete** | `Article.find_all().delete()`, `delete_many({})` | Deletes all user drafts and published stories. |
| **Destructive Seed Script** | Scripts that call `delete()` before re-seeding | Wipes real user activity, passwords, and sessions. |
| **Raw Mongo Shell Drop** | `mongo ... --eval "db.dropDatabase()"` | Immediate unrecoverable deletion. |

---

## 2. Mandatory Human Confirmation Gate

If a user or task genuinely requires a destructive operation (such as deleting an entire collection during a major migration, mass updating statuses, or running a raw cleanup script):

1. **STOP IMMEDIATELY.** Do NOT run the command autonomously.
2. **Explain in Plain, Simple Words (Hinglish / English)**:
   - What data will be affected (e.g. *"Bhai, yeh command run karne se Article collection ke 50 records permanently delete ho jayenge"*).
   - What collection and database cluster is targeted.
   - Why this action cannot be undone.
3. **Explicitly Ask for User Confirmation**: Wait for explicit written approval (e.g., *"Kya aap confirm karte hain ki yeh execute karein?"*) before executing.

---

## 3. Database Architecture & Collections

- **Host**: `api.srvr2px.cyberads.io:27017`
- **Database Name**: Configured in `backend/config.py` (`DATABASE_NAME`)
- **ODM**: Beanie (Async Motor driver on top of MongoDB)
- **Active Collections**:
  1. `users`: CyberMedia editors, authors, and super admins. Contains hashed bcrypt passwords and role permissions.
  2. `articles`: Editorial stories across Dataquest, Voice&Data, PCQuest, and CIOL with full 11-field PubLive JSON metadata.
  3. `activity_logs`: Audit trail of user logins, AI generations, review approvals, and session heartbeats.

---

## 4. Safe Coding Rules for AI Agents

### A. Idempotent Seeding (`seed.py`)
- When modifying `backend/seed.py`:
  - **ALWAYS** check `existing = await User.find_one(...)`.
  - Only update fields that need syncing (`update_data[...]`).
  - **NEVER** delete existing user documents to "re-create" them.

### B. Soft Delete Preferred
- For editorial articles, prefer changing status to `"archived"` or `"trashed"` rather than invoking physical `article.delete()` unless explicitly requested by the article author.

### C. Scope Deletes by ID and Ownership
- Deletions must **ALWAYS** be filtered by a specific ID and verified against user ownership:
  ```python
  # ✅ Safe: Deletes only one verified article
  article = await Article.get(obj_id)
  await _check_article_access(article, current_user)
  await article.delete()
  
  # ❌ Dangerous: Unbounded or unauthenticated delete
  await Article.find({"publication": pub}).delete()
  ```

### D. Always Test With Mock Queries First
- When writing queries that modify data, test with a `find()` query first to count how many records will match before running any update.

