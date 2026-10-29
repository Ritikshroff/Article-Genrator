<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# CyberMedia AI Editorial Copilot — Master Agent Constitution & Handover

> [!CAUTION]
> ### 🛑 TOP PRIORITY SECURITY RULE: ZERO ACCIDENTAL DB DELETION OR CORRUPTION
> - The backend connects to an **EXTERNAL LIVE MONGODB CLUSTER** (`api.srvr2px.cyberads.io:27017`).
> - **NEVER** execute `db.dropDatabase()`, `Collection.drop()`, `delete_many({})`, or any unfiltered bulk delete command.
> - **CONFIRMATION GATE**: Before running ANY command or script that updates or deletes multiple records, alters database schema, or restarts services with breaking changes, the AI **MUST STOP and explain the exact impact in simple, plain words (Hinglish/English)** and wait for manual user confirmation.
> - Soft deletes and audit logging are strictly preferred over physical deletion.

---

## 1. Project Overview & Quick Handover

The **CyberMedia AI Stack for Edit Desk (ASED)** is an enterprise AI Editorial Copilot built for CyberMedia's premier technology publications:
- **DATAQUEST** (`dqindia.com`) — Enterprise IT, Cloud, Semiconductors, AI policy
- **VOICE&DATA** (`voicendata.com`) — Telecom, 5G, Satcom, Networking, TRAI / DoT
- **PCQUEST** (`pcquest.com`) — Hardware benchmarks, PC gadgets, Labs reviews
- **CIOL** (`ciol.com`) — Technology business, digital transformation, CIO strategies

### Architecture:
- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind-style inline utilities. Runs locally on port `3000` (Production port `3002`).
- **Backend API**: FastAPI (Python 3.12), Beanie ODM, Motor async driver. Runs locally on port `8001` (Production port `8019`).
- **Database**: External MongoDB cluster at `api.srvr2px.cyberads.io:27017`.
- **AI Engine**: Google Gemini API (`gemini-2.5-flash` / `gemini-3.5-flash`) via structured JSON schema with strict temperature control (`0.1`–`0.2`).

---

## 2. Active Skills Directory (`.agents/skills/`)

All agents and developers must adhere to the specialized skills defined in `.agents/skills/`:

| Skill Name | Location | Purpose & Activation Trigger |
| :--- | :--- | :--- |
| **`cybermedia-db-security`** | `.agents/skills/cybermedia-db-security/SKILL.md` | **Mandatory** for database operations, Beanie models, seeding, and destructive prevention gates. |
| **`cybermedia-design-system`** | `.agents/skills/cybermedia-design-system/SKILL.md` | **Mandatory** for frontend UI/UX, typography hierarchy, casing rules, brand palettes, and logo styling. |
| **`cybermedia-access-control`** | `.agents/skills/cybermedia-access-control/SKILL.md` | **Mandatory** for user roles, RBAC, and Publication Isolation ("No Cross Access") rules. |
| **`cybermedia-frontend-standards`** | `.agents/skills/cybermedia-frontend-standards/SKILL.md` | Next.js standards, component size limits, TypeScript types, `apiFetch` rules. |
| **`cybermedia-backend-standards`** | `.agents/skills/cybermedia-backend-standards/SKILL.md` | FastAPI standards, Pydantic schemas, router design, error handling. |
| **Deployment Guide** | `.agents/rules/deployment.md` | Server accounts, PM2, Apache reverse proxy, systemd service management. |

---

## 3. Core Operational Invariants

1. **Publication Isolation (No Cross Access)**:
   - Voice&Data team (`shubhendup`, `ayushis`) is strictly locked to Voice&Data.
   - Dataquest & CIOL team (`shrikanthg`, `deepalij`, `nikithas`, `manishas`, `preetia`) is locked to DQ & CIOL.
   - PCQ team (`ashokpa`, `nehaj`, `harshs`, `amays`, `preetia`) is locked to PCQ.
   - Super Admins (`sudesh`, `dhaval`, `ritik`, `admin`) have full multi-publication oversight and access to the ASED Monitoring Tool.
2. **Editorial Stylesheet Mandates**:
   - Sentence Case for DQ, Voice&Data, and PCQ headlines/subheads.
   - Title Case for CIOL headlines.
   - Strict UK English across all articles (`-ise`, `programme`, `centre`, `colour`).
   - Zero em-dashes (`—`); replace with commas or standard sentence breaks.
   - Strip all marketing hype buzzwords.
3. **Factual Integrity & Verbatim Quotes**:
   - Spokesperson quotes must remain 100% verbatim faithful to the input Press Release inside double quotes at the bottom of the news story.
4. **Transparent Clean Brand Logos**:
   - Logos must never have white background boxes, card containers, or box-shadows.
