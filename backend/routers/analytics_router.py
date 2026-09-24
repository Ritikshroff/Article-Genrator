# ─────────────────────────────────────────────────────────────
# routers/analytics_router.py
# Executive Analytics & User Activity Monitoring — ASED Monitor (CyberMedia)
# ─────────────────────────────────────────────────────────────

import io
import csv
from datetime import datetime, timezone, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response

from models import User, Article, ActivityLog
from auth import get_current_user, require_editor, require_monitoring_access
from schemas import (
    HeartbeatRequest,
    EventLogRequest,
    UserProductivityStats,
    AnalyticsOverviewResponse,
)

router = APIRouter(prefix="/analytics", tags=["Analytics & Monitoring"])

# Standard productivity baseline: manual drafting takes 25 min vs Copilot 2 min = 23 min saved (0.383 hrs)
HOURS_SAVED_PER_ARTICLE = 23.0 / 60.0


@router.post("/heartbeat")
async def record_heartbeat(
    body: HeartbeatRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Client heartbeat ping — tracks user active time and last-seen timestamp.
    Called periodically while the user has the copilot open.
    """
    now = datetime.now(timezone.utc)
    current_user.last_active_at = now
    current_user.total_active_seconds = (getattr(current_user, "total_active_seconds", 0) or 0) + body.duration_seconds
    await current_user.save()

    return {
        "status": "ok",
        "last_active_at": current_user.last_active_at,
        "total_active_minutes": int(current_user.total_active_seconds / 60),
    }


@router.post("/event")
async def record_event(
    body: EventLogRequest,
    current_user: User = Depends(get_current_user),
):
    """Log user interactions such as AI generation, draft saving, and CMS export."""
    log = ActivityLog(
        user_id=str(current_user.id),
        user_name=current_user.full_name,
        user_role=current_user.role,
        event_type=body.event_type,
        publication=body.publication,
        duration_seconds=body.duration_seconds,
        details=body.details,
    )
    await log.insert()
    return {"status": "logged", "event_id": str(log.id)}


@router.get("/overview", response_model=AnalyticsOverviewResponse)
async def get_analytics_overview(
    current_user: User = Depends(require_monitoring_access),
):
    """
    Executive dashboard overview providing adoption rate, hours saved,
    editorial throughput, and individual writer productivity stats.
    (Editor only)
    """
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - timedelta(days=7)

    # 1. Fetch users & articles with slim field projections (avoids downloading MBs of raw text/images)
    users_cursor = User.get_motor_collection().find(
        {},
        {
            "_id": 1,
            "full_name": 1,
            "username": 1,
            "email": 1,
            "role": 1,
            "team": 1,
            "last_login_at": 1,
            "last_active_at": 1,
            "total_logins": 1,
            "total_active_seconds": 1,
        }
    )
    all_users = await users_cursor.to_list(length=1000)

    articles_cursor = Article.get_motor_collection().find(
        {},
        {
            "_id": 1,
            "status": 1,
            "publication": 1,
            "created_by_id": 1,
            "author_rating": 1,
        }
    )
    all_articles = await articles_cursor.to_list(length=10000)

    # 2. Activity metrics
    active_today = 0
    active_this_week = 0
    for u in all_users:
        last_act = u.get("last_active_at")
        if last_act:
            if last_act.tzinfo is None:
                last_act = last_act.replace(tzinfo=timezone.utc)
            if last_act >= today_start:
                active_today += 1
            if last_act >= week_start:
                active_this_week += 1

    total_users_count = len(all_users)
    adoption_rate = round((active_this_week / total_users_count * 100), 1) if total_users_count > 0 else 0.0

    # 3. Editorial metrics
    total_articles = len(all_articles)
    total_approved = sum(1 for a in all_articles if a.get("status") == "approved")
    total_revisions = sum(1 for a in all_articles if a.get("status") == "revision_requested")
    total_reviewed = total_approved + total_revisions
    approval_rate = round((total_approved / total_reviewed * 100), 1) if total_reviewed > 0 else 100.0

    total_hours_saved = round(total_articles * HOURS_SAVED_PER_ARTICLE, 1)

    # 4. Publication distribution
    pub_counts: dict[str, int] = {}
    for a in all_articles:
        p = a.get("publication") or "Unassigned"
        pub_counts[p] = pub_counts.get(p, 0) + 1

    # 5. Team productivity per user
    articles_by_author: dict[str, list[dict]] = {}
    for a in all_articles:
        author_id = str(a.get("created_by_id", ""))
        articles_by_author.setdefault(author_id, []).append(a)

    team_stats: list[UserProductivityStats] = []
    for u in all_users:
        uid_str = str(u["_id"])
        user_arts = articles_by_author.get(uid_str, [])
        drafted = len(user_arts)
        submitted = sum(1 for a in user_arts if a.get("status") in ("submitted", "approved", "revision_requested", "published"))
        approved = sum(1 for a in user_arts if a.get("status") in ("approved", "published"))
        revisions = sum(1 for a in user_arts if a.get("status") == "revision_requested")

        # Ratings
        ratings = [a.get("author_rating") for a in user_arts if a.get("author_rating") is not None]
        avg_rating = round(sum(ratings) / len(ratings), 1) if ratings else None

        # Activity status
        last_act = u.get("last_active_at")
        status_label: str = "inactive"
        if last_act:
            if last_act.tzinfo is None:
                last_act = last_act.replace(tzinfo=timezone.utc)
            if last_act >= today_start:
                status_label = "active_today"
            elif last_act >= week_start:
                status_label = "active_this_week"

        active_secs = u.get("total_active_seconds", 0) or 0

        team_stats.append(
            UserProductivityStats(
                user_id=uid_str,
                full_name=u.get("full_name", ""),
                username=u.get("username", ""),
                email=u.get("email"),
                role=u.get("role", "author"),
                team=u.get("team") or "Editorial",
                last_login_at=u.get("last_login_at"),
                last_active_at=last_act,
                total_logins=u.get("total_logins", 0) or 0,
                total_active_minutes=int(active_secs / 60),
                status=status_label,
                articles_drafted=drafted,
                articles_submitted=submitted,
                articles_approved=approved,
                articles_revision_requested=revisions,
                avg_quality_rating=avg_rating,
                estimated_hours_saved=round(drafted * HOURS_SAVED_PER_ARTICLE, 1),
            )
        )

    # Sort team: authors with highest drafts first, then editors
    team_stats.sort(key=lambda s: (s.role == "author", s.articles_drafted, s.total_active_minutes), reverse=True)

    # 6. Recent activity feed
    logs_cursor = ActivityLog.get_motor_collection().find().sort("created_at", -1).limit(15)
    recent_logs = await logs_cursor.to_list(length=15)
    recent_activity = [
        {
            "id": str(log["_id"]),
            "user_name": log.get("user_name", ""),
            "user_role": log.get("user_role", "author"),
            "event_type": log.get("event_type", "heartbeat"),
            "publication": log.get("publication"),
            "created_at": log["created_at"].isoformat() if hasattr(log.get("created_at"), "isoformat") else str(log.get("created_at")),
            "details": log.get("details"),
        }
        for log in recent_logs
    ]

    return AnalyticsOverviewResponse(
        total_registered_users=total_users_count,
        active_users_today=active_today,
        active_users_this_week=active_this_week,
        adoption_rate_pct=adoption_rate,
        total_articles_generated=total_articles,
        total_articles_approved=total_approved,
        approval_rate_pct=approval_rate,
        total_hours_saved=total_hours_saved,
        publication_breakdown=pub_counts,
        recent_activity=recent_activity,
        team_productivity=team_stats,
    )


@router.get("/export")
async def export_analytics_csv(
    current_user: User = Depends(require_monitoring_access),
):
    """
    Generate and stream an Executive Productivity CSV report for management meetings.
    (Editor only)
    """
    overview = await get_analytics_overview(current_user=current_user)

    output = io.StringIO()
    writer = csv.writer(output)

    # Header metadata block
    writer.writerow(["AI STACK FOR EDIT DESK (ASED) — EXECUTIVE MONITOR & PRODUCTIVITY REPORT"])
    writer.writerow(["Generated At", datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")])
    writer.writerow(["Generated By", f"{current_user.full_name} ({current_user.username})"])
    writer.writerow([])

    # Executive Summary KPIs
    writer.writerow(["EXECUTIVE SUMMARY KPIS"])
    writer.writerow(["Metric", "Value"])
    writer.writerow(["Total Registered Team Members", overview.total_registered_users])
    writer.writerow(["Active Writers/Editors This Week", overview.active_users_this_week])
    writer.writerow(["Team Adoption Rate", f"{overview.adoption_rate_pct}%"])
    writer.writerow(["Total Articles Generated", overview.total_articles_generated])
    writer.writerow(["Total Articles Approved", overview.total_articles_approved])
    writer.writerow(["Editorial Approval Rate", f"{overview.approval_rate_pct}%"])
    writer.writerow(["Cumulative Man-Hours Saved (Est.)", f"{overview.total_hours_saved} hrs"])
    writer.writerow([])

    # Team Productivity Table
    writer.writerow(["TEAM MEMBER PRODUCTIVITY BREAKDOWN"])
    writer.writerow([
        "Full Name",
        "Username",
        "Email",
        "Role",
        "Team",
        "Activity Status",
        "Total Logins",
        "Total Active Minutes",
        "Drafts Created",
        "Submitted for Review",
        "Approved",
        "Revision Requested",
        "Avg AI Rating (1-5)",
        "Est. Hours Saved",
        "Last Active (UTC)",
    ])

    for member in overview.team_productivity:
        writer.writerow([
            member.full_name,
            member.username,
            member.email or "N/A",
            member.role.capitalize(),
            member.team,
            member.status.replace("_", " ").title(),
            member.total_logins,
            member.total_active_minutes,
            member.articles_drafted,
            member.articles_submitted,
            member.articles_approved,
            member.articles_revision_requested,
            member.avg_quality_rating or "N/A",
            f"{member.estimated_hours_saved} hrs",
            member.last_active_at.strftime("%Y-%m-%d %H:%M:%S") if member.last_active_at else "Never",
        ])

    csv_data = output.getvalue()
    filename = f"ASED_executive_productivity_report_{datetime.now().strftime('%Y%m%d')}.csv"

    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
