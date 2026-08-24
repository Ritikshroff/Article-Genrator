"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles, Key, AlertCircle, AlertTriangle, Trash2,
  CheckCircle2, RotateCcw, ChevronDown, ChevronUp, Settings2,
  Newspaper, Mic, PenTool, BookOpen, BarChart3, Info, ExternalLink,
  LogOut, FolderOpen, Save, Inbox, CheckSquare, UserCheck, RefreshCw, Filter, Eye, Send, FileText, Clock
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { StepProgress } from "@/components/StepProgress";
import { OutputPanel, EditorialPackage } from "@/components/OutputPanel";
import { magazineList, MagazineKey } from "@/lib/magazineConfig";
import { useAuth } from "@/lib/authContext";
import { apiFetch } from "@/lib/apiClient";
import { CardSkeleton, ArticleRowSkeleton, FullPageSkeleton } from "@/components/Skeletons";
import { CustomSelect } from "@/components/CustomSelect";

const articleTypes = [
  { id: "News", label: "News Story", desc: "Factual news report", icon: Newspaper },
  { id: "Interview", label: "Interview Q&A", desc: "Question & answer format", icon: Mic },
  { id: "Opinion", label: "Opinion Piece", desc: "Expert viewpoint / editorial", icon: PenTool },
  { id: "Feature", label: "Feature Story", desc: "Long-form deep dive", icon: BookOpen },
  { id: "CaseStudy", label: "Case Study", desc: "Outcome & success report", icon: BarChart3 },
];

const defaultPrompts = {
  News: `SEO-optimised Dataquest news article:\n- Use H1/H2/H3 heading structure (## What Happened, ## India Perspective, ## What This Means, etc.)\n- Lead with inverted pyramid intro (Who, What, Where, When, Why in first 80 words)\n- Include primary keyword in first 100 words and in 2+ subheadings\n- Add India market angle section\n- End with FAQ section (4 Q&A pairs targeting long-tail queries)\n- Strip all marketing language`,
  Interview: `SEO-optimised interview-style or Q&A article:\n- Use H1/H2/H3 heading structure\n- Include primary keyword in first 100 words and in 2+ H2 subheadings\n- Structure Q&A with ## Q: [Question] and **A:** [Answer] format (min 5 pairs)\n- End with ## Key Takeaway section and FAQ (4 pairs)`,
  Opinion: `SEO-optimised expert opinion or editorial:\n- Use H1/H2/H3 heading structure\n- Include primary keyword in first 100 words and in subheadings\n- Include a ## The Other Side counter-argument section\n- End with ## The Bottom Line conclusion and FAQ (4 pairs)`,
  Feature: `SEO-optimised long-form feature or deep-dive:\n- Use H1/H2/H3 heading structure (## How It Works, ## Market Context, ## Why India Matters, etc.)\n- Include primary keyword in first 100 words and in 3+ subheadings\n- Every section must include a specific statistic or market figure\n- End with ## The Bigger Picture conclusion and FAQ (5 pairs)`,
  CaseStudy: `SEO-optimised corporate case study:\n- Use exact H2 structure: ## The Challenge → ## The Solution → ## The Results → ## Key Lessons\n- Include primary keyword in first 100 words and in Challenge + Results headings\n- Quantify outcomes in Results with hard numbers (%, time saved, scale)\n- End with ## What This Proves conclusion and FAQ (4 pairs)`,
};

const wordPresets = {
  short:  { label: "Short (approx. 500 words)",     min: 400,  max: 600  },
  medium: { label: "Medium (approx. 700 words)",    min: 600,  max: 800  },
  long:   { label: "Long (approx. 1,000 words)",    min: 900,  max: 1100 },
  feature:{ label: "Feature article (1,200+ words)",min: 1100, max: 1400 },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  draft: { label: "Draft", color: "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300", icon: <FileText className="w-3 h-3" /> },
  submitted: { label: "Awaiting Review", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-200 font-bold border border-blue-300 dark:border-blue-700 animate-pulse", icon: <Send className="w-3 h-3" /> },
  approved: { label: "Approved", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300", icon: <CheckCircle2 className="w-3 h-3" /> },
  revision_requested: { label: "Revision Requested", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300", icon: <AlertTriangle className="w-3 h-3" /> },
  published: { label: "Published", color: "bg-[#e30613]/10 text-[#e30613]", icon: <Newspaper className="w-3 h-3" /> },
};

const InfoTooltip: React.FC<{ text: string }> = ({ text }) => {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-flex items-center ml-1.5 align-middle">
      <button
        type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
        aria-label="Information"
        className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors p-0.5 rounded focus:outline-none"
      >
        <Info className="w-3.5 h-3.5" />
      </button>
      {show && (
        <span className="absolute left-0 sm:left-1/2 sm:-translate-x-1/2 top-full mt-2 w-64 p-2.5 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-[11px] font-normal leading-relaxed shadow-2xl border border-zinc-700 dark:border-zinc-300 z-[999] animate-fadeIn pointer-events-none rounded-sm block text-left">
          {text}
          <span className="absolute bottom-full left-4 sm:left-1/2 sm:-translate-x-1/2 -mb-px border-4 border-transparent border-b-zinc-900 dark:border-b-zinc-100 block" />
        </span>
      )}
    </span>
  );
};

// ── EDITOR DASHBOARD VIEW (For Editors) ──────────────────────────
function EditorDashboardView() {
  const [allArticles, setAllArticles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [pubFilter, setPubFilter] = useState("");

  const fetchArticles = async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await apiFetch<{ articles: any[]; total: number }>("/articles");
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
    if (!confirm(`Delete article "${title}"? This cannot be undone.`)) return;
    try {
      await apiFetch(`/articles/${id}`, { method: "DELETE" });
      fetchArticles();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const submittedCount = allArticles.filter(a => a.status === "submitted").length;
  const approvedCount = allArticles.filter(a => a.status === "approved").length;
  const revisionCount = allArticles.filter(a => a.status === "revision_requested").length;
  const totalCount = allArticles.length;

  const displayedArticles = allArticles.filter((a) => {
    if (statusFilter && a.status !== statusFilter) return false;
    if (pubFilter && a.publication !== pubFilter) return false;
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
            <CheckCircle2 className="w-4 h-4" />
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
            <span className="text-xs font-bold uppercase tracking-wider">Total Articles</span>
            <FileText className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-zinc-900 dark:text-zinc-50">{totalCount}</div>
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

      {/* Articles List */}
      {isLoading ? (
        <div className="space-y-3">
          <ArticleRowSkeleton />
          <ArticleRowSkeleton />
          <ArticleRowSkeleton />
        </div>
      ) : displayedArticles.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#161616] border border-zinc-200 dark:border-zinc-800">
          <FileText className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-2" />
          <p className="text-sm font-bold text-zinc-500">No articles found in queue</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedArticles.map((article) => {
            const isSubmitted = article.status === "submitted";
            const st = STATUS_CONFIG[article.status] || STATUS_CONFIG.draft;
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
                    <span className="px-1.5 py-0.5 text-[10px] font-black text-white bg-red-600">
                      {article.publication === "DataQuest" ? "DQ" : article.publication === "VoiceData" ? "V&D" : "PCQ"}
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
                    <span>Author: <strong className="text-zinc-600 dark:text-zinc-300">{article.created_by_name}</strong></span>
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

export default function Dashboard() {
  const { user, isEditor, logout, isLoading: authLoading } = useAuth();

  // ── Magazine segment state ───────────────────────────────────────
  const [magazine, setMagazine] = useState<MagazineKey>("Dataquest");
  const mag = magazineList.find((m) => m.key === magazine)!;

  // Save article state
  const [isSaving, setIsSaving] = useState(false);
  const [savedArticleId, setSavedArticleId] = useState<string | null>(null);

  const [pressRelease, setPressRelease] = useState("");
  const [customApiKey, setCustomApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isApiKeySaved, setIsApiKeySaved] = useState(false);

  // Generation states
  const [status, setStatus] = useState<"idle" | "generating" | "completed" | "error">("idle");
  const [currentStep, setCurrentStep] = useState(0);
  const [stepMessage, setStepMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [packageData, setPackageData] = useState<EditorialPackage>({});

  // Parameters
  const [topicType, setTopicType] = useState<"News" | "Interview" | "Opinion" | "Feature" | "CaseStudy" | "">("");
  const [wordPreset, setWordPreset] = useState<keyof typeof wordPresets>("medium");
  const [minWords, setMinWords] = useState<number>(600);
  const [maxWords, setMaxWords] = useState<number>(800);
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [generateImage, setGenerateImage] = useState<boolean>(true);
  const [imageCount, setImageCount] = useState<number>(1);
  const [humanize, setHumanize] = useState<boolean>(true);
  const [referencePCQuest, setReferencePCQuest] = useState<boolean>(true);
  const [handsOnData, setHandsOnData] = useState<boolean>(false);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showStartOverModal, setShowStartOverModal] = useState(false);

  const wordCount = pressRelease.trim().split(/\s+/).filter(Boolean).length;
  const canGenerate = !!pressRelease.trim() && !!topicType && status !== "generating";

  useEffect(() => {
    const preset = wordPresets[wordPreset];
    setMinWords(preset.min);
    setMaxWords(preset.max);
  }, [wordPreset]);

  useEffect(() => {
    if (topicType === "Feature") setWordPreset("feature");
    else if (wordPreset === "feature") setWordPreset("medium");
  }, [topicType]);

  useEffect(() => {
    const saved = sessionStorage.getItem("gemini_api_key");
    if (saved) { setCustomApiKey(saved); setIsApiKeySaved(true); }
  }, []);

  const handleClearPR = () => { setPressRelease(""); };

  const handleReset = () => {
    setStatus("idle");
    setCurrentStep(0);
    setStepMessage("");
    setErrorMessage("");
    setPackageData({});
    setSavedArticleId(null);
  };

  const handleGenerate = async () => {
    if (isEditor) { setErrorMessage("Article generation is restricted to Authors."); setStatus("error"); return; }
    if (!topicType) { setErrorMessage("Please select an Article Type first."); setStatus("error"); return; }
    if (!pressRelease.trim()) { setErrorMessage("Please paste a press release first."); setStatus("error"); return; }

    setStatus("generating");
    setCurrentStep(1);
    setStepMessage("Connecting to Gemini AI...");
    setErrorMessage("");
    setPackageData({});

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pressRelease,
          customApiKey: customApiKey.trim() || undefined,
          topicType, minWords, maxWords, customPrompt,
          generateImage, imageCount, humanize, referencePCQuest, hands_on_data: handsOnData, magazine,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Generation failed.");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Stream not available.");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const payload = JSON.parse(line);
            if (payload.type === "step") { setCurrentStep(payload.step); setStepMessage(payload.message); }
            else if (payload.type === "data") { setPackageData((prev) => ({ ...prev, [payload.key]: payload.data })); }
            else if (payload.type === "done") {
              setStatus("completed");
              import("canvas-confetti").then((m) =>
                m.default({ particleCount: 120, spread: 70, origin: { y: 0.6 }, colors: [mag.accentHex, "#ffffff", "#111111"] })
              );
            } else if (payload.type === "error") { throw new Error(payload.message); }
          } catch (jsonErr: any) {
            if (line.includes('"type":"error"')) throw new Error(jsonErr.message || "Error.");
          }
        }
      }
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message || "An unexpected error occurred.");
    }
  };

  const handleSaveArticle = async () => {
    if (isEditor) { alert("Article saving is restricted to Authors."); return; }
    if (!packageData.news) return;
    setIsSaving(true);
    try {
      const res = await apiFetch<{ id: string }>("/articles", {
        method: "POST",
        body: JSON.stringify({
          title: packageData.news.headline || "Untitled Article",
          publication: magazine,
          press_release: pressRelease,
          news_data: packageData.news,
          seo_data: packageData.seo,
          impact_data: packageData.impact,
          interview_data: packageData.interview,
          review_data: packageData.review,
          social_data: packageData.social,
          creative_data: packageData.creative
            ? { images: packageData.creative.images?.map((img) => ({ title: img.title, prompt: img.prompt })) }
            : null,
        }),
      });
      setSavedArticleId(res.id);
    } catch (err: any) {
      alert("Failed to save article: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const getStepsForTopic = () => {
    let steps: { id: number; name: string }[] = [];
    if (topicType === "Interview") steps = [{ id: 1, name: "Interview Q&A" }, { id: 2, name: "Interview Prep & Queries" }, { id: 3, name: "SEO Assets" }];
    else if (topicType === "Opinion") steps = [{ id: 1, name: "Opinion Piece" }, { id: 2, name: "SEO Assets" }, { id: 3, name: "Editorial Review" }];
    else if (topicType === "Feature") steps = [{ id: 1, name: "Feature Article" }, { id: 2, name: "Industry Impact Analysis" }, { id: 3, name: "SEO Assets" }];
    else if (topicType === "CaseStudy") steps = [{ id: 1, name: "Case Study" }, { id: 2, name: "SEO Assets" }, { id: 3, name: "Editorial Review" }];
    else steps = [{ id: 1, name: "News Article" }, { id: 2, name: "SEO Assets" }, { id: 3, name: "Social Media" }, { id: 4, name: "Editorial Review" }];
    if (generateImage) steps.push({ id: steps.length + 1, name: "Cover Banner" });
    return steps;
  };

  const labelCls = "block text-[13px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5";
  const inputCls = `w-full text-[14px] px-3.5 py-2.5 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-[#111] text-zinc-900 dark:text-zinc-100 focus:outline-none ${magazine === "Voice&Data" ? "focus:border-[#00839b]" : "focus:border-[#e30613]"} transition-colors placeholder:text-zinc-400 dark:placeholder:text-zinc-600`;
  const selectCls = `${inputCls} cursor-pointer appearance-none pr-9`;
  const stepBadge = `inline-flex items-center justify-center w-6 h-6 rounded-full ${magazine === "Voice&Data" ? "bg-[#00839b]" : "bg-[#e30613]"} text-white text-[11px] font-black flex-shrink-0 mr-2`;

  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen bg-[#f5f5f5] dark:bg-[#0d0d0d] text-zinc-900 dark:text-zinc-100 flex flex-col lg:overflow-hidden">

      {/* ── HEADER ────────────────────────────────────────────────── */}
      <header className="bg-white dark:bg-[#111] border-b border-zinc-200 dark:border-zinc-800 flex-shrink-0 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className={`w-1 h-8 flex-shrink-0 transition-colors ${magazine === "Voice&Data" ? "bg-[#00839b]" : "bg-[#e30613]"}`} />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-[17px] font-black text-zinc-900 dark:text-zinc-50 leading-none">
                  CYBERMEDIA
                </span>
                <span className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase hidden sm:inline">
                  {isEditor ? "Editor Control Hub" : "AI Editorial Copilot"}
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 mt-0.5 truncate max-w-[200px] sm:max-w-none">
                {isEditor ? "Review, approve & publish article submissions" : mag.tagline}
              </p>
            </div>
          </div>

          {/* Publication Switcher (for Authors) */}
          {!isEditor && (
            <div className="flex items-center p-0.5 border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 rounded-xs h-8">
              {magazineList.map((m) => {
                const isActive = magazine === m.key;
                return (
                  <button
                    key={m.key}
                    id={`segment-${m.key}`}
                    onClick={() => {
                      setMagazine(m.key);
                      setPressRelease("");
                      handleReset();
                    }}
                    className={`h-7 px-3 text-[11px] font-bold transition-all flex items-center justify-center rounded-xs ${
                      isActive
                        ? m.key === "Voice&Data" ? "bg-[#00839b] text-white shadow-xs" : "bg-[#e30613] text-white shadow-xs"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                    }`}
                  >
                    {m.name}
                  </button>
                );
              })}
            </div>
          )}

          {/* Right Controls - Perfect Height Alignment */}
          <div className="flex items-center gap-2">
            <Link
              href="/articles"
              className="h-8 px-3 text-[11px] font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors inline-flex items-center gap-1.5 rounded-xs"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              {isEditor ? "Review Queue & Articles" : "My Articles"}
            </Link>

            {!isEditor && status === "completed" && packageData.news && (
              savedArticleId ? (
                <Link
                  href={`/articles/${savedArticleId}`}
                  className="h-8 px-3 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 transition-colors inline-flex items-center gap-1.5 rounded-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Saved
                </Link>
              ) : (
                <button
                  onClick={handleSaveArticle}
                  disabled={isSaving}
                  className="h-8 px-3 text-[11px] font-bold bg-[#e30613] text-white hover:bg-[#b8040f] transition-colors disabled:opacity-50 inline-flex items-center gap-1.5 rounded-xs cursor-pointer"
                >
                  {isSaving ? (
                    <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                  ) : (
                    <><Save className="w-3.5 h-3.5" /> Save Article</>
                  )}
                </button>
              )
            )}

            {user && (
              <div className="h-8 px-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] inline-flex items-center gap-1.5 rounded-xs">
                <span className={`px-1.5 py-0.5 text-[9px] font-black text-white ${user.role === "editor" ? "bg-blue-600" : "bg-zinc-600"}`}>
                  {user.role === "editor" ? "EDITOR" : "AUTHOR"}
                </span>
                <span className="font-bold text-zinc-700 dark:text-zinc-300">{user.full_name}</span>
              </div>
            )}

            <div className="h-8 flex items-center">
              <ThemeToggle />
            </div>

            <button
              onClick={logout}
              className="h-8 w-8 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors inline-flex items-center justify-center border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 rounded-xs cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ── DUAL WORKSPACE RENDER ───────────────────────────────────── */}
      {isEditor ? (
        /* EDITOR WORKSPACE VIEW */
        <EditorDashboardView />
      ) : (
        /* AUTHOR WORKSPACE VIEW (Article Generator) */
        <>
          {/* Publication Bar */}
          <div key={mag.key} className={`${magazine === "Voice&Data" ? "bg-[#00839b]/10 border-[#00839b]/20 text-[#00839b]" : "bg-[#e30613]/10 border-[#e30613]/20 text-[#e30613]"} border-b px-5 py-1.5 flex items-center justify-between text-[11px] font-semibold animate-fadeIn flex-shrink-0`}>
            <span className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${magazine === "Voice&Data" ? "bg-[#00839b]" : "bg-[#e30613]"} animate-pulse`} />
              Active Publication: <strong>{mag.name}</strong> (
              <a
                href={`https://www.${mag.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors inline-flex items-center gap-0.5"
              >
                {mag.domain} <ExternalLink className="w-2.5 h-2.5" />
              </a>
              )
            </span>
            <span className="text-[10px] text-zinc-500 font-medium hidden sm:inline">
              Configured for {mag.name} Editorial Style
            </span>
          </div>

          <main className="flex-1 min-h-0 max-w-6xl mx-auto w-full px-4 sm:px-6 py-4 grid grid-cols-1 lg:grid-cols-2 gap-5 lg:items-stretch lg:overflow-hidden">
            {/* LEFT: INPUT FORM */}
            <section className="bg-white dark:bg-[#161616] border border-zinc-200 dark:border-zinc-800 flex flex-col h-full min-h-0 overflow-hidden">
              <div className="px-5 py-2.5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-[#1a1a1a] flex-shrink-0 flex items-center justify-between">
                <div>
                  <h2 className="text-[14px] font-bold text-zinc-800 dark:text-zinc-200">Create Article</h2>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Follow the 3 steps below to generate a ready-to-publish article.</p>
                </div>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-extrabold ${magazine === "Voice&Data" ? "bg-[#e59e19] text-zinc-950 font-black" : "bg-[#e30613] text-white"} tracking-wider uppercase`}>
                  {mag.shortName} Engine
                </span>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto scroller px-5 py-5 space-y-6">
                {/* STEP 1: Press Release */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="flex items-center text-[14px] font-bold text-zinc-800 dark:text-zinc-200">
                      <span className={stepBadge}>1</span> Paste the Press Release
                      <InfoTooltip text="Paste raw text, press release, or product announcement." />
                    </h3>
                    {pressRelease && (
                      <button onClick={handleClearPR} className="text-[12px] text-zinc-400 hover:text-red-500 transition-colors flex items-center gap-1">
                        <Trash2 className="w-3.5 h-3.5" /> Clear
                      </button>
                    )}
                  </div>
                  <div className="ml-8 space-y-3">
                    <textarea
                      value={pressRelease}
                      onChange={(e) => setPressRelease(e.target.value)}
                      placeholder="Paste the full press release or article text here..."
                      rows={6}
                      className={inputCls + " resize-none font-mono text-[13px] leading-relaxed"}
                    />
                    <div className="flex justify-between items-center text-[11px] text-zinc-400">
                      <span>{wordCount} words</span>
                      <span>Min recommended: 100 words</span>
                    </div>
                  </div>
                </div>

                <hr className="border-zinc-100 dark:border-zinc-800" />

                {/* STEP 2: Article Type */}
                <div>
                  <h3 className="flex items-center text-[14px] font-bold text-zinc-800 dark:text-zinc-200 mb-3">
                    <span className={stepBadge}>2</span> Choose Article Type
                    <InfoTooltip text="Select format: News, Interview, Opinion, Feature, or Case Study." />
                  </h3>
                  <div className="ml-8 grid grid-cols-2 gap-2">
                    {articleTypes.map((type) => {
                      const Icon = type.icon;
                      const isSelected = topicType === type.id;
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setTopicType(type.id as any)}
                          className={`p-3 border text-left transition-all ${
                            isSelected
                              ? magazine === "Voice&Data" ? "border-[#00839b] bg-[#00839b]/5 dark:bg-[#00839b]/10" : "border-[#e30613] bg-[#e30613]/5 dark:bg-[#e30613]/10"
                              : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Icon className={`w-4 h-4 ${isSelected ? magazine === "Voice&Data" ? "text-[#00839b]" : "text-[#e30613]" : "text-zinc-400"}`} />
                            <span className="text-[13px] font-bold">{type.label}</span>
                          </div>
                          <p className="text-[11px] text-zinc-400 mt-1">{type.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <hr className="border-zinc-100 dark:border-zinc-800" />

                {/* STEP 3: Settings */}
                <div>
                  <h3 className="flex items-center text-[14px] font-bold text-zinc-800 dark:text-zinc-200 mb-3">
                    <span className={stepBadge}>3</span> Article Settings
                    <InfoTooltip text="Configure length, image, tone, and link preferences." />
                  </h3>
                  <div className="ml-8 space-y-4">
                    <div>
                      <label className={labelCls}>Article Length</label>
                      <CustomSelect
                        options={Object.entries(wordPresets).map(([key, { label }]) => ({
                          value: key,
                          label,
                        }))}
                        value={wordPreset}
                        onChange={(val) => setWordPreset(val as any)}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-[13px] font-semibold cursor-pointer">
                        <input type="checkbox" checked={humanize} onChange={(e) => setHumanize(e.target.checked)} className="checkbox-editorial" style={{ accentColor: magazine === "Voice&Data" ? "#00839b" : "#e30613" }} />
                        Natural Human Journalist Tone
                      </label>
                      <label className="flex items-center gap-2 text-[13px] font-semibold cursor-pointer">
                        <input type="checkbox" checked={generateImage} onChange={(e) => setGenerateImage(e.target.checked)} className="checkbox-editorial" style={{ accentColor: magazine === "Voice&Data" ? "#00839b" : "#e30613" }} />
                        Generate Cover Banner Image
                      </label>
                      <label className="flex items-center gap-2 text-[13px] font-semibold cursor-pointer">
                        <input type="checkbox" checked={referencePCQuest} onChange={(e) => setReferencePCQuest(e.target.checked)} className="checkbox-editorial" style={{ accentColor: magazine === "Voice&Data" ? "#00839b" : "#e30613" }} />
                        Link to related {mag.name} articles
                      </label>
                    </div>

                    {/* Advanced Settings Accordion */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                      >
                        <Settings2 className="w-3.5 h-3.5" />
                        {showAdvanced ? "Hide Advanced Settings" : "Show Advanced Settings"}
                        {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {showAdvanced && (
                        <div className="mt-3 p-3.5 bg-zinc-50 dark:bg-[#111] border border-zinc-200 dark:border-zinc-800 space-y-4.5 rounded-xs animate-in fade-in duration-150">
                          {/* Custom Prompt Directives */}
                          <div className="space-y-1.5">
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                              Custom Editorial Instructions / Directives
                            </label>
                            <textarea
                              value={customPrompt}
                              onChange={(e) => setCustomPrompt(e.target.value)}
                              placeholder="e.g., Focus heavily on 5G spectrum allocation, include executive quotes, emphasize India enterprise impact..."
                              rows={2}
                              className="w-full px-3 py-2 text-xs bg-white dark:bg-[#161616] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#e30613] transition-all placeholder:text-zinc-400 resize-none font-mono"
                            />
                          </div>

                          {/* Custom Gemini API Key */}
                          <div className="space-y-1.5">
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                              Custom Gemini API Key (Optional)
                            </label>
                            <div className="flex gap-2">
                              <input
                                type={showApiKey ? "text" : "password"}
                                value={customApiKey}
                                onChange={(e) => {
                                  setCustomApiKey(e.target.value);
                                  setIsApiKeySaved(false);
                                }}
                                placeholder="AIzaSy..."
                                className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-[#161616] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#e30613] font-mono"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (customApiKey.trim()) {
                                    sessionStorage.setItem("gemini_api_key", customApiKey.trim());
                                    setIsApiKeySaved(true);
                                  } else {
                                    sessionStorage.removeItem("gemini_api_key");
                                    setIsApiKeySaved(false);
                                  }
                                }}
                                className="px-3 py-1.5 text-xs font-bold bg-zinc-800 text-white hover:bg-black dark:bg-zinc-700 dark:hover:bg-zinc-600 transition-colors"
                              >
                                {isApiKeySaved ? "Saved!" : "Save Key"}
                              </button>
                            </div>
                          </div>

                          {/* Magazine Specific Checks */}
                          <div className="pt-1">
                            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer text-zinc-700 dark:text-zinc-300">
                              <input
                                type="checkbox"
                                checked={handsOnData}
                                onChange={(e) => setHandsOnData(e.target.checked)}
                                className="checkbox-editorial"
                                style={{ accentColor: magazine === "Voice&Data" ? "#00839b" : "#e30613" }}
                              />
                              Include CyberMedia Labs Hands-on Testing Benchmark Data
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* GENERATE BUTTON */}
                <div className="space-y-3 pt-2">
                  <button
                    onClick={handleGenerate}
                    disabled={!canGenerate}
                    className={`btn-primary w-full text-[13px] py-4 gap-2.5 ${!canGenerate ? "!bg-zinc-200 dark:!bg-zinc-800 !text-zinc-400 !cursor-not-allowed" : ""}`}
                  >
                    <Sparkles className={`w-4 h-4 ${status === "generating" ? "animate-spin" : ""}`} />
                    {status === "generating"
                      ? `Generating step ${currentStep} of ${getStepsForTopic().length}...`
                      : "Generate Article"}
                  </button>

                  {status !== "idle" && (
                    <button onClick={handleReset} className="btn-ghost w-full text-[12px] py-2">
                      <RotateCcw className="w-3.5 h-3.5" /> Start over
                    </button>
                  )}
                </div>
              </div>
            </section>

            {/* RIGHT: OUTPUT PANEL */}
            <section className="h-full flex flex-col min-h-0 overflow-hidden">
              <OutputPanel
                packageData={packageData}
                magazine={magazine}
                status={status}
                currentStep={currentStep}
                stepMessage={stepMessage}
                steps={getStepsForTopic()}
              />
            </section>
          </main>
        </>
      )}
    </div>
  );
}
