"use client";
// ─────────────────────────────────────────────────────────────
// EditorDashboardView.tsx
// Review Queue and Articles Management for Editors
// ─────────────────────────────────────────────────────────────

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Send,
  CheckCircle2,
  AlertTriangle,
  Newspaper,
  FileText,
  Filter,
  Trash2,
  UserCheck,
  Eye,
  Inbox,
} from "lucide-react";
import { useToast } from "@/lib/toastContext";
import { apiFetch } from "@/lib/apiClient";
import type { ArticleListItem } from "@/lib/types";
import { ArticleRowSkeleton } from "@/components/Skeletons";
import { CustomSelect } from "@/components/CustomSelect";
import { resolvePublication } from "@/lib/magazineConfig";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  draft: {
    label: "Draft",
    color: "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
    icon: <FileText className="w-3 h-3" />,
  },
  submitted: {
    label: "Awaiting Review",
    color:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-200 font-bold border border-blue-300 dark:border-blue-700 animate-pulse",
    icon: <Send className="w-3 h-3" />,
  },
  approved: {
    label: "Approved",
    color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  revision_requested: {
    label: "Revision Requested",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    icon: <AlertTriangle className="w-3 h-3" />,
  },
  published: {
    label: "Published",
    color: "bg-[#e30613]/10 text-[#e30613]",
    icon: <Newspaper className="w-3 h-3" />,
  },
};

export function EditorDashboardView() {
  const { toast } = useToast();
  const [allArticles, setAllArticles] = useState<ArticleListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [pubFilter, setPubFilter] = useState("");

  const fetchArticles = async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await apiFetch<{ articles: ArticleListItem[]; total: number }>("/articles");
      setAllArticles(data.articles);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    const confirmed = await toast.confirm(
      `Delete article "${title}"? This cannot be undone.`,
      { title: "Delete Article", confirmText: "Delete", isDestructive: true }
    );
    if (!confirmed) return;
    try {
      await apiFetch(`/articles/${id}`, { method: "DELETE" });
      toast.success("Article deleted successfully");
      fetchArticles();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const submittedCount = allArticles.filter((a) => a.status === "submitted").length;
  const approvedCount = allArticles.filter((a) => a.status === "approved").length;
  const revisionCount = allArticles.filter((a) => a.status === "revision_requested").length;
  const totalCount = allArticles.length;

  const displayedArticles = allArticles.filter((a) => {
    if (statusFilter && a.status !== statusFilter) return false;
    if (pubFilter && resolvePublication(a.publication).key !== pubFilter) return false;
    return true;
  });

  return (
    <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-6 space-y-6 overflow-y-auto">
      {/* Editor Banner & Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <button
          onClick={() => setStatusFilter(statusFilter === "submitted" ? "" : "submitted")}
          className={`p-4 bg-white dark:bg-[#161616] border text-left transition-all ${
            statusFilter === "submitted"
              ? "border-blue-500 ring-2 ring-blue-500/20"
              : "border-zinc-200 dark:border-zinc-800 hover:border-blue-300"
          }`}
        >
          <div className="flex items-center justify-between text-blue-600 dark:text-blue-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Awaiting Review</span>
            <Send className="w-4 h-4" />
          </div>
          {isLoading ? (
            <div className="h-8 w-14 shimmer rounded-xs my-0.5" />
          ) : (
            <div className="text-2xl font-black text-zinc-900 dark:text-zinc-50">{submittedCount}</div>
          )}
          <p className="text-[11px] text-zinc-400 mt-1">Submitted drafts to review</p>
        </button>

        <button
          onClick={() => setStatusFilter(statusFilter === "approved" ? "" : "approved")}
          className={`p-4 bg-white dark:bg-[#161616] border text-left transition-all ${
            statusFilter === "approved"
              ? "border-emerald-500 ring-2 ring-emerald-500/20"
              : "border-zinc-200 dark:border-zinc-800 hover:border-emerald-300"
          }`}
        >
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Approved</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          {isLoading ? (
            <div className="h-8 w-14 shimmer rounded-xs my-0.5" />
          ) : (
            <div className="text-2xl font-black text-zinc-900 dark:text-zinc-50">{approvedCount}</div>
          )}
          <p className="text-[11px] text-zinc-400 mt-1">Ready to be published</p>
        </button>

        <button
          onClick={() => setStatusFilter(statusFilter === "revision_requested" ? "" : "revision_requested")}
          className={`p-4 bg-white dark:bg-[#161616] border text-left transition-all ${
            statusFilter === "revision_requested"
              ? "border-amber-500 ring-2 ring-amber-500/20"
              : "border-zinc-200 dark:border-zinc-800 hover:border-amber-300"
          }`}
        >
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">In Revision</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          {isLoading ? (
            <div className="h-8 w-14 shimmer rounded-xs my-0.5" />
          ) : (
            <div className="text-2xl font-black text-zinc-900 dark:text-zinc-50">{revisionCount}</div>
          )}
          <p className="text-[11px] text-zinc-400 mt-1">Returned to author</p>
        </button>

        <button
          onClick={() => setStatusFilter("")}
          className={`p-4 bg-white dark:bg-[#161616] border text-left transition-all ${
            statusFilter === ""
              ? "border-zinc-400 dark:border-zinc-600"
              : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300"
          }`}
        >
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Total Articles</span>
            <FileText className="w-4 h-4" />
          </div>
          {isLoading ? (
            <div className="h-8 w-14 shimmer rounded-xs my-0.5" />
          ) : (
            <div className="text-2xl font-black text-zinc-900 dark:text-zinc-50">{totalCount}</div>
          )}
          <p className="text-[11px] text-zinc-400 mt-1">All database articles</p>
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-white dark:bg-[#161616] border border-zinc-200 dark:border-zinc-800 p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-zinc-400" />
          <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Filter Review Queue:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <CustomSelect
            options={[
              { value: "", label: "All Statuses" },
              { value: "submitted", label: "Awaiting Review (Queue)" },
              { value: "draft", label: "Draft" },
              { value: "approved", label: "Approved" },
              { value: "revision_requested", label: "Revision Requested" },
              { value: "published", label: "Published" },
            ]}
            value={statusFilter}
            onChange={(val) => setStatusFilter(val)}
            className="w-48"
          />

          <CustomSelect
            options={[
              { value: "", label: "All Publications" },
              { value: "Dataquest", label: "DATAQUEST (DQ)" },
              { value: "Voice&Data", label: "VOICE&DATA (V&D)" },
              { value: "PCquest", label: "PCQUEST (PCQ)" },
            ]}
            value={pubFilter}
            onChange={(val) => setPubFilter(val)}
            className="w-48"
          />

          {(statusFilter || pubFilter) && (
            <button
              onClick={() => {
                setStatusFilter("");
                setPubFilter("");
              }}
              className="text-xs text-[#e30613] hover:underline font-bold"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Article Review Cards */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <ArticleRowSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-white dark:bg-[#161616] border border-red-200 dark:border-red-900/30 text-red-500">
          <p className="text-sm font-bold">{error}</p>
          <button onClick={fetchArticles} className="mt-2 text-xs underline font-bold">
            Try again
          </button>
        </div>
      ) : displayedArticles.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-[#161616] border border-zinc-200 dark:border-zinc-800 text-zinc-400">
          <Inbox className="w-10 h-10 mx-auto mb-2 text-zinc-300 dark:text-zinc-600" />
          <p className="text-sm font-bold text-zinc-600 dark:text-zinc-300">No articles in this queue</p>
          <p className="text-xs mt-1">When authors submit articles for review, they will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedArticles.map((article) => {
            const isSubmitted = article.status === "submitted";
            const st = STATUS_CONFIG[article.status] || STATUS_CONFIG.draft;
            const pubMeta = resolvePublication(article.publication);
            return (
              <div
                key={article.id}
                className={`bg-white dark:bg-[#161616] border p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${
                  isSubmitted
                    ? "border-blue-400 dark:border-blue-800 shadow-sm bg-blue-50/20 dark:bg-blue-950/10"
                    : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className={`px-1.5 py-0.5 text-[10px] font-black text-white ${pubMeta.badgeBg}`}>
                      {pubMeta.code}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold ${st.color}`}>
                      {st.icon} {st.label}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 truncate">
                    {article.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1.5 text-[11px] text-zinc-400">
                    <span>Created: {new Date(article.created_at).toLocaleDateString("en-IN")}</span>
                    <span>
                      Author:{" "}
                      <strong className="text-zinc-600 dark:text-zinc-300">
                        {article.created_by_name}
                      </strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isSubmitted ? (
                    <Link
                      href={`/articles/${article.id}`}
                      className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <UserCheck className="w-3.5 h-3.5" /> Review & Approve →
                    </Link>
                  ) : (
                    <Link
                      href={`/articles/${article.id}`}
                      className="px-3 py-1.5 text-[11px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" /> View Detail
                    </Link>
                  )}
                  <button
                    onClick={() => handleDelete(article.id, article.title)}
                    className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
