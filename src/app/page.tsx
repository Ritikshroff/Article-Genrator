"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles, Key, FileText, AlertCircle, Trash2,
  CheckCircle2, RotateCcw, ChevronRight
} from "lucide-react";
import { samplePRs } from "@/lib/samplePRs";
import { ThemeToggle } from "@/components/ThemeToggle";
import { StepProgress } from "@/components/StepProgress";
import { OutputPanel, EditorialPackage } from "@/components/OutputPanel";
import { magazineList, MagazineKey } from "@/lib/magazineConfig";

const defaultPrompts = {
  News: `SEO-optimised Dataquest news article:\n- Use H1/H2/H3 heading structure (## What Happened, ## India Perspective, ## What This Means, etc.)\n- Lead with inverted pyramid intro (Who, What, Where, When, Why in first 80 words)\n- Include primary keyword in first 100 words and in 2+ subheadings\n- Add India market angle section\n- End with FAQ section (4 Q&A pairs targeting long-tail queries)\n- Strip all marketing language`,
  Interview: `SEO-optimised interview-style or Q&A article:\n- Use H1/H2/H3 heading structure\n- Include primary keyword in first 100 words and in 2+ H2 subheadings\n- Structure Q&A with ## Q: [Question] and **A:** [Answer] format (min 5 pairs)\n- End with ## Key Takeaway section and FAQ (4 pairs)`,
  Opinion: `SEO-optimised expert opinion or editorial:\n- Use H1/H2/H3 heading structure\n- Include primary keyword in first 100 words and in subheadings\n- Include a ## The Other Side counter-argument section\n- End with ## The Bottom Line conclusion and FAQ (4 pairs)`,
  Feature: `SEO-optimised long-form feature or deep-dive:\n- Use H1/H2/H3 heading structure (## How It Works, ## Market Context, ## Why India Matters, etc.)\n- Include primary keyword in first 100 words and in 3+ subheadings\n- Every section must include a specific statistic or market figure\n- End with ## The Bigger Picture conclusion and FAQ (5 pairs)`,
  CaseStudy: `SEO-optimised corporate case study:\n- Use exact H2 structure: ## The Challenge → ## The Solution → ## The Results → ## Key Lessons\n- Include primary keyword in first 100 words and in Challenge + Results headings\n- Quantify outcomes in Results with hard numbers (%, time saved, scale)\n- End with ## What This Proves conclusion and FAQ (4 pairs)`,
};

export default function Dashboard() {
  // ── Magazine segment state ───────────────────────────────────────────
  // NOTE: Locked to DataQuest for editorial review.
  // To re-enable the switcher, change "DataQuest" back to "PCQuest"
  // and un-hide the switcher bar below.
  const [magazine, setMagazine] = useState<MagazineKey>("DataQuest");
  const mag = magazineList.find((m) => m.key === magazine)!;

  const [pressRelease, setPressRelease] = useState("");
  const [selectedSample, setSelectedSample] = useState("");
  const [customApiKey, setCustomApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isApiKeySaved, setIsApiKeySaved] = useState(false);

  // Generation states
  const [status, setStatus] = useState<"idle" | "generating" | "completed" | "error">("idle");
  const [currentStep, setCurrentStep] = useState(0);
  const [stepMessage, setStepMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [packageData, setPackageData] = useState<EditorialPackage>({});

  // Customization parameters
  const [topicType, setTopicType] = useState<"News" | "Interview" | "Opinion" | "Feature" | "CaseStudy" | "">("");
  const [minWords, setMinWords] = useState<number>(500);
  const [maxWords, setMaxWords] = useState<number>(700);
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [generateImage, setGenerateImage] = useState<boolean>(true);
  const [humanize, setHumanize] = useState<boolean>(true);
  const [referencePCQuest, setReferencePCQuest] = useState<boolean>(true);

  const filteredSamples = samplePRs.filter((pr) => pr.magazine === magazine);
  const wordCount = pressRelease.trim().split(/\s+/).filter(Boolean).length;

  useEffect(() => {
    if (topicType === "Feature") { setMinWords(800); setMaxWords(1200); }
    else { setMinWords(500); setMaxWords(700); }
  }, [topicType]);

  useEffect(() => {
    const saved = sessionStorage.getItem("gemini_api_key");
    if (saved) { setCustomApiKey(saved); setIsApiKeySaved(true); }
  }, []);

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (customApiKey.trim()) {
      sessionStorage.setItem("gemini_api_key", customApiKey);
      setIsApiKeySaved(true);
      setShowApiKey(false);
    }
  };

  const handleClearApiKey = () => {
    sessionStorage.removeItem("gemini_api_key");
    setCustomApiKey("");
    setIsApiKeySaved(false);
  };

  const handleSampleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedSample(val);
    if (!val) { setPressRelease(""); return; }
    const found = filteredSamples.find((p) => p.id === val);
    if (found) setPressRelease(found.content);
  };

  const handleClearPR = () => { setPressRelease(""); setSelectedSample(""); };

  const handleReset = () => {
    setStatus("idle");
    setCurrentStep(0);
    setStepMessage("");
    setErrorMessage("");
    setPackageData({});
  };

  const handleGenerate = async () => {
    if (!topicType) { setErrorMessage("Please select a Topic Type before generating."); setStatus("error"); return; }
    if (!pressRelease.trim()) { setErrorMessage("Please enter or select a Press Release before generating."); setStatus("error"); return; }

    setStatus("generating");
    setCurrentStep(1);
    setStepMessage("Initializing connection to Gemini API...");
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
          generateImage, humanize, referencePCQuest, magazine,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to generate editorial package.");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response reader available from the stream.");

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
            console.error("Stream parse error:", line, jsonErr);
            if (line.includes('"type":"error"')) throw new Error(jsonErr.message || "Model execution error.");
          }
        }
      }
    } catch (err: any) {
      console.error("Generation failed:", err);
      setStatus("error");
      setErrorMessage(err.message || "An unexpected error occurred during processing.");
    }
  };

  const getStepsForTopic = () => {
    let steps: { id: number; name: string }[] = [];
    if (topicType === "Interview") steps = [{ id: 1, name: "Interview Q&A" }, { id: 2, name: "Interview Prep & Queries" }, { id: 3, name: "SEO Asset Generator" }];
    else if (topicType === "Opinion") steps = [{ id: 1, name: "Opinion Piece" }, { id: 2, name: "SEO Asset Generator" }, { id: 3, name: "Editorial Review" }];
    else if (topicType === "Feature") steps = [{ id: 1, name: "Deep-Dive Feature" }, { id: 2, name: "Industry Impact Analysis" }, { id: 3, name: "SEO Asset Generator" }];
    else if (topicType === "CaseStudy") steps = [{ id: 1, name: "Case Study Generator" }, { id: 2, name: "SEO Asset Generator" }, { id: 3, name: "Editorial Review" }];
    else steps = [{ id: 1, name: "News Article Generator" }, { id: 2, name: "SEO Asset Generator" }, { id: 3, name: "Social Media Assets" }, { id: 4, name: "Editorial Review" }];
    if (generateImage) steps.push({ id: steps.length + 1, name: "Header Banner Creative" });
    return steps;
  };

  // ─── Shared label style ────────────────────────────────────────────
  const sectionLabel = "text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-400 dark:text-zinc-500 block mb-2";
  const inputCls = "w-full text-[13px] px-3 py-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111] text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#e30613] transition-colors placeholder:text-zinc-400 dark:placeholder:text-zinc-600 font-[Inter]";
  const selectCls = `${inputCls} cursor-pointer appearance-none`;

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0d0d0d] text-zinc-900 dark:text-zinc-100 flex flex-col transition-colors duration-200">

      {/* ── MAGAZINE SEGMENT SWITCHER — hidden for DQ editorial review ── */}
      <div className="hidden">
        <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111] sticky top-0 z-[60]">
          <div className="max-w-screen-xl mx-auto px-6 flex items-center gap-1 py-2">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mr-3 shrink-0">Edition:</span>
            {magazineList.map((m) => (
              <button
                key={m.key}
                id={`segment-${m.key}`}
                onClick={() => { setMagazine(m.key); setSelectedSample(""); setPressRelease(""); handleReset(); }}
                className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider border transition-colors ${
                  magazine === m.key
                    ? "bg-[#e30613] text-white border-[#e30613]"
                    : "text-zinc-500 border-transparent hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                {m.shortName}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111] sticky top-0 z-50">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">

          {/* Left: Brand */}
          <div className="flex items-center gap-0">
            {/* DQ red left-border accent mark */}
            <div className="w-1 self-stretch bg-[#e30613] mr-4 flex-shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-[17px] font-black leading-none text-zinc-900 dark:text-zinc-50 tracking-tight">
                  {mag.name}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-400 border-l border-zinc-300 dark:border-zinc-700 pl-2 ml-0.5">
                  Editorial AI
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5 tracking-wide">
                {mag.tagline}
              </p>
            </div>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-2">
            {/* API Key — hidden for editorial review */}
            <div className="hidden">
              <div className="relative">
                {isApiKeySaved ? (
                  <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">API Key Set</span>
                    <button
                      onClick={handleClearApiKey}
                      className="ml-1 text-zinc-400 hover:text-[#e30613] transition-colors text-xs font-bold"
                      title="Remove API Key"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-600 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
                  >
                    <Key className="w-3 h-3" />
                    API Key
                  </button>
                )}

                {/* API Key Dropdown */}
                {showApiKey && !isApiKeySaved && (
                  <div className="absolute right-0 mt-2 w-80 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-[#1a1a1a] shadow-xl z-50 animate-slideDown">
                    <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                        Google Gemini API Key
                      </p>
                    </div>
                    <form onSubmit={handleSaveApiKey} className="p-4 space-y-3">
                      <input
                        type="password"
                        placeholder="AIza..."
                        value={customApiKey}
                        onChange={(e) => setCustomApiKey(e.target.value)}
                        className={inputCls + " font-mono text-xs"}
                        required
                      />
                      <p className="text-[10px] text-zinc-400 leading-relaxed">
                        Stored in session only. Falls back to server <code className="text-[#e30613]">GEMINI_API_KEY</code> if not set.
                      </p>
                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowApiKey(false)}
                          className="flex-1 py-2 text-[11px] font-semibold uppercase tracking-wide border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-1 py-2 text-[11px] font-bold uppercase tracking-wide bg-[#e30613] text-white hover:bg-[#b8040f] transition-colors"
                        >
                          Save Key
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>

            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ── MAIN LAYOUT ─────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-screen-xl mx-auto w-full px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-px items-start lg:border-x border-zinc-200 dark:border-zinc-800">

        {/* ─── LEFT COLUMN: Input Form ─────────────────────────────────── */}
        <section className="lg:col-span-5 lg:border-r border-zinc-200 dark:border-zinc-800">

          {/* Panel header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-200 dark:border-zinc-800">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">
              Input — Press Release
            </p>
            {pressRelease.trim() && (
              <button
                onClick={handleClearPR}
                className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-400 hover:text-[#e30613] transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>

          <div className="px-5 py-5 space-y-5">

            {/* — Textarea — */}
            <div>
              <label className={sectionLabel}>
                Press Release Content <span className="text-[#e30613]">*</span>
              </label>
              <div className="relative">
                <textarea
                  placeholder="Paste corporate press release or raw article text here..."
                  value={pressRelease}
                  onChange={(e) => { setPressRelease(e.target.value); setSelectedSample(""); }}
                  rows={11}
                  className="textarea-editor scroller"
                  spellCheck={false}
                />
                {pressRelease.trim() && (
                  <div className="absolute bottom-2.5 right-3 text-[10px] font-mono text-zinc-400 dark:text-zinc-600 pointer-events-none">
                    {wordCount.toLocaleString()} words
                  </div>
                )}
              </div>
            </div>

            {/* — Sample PR Selector — */}
            <div>
              <label className={sectionLabel} htmlFor="sample-pr-selector">
                Or load a sample ({mag.shortName})
              </label>
              <div className="relative">
                <select
                  id="sample-pr-selector"
                  value={selectedSample}
                  onChange={handleSampleChange}
                  className={selectCls}
                >
                  <option value="">— Select sample press release —</option>
                  {filteredSamples.map((pr) => (
                    <option key={pr.id} value={pr.id}>{pr.title}</option>
                  ))}
                </select>
                <ChevronRight className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none rotate-90" />
              </div>
            </div>

            {/* ─── Divider ── */}
            <hr className="rule-editorial" />

            {/* — Parameters section — */}
            <div>
              <p className={sectionLabel}>Generation Parameters</p>

              <div className="grid grid-cols-2 gap-3">

                {/* Topic Type */}
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1.5 tracking-wide">
                    Topic Type <span className="text-[#e30613]">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={topicType}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        setTopicType(val);
                        if (val && defaultPrompts[val as keyof typeof defaultPrompts]) {
                          setCustomPrompt(defaultPrompts[val as keyof typeof defaultPrompts]);
                        }
                      }}
                      className={selectCls}
                    >
                      <option value="" disabled>— Select —</option>
                      <option value="News">News Story</option>
                      <option value="Interview">Interview Q&A</option>
                      <option value="Opinion">Opinion / Editorial</option>
                      <option value="Feature">Feature / Long-form</option>
                      <option value="CaseStudy">Case Study</option>
                    </select>
                    <ChevronRight className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none rotate-90" />
                  </div>
                </div>

                {/* Word count */}
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1.5 tracking-wide">
                    Word Range
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number" min={100} max={2000} value={minWords}
                      onChange={(e) => setMinWords(parseInt(e.target.value) || 0)}
                      className={inputCls + " text-center font-mono"}
                      placeholder="Min"
                    />
                    <span className="text-zinc-300 dark:text-zinc-700 text-sm flex-shrink-0">–</span>
                    <input
                      type="number" min={200} max={3000} value={maxWords}
                      onChange={(e) => setMaxWords(parseInt(e.target.value) || 0)}
                      className={inputCls + " text-center font-mono"}
                      placeholder="Max"
                    />
                  </div>
                </div>
              </div>

              {/* Custom tone prompt */}
              <div className="mt-3">
                <label className="text-[10px] text-zinc-400 block mb-1.5 tracking-wide">
                  Custom Style / Tone Notes
                  <span className="ml-1 text-zinc-300 dark:text-zinc-700">(optional)</span>
                </label>
                <textarea
                  placeholder="e.g. Focus on cybersecurity impact; formal analyst tone..."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  rows={2}
                  className={inputCls + " resize-none text-[12px]"}
                />
              </div>
            </div>

            {/* ─── Divider ── */}
            <hr className="rule-editorial" />

            {/* — Option toggles — */}
            <div>
              <p className={sectionLabel}>Options</p>
              <div className="space-y-2.5">
                {[
                  { id: "humanize", checked: humanize, onChange: setHumanize, label: "Bypass AI detectors — human-like style" },
                  { id: "generateImage", checked: generateImage, onChange: setGenerateImage, label: "Generate cover banner (Imagen 4.0)" },
                  { id: "referencePCQuest", checked: referencePCQuest, onChange: setReferencePCQuest, label: `Cross-reference ${mag.name} coverage` },
                ].map((opt) => (
                  <label
                    key={opt.id}
                    htmlFor={opt.id}
                    className="flex items-center gap-2.5 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      id={opt.id}
                      checked={opt.checked}
                      onChange={(e) => opt.onChange(e.target.checked)}
                      className="checkbox-editorial"
                    />
                    <span className="text-[12px] text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200 transition-colors select-none leading-tight">
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* ─── Divider ── */}
            <hr className="rule-editorial" />

            {/* — Generate CTA — */}
            <div className="space-y-2">
              <button
                onClick={handleGenerate}
                disabled={status === "generating" || !pressRelease.trim() || !topicType}
                className={`btn-primary ${
                  status === "generating"
                    ? "!bg-zinc-100 dark:!bg-zinc-900 !text-zinc-400 dark:!text-zinc-600 !cursor-wait"
                    : !pressRelease.trim() || !topicType
                    ? "!bg-zinc-100 dark:!bg-zinc-900 !text-zinc-400 dark:!text-zinc-600 !cursor-not-allowed"
                    : ""
                }`}
              >
                <Sparkles className={`w-3.5 h-3.5 ${status === "generating" ? "animate-spin" : ""}`} />
                {status === "generating"
                  ? `Step ${currentStep} of ${getStepsForTopic().length} — Processing`
                  : `Generate ${mag.shortName} Editorial Package`}
              </button>

              {status !== "idle" && (
                <button onClick={handleReset} className="btn-ghost">
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              )}
            </div>

          </div>
        </section>

        {/* ─── RIGHT COLUMN: Output panel ──────────────────────────────── */}
        <section className="lg:col-span-7 min-h-[500px] flex flex-col">

          {/* 1. Idle state */}
          {status === "idle" && (
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center border border-dashed border-zinc-200 dark:border-zinc-800 m-4 lg:m-0 lg:border-0 lg:border-dashed">
              {/* Editorial masthead placeholder */}
              <div className="w-full max-w-sm space-y-6">
                <div className="space-y-1 border-b-2 border-zinc-900 dark:border-zinc-100 pb-4">
                  <p className="label-editorial">Dataquest AI Editorial Copilot</p>
                  <h2 className="font-serif text-2xl font-black text-zinc-900 dark:text-zinc-100 leading-tight">
                    Awaiting Input
                  </h2>
                  <p className="text-xs text-zinc-400 leading-relaxed mt-2">
                    Paste a press release on the left and configure your parameters to begin generating a full editorial package.
                  </p>
                </div>

                {/* What will be generated */}
                <div className="text-left space-y-2">
                  {[
                    ["01", "News Article / Feature / Opinion"],
                    ["02", "SEO Metadata & Keywords"],
                    ["03", "Social Media Assets"],
                    ["04", "Editorial Review Checklist"],
                    ["05", "AI-generated Cover Banner"],
                  ].map(([num, label]) => (
                    <div key={num} className="flex items-center gap-3 py-2 border-b border-zinc-100 dark:border-zinc-800/60">
                      <span className="text-[10px] font-black text-zinc-300 dark:text-zinc-700 font-mono w-5 shrink-0">{num}</span>
                      <span className="text-[12px] text-zinc-500 dark:text-zinc-400">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. Generating state */}
          {status === "generating" && (
            <div className="p-4 lg:p-5 space-y-4 flex-1 flex flex-col">
              <StepProgress
                currentStep={currentStep}
                stepMessage={stepMessage}
                status={status}
                steps={getStepsForTopic()}
              />

              {/* Skeleton article preview */}
              <div className="flex-1 border border-zinc-200 dark:border-zinc-800 p-5 space-y-4 animate-pulse">
                <div className="h-3 w-20 bg-zinc-100 dark:bg-zinc-800" />
                <div className="h-5 w-3/4 bg-zinc-200 dark:bg-zinc-700" />
                <div className="h-3 w-1/2 bg-zinc-100 dark:bg-zinc-800" />
                <hr className="border-zinc-100 dark:border-zinc-800" />
                <div className="space-y-2 pt-1">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className={`h-2.5 bg-zinc-100 dark:bg-zinc-800 ${i % 3 === 2 ? "w-4/5" : "w-full"}`} />
                  ))}
                </div>
                <div className="h-4 w-1/3 bg-zinc-100 dark:bg-zinc-800 mt-2" />
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className={`h-2.5 bg-zinc-100 dark:bg-zinc-800 ${i % 4 === 3 ? "w-2/3" : "w-full"}`} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 3. Completed state */}
          {status === "completed" && (
            <div className="flex-1 flex flex-col animate-fadeIn">
              <OutputPanel packageData={packageData} />
            </div>
          )}

          {/* 4. Error state */}
          {status === "error" && (
            <div className="p-4 lg:p-5 space-y-4 flex-1 flex flex-col">
              <StepProgress
                currentStep={currentStep}
                stepMessage={stepMessage}
                status={status}
                errorMessage={errorMessage}
                steps={getStepsForTopic()}
              />

              {Object.keys(packageData).length > 0 && (
                <div className="flex-1 border border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                    Partial output — generated before failure
                  </div>
                  <div className="flex-1">
                    <OutputPanel packageData={packageData} />
                  </div>
                </div>
              )}
            </div>
          )}

        </section>
      </main>

      {/* ── FOOTER ─────────────────────────────────────────────────────── */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111]">
        <div className="max-w-screen-xl mx-auto px-6 h-10 flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-300 dark:text-zinc-600">
            {mag.name} · AI Editorial Copilot
          </p>
          <p className="text-[10px] text-zinc-300 dark:text-zinc-600">
            Powered by Google Gemini · Internal Tool
          </p>
        </div>
      </footer>

    </div>
  );
}
