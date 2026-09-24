"use client";
// ─────────────────────────────────────────────────────────────
// KPICards.tsx
// Executive Overview KPI metric cards
// ─────────────────────────────────────────────────────────────

import React from "react";
import { Clock, TrendingUp, FileText, CheckCircle2, Award, Zap } from "lucide-react";
import type { AnalyticsOverviewResponse } from "@/lib/types";

interface KPICardsProps {
  overview: AnalyticsOverviewResponse;
}

export function KPICards({ overview }: KPICardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Man-Hours Saved */}
      <div className="bg-white dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 p-5 rounded-xs shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Efficiency Gained
          </span>
          <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Zap className="w-4 h-4" />
          </div>
        </div>
        <div className="text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
          {overview.total_hours_saved} <span className="text-sm font-semibold text-zinc-500">hrs</span>
        </div>
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1.5 flex items-center gap-1">
          <TrendingUp className="w-3 h-3 text-emerald-500" />
          ~23 min labor saved per article
        </p>
      </div>

      {/* 2. Team Adoption Rate */}
      <div className="bg-white dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 p-5 rounded-xs shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Team Adoption
          </span>
          <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Award className="w-4 h-4" />
          </div>
        </div>
        <div className="text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
          {overview.adoption_rate_pct}%
        </div>
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1.5">
          <strong className="text-zinc-700 dark:text-zinc-200 font-semibold">{overview.active_users_this_week}</strong> of{" "}
          {overview.total_registered_users} members active this week
        </p>
      </div>

      {/* 3. Total Articles Produced */}
      <div className="bg-white dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 p-5 rounded-xs shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Articles Created
          </span>
          <div className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-950/40 text-[#e30613] flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
        </div>
        <div className="text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
          {overview.total_articles_generated}
        </div>
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1.5">
          <strong className="text-zinc-700 dark:text-zinc-200 font-semibold">{overview.total_articles_approved}</strong> fully approved for publishing
        </p>
      </div>

      {/* 4. Editorial Approval Rate */}
      <div className="bg-white dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 p-5 rounded-xs shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Editorial Approval Rate
          </span>
          <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
          {overview.approval_rate_pct}%
        </div>
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1.5">
          First-pass quality & compliance
        </p>
      </div>
    </div>
  );
}
