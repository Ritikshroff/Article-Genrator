"use client";
// ─────────────────────────────────────────────────────────────
// app/analytics/page.tsx
// Executive Management & Editorial Activity Dashboard — ASED Monitor
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Download,
  RefreshCw,
  Activity,
  Layers,
  FileCheck2,
  Clock,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "@/lib/authContext";
import { useToast } from "@/lib/toastContext";
import { apiFetch, getApiBaseUrl } from "@/lib/apiClient";
import { FullPageSkeleton } from "@/components/Skeletons";
import { ThemeToggle } from "@/components/ThemeToggle";
import { KPICards } from "@/features/analytics/KPICards";
import { TeamTable } from "@/features/analytics/TeamTable";
import type { AnalyticsOverviewResponse } from "@/lib/types";

export default function AnalyticsPage() {
  const { user, isEditor, canAccessMonitoring, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [data, setData] = useState<AnalyticsOverviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const fetchOverview = async (showToast = false) => {
    try {
      if (showToast) setIsRefreshing(true);
      const res = await apiFetch<AnalyticsOverviewResponse>("/analytics/overview");
      setData(res);
      if (showToast) toast.success("Analytics refreshed with live database metrics.");
    } catch (err: any) {
      toast.error(err.message || "Failed to load management analytics.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) return; // AuthProvider redirects to /login

    if (!canAccessMonitoring) {
      toast.error("Access restricted: Only Sudesh Prasad (sudeshp@cybermedia.co.in) is authorized to access ASED Monitor.");
      router.push("/");
      return;
    }

    fetchOverview();
  }, [authLoading, user, canAccessMonitoring]);

  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      const token = localStorage.getItem("auth_token") || "";
      const url = `${getApiBaseUrl()}/analytics/export`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to export analytics report");

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `ASED_executive_productivity_report_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);

      toast.success("Executive CSV report downloaded successfully.");
    } catch (err: any) {
      toast.error(err.message || "Failed to download export report.");
    } finally {
      setIsExporting(false);
    }
  };

  if (authLoading || isLoading) {
    return <FullPageSkeleton />;
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5] dark:bg-[#0d0d0d] p-4 text-center">
        <div>
          <ShieldAlert className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Unable to load analytics</h2>
          <button
            onClick={() => fetchOverview(true)}
            className="mt-4 px-4 py-2 bg-[#e30613] text-white text-xs font-bold rounded-xs cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] dark:bg-[#0d0d0d] text-zinc-900 dark:text-zinc-100 flex flex-col">
      {/* ── HEADER ────────────────────────────────────────────────── */}
      <header className="bg-white dark:bg-[#111] border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-xs transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-[17px] font-black text-zinc-900 dark:text-zinc-50 leading-none">
                  CYBERMEDIA
                </span>
                <span className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase">
                  ASED Monitor • Executive Analytics
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 mt-0.5">
                AI Stack for Edit desk (ASED) — Real-time team adoption, throughput, and efficiency monitoring
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchOverview(true)}
              disabled={isRefreshing}
              className="h-8 px-3 text-[11px] font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 border border-zinc-200 dark:border-zinc-700 transition-colors inline-flex items-center gap-1.5 rounded-xs cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={handleExportCSV}
              disabled={isExporting}
              className="h-8 px-3 text-[11px] font-bold bg-[#e30613] hover:bg-[#b8040f] text-white transition-colors inline-flex items-center gap-1.5 rounded-xs cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? "Exporting..." : "Download ASED Productivity CSV"}</span>
            </button>

            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ──────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-5 sm:px-8 py-6 w-full flex-1">
        {/* KPI Cards */}
        <KPICards overview={data} />

        {/* Publication Distribution Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {["Dataquest", "Voice&Data", "PCquest"].map((pub) => {
            const count = data.publication_breakdown[pub] || 0;
            const pct = data.total_articles_generated > 0 ? Math.round((count / data.total_articles_generated) * 100) : 0;
            const accentColor = pub === "Voice&Data" ? "text-[#00839b]" : "text-[#e30613]";
            const barColor = pub === "Voice&Data" ? "bg-[#00839b]" : "bg-[#e30613]";

            return (
              <div
                key={pub}
                className="bg-white dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 p-4 rounded-xs shadow-xs"
              >
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className={accentColor}>{pub}</span>
                  <span className="text-zinc-500">{count} articles ({pct}%)</span>
                </div>
                <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-2">
                  <div className={`h-full ${barColor}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Team Productivity Roster Table */}
        <TeamTable members={data.team_productivity} />

        {/* Recent Live Activity Feed */}
        {data.recent_activity.length > 0 && (
          <div className="mt-6 bg-white dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 rounded-xs shadow-xs p-5">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#e30613]" />
              Real-time Team Activity Feed
            </h3>
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {data.recent_activity.map((act) => (
                <div key={act.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">{act.user_name}</span>
                    <span className="text-zinc-400">({act.user_role})</span>
                    <span className="text-zinc-600 dark:text-zinc-300">
                      {act.event_type === "login" && "signed in"}
                      {act.event_type === "heartbeat" && "active in editor"}
                      {act.event_type === "generate_ai" && `generated AI package${act.publication ? ` for ${act.publication}` : ""}`}
                      {act.event_type === "save_draft" && `saved article draft${act.details?.title ? `: "${act.details.title}"` : ""}`}
                      {act.event_type === "submit_review" && "submitted article for review"}
                      {act.event_type === "review_approve" && "approved an article"}
                      {act.event_type === "review_revision" && "requested article revisions"}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400 whitespace-nowrap">
                    {new Date(act.created_at).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
