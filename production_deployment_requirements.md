# Production Deployment Requirements — CyberMedia AI Editorial Copilot

**Target Domain**: `copilot.cybermedia.co.in` (or `editorial-ai.cybermedia.co.in`)  
**Architecture**: Next.js 16 (App Router) + PostgreSQL / Vector DB + Google Gemini 3.5 API + Google OAuth SSO  

---

## 1. Summary of Architecture Components

```
┌───────────────────────────────────────────────────────────────────────────────────┐
│                           CUSTOM DOMAIN & DNS LAYER                               │
│                  copilot.cybermedia.co.in (SSL HTTPS via Cloudflare / Vercel)      │
└─────────────────────────────────────────┬─────────────────────────────────────────┘
                                          │
                                          ▼
┌───────────────────────────────────────────────────────────────────────────────────┐
│                        AUTHENTICATION & ACCESS CONTROL                            │
│           Google Workspace OAuth SSO (Restricted to @cybermedia.co.in)            │
└─────────────────────────────────────────┬─────────────────────────────────────────┘
                                          │
                                          ▼
┌───────────────────────────────────────────────────────────────────────────────────┐
│                      APPLICATION SERVER (HOSTING LAYER)                           │
│        Vercel Enterprise / AWS Amplify OR AWS EC2 VM (Docker + Nginx + PM2)       │
└──────────────────┬──────────────────────┬──────────────────────┬──────────────────┘
                   │                      │                      │
                   ▼                      ▼                      ▼
┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
│  PRIMARY DATABASE    │  │   VECTOR RAG DB      │  │ CMS DIRECT PUBLISH   │
│  Supabase / Neon     │  │  Qdrant / Pinecone   │  │ WordPress REST API   │
│  (Drafts & Users)    │  │  (10k+ Archives)     │  │ (DQ, V&D, PCQ CMS)   │
└──────────────────────┘  └──────────────────────┘  └──────────────────────┘
```

---

## 2. Itemized Production Requirements

### 🌐 A. Domain, DNS & Networking
1. **Subdomain Record**:
   - Create a CNAME / A record in CyberMedia’s DNS provider (e.g. GoDaddy / Cloudflare):
     - `copilot.cybermedia.co.in` ➔ Points to Vercel CNAME or AWS EC2 Elastic IP.
2. **SSL / TLS Certificate**:
   - Managed automatically via Vercel / Cloudflare Let's Encrypt (Zero cost).

---

### 🖥️ B. Hosting & Compute Server
Choose one of the two options:

* **Option 1: Vercel Pro / Enterprise (RECOMMENDED - 10-Minute Setup)**
  - Automated CI/CD directly from GitHub repo (`git push origin main` auto-deploys).
  - Built-in global CDN, SSL, DDoS protection, edge serverless functions.
  - *Cost*: ~$20 / user / month.

* **Option 2: Self-Hosted Cloud VM (AWS EC2 / Azure / DigitalOcean)**
  - Server Specs: Ubuntu 24.04 LTS (2 vCPU, 4GB RAM, 40GB SSD).
  - Software Stack: Docker + Nginx (Reverse Proxy with SSL) + PM2 (Process Manager).
  - *Cost*: ~$25 / month.

---

### 🗄️ C. Databases (Data Retention & Scaled RAG)

1. **Primary Relational DB (Users, Sessions & Draft History)**
   - **Recommended Tech**: **Supabase PostgreSQL** or **Neon Serverless Postgres**.
   - **Tables Needed**:
     - `users`: ID, Email, Name, Role (`editor`, `chief_editor`, `admin`), Last Login.
     - `article_drafts`: Draft ID, User ID, Publication (`DQ`, `VND`, `PCQ`), Topic Type, PR Raw Text, Generated JSON Payload, Status (`draft`, `in_review`, `published_to_cms`), CreatedAt.
     - `audit_logs`: User actions tracking for compliance.

2. **Vector DB (Scaled RAG Retrieval Engine)**
   - **Recommended Tech**: **Qdrant Cloud** or **Pinecone** or **pgvector** (inside Supabase).
   - **Purpose**: Ingest 10,000+ past published articles from `dqindia.com`, `voicendata.com`, and `pcquest.com` via automated weekly sitemap crawler. Enables instant semantic RAG citations across the entire 20+ year publication history.

---

### 🔐 D. Authentication & Security (Single Sign-On)
1. **Auth Framework**: NextAuth.js (Auth.js) or Firebase Auth.
2. **Google OAuth Client Credentials**:
   - Register OAuth 2.0 Client ID in Google Cloud Console (`console.cloud.google.com`).
   - Allowed Callback URL: `https://copilot.cybermedia.co.in/api/auth/callback/google`.
3. **Domain Whitelist Enforcement**:
   - Hardcode sign-in restriction to emails ending with `@cybermedia.co.in` or `@cmrsl.net`.
   - Block public access completely.

---

### 🔌 E. CMS Direct Publishing Integration (WordPress / Drupal)
1. **WordPress REST API Access**:
   - Generate Application Passwords for editorial bot accounts on:
     - `https://www.dqindia.com/wp-json/wp/v2/posts`
     - `https://www.voicendata.com/wp-json/wp/v2/posts`
     - `https://www.pcquest.com/wp-json/wp/v2/posts`
2. **1-Click Publish Action**:
   - Add a **"Push Draft to CMS"** button in the Output Panel that automatically creates a WordPress post draft with Title, HTML Body, Categories, Tags, and SEO Meta Fields pre-filled!

---

### 🔑 F. AI API Credentials
1. **Google Gemini API Key**:
   - Production billing account on Google AI Studio / Vertex AI for `gemini-1.5-pro` & `imagen-3.0`.
2. **Environment Variables Configured on Server**:
   ```env
   NEXTAUTH_SECRET=super_secret_jwt_key
   NEXTAUTH_URL=https://copilot.cybermedia.co.in
   GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=xxx
   GEMINI_API_KEY=AIzaSy...
   DATABASE_URL=postgresql://user:pass@ep-cool-db.supabase.co/main
   WP_DQ_API_TOKEN=xxx
   WP_VND_API_TOKEN=xxx
   WP_PCQ_API_TOKEN=xxx
   ```

---

## 3. Estimated Monthly Operating Costs

| Item | Service Provider | Estimated Cost / Month |
|---|---|---|
| **Hosting & CDN** | Vercel Pro / AWS EC2 | $20 – $25 |
| **Relational Database** | Supabase Postgres (Free Tier / Pro) | $0 – $25 |
| **Vector Database** | Qdrant Cloud (Free / Starter) | $0 – $15 |
| **Gemini AI API** | Google AI Studio (~1,000 articles) | $15 – $30 |
| **Domain & SSL** | Existing CyberMedia Domain | $0 |
| **Total Estimated Cost** | — | **~$35 – $95 / month** (₹3,000 – ₹8,000 INR) |

---

## 4. Implementation Timeline (5-Day Action Plan)

```
Day 1: Domain & Auth Setup
├── Configure CNAME copilot.cybermedia.co.in
└── Setup Google OAuth Client ID & domain whitelist (@cybermedia.co.in)

Day 2: Database Provisioning
├── Deploy Supabase Postgres DB & migrations (users, article_drafts tables)
└── Connect NextAuth.js to database

Day 3: Vercel / AWS Hosting Deployment
├── Push GitHub repo to production hosting
└── Set environment variables & verify HTTPS SSL build

Day 4: CMS API Integration
├── Connect WordPress REST API endpoints for DQ, V&D, PCQ
└── Test 1-click "Push Draft to CMS" button

Day 5: Editorial Testing & UAT
├── Conduct live UAT with editorial teams
└── Hand over user access credentials
```
