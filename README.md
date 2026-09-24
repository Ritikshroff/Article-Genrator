This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

# AI Stack for Edit desk (ASED)

**AI Stack for Edit desk (ASED)** is CyberMedia's editorial intelligence and automated multi-brand content generation platform, paired with **ASED Monitor** for executive productivity tracking. The system features a Python FastAPI backend with MongoDB (using Beanie ODM), JWT authentication, persistent storage, a 2-tier editorial review workflow, and real-time management analytics.

## What Was Accomplished

1. **FastAPI Backend Structure**
   - Built a fully asynchronous API using **FastAPI**.
   - Connected to **MongoDB** using the **Motor** driver and **Beanie** ODM, ensuring full Pydantic compatibility and eliminating schema duplication.
   - Designed robust ORM documents for `User`, `Article`, and `ActivityLog`, capturing all generated content, editorial reviews, and active work sessions.
   
2. **Authentication & Team Roles**
   - Implemented JWT-based authentication via `passlib[bcrypt]` and `python-jose`.
   - Comprehensive user credentials seeded for the editorial & author team.
   - Dual-role capability: **Editor** (full review queue, approvals, publishing, and executive oversight) vs. **Author** (draft creation, AI generation, and submission).

3. **ASED Monitor (Executive Analytics & Oversight)**
   - Real-time team monitoring dashboard (`/analytics`) tracking live heartbeats, individual user activity, man-hours saved, and article throughput.
   - Downloadable executive CSV reports with complete productivity breakdowns.

4. **Editorial Workflow (CRUD)**
   - **Authors** can generate articles, save them as drafts, and "Submit for Review".
   - **Editors** have a dedicated "Review Queue" (`/articles`) to review submissions, leave notes, and "Approve" or "Request Revision".
   - Articles transition cleanly between states: `draft` ➝ `submitted` ➝ `approved` / `revision_requested`.

5. **Frontend Integration**
   - Sleek, branded **Login Page** (`/login`).
   - Clean navigation across **ASED Editorial Workspace**, **ASED Review Queue**, and **ASED Monitor**.

## How to Test and Run

You need both the Next.js frontend and the FastAPI backend running simultaneously.

### 1. Start MongoDB (if not already running)
Ensure you have a local instance of MongoDB running on port 27017.

### 2. Start the FastAPI Backend
Open a new terminal, navigate to the `backend/` directory, and start the Uvicorn server:
```bash
cd backend
# Optionally activate a virtual environment
uvicorn main:app --reload --port 8000
```
*(The backend will automatically seed the 3 default users on startup).*

### 3. Start the Next.js Frontend
In your existing terminal running Next.js, restart it or ensure it's running:
```bash
npm run dev
```

### 4. Verify Workflows
1. **Log in as Author**: Go to `http://localhost:3000/login`, sign in as `author1` / `Author@2026`.
2. **Generate & Save**: Generate an article on the dashboard. When done, click the red "Save Article" button in the top right.
3. **Submit**: Click "My Articles", view your draft, and click "Submit for Review".
4. **Log in as Editor**: Sign out, log back in as `editor1` / `CyberMedia@2026`.
5. **Review**: Go to "All Articles", find the submitted article, and test the "Approve" or "Request Revision" functionality with notes.
