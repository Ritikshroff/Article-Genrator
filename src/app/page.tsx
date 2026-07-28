"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles, Key, AlertCircle, Trash2,
  CheckCircle2, RotateCcw, ChevronDown, ChevronUp, Settings2,
  Newspaper, Mic, PenTool, BookOpen, BarChart3, Info
} from "lucide-react";
import { samplePRs } from "@/lib/samplePRs";
import { ThemeToggle } from "@/components/ThemeToggle";
import { StepProgress } from "@/components/StepProgress";
import { OutputPanel, EditorialPackage } from "@/components/OutputPanel";
import { magazineList, MagazineKey } from "@/lib/magazineConfig";

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

// Word length presets — mapped to human-friendly labels
const wordPresets = {
  short:  { label: "Short (approx. 500 words)",     min: 400,  max: 600  },
  medium: { label: "Medium (approx. 700 words)",    min: 600,  max: 800  },
  long:   { label: "Long (approx. 1,000 words)",    min: 900,  max: 1100 },
  feature:{ label: "Feature article (1,200+ words)",min: 1100, max: 1400 },
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

export default function Dashboard() {
  // ── Magazine segment state ───────────────────────────────────────
  // NOTE: Locked to DataQuest for editorial review.
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

  // Parameters
  const [topicType, setTopicType] = useState<"News" | "Interview" | "Opinion" | "Feature" | "CaseStudy" | "">("");
  const [wordPreset, setWordPreset] = useState<keyof typeof wordPresets>("medium");
  const [minWords, setMinWords] = useState<number>(600);
  const [maxWords, setMaxWords] = useState<number>(800);
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [generateImage, setGenerateImage] = useState<boolean>(true);
  const [humanize, setHumanize] = useState<boolean>(true);
  const [referencePCQuest, setReferencePCQuest] = useState<boolean>(true);

  // Advanced options toggle (hidden by default)
  const [showAdvanced, setShowAdvanced] = useState(false);

  const filteredSamples = samplePRs.filter((pr) => pr.magazine === magazine);
  const wordCount = pressRelease.trim().split(/\s+/).filter(Boolean).length;
  const canGenerate = !!pressRelease.trim() && !!topicType && status !== "generating";

  // Sync word preset → actual min/max
  useEffect(() => {
    const preset = wordPresets[wordPreset];
    setMinWords(preset.min);
    setMaxWords(preset.max);
  }, [wordPreset]);

  // Feature type → auto-switch to long preset
  useEffect(() => {
    if (topicType === "Feature") setWordPreset("feature");
    else if (wordPreset === "feature") setWordPreset("medium");
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
          generateImage, humanize, referencePCQuest, magazine,
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

  // ── Shared styles ────────────────────────────────────────────────
  const labelCls = "block text-[13px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5";
  const inputCls = "w-full text-[14px] px-3.5 py-2.5 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-[#111] text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#e30613] transition-colors placeholder:text-zinc-400 dark:placeholder:text-zinc-600";
  const selectCls = `${inputCls} cursor-pointer appearance-none pr-9`;
  const stepBadge = "inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#e30613] text-white text-[11px] font-black flex-shrink-0 mr-2";

  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen bg-[#f5f5f5] dark:bg-[#0d0d0d] text-zinc-900 dark:text-zinc-100 flex flex-col lg:overflow-hidden">

      {/* ── MAGAZINE SWITCHER — hidden for DQ editorial review ── */}
      <div className="hidden">
        {magazineList.map((m) => (
          <button key={m.key} id={`segment-${m.key}`}
            onClick={() => { setMagazine(m.key); setSelectedSample(""); setPressRelease(""); handleReset(); }}>
            {m.shortName}
          </button>
        ))}
      </div>

      {/* ── HEADER ────────────────────────────────────────────────── */}
      <header className="bg-white dark:bg-[#111] border-b border-zinc-200 dark:border-zinc-800 flex-shrink-0 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-0">
            <div className="w-1 self-stretch bg-[#e30613] mr-4 flex-shrink-0" />
            <div>
              <div className="flex items-baseline gap-2.5">
                <span className="font-serif text-[19px] font-black text-zinc-900 dark:text-zinc-50 leading-none">
                  {mag.name}
                </span>
                <span className="text-[10px] font-semibold text-zinc-400 tracking-wider uppercase">
                  Editorial AI
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 mt-0.5">{mag.tagline}</p>
            </div>
          </div>
          {/* Right */}
          <div className="flex items-center gap-3">
            {/* API Key — hidden */}
            <div className="hidden">
              <div className="relative">
                {isApiKeySaved ? (
                  <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />API Key Set
                    <button onClick={handleClearApiKey} className="text-zinc-400 hover:text-[#e30613] ml-1 font-bold">×</button>
                  </div>
                ) : (
                  <button onClick={() => setShowApiKey(!showApiKey)} className="flex items-center gap-1.5 px-3 py-1.5 border border-zinc-200 dark:border-zinc-700 text-[11px] font-semibold uppercase tracking-wide text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">
                    <Key className="w-3 h-3" /> API Key
                  </button>
                )}
                {showApiKey && !isApiKeySaved && (
                  <div className="absolute right-0 mt-2 w-80 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-[#1a1a1a] shadow-xl z-50 animate-slideDown">
                    <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Gemini API Key</p>
                    </div>
                    <form onSubmit={handleSaveApiKey} className="p-4 space-y-3">
                      <input type="password" placeholder="AIza..." value={customApiKey}
                        onChange={(e) => setCustomApiKey(e.target.value)}
                        className={inputCls + " font-mono text-xs"} required />
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setShowApiKey(false)}
                          className="flex-1 py-2 text-[11px] font-semibold border border-zinc-200 dark:border-zinc-700 text-zinc-500 uppercase tracking-wide">Cancel</button>
                        <button type="submit"
                          className="flex-1 py-2 text-[11px] font-bold bg-[#e30613] text-white hover:bg-[#b8040f] uppercase tracking-wide transition-colors">Save</button>
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

      {/* ── MAIN ──────────────────────────────────────────────────── */}
      <main className="flex-1 min-h-0 max-w-6xl mx-auto w-full px-4 sm:px-6 py-4 grid grid-cols-1 lg:grid-cols-2 gap-5 lg:items-stretch lg:overflow-hidden">

        {/* ─── LEFT: INPUT FORM ──────────────────────────────────── */}
        <section className="bg-white dark:bg-[#161616] border border-zinc-200 dark:border-zinc-800 flex flex-col h-full min-h-0 overflow-hidden">

          {/* Panel title */}
          <div className="px-5 py-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-[#1a1a1a] flex-shrink-0">
            <h2 className="text-[14px] font-bold text-zinc-800 dark:text-zinc-200">
              Create Article
            </h2>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Follow the 3 steps below to generate a ready-to-publish article.
            </p>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto scroller px-5 py-5 space-y-6">

            {/* ── STEP 1: Paste Press Release ── */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="flex items-center text-[14px] font-bold text-zinc-800 dark:text-zinc-200">
                  <span className={stepBadge}>1</span>
                  Paste the Press Release
                  <InfoTooltip text="Paste the full press release, product announcement, or raw article text. The AI will extract facts, executive quotes, and India market angles to write the story." />
                </h3>
                {pressRelease.trim() && (
                  <button onClick={handleClearPR}
                    className="flex items-center gap-1 text-[12px] text-zinc-400 hover:text-[#e30613] transition-colors font-medium">
                    <Trash2 className="w-3.5 h-3.5" /> Clear
                  </button>
                )}
              </div>
              <p className="text-[12px] text-zinc-400 mb-3 ml-8">
                Copy the full press release text and paste it below.
              </p>
              <div className="relative">
                <textarea
                  placeholder="Paste the full press release or article text here..."
                  value={pressRelease}
                  onChange={(e) => { setPressRelease(e.target.value); setSelectedSample(""); }}
                  rows={8}
                  className="textarea-editor scroller w-full resize-none"
                  spellCheck={false}
                />
                {pressRelease.trim() && (
                  <div className="absolute bottom-3 right-3 text-[11px] font-mono bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 px-2 py-0.5 text-zinc-400">
                    {wordCount.toLocaleString()} words
                  </div>
                )}
              </div>
            </div>

            {/* Divider */}
            <hr className="border-zinc-100 dark:border-zinc-800" />

            {/* ── STEP 2: Choose Article Type ── */}
            <div>
              <h3 className="flex items-center text-[14px] font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                <span className={stepBadge}>2</span>
                Choose Article Type
                <InfoTooltip text="Select the editorial format: News Story for breaking news, Interview Q&A for question-and-answer format, Opinion for expert viewpoints, Feature for deep-dive analysis, or Case Study for customer success stories." />
              </h3>
              <p className="text-[12px] text-zinc-400 mb-3 ml-8">
                Select the format that best matches the press release content.
              </p>
              <div className="ml-8 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {articleTypes.map((type) => {
                  const IconComponent = type.icon;
                  const isSelected = topicType === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => {
                        setTopicType(type.id as any);
                        if (defaultPrompts[type.id as keyof typeof defaultPrompts]) {
                          setCustomPrompt(defaultPrompts[type.id as keyof typeof defaultPrompts]);
                        }
                      }}
                      className={`flex items-start gap-3 p-3 border text-left transition-all ${
                        isSelected
                          ? "border-[#e30613] bg-[#e30613]/5 text-zinc-900 dark:text-zinc-100"
                          : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111] hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      <div className={`p-1.5 border flex-shrink-0 mt-0.5 ${
                        isSelected ? "border-[#e30613] bg-[#e30613] text-white" : "border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                      }`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[13px] font-bold leading-tight">{type.label}</p>
                        <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5 leading-snug">{type.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Divider */}
            <hr className="border-zinc-100 dark:border-zinc-800" />

            {/* ── STEP 3: Settings ── */}
            <div>
              <h3 className="flex items-center text-[14px] font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                <span className={stepBadge}>3</span>
                Article Settings
                <InfoTooltip text="Fine-tune word length, writing tone, custom cover image generation, and internal publication links." />
              </h3>
              <p className="text-[12px] text-zinc-400 mb-4 ml-8">
                Adjust these options before generating. The defaults work well for most articles.
              </p>

              <div className="ml-8 space-y-4">
                {/* Article length */}
                <div>
                  <label className={labelCls} htmlFor="word-preset">
                    Article Length
                    <InfoTooltip text="Choose your target word count: Short (~500w), Medium (~700w), Long (~1000w), or Feature (1200+w)." />
                  </label>
                  <div className="relative">
                    <select
                      id="word-preset"
                      value={wordPreset}
                      onChange={(e) => setWordPreset(e.target.value as keyof typeof wordPresets)}
                      className={selectCls}
                    >
                      {Object.entries(wordPresets).map(([key, { label }]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="space-y-3">
                  {[
                    {
                      id: "humanize",
                      checked: humanize,
                      onChange: setHumanize,
                      label: "Write in a natural, human tone",
                      hint: "Makes the article sound like it was written by a journalist, not a machine.",
                      info: "Uses advanced writing patterns to ensure the article sounds like a senior Dataquest journalist and bypasses automated AI detectors."
                    },
                    {
                      id: "generateImage",
                      checked: generateImage,
                      onChange: setGenerateImage,
                      label: "Generate a cover image",
                      hint: "Automatically creates a banner image for the article.",
                      info: "Uses Google Imagen 4.0 AI to automatically render a custom header banner for your article."
                    },
                    {
                      id: "referencePCQuest",
                      checked: referencePCQuest,
                      onChange: setReferencePCQuest,
                      label: `Link to related ${mag.name} articles`,
                      hint: "Adds links to relevant past coverage from our publication.",
                      info: "Embeds internal hyperlinks and references to relevant past reporting to boost SEO topical authority."
                    },
                  ].map((opt) => (
                    <label key={opt.id} htmlFor={opt.id} className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        id={opt.id}
                        checked={opt.checked}
                        onChange={(e) => opt.onChange(e.target.checked)}
                        className="checkbox-editorial mt-0.5"
                      />
                      <div>
                        <p className="text-[13px] font-semibold text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors inline-flex items-center">
                          {opt.label}
                          <InfoTooltip text={opt.info} />
                        </p>
                        <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5 leading-snug">
                          {opt.hint}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Advanced toggle */}
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-1.5 text-[12px] text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors mt-1"
                >
                  <Settings2 className="w-3.5 h-3.5" />
                  {showAdvanced ? "Hide" : "Show"} advanced options
                  {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {showAdvanced && (
                  <div className="border border-zinc-200 dark:border-zinc-700 p-4 space-y-3 animate-fadeIn">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">Advanced — Editorial Tone Notes</p>
                    <p className="text-[12px] text-zinc-400">
                      Optionally add specific instructions for the AI. For example: "Focus on cybersecurity impact" or "Use a formal analyst tone."
                    </p>
                    <textarea
                      placeholder="Optional: Add any specific tone or focus instructions here..."
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      rows={3}
                      className={inputCls + " resize-none text-[13px]"}
                    />
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Custom Word Range</p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <label className="text-[11px] text-zinc-400 block mb-1">Min words</label>
                          <input type="number" min={100} max={2000} value={minWords}
                            onChange={(e) => setMinWords(parseInt(e.target.value) || 0)}
                            className={inputCls + " text-center font-mono"} />
                        </div>
                        <span className="text-zinc-300 dark:text-zinc-600 mt-4 text-lg">–</span>
                        <div className="flex-1">
                          <label className="text-[11px] text-zinc-400 block mb-1">Max words</label>
                          <input type="number" min={200} max={3000} value={maxWords}
                            onChange={(e) => setMaxWords(parseInt(e.target.value) || 0)}
                            className={inputCls + " text-center font-mono"} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Divider */}
            <hr className="border-zinc-100 dark:border-zinc-800" />

            {/* ── GENERATE BUTTON ── */}
            <div className="space-y-3">
              {/* Validation hints */}
              {!pressRelease.trim() && (
                <p className="text-[12px] text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  Step 1: Paste a press release first.
                </p>
              )}
              {pressRelease.trim() && !topicType && (
                <p className="text-[12px] text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  Step 2: Select an article type above.
                </p>
              )}

              <button
                onClick={handleGenerate}
                disabled={!canGenerate}
                className={`btn-primary text-[13px] py-4 gap-2.5 ${!canGenerate ? "!bg-zinc-200 dark:!bg-zinc-800 !text-zinc-400 !cursor-not-allowed" : ""}`}
              >
                <Sparkles className={`w-4 h-4 ${status === "generating" ? "animate-spin" : ""}`} />
                {status === "generating"
                  ? `Processing step ${currentStep} of ${getStepsForTopic().length}...`
                  : "Generate Article"}
              </button>

              {status !== "idle" && (
                <button onClick={handleReset} className="btn-ghost text-[12px] py-2.5">
                  <RotateCcw className="w-3.5 h-3.5" />
                  Start over
                </button>
              )}

              {status === "error" && errorMessage && !Object.keys(packageData).length && (
                <div className="flex items-start gap-2 p-3 border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-400 text-[12px]">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>

          </div>
        </section>

        {/* ─── RIGHT: OUTPUT ─────────────────────────────────────── */}
        <section className="h-full flex flex-col min-h-0 overflow-hidden">

          {/* 1. Idle */}
          {status === "idle" && (
            <div className="h-full flex flex-col bg-white dark:bg-[#161616] border border-zinc-200 dark:border-zinc-800 min-h-0 overflow-hidden">
              {/* Header */}
              <div className="px-6 py-3.5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-[#1a1a1a] flex-shrink-0">
                <h2 className="text-[14px] font-bold text-zinc-800 dark:text-zinc-200">Article Preview</h2>
                <p className="text-[11px] text-zinc-400 mt-0.5">Your generated article will appear here.</p>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto p-6 text-center flex flex-col items-center justify-center scroller">
                <div className="w-full max-w-xs space-y-5">
                  {/* Masthead icon */}
                  <div className="mx-auto w-16 h-16 border-2 border-zinc-200 dark:border-zinc-700 flex items-center justify-center">
                    <span className="font-serif text-2xl font-black text-zinc-300 dark:text-zinc-700">DQ</span>
                  </div>
                  <div>
                    <h3 className="font-serif text-[18px] font-black text-zinc-700 dark:text-zinc-400 mb-2">
                      Ready when you are
                    </h3>
                    <p className="text-[13px] text-zinc-400 dark:text-zinc-500 leading-relaxed">
                      Complete the 3 steps on the left and click <strong>"Generate Article"</strong> to get started.
                    </p>
                  </div>

                  {/* What you'll get */}
                  <div className="text-left border-t border-zinc-100 dark:border-zinc-800 pt-5 space-y-3">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-300 dark:text-zinc-600">What you'll receive</p>
                    {[
                      "Full article text — ready to publish",
                      "SEO title, meta description & keywords",
                      "LinkedIn & Twitter posts",
                      "Editorial review checklist",
                      "AI-generated cover image",
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-[13px] text-zinc-500 dark:text-zinc-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#e30613] flex-shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. Generating */}
          {status === "generating" && (
            <div className="space-y-4 h-full flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex-shrink-0">
                <StepProgress
                  currentStep={currentStep}
                  stepMessage={stepMessage}
                  status={status}
                  steps={getStepsForTopic()}
                />
              </div>
              {/* Skeleton */}
              <div className="flex-1 min-h-0 overflow-y-auto scroller bg-white dark:bg-[#161616] border border-zinc-200 dark:border-zinc-800 p-6 space-y-4 animate-pulse">
                <div className="h-3 w-24 bg-zinc-100 dark:bg-zinc-800" />
                <div className="h-6 w-3/4 bg-zinc-200 dark:bg-zinc-700" />
                <div className="h-4 w-1/2 bg-zinc-100 dark:bg-zinc-800" />
                <hr className="border-zinc-100 dark:border-zinc-800" />
                {[...Array(7)].map((_, i) => (
                  <div key={i} className={`h-3 bg-zinc-100 dark:bg-zinc-800 ${i % 3 === 2 ? "w-4/5" : "w-full"}`} />
                ))}
              </div>
            </div>
          )}

          {/* 3. Completed */}
          {status === "completed" && (
            <div className="flex-1 h-full min-h-0 flex flex-col animate-fadeIn overflow-hidden">
              <OutputPanel packageData={packageData} />
            </div>
          )}

          {/* 4. Error */}
          {status === "error" && (
            <div className="space-y-4 h-full flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex-shrink-0">
                <StepProgress
                  currentStep={currentStep}
                  stepMessage={stepMessage}
                  status={status}
                  errorMessage={errorMessage}
                  steps={getStepsForTopic()}
                />
              </div>
              {Object.keys(packageData).length > 0 && (
                <div className="flex-1 min-h-0 border border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-2 text-[12px] font-semibold text-zinc-500 uppercase tracking-wide flex-shrink-0">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                    Partial output — generated before failure
                  </div>
                  <div className="flex-1 min-h-0 overflow-hidden"><OutputPanel packageData={packageData} /></div>
                </div>
              )}
            </div>
          )}

        </section>
      </main>

      {/* ── FOOTER ────────────────────────────────────────────────── */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-10 flex items-center justify-between">
          <p className="text-[11px] font-semibold text-zinc-300 dark:text-zinc-600 uppercase tracking-widest">
            {mag.name} · AI Editorial Copilot
          </p>
          <p className="text-[11px] text-zinc-300 dark:text-zinc-600">
            Powered by Google Gemini · Internal Tool
          </p>
        </div>
      </footer>

    </div>
  );
}
