"use client";
// ─────────────────────────────────────────────────────────────
// Articles List & Review Queue Page — Editor Hub & Author Workspace
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/authContext";
import { apiFetch } from "@/lib/apiClient";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  Trash2,
  Eye,
  Newspaper,
  Filter,
  Sparkles,
  Inbox,
  CheckSquare,
  RefreshCw,
  LogOut,
  UserCheck,
  Star,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ArticleRowSkeleton, FullPageSkeleton } from "@/components/Skeletons";
import { CustomSelect } from "@/components/CustomSelect";

interface ArticleListItem {
  id: string;
  title: string;
  publication: string;
  status: string;
  created_by_name: string;
  reviewed_by_name: string | null;
  created_at: string;
  updated_at: string;
  author_rating?: number | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  draft: { label: "Draft", color: "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300", icon: <FileText className="w-3 h-3" /> },
  submitted: { label: "Awaiting Review", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-200 font-bold border border-blue-300 dark:border-blue-700 animate-pulse", icon: <Send className="w-3 h-3" /> },
  approved: { label: "Approved", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300", icon: <CheckCircle2 className="w-3 h-3" /> },
  revision_requested: { label: "Revision Requested", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300", icon: <AlertTriangle className="w-3 h-3" /> },
  published: { label: "Published", color: "bg-[#e30613]/10 text-[#e30613]", icon: <Newspaper className="w-3 h-3" /> },
};

const PUB_BADGE: Record<string, string> = {
  Dataquest: "bg-[#e30613]",
  "Voice&Data": "bg-[#00839b]",
  PCquest: "bg-[#e30613]",
};

function formatIndianDateTime(dateStr?: string | null): string {
  if (!dateStr) return "N/A";
  let normalized = dateStr;
  if (!normalized.endsWith("Z") && !normalized.includes("+") && !normalized.match(/-\d{2}:\d{2}$/)) {
    normalized = normalized + "Z";
  }
  const dt = new Date(normalized);
  if (isNaN(dt.getTime())) return dateStr;

  return dt.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

export default function ArticlesPage() {
  const { user, isEditor, logout, isLoading: authLoading } = useAuth();
  const [allArticles, setAllArticles] = useState<ArticleListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [pubFilter, setPubFilter] = useState<string>("");

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
    if (!authLoading && user) fetchArticles();
  }, [authLoading, user]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete article "${title}"? This cannot be undone.`)) return;
    try {
      await apiFetch(`/articles/${id}`, { method: "DELETE" });
      fetchArticles();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Stats calculation over all articles
  const submittedCount = allArticles.filter(a => a.status === "submitted").length;
  const approvedCount = allArticles.filter(a => a.status === "approved").length;
  const revisionCount = allArticles.filter(a => a.status === "revision_requested").length;
  const totalCount = allArticles.length;

  const displayedArticles = allArticles.filter((a) => {
    if (statusFilter && a.status !== statusFilter) return false;
    if (pubFilter && a.publication !== pubFilter) return false;
    return true;
  });

  if (authLoading) {
    return <FullPageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0a0a] text-zinc-900 dark:text-zinc-100">
      {/* ── HEADER ────────────────────────────────────────────────── */}
      <header className="bg-white dark:bg-[#111] border-b border-zinc-200 dark:border-zinc-800 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {!isEditor && (
              <Link href="/" className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-zinc-900 dark:text-zinc-50">
                  {isEditor ? "Editor Control Hub & Review Queue" : "Author Workspace — My Articles"}
                </h1>
                <span className={`px-2 py-0.5 text-[9px] font-black uppercase text-white rounded-xs ${isEditor ? "bg-blue-600" : "bg-zinc-600"}`}>
                  {isEditor ? "EDITOR ROLE" : "AUTHOR ROLE"}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {isEditor ? "Review, approve, or request revisions for submitted articles" : "Manage your draft articles and submission statuses"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Generate Article button for Authors */}
            {!isEditor && (
              <Link
                href="/"
                className="px-3.5 py-1.5 text-xs font-bold bg-[#e30613] hover:bg-[#b8040f] text-white transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" /> Generate Article
              </Link>
            )}

            {/* Refresh button */}
            <button
              onClick={fetchArticles}
              className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-xs transition-colors"
              title="Refresh List"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <ThemeToggle />

            {/* Logout */}
            <button
              onClick={logout}
              className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ────────────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        
        {/* Editor Overview Stats Bar */}
        {isEditor && (
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
                <Inbox className="w-4 h-4" />
              </div>
              <div className="text-2xl font-black text-zinc-900 dark:text-zinc-50">{submittedCount}</div>
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
                <CheckSquare className="w-4 h-4" />
              </div>
              <div className="text-2xl font-black text-zinc-900 dark:text-zinc-50">{approvedCount}</div>
              <p className="text-[11px] text-zinc-400 mt-1">Ready for CMS publish</p>
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
                <span className="text-xs font-bold uppercase tracking-wider">Revisions Requested</span>
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="text-2xl font-black text-zinc-900 dark:text-zinc-50">{revisionCount}</div>
              <p className="text-[11px] text-zinc-400 mt-1">Returned to authors</p>
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
                <span className="text-xs font-bold uppercase tracking-wider">All Submissions</span>
                <FileText className="w-4 h-4" />
              </div>
              <div className="text-2xl font-black text-zinc-900 dark:text-zinc-50">{totalCount}</div>
              <p className="text-[11px] text-zinc-400 mt-1">Total articles in database</p>
            </button>
          </div>
        )}

        {/* Filter Controls Bar */}
        <div className="bg-white dark:bg-[#161616] border border-zinc-200 dark:border-zinc-800 p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-zinc-400" />
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Filter Articles:</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <CustomSelect
              options={[
                { value: "", label: "All Statuses" },
                { value: "submitted", label: "Submitted (Review Queue)" },
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
                { value: "Dataquest", label: "DATAQUEST" },
                { value: "Voice&Data", label: "VOICE&DATA" },
                { value: "PCquest", label: "PCQUEST" },
              ]}
              value={pubFilter}
              onChange={(val) => setPubFilter(val)}
              className="w-44"
            />

            {(statusFilter || pubFilter) && (
              <button
                onClick={() => { setStatusFilter(""); setPubFilter(""); }}
                className="text-xs text-[#e30613] hover:underline font-semibold"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Article Cards List */}
        {isLoading ? (
          <div className="space-y-3">
            <ArticleRowSkeleton />
            <ArticleRowSkeleton />
            <ArticleRowSkeleton />
          </div>
        ) : displayedArticles.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-[#161616] border border-zinc-200 dark:border-zinc-800">
            <FileText className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
            <p className="text-sm font-bold text-zinc-500">No articles found matching filters</p>
            <p className="text-xs text-zinc-400 mt-1">
              {isEditor ? "No articles have been submitted yet." : "Generate an article on the dashboard to see it here."}
            </p>
            {!isEditor && (
              <Link href="/" className="inline-block mt-4 px-4 py-2 bg-[#e30613] text-white text-xs font-bold hover:bg-[#b8040f] transition-colors">
                Go to Article Generator
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {displayedArticles.map((article) => {
              const articleId = article.id || (article as any)._id || "";
              const st = STATUS_CONFIG[article.status] || STATUS_CONFIG.draft;
              const isSubmitted = article.status === "submitted";
              return (
                <div
                  key={articleId}
                  className={`bg-white dark:bg-[#161616] border p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors group ${
                    isSubmitted && isEditor
                      ? "border-blue-400 dark:border-blue-800 shadow-sm bg-blue-50/20 dark:bg-blue-950/10"
                      : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={`px-1.5 py-0.5 text-[10px] font-black text-white ${PUB_BADGE[article.publication] || "bg-zinc-600"}`}>
                        {article.publication === "DataQuest" ? "DQ" : article.publication === "VoiceData" ? "V&D" : "PCQ"}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold ${st.color}`}>
                        {st.icon} {st.label}
                      </span>
                      {article.reviewed_by_name && (
                        <span className="text-[10px] text-zinc-400">
                          Reviewed by {article.reviewed_by_name}
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 truncate">
                      {article.title}
                    </h3>

                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-zinc-400 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Created: {formatIndianDateTime(article.created_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <UserCheck className="w-3 h-3 text-zinc-400" /> Author: <strong className="text-zinc-600 dark:text-zinc-300">{article.created_by_name}</strong>
                      </span>
                      {article.author_rating && (
                        <span className="flex items-center gap-0.5" title={`Author rated this ${article.author_rating}/5`}>
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} className={`w-2.5 h-2.5 ${s <= article.author_rating! ? "text-amber-400 fill-amber-400" : "text-zinc-200 dark:text-zinc-700"}`} />
                          ))}
                          <span className="ml-0.5 text-amber-500 font-semibold">{article.author_rating}/5</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {/* Primary Editor Review Action */}
                    {isEditor && isSubmitted ? (
                      <Link
                        href={`/articles/${articleId}`}
                        className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        <UserCheck className="w-3.5 h-3.5" /> Review & Approve →
                      </Link>
                    ) : (
                      <Link
                        href={`/articles/${articleId}`}
                        className="px-3 py-1.5 text-[11px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" /> View Detail
                      </Link>
                    )}

                    {(article.status === "draft" || isEditor) && (
                      <button
                        onClick={() => handleDelete(articleId, article.title)}
                        className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                        title="Delete Article"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
