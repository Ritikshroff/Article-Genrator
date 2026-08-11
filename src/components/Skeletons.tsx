import React from "react";

// ── KPI Card Skeleton ────────────────────────────────────────────
export function CardSkeleton() {
  return (
    <div className="p-4 bg-white dark:bg-[#161616] border border-zinc-200 dark:border-zinc-800 rounded-xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="h-3 w-28 shimmer rounded-xs" />
        <div className="h-4 w-4 shimmer rounded-full" />
      </div>
      <div className="h-8 w-14 shimmer rounded-xs" />
      <div className="h-2.5 w-36 shimmer rounded-xs" />
    </div>
  );
}

// ── Article Row Skeleton ─────────────────────────────────────────
export function ArticleRowSkeleton() {
  return (
    <div className="bg-white dark:bg-[#161616] border border-zinc-200 dark:border-zinc-800 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex-1 space-y-2.5 min-w-0 w-full">
        <div className="flex items-center gap-2">
          <div className="h-4 w-8 shimmer rounded-xs" />
          <div className="h-4 w-24 shimmer rounded-xs" />
        </div>
        <div className="h-5 w-3/4 shimmer rounded-xs" />
        <div className="flex items-center gap-3">
          <div className="h-3 w-32 shimmer rounded-xs" />
          <div className="h-3 w-24 shimmer rounded-xs" />
        </div>
      </div>
      <div className="h-8 w-28 shimmer rounded-xs flex-shrink-0" />
    </div>
  );
}

// ── Article Detail Page Skeleton ─────────────────────────────────
export function ArticleDetailSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0a0a] text-zinc-900 dark:text-zinc-100">
      {/* Header Skeleton */}
      <header className="bg-white dark:bg-[#111] border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-6 w-6 shimmer rounded-full" />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-4 w-8 shimmer rounded-xs" />
                <div className="h-4 w-20 shimmer rounded-xs" />
              </div>
              <div className="h-5 w-72 shimmer rounded-xs" />
            </div>
          </div>
          <div className="h-8 w-32 shimmer rounded-xs" />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        {/* Metadata Bar Skeleton */}
        <div className="bg-white dark:bg-[#161616] border border-zinc-200 dark:border-zinc-800 p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="h-4 w-32 shimmer rounded-xs" />
          <div className="h-4 w-40 shimmer rounded-xs" />
          <div className="h-4 w-40 shimmer rounded-xs" />
        </div>

        {/* Content Skeleton */}
        <div className="bg-white dark:bg-[#161616] border border-zinc-200 dark:border-zinc-800 p-8 space-y-6">
          <div className="h-8 w-2/3 shimmer rounded-xs" />
          <div className="h-4 w-full shimmer rounded-xs" />
          <div className="h-4 w-11/12 shimmer rounded-xs" />
          <div className="h-4 w-4/5 shimmer rounded-xs" />
          <div className="h-64 w-full shimmer rounded-xs my-6" />
          <div className="h-4 w-full shimmer rounded-xs" />
          <div className="h-4 w-5/6 shimmer rounded-xs" />
        </div>
      </main>
    </div>
  );
}

// ── Full App Loading Skeleton ────────────────────────────────────
export function FullPageSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0a0a] flex flex-col">
      <header className="h-14 bg-white dark:bg-[#111] border-b border-zinc-200 dark:border-zinc-800 px-6 flex items-center justify-between">
        <div className="h-5 w-36 shimmer rounded-xs" />
        <div className="flex items-center gap-3">
          <div className="h-6 w-24 shimmer rounded-xs" />
          <div className="h-6 w-20 shimmer rounded-xs" />
        </div>
      </header>
      <div className="flex-1 max-w-6xl mx-auto w-full p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <div className="space-y-3">
          <ArticleRowSkeleton />
          <ArticleRowSkeleton />
          <ArticleRowSkeleton />
        </div>
      </div>
    </div>
  );
}
