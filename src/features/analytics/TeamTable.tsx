"use client";
// ─────────────────────────────────────────────────────────────
// TeamTable.tsx
// Team Member Productivity & Activity Table
// ─────────────────────────────────────────────────────────────

import React, { useState } from "react";
import { Search, UserCheck, Star, Clock, CheckCircle2, AlertTriangle, FileText } from "lucide-react";
import type { UserProductivityStats } from "@/lib/types";

interface TeamTableProps {
  members: UserProductivityStats[];
}

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return "Never logged in";
  let normalized = dateStr;
  if (!normalized.endsWith("Z") && !normalized.includes("+") && !normalized.match(/-\d{2}:\d{2}$/)) {
    normalized = normalized + "Z";
  }
  const dt = new Date(normalized);
  if (isNaN(dt.getTime())) return "Unknown";

  return dt.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function TeamTable({ members }: TeamTableProps) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "author" | "editor">("all");

  const filtered = members.filter((m) => {
    const matchesSearch =
      m.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (m.email && m.email.toLowerCase().includes(search.toLowerCase())) ||
      m.username.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || m.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="bg-white dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 rounded-xs shadow-xs p-5">
      {/* Table Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
            Team Productivity & Adoption Roster
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Individual throughput, time invested, and editorial output stats
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search team member..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-50 dark:bg-[#1b1b1b] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-xs focus:outline-none focus:border-[#e30613]"
            />
          </div>

          {/* Role Filter */}
          <div className="flex p-0.5 border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 rounded-xs">
            {(["all", "author", "editor"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-2.5 py-1 text-[11px] font-bold capitalize transition-colors rounded-xs cursor-pointer ${
                  roleFilter === r
                    ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                }`}
              >
                {r === "all" ? "All Roles" : `${r}s`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              <th className="py-2.5 px-3">Team Member</th>
              <th className="py-2.5 px-3">Role</th>
              <th className="py-2.5 px-3">Activity Status</th>
              <th className="py-2.5 px-3">Logins</th>
              <th className="py-2.5 px-3">Active Time</th>
              <th className="py-2.5 px-3">Drafts</th>
              <th className="py-2.5 px-3">Submitted</th>
              <th className="py-2.5 px-3">Approved</th>
              <th className="py-2.5 px-3">Hours Saved</th>
              <th className="py-2.5 px-3 text-right">Last Active (IST)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-zinc-400">
                  No matching team members found.
                </td>
              </tr>
            ) : (
              filtered.map((m) => {
                const statusPill =
                  m.status === "active_today"
                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                    : m.status === "active_this_week"
                    ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700";

                const statusLabel =
                  m.status === "active_today"
                    ? "Active Today"
                    : m.status === "active_this_week"
                    ? "Active This Week"
                    : "Inactive";

                return (
                  <tr key={m.user_id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-zinc-900 dark:text-zinc-100">
                        {m.full_name}
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        {m.email || m.username}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 text-[9px] font-black uppercase rounded-xs tracking-wider ${
                          m.role === "editor"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200"
                            : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                        }`}
                      >
                        {m.role}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold border rounded-full ${statusPill}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${m.status === "active_today" ? "bg-emerald-500 animate-pulse" : m.status === "active_this_week" ? "bg-blue-500" : "bg-zinc-400"}`} />
                        {statusLabel}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-semibold text-zinc-700 dark:text-zinc-300">
                      {m.total_logins}
                    </td>

                    <td className="py-3 px-3 text-zinc-600 dark:text-zinc-400">
                      {m.total_active_minutes >= 60 ? (
                        <span>
                          {Math.floor(m.total_active_minutes / 60)}h {m.total_active_minutes % 60}m
                        </span>
                      ) : (
                        <span>{m.total_active_minutes}m</span>
                      )}
                    </td>

                    <td className="py-3 px-3 font-bold text-zinc-900 dark:text-zinc-100">
                      {m.articles_drafted}
                    </td>

                    <td className="py-3 px-3 text-blue-600 dark:text-blue-400 font-semibold">
                      {m.articles_submitted}
                    </td>

                    <td className="py-3 px-3 text-emerald-600 dark:text-emerald-400 font-semibold">
                      {m.articles_approved}
                    </td>

                    <td className="py-3 px-3 font-bold text-zinc-900 dark:text-zinc-100">
                      {m.estimated_hours_saved > 0 ? `${m.estimated_hours_saved}h` : "—"}
                    </td>

                    <td className="py-3 px-3 text-right text-zinc-500 dark:text-zinc-400 text-[11px]">
                      {formatRelativeTime(m.last_active_at || m.last_login_at)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
