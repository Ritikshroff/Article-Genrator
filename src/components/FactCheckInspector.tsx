"use client";
// ─────────────────────────────────────────────────────────────
// FactCheckInspector.tsx
// Interactive Same-Screen Audit Panel & Grounding Inspector
// ─────────────────────────────────────────────────────────────

import React, { useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  X,
  Copy,
  Check,
  ExternalLink,
  Zap,
  Info,
} from "lucide-react";
import type { FactCheckReport, FactCheckClaim } from "@/lib/factCheckEngine";

interface FactCheckInspectorProps {
  report: FactCheckReport | null;
  isOpen: boolean;
  onClose: () => void;
  onHighlightClaim?: (claim: FactCheckClaim) => void;
}

export const FactCheckInspector: React.FC<FactCheckInspectorProps> = ({
  report,
  isOpen,
  onClose,
  onHighlightClaim,
}) => {
  const [filter, setFilter] = useState<"all" | "verified" | "unverified">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen || !report) return null;

  const filteredClaims = report.claims.filter((c) => {
    if (filter === "verified") return c.status === "verified";
    if (filter === "unverified") return c.status === "unverified";
    return true;
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-600 dark:text-emerald-400 border-emerald-500";
    if (score >= 75) return "text-amber-600 dark:text-amber-400 border-amber-500";
    return "text-rose-600 dark:text-rose-400 border-rose-500";
  };

  return (
    <aside
      aria-label="Fact Check Verification Inspector"
      className="w-full md:w-[380px] lg:w-[420px] bg-white dark:bg-[#151515] border-l border-zinc-200 dark:border-zinc-800 flex flex-col h-full z-40 animate-in slide-in-from-right duration-200"
    >
      {/* Header */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-[#1a1a1a]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-sm">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              Source Fidelity Audit
            </h3>
            <p className="text-[10px] text-zinc-400">Verifying claims against press release</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer rounded"
          title="Close Audit Panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Score Summary Box */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#161616] space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              Grounding Score
            </div>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className={`text-2xl font-black ${getScoreColor(report.fidelityScore).split(" ")[0]}`}>
                {report.fidelityScore}%
              </span>
              <span className="text-[11px] text-zinc-500 font-medium">Source Fidelity</span>
            </div>
          </div>

          <div className="text-right">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-xs">
              <Zap className="w-2.5 h-2.5 text-amber-500" />
              {report.tokenCost === 0 ? "0 Tokens (Instant)" : "Budget Optimized"}
            </span>
            <div className="text-[10px] text-zinc-400 mt-1">{report.executionTimeMs}ms execution</div>
          </div>
        </div>

        {/* Status Pills */}
        <div className="grid grid-cols-3 gap-1.5 pt-1">
          <div className="p-2 border border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xs text-center">
            <div className="text-xs font-black text-emerald-700 dark:text-emerald-400">
              {report.verifiedCount}
            </div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-500">
              Verified
            </div>
          </div>

          <div className="p-2 border border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20 rounded-xs text-center">
            <div className="text-xs font-black text-blue-700 dark:text-blue-400">
              {report.contextCount}
            </div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-500">
              Context
            </div>
          </div>

          <div className="p-2 border border-amber-500/20 bg-amber-50/50 dark:bg-amber-950/20 rounded-xs text-center">
            <div className="text-xs font-black text-amber-700 dark:text-amber-400">
              {report.unverifiedCount}
            </div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-500">
              Review
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#181818] px-3 pt-2 gap-1 text-[11px] font-semibold">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 border-b-2 cursor-pointer transition-colors ${
            filter === "all"
              ? "border-[#e30613] text-[#e30613] font-bold"
              : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          }`}
        >
          All ({report.totalFacts})
        </button>
        <button
          onClick={() => setFilter("verified")}
          className={`px-3 py-1.5 border-b-2 cursor-pointer transition-colors ${
            filter === "verified"
              ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold"
              : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          }`}
        >
          Verified ({report.verifiedCount})
        </button>
        <button
          onClick={() => setFilter("unverified")}
          className={`px-3 py-1.5 border-b-2 cursor-pointer transition-colors ${
            filter === "unverified"
              ? "border-amber-500 text-amber-600 dark:text-amber-400 font-bold"
              : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          }`}
        >
          Needs Review ({report.unverifiedCount})
        </button>
      </div>

      {/* Claims List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scroller">
        {filteredClaims.length === 0 ? (
          <div className="p-8 text-center text-zinc-400 text-xs">
            No claims matching this filter.
          </div>
        ) : (
          filteredClaims.map((claim) => (
            <div
              key={claim.id}
              onClick={() => onHighlightClaim && onHighlightClaim(claim)}
              className={`p-3 border transition-all rounded-xs space-y-2 cursor-pointer ${
                claim.status === "verified"
                  ? "border-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/10 hover:border-emerald-500/40"
                  : claim.status === "context"
                  ? "border-blue-500/20 bg-blue-50/20 dark:bg-blue-950/10 hover:border-blue-500/40"
                  : "border-amber-500/30 bg-amber-50/30 dark:bg-amber-950/20 hover:border-amber-500/60"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  {claim.status === "verified" ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  ) : claim.status === "context" ? (
                    <Info className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    {claim.claim}
                  </span>
                </div>

                <span
                  className={`px-1.5 py-0.5 text-[9px] font-extrabold uppercase rounded-xs shrink-0 ${
                    claim.status === "verified"
                      ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                      : claim.status === "context"
                      ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                      : "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300"
                  }`}
                >
                  {claim.status === "verified" ? "100% Match" : claim.status === "context" ? "Archive" : "Audit"}
                </span>
              </div>

              {/* Source Snippet Proof */}
              {claim.sourceSnippet && (
                <div className="p-2 bg-white dark:bg-[#111] border border-zinc-200 dark:border-zinc-800 rounded-xs text-[11px] space-y-1">
                  <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Evidence ({claim.sourceName})</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(claim.sourceSnippet || "", claim.id);
                      }}
                      className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors flex items-center gap-0.5"
                    >
                      {copiedId === claim.id ? (
                        <>
                          <Check className="w-2.5 h-2.5 text-emerald-500" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-2.5 h-2.5" /> Copy Proof
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-zinc-700 dark:text-zinc-300 italic leading-snug">
                    "{claim.sourceSnippet}"
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#181818] text-[10px] text-zinc-500 flex items-center justify-between">
        <span>Deterministic Rule Grounding</span>
        <span className="font-semibold text-emerald-600 dark:text-emerald-400">0% Inference Bias</span>
      </div>
    </aside>
  );
};
