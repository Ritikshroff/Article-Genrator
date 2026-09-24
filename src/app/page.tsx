"use client";
// ─────────────────────────────────────────────────────────────
// page.tsx
// Main Editorial Dashboard Orchestrator
// ─────────────────────────────────────────────────────────────

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  CheckCircle2,
  ExternalLink,
  LogOut,
  FolderOpen,
  Save,
  BarChart3,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { OutputPanel } from "@/components/OutputPanel";
import { magazineList } from "@/lib/magazineConfig";
import { useAuth } from "@/lib/authContext";
import { useToast } from "@/lib/toastContext";
import { FullPageSkeleton } from "@/components/Skeletons";
import { EditorDashboardView } from "@/features/editor/EditorDashboardView";
import { GeneratorForm } from "@/features/generator/GeneratorForm";
import { useGenerator } from "@/features/generator/useGenerator";

export default function Dashboard() {
  const { user, isEditor, canAccessMonitoring, logout, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const gen = useGenerator(isEditor);

  const steps = gen.getStepsForTopic();

  if (authLoading) {
    return <FullPageSkeleton />;
  }

  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen bg-[#f5f5f5] dark:bg-[#0d0d0d] text-zinc-900 dark:text-zinc-100 flex flex-col lg:overflow-hidden">
      {/* ── HEADER ────────────────────────────────────────────────── */}
      <header className="bg-white dark:bg-[#111] border-b border-zinc-200 dark:border-zinc-800 flex-shrink-0 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div
              className={`w-1 h-8 flex-shrink-0 transition-colors ${
                gen.magazine === "Voice&Data" ? "bg-[#00839b]" : "bg-[#e30613]"
              }`}
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-[17px] font-black text-zinc-900 dark:text-zinc-50 leading-none">
                  CYBERMEDIA
                </span>
                <span className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase hidden sm:inline">
                  {isEditor ? "ASED • Editor Hub" : "AI Stack for Edit desk (ASED)"}
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 mt-0.5 truncate max-w-[200px] sm:max-w-none">
                {isEditor ? "Review, approve & publish article submissions" : gen.mag.tagline}
              </p>
            </div>
          </div>

          {/* Publication Switcher (for Authors) */}
          {!isEditor && (
            <div className="flex items-center p-0.5 border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 rounded-xs h-8">
              {magazineList.map((m) => {
                const isActive = gen.magazine === m.key;
                return (
                  <button
                    key={m.key}
                    id={`segment-${m.key}`}
                    onClick={() => {
                      gen.setMagazine(m.key);
                      gen.handleClearPR();
                      gen.handleReset();
                    }}
                    className={`h-7 px-3 text-[11px] font-bold transition-all flex items-center justify-center rounded-xs cursor-pointer ${
                      isActive
                        ? m.key === "Voice&Data"
                          ? "bg-[#00839b] text-white shadow-xs"
                          : "bg-[#e30613] text-white shadow-xs"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                    }`}
                  >
                    {m.name}
                  </button>
                );
              })}
            </div>
          )}

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            {canAccessMonitoring && (
              <Link
                href="/analytics"
                className="h-8 px-3 text-[11px] font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors inline-flex items-center gap-1.5 rounded-xs"
              >
                <BarChart3 className="w-3.5 h-3.5 text-[#e30613]" />
                <span className="hidden sm:inline">ASED Monitor</span>
              </Link>
            )}

            <Link
              href="/articles"
              className="h-8 px-3 text-[11px] font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors inline-flex items-center gap-1.5 rounded-xs"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              {isEditor ? "Review Queue & Articles" : "My Articles"}
            </Link>

            {!isEditor && gen.status === "completed" && gen.packageData.news && (
              gen.savedArticleId ? (
                <Link
                  href={`/articles/${gen.savedArticleId}`}
                  className="h-8 px-3 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 transition-colors inline-flex items-center gap-1.5 rounded-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Saved
                </Link>
              ) : (
                <button
                  onClick={gen.handleSaveArticle}
                  disabled={gen.isSaving}
                  className="h-8 px-3 text-[11px] font-bold bg-[#e30613] text-white hover:bg-[#b8040f] transition-colors disabled:opacity-50 inline-flex items-center gap-1.5 rounded-xs cursor-pointer"
                >
                  {gen.isSaving ? (
                    <>
                      <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" /> Save Article
                    </>
                  )}
                </button>
              )
            )}

            {user && (
              <div className="h-8 px-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] inline-flex items-center gap-1.5 rounded-xs">
                <span
                  className={`px-1.5 py-0.5 text-[9px] font-black text-white ${
                    user.role === "editor" ? "bg-blue-600" : "bg-zinc-600"
                  }`}
                >
                  {user.role === "editor" ? "EDITOR" : "AUTHOR"}
                </span>
                <span className="font-bold text-zinc-700 dark:text-zinc-300">{user.full_name}</span>
              </div>
            )}

            <div className="h-8 flex items-center">
              <ThemeToggle />
            </div>

            <button
              onClick={() => {
                toast.info("You have been signed out.");
                logout();
              }}
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
          {/* Global Sticky Generation Progress Banner */}
          {gen.status === "generating" && (
            <div className="fixed top-0 left-0 right-0 z-[9999] bg-[#e30613] text-white px-5 py-2.5 shadow-2xl flex items-center justify-between border-b border-red-700 animate-pulse">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 animate-spin text-amber-300" />
                <div>
                  <span className="text-xs font-black uppercase tracking-wider block">
                    ⚡ AI ARTICLE GENERATION IN PROGRESS
                  </span>
                  <span className="text-[11px] opacity-90 font-medium">
                    Step {gen.currentStep || 1} of {steps.length || 4}:{" "}
                    {gen.stepMessage || "Writing 11-field PubLive metadata & editorial draft..."} —
                    Please stay on this page!
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline-block text-[10px] font-black bg-white text-[#e30613] px-3 py-1 uppercase tracking-widest rounded-xs shadow-xs">
                  {Math.round(((gen.currentStep || 1) / (steps.length || 4)) * 100)}% COMPLETE
                </span>
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              </div>
            </div>
          )}

          {/* Publication Bar */}
          <div
            key={gen.mag.key}
            className={`${
              gen.magazine === "Voice&Data"
                ? "bg-[#00839b]/10 border-[#00839b]/20 text-[#00839b]"
                : "bg-[#e30613]/10 border-[#e30613]/20 text-[#e30613]"
            } border-b px-5 py-1.5 flex items-center justify-between text-[11px] font-semibold animate-fadeIn flex-shrink-0`}
          >
            <span className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  gen.magazine === "Voice&Data" ? "bg-[#00839b]" : "bg-[#e30613]"
                } animate-pulse`}
              />
              Active Publication: <strong>{gen.mag.name}</strong> (
              <a
                href={`https://www.${gen.mag.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors inline-flex items-center gap-0.5"
              >
                {gen.mag.domain} <ExternalLink className="w-2.5 h-2.5" />
              </a>
              )
            </span>
            <span className="text-[10px] text-zinc-500 font-medium hidden sm:inline">
              Configured for {gen.mag.name} Editorial Style
            </span>
          </div>

          <main className="flex-1 min-h-0 max-w-6xl mx-auto w-full px-4 sm:px-6 py-4 grid grid-cols-1 lg:grid-cols-2 gap-5 lg:items-stretch lg:overflow-hidden">
            {/* LEFT: INPUT FORM */}
            <GeneratorForm
              magazine={gen.magazine}
              mag={gen.mag}
              pressRelease={gen.pressRelease}
              setPressRelease={gen.setPressRelease}
              handleClearPR={gen.handleClearPR}
              wordCount={gen.wordCount}
              topicType={gen.topicType}
              setTopicType={gen.setTopicType}
              wordPreset={gen.wordPreset}
              setWordPreset={gen.setWordPreset}
              humanize={gen.humanize}
              setHumanize={gen.setHumanize}
              generateImage={gen.generateImage}
              setGenerateImage={gen.setGenerateImage}
              imageCount={gen.imageCount}
              setImageCount={gen.setImageCount}
              referencePCQuest={gen.referencePCQuest}
              setReferencePCQuest={gen.setReferencePCQuest}
              showAdvanced={gen.showAdvanced}
              setShowAdvanced={gen.setShowAdvanced}
              customPrompt={gen.customPrompt}
              setCustomPrompt={gen.setCustomPrompt}
              handsOnData={gen.handsOnData}
              setHandsOnData={gen.setHandsOnData}
              canGenerate={gen.canGenerate}
              status={gen.status}
              currentStep={gen.currentStep}
              totalSteps={steps.length || 4}
              handleGenerate={gen.handleGenerate}
              handleReset={gen.handleReset}
            />

            {/* RIGHT: OUTPUT PANEL */}
            <section className="h-full flex flex-col min-h-0 overflow-hidden">
              <OutputPanel
                packageData={gen.packageData}
                magazine={gen.magazine}
                status={gen.status}
                currentStep={gen.currentStep}
                stepMessage={gen.stepMessage}
                steps={steps}
              />
            </section>
          </main>
        </>
      )}
    </div>
  );
}
