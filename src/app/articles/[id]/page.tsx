"use client";
// ─────────────────────────────────────────────────────────────
// Article Detail Page — View + Editor Review
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/authContext";
import { apiFetch } from "@/lib/apiClient";
import { OutputPanel, EditorialPackage } from "@/components/OutputPanel";
import { ArticleDetailSkeleton } from "@/components/Skeletons";
import {
  ArrowLeft,
  Send,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  Clock,
  User,
  FileText,
  Newspaper,
} from "lucide-react";

interface ArticleDetail {
  id: string;
  title: string;
  publication: string;
  status: string;
  created_by_id: string;
  created_by_name: string;
  reviewed_by_id: string | null;
  reviewed_by_name: string | null;
  press_release: string;
  news_data: any;
  seo_data: any;
  impact_data: any;
  interview_data: any;
  review_data: any;
  social_data: any;
  creative_data: any;
  editor_notes: string | null;
  created_at: string;
  updated_at: string;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300" },
  submitted: { label: "Submitted for Review", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  approved: { label: "Approved", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" },
  revision_requested: { label: "Revision Requested", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
  published: { label: "Published", color: "bg-[#e30613]/10 text-[#e30613]" },
};

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isEditor, isLoading: authLoading } = useAuth();
  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Review form
  const [reviewNotes, setReviewNotes] = useState("");
  const [isReviewing, setIsReviewing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const articleId = params?.id as string;

  const fetchArticle = async () => {
    setIsLoading(true);
    try {
      const data = await apiFetch<ArticleDetail>(`/articles/${articleId}`);
      setArticle(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user && articleId) fetchArticle();
  }, [authLoading, user, articleId]);

  const handleSubmitForReview = async () => {
    if (!article) return;
    setIsSubmitting(true);
    try {
      const updated = await apiFetch<ArticleDetail>(`/articles/${article.id}/submit`, {
        method: "POST",
      });
      setArticle(updated);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReview = async (action: "approve" | "request_revision") => {
    if (!article) return;
    setIsReviewing(true);
    try {
      const updated = await apiFetch<ArticleDetail>(`/articles/${article.id}/review`, {
        method: "POST",
        body: JSON.stringify({ action, notes: reviewNotes }),
      });
      setArticle(updated);
      setReviewNotes("");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsReviewing(false);
    }
  };

  if (authLoading || isLoading) {
    return <ArticleDetailSkeleton />;
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-[#0a0a0a]">
        <div className="text-center">
          <p className="text-sm font-bold text-red-500 mb-2">{error || "Article not found"}</p>
          <Link href="/articles" className="text-xs text-[#e30613] hover:underline">← Back to Articles</Link>
        </div>
      </div>
    );
  }

  const st = STATUS_LABELS[article.status] || STATUS_LABELS.draft;
  const isOwnArticle = article.created_by_id === user?.id;
  const canSubmit = isOwnArticle && (article.status === "draft" || article.status === "revision_requested");
  const canReview = isEditor && article.status === "submitted";

  // Convert article data to EditorialPackage for OutputPanel
  const packageData: EditorialPackage = {
    news: article.news_data,
    seo: article.seo_data,
    impact: article.impact_data,
    interview: article.interview_data,
    review: article.review_data,
    social: article.social_data,
    creative: article.creative_data,
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0a0a]">
      {/* Header */}
      <header className="bg-white dark:bg-[#111] border-b border-zinc-200 dark:border-zinc-800 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/articles"
              className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors rounded-xs cursor-pointer flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800"
              title="Back to Articles Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`px-1.5 py-0.5 text-[10px] font-black text-white ${article.publication === "Voice&Data" || article.publication === "VoiceData" ? "bg-[#00839b]" : "bg-[#e30613]"}`}>
                  {article.publication === "Dataquest" || article.publication === "DataQuest" ? "DQ" : article.publication === "Voice&Data" || article.publication === "VoiceData" ? "V&D" : "PCQ"}
                </span>
                <span className={`px-2 py-0.5 text-[10px] font-bold ${st.color}`}>
                  {st.label}
                </span>
              </div>
              <h1 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-md">
                {article.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Submit for Review (Author) */}
            {canSubmit && (
              <button
                onClick={handleSubmitForReview}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {isSubmitting ? "Submitting..." : "Submit for Review"}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6 space-y-6">

        {/* Article Metadata Bar */}
        <div className="bg-white dark:bg-[#161616] border border-zinc-200 dark:border-zinc-800 p-4 flex flex-wrap items-center gap-4 text-[11px] text-zinc-500">
          <span className="flex items-center gap-1"><User className="w-3 h-3" /> Author: <strong className="text-zinc-700 dark:text-zinc-300">{article.created_by_name}</strong></span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Created: {new Date(article.created_at).toLocaleString("en-IN")}</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Updated: {new Date(article.updated_at).toLocaleString("en-IN")}</span>
          {article.reviewed_by_name && (
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Reviewed by: <strong className="text-zinc-700 dark:text-zinc-300">{article.reviewed_by_name}</strong></span>
          )}
        </div>

        {/* Editor Notes (if revision requested) */}
        {article.editor_notes && article.status === "revision_requested" && (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300">
            <div className="flex items-center gap-2 text-sm font-bold mb-2">
              <MessageSquare className="w-4 h-4" />
              Editor Revision Notes
            </div>
            <p className="text-sm leading-relaxed">{article.editor_notes}</p>
          </div>
        )}

        {/* Editor Approval Notes */}
        {article.editor_notes && article.status === "approved" && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300">
            <div className="flex items-center gap-2 text-sm font-bold mb-2">
              <CheckCircle2 className="w-4 h-4" />
              Editor Approval Notes
            </div>
            <p className="text-sm leading-relaxed">{article.editor_notes}</p>
          </div>
        )}

        {/* Editor Review Panel */}
        {canReview && (
          <div className="bg-white dark:bg-[#161616] border-2 border-blue-300 dark:border-blue-800 p-5 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-blue-700 dark:text-blue-300">
              <FileText className="w-4 h-4" />
              Editor Review Panel
            </div>
            <textarea
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Add review notes (optional for approval, recommended for revision requests)..."
              rows={3}
              className="w-full px-4 py-3 text-sm bg-zinc-50 dark:bg-[#111] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
            />
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleReview("approve")}
                disabled={isReviewing}
                className="px-5 py-2 text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {isReviewing ? "Processing..." : "Approve Article"}
              </button>
              <button
                onClick={() => handleReview("request_revision")}
                disabled={isReviewing}
                className="px-5 py-2 text-xs font-bold bg-amber-600 text-white hover:bg-amber-700 transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                {isReviewing ? "Processing..." : "Request Revision"}
              </button>
            </div>
          </div>
        )}

        {/* Reuse OutputPanel to render the full article with backend sync & read-only enforcement */}
        {article.news_data && (
          <div className="bg-white dark:bg-[#161616] border border-zinc-200 dark:border-zinc-800">
            <OutputPanel
              packageData={packageData}
              magazine={article.publication}
              articleId={article.id}
              readOnly={user?.role === "author" && article.status !== "draft" && article.status !== "revision_requested"}
            />
          </div>
        )}
      </main>
    </div>
  );
}
