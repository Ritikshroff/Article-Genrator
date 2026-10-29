"use client";
// ─────────────────────────────────────────────────────────────
// GeneratorForm.tsx
// Left-panel editorial form: Press Release + Article Type + Settings
// ─────────────────────────────────────────────────────────────

import React, { useState } from "react";
import {
  Sparkles,
  Trash2,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Settings2,
  Info,
} from "lucide-react";
import { CustomSelect } from "@/components/CustomSelect";
import { articleTypes, wordPresets, TopicType } from "./constants";
import { MagazineConfig } from "@/lib/magazineConfig";

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

interface GeneratorFormProps {
  magazine: string;
  mag: MagazineConfig;
  pressRelease: string;
  setPressRelease: (val: string) => void;
  handleClearPR: () => void;
  wordCount: number;
  topicType: TopicType;
  setTopicType: (val: TopicType) => void;
  wordPreset: keyof typeof wordPresets;
  setWordPreset: (val: keyof typeof wordPresets) => void;
  humanize: boolean;
  setHumanize: (val: boolean) => void;
  generateImage: boolean;
  setGenerateImage: (val: boolean) => void;
  imageCount: number;
  setImageCount: (val: number) => void;
  referencePCQuest: boolean;
  setReferencePCQuest: (val: boolean) => void;
  showAdvanced: boolean;
  setShowAdvanced: (val: boolean) => void;
  customPrompt: string;
  setCustomPrompt: (val: string) => void;
  handsOnData: boolean;
  setHandsOnData: (val: boolean) => void;
  canGenerate: boolean;
  status: "idle" | "generating" | "completed" | "error";
  currentStep: number;
  totalSteps: number;
  handleGenerate: () => void;
  handleReset: () => void;
}

export function GeneratorForm({
  magazine,
  mag,
  pressRelease,
  setPressRelease,
  handleClearPR,
  wordCount,
  topicType,
  setTopicType,
  wordPreset,
  setWordPreset,
  humanize,
  setHumanize,
  generateImage,
  setGenerateImage,
  imageCount,
  setImageCount,
  referencePCQuest,
  setReferencePCQuest,
  showAdvanced,
  setShowAdvanced,
  customPrompt,
  setCustomPrompt,
  handsOnData,
  setHandsOnData,
  canGenerate,
  status,
  currentStep,
  totalSteps,
  handleGenerate,
  handleReset,
}: GeneratorFormProps) {
  const labelCls = "block text-[13px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5";
  const inputCls = `w-full text-[14px] px-3.5 py-2.5 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-[#111] text-zinc-900 dark:text-zinc-100 focus:outline-none transition-colors placeholder:text-zinc-400 dark:placeholder:text-zinc-600`;
  const stepBadge = `inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-[11px] font-black flex-shrink-0 mr-2 shadow-xs`;

  return (
    <section className="bg-white dark:bg-[#161616] border border-zinc-200 dark:border-zinc-800 flex flex-col h-full min-h-0 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-[#1a1a1a] flex-shrink-0 flex items-center justify-between">
        <div>
          <h2 className="text-[13px] font-bold text-zinc-800 dark:text-zinc-200 leading-tight">Create Article</h2>
          <p className="text-[10px] text-zinc-400">
            Paste press release & generate ready-to-publish draft
          </p>
        </div>
        <div className="flex items-center">
          <img
            src={mag.logoUrl}
            alt={mag.name}
            className="h-4.5 sm:h-5 w-auto object-contain max-w-[105px]"
          />
        </div>
      </div>

      {/* Scrollable Form Body with Balanced Spacing */}
      <div className="flex-1 min-h-0 overflow-y-auto scroller px-3.5 py-2.5 flex flex-col gap-2.5">
        {/* STEP 1: Press Release */}
        <div className="flex-1 flex flex-col min-h-[220px]">
          <div className="flex items-center justify-between mb-1.5 flex-shrink-0">
            <h3 className="flex items-center text-[12px] font-bold text-zinc-800 dark:text-zinc-200">
              <span className={stepBadge} style={{ backgroundColor: mag.accentHex }}>1</span> Paste Press Release
              <InfoTooltip text="Paste raw text, press release, or product announcement." />
            </h3>
            {pressRelease && (
              <button
                type="button"
                onClick={handleClearPR}
                className="text-[11px] text-zinc-400 hover:text-red-500 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" /> Clear
              </button>
            )}
          </div>
          <div className="ml-6 flex-1 flex flex-col min-h-0 space-y-1">
            <textarea
              value={pressRelease}
              onChange={(e) => setPressRelease(e.target.value)}
              placeholder="Paste the full press release or announcement text here..."
              className={inputCls + " flex-1 w-full resize-none font-mono text-[12px] leading-relaxed min-h-[160px]"}
            />
            <div className="flex justify-between items-center text-[10px] text-zinc-400 flex-shrink-0 pt-0.5">
              <span className={wordCount < 50 && pressRelease.length > 0 ? "text-amber-500 font-bold" : ""}>
                {wordCount} words
              </span>
              <span>Min recommended: 100 words</span>
            </div>
          </div>
        </div>

        <hr className="border-zinc-100 dark:border-zinc-800 flex-shrink-0" />

        {/* STEP 2: Article Type (Default News Story + Dropdown for Others) */}
        <div className="flex-shrink-0">
          <h3 className="flex items-center text-[12px] font-bold text-zinc-800 dark:text-zinc-200 mb-1.5">
            <span className={stepBadge} style={{ backgroundColor: mag.accentHex }}>2</span> Article Format
            <InfoTooltip text="News Story is selected by default. Use dropdown to switch to Feature, Interview, Opinion, or Case Study." />
          </h3>
          <div className="ml-6 flex flex-wrap sm:flex-nowrap items-center gap-2">
            {/* News Story Button - Always selected by default unless changed */}
            <button
              type="button"
              id="format-news-story"
              onClick={() => setTopicType("News")}
              style={
                topicType === "News" || !topicType
                  ? {
                      borderColor: mag.accentHex,
                      color: mag.accentHex,
                      backgroundColor: `${mag.accentHex}14`,
                    }
                  : undefined
              }
              className={`h-8 px-2.5 border text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer rounded-xs shrink-0 ${
                topicType === "News" || !topicType
                  ? ""
                  : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-[#111] text-zinc-600 dark:text-zinc-400 hover:border-zinc-400"
              }`}
              title="Click to select News Story format"
            >
              <input
                type="radio"
                name="articleTypeSelection"
                checked={topicType === "News" || !topicType}
                onChange={() => setTopicType("News")}
                style={{ accentColor: mag.accentHex }}
                className="pointer-events-none w-3.5 h-3.5 cursor-pointer"
              />
              <span>News Story</span>
            </button>

            {/* Dropdown for other formats to save space */}
            <div className="flex-1 min-w-[170px]">
              <CustomSelect
                placeholder="Other Formats..."
                options={articleTypes.map((t) => ({
                  value: t.id,
                  label: `${t.label} (${t.desc})`,
                }))}
                value={topicType === "News" || !topicType ? "" : topicType}
                onChange={(val) => setTopicType((val as TopicType) || "News")}
              />
            </div>
          </div>

          {topicType && topicType !== "News" && (
            <div className="ml-6 mt-1 text-[10px] text-zinc-500 flex items-center gap-1">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">Format:</span>
              <span className="font-bold" style={{ color: mag.accentHex }}>
                {articleTypes.find((t) => t.id === topicType)?.label}
              </span>
              <span>— {articleTypes.find((t) => t.id === topicType)?.desc}</span>
            </div>
          )}
        </div>

        <hr className="border-zinc-100 dark:border-zinc-800 flex-shrink-0" />

        {/* STEP 3: Settings */}
        <div className="flex-shrink-0">
          <h3 className="flex items-center text-[12px] font-bold text-zinc-800 dark:text-zinc-200 mb-1.5">
            <span className={stepBadge} style={{ backgroundColor: mag.accentHex }}>3</span> Article Settings
            <InfoTooltip text="Configure length, image, tone, and link preferences." />
          </h3>
          <div className="ml-6 space-y-2">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Article Length
              </label>
              <CustomSelect
                options={Object.entries(wordPresets).map(([key, { label }]) => ({
                  value: key,
                  label,
                }))}
                value={wordPreset}
                onChange={(val) => setWordPreset(val as keyof typeof wordPresets)}
              />
            </div>

            <div className="space-y-1.5 pt-0.5">
              <label className="flex items-center gap-2 text-[12px] font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={humanize}
                  onChange={(e) => setHumanize(e.target.checked)}
                  className="checkbox-editorial"
                  style={{ accentColor: mag.accentHex }}
                />
                Natural Human Journalist Tone
              </label>

              <div className="space-y-1">
                <label className="flex items-center gap-2 text-[12px] font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={generateImage}
                    onChange={(e) => setGenerateImage(e.target.checked)}
                    className="checkbox-editorial"
                    style={{ accentColor: mag.accentHex }}
                  />
                  Generate Cover Banner Image
                </label>
                {generateImage && (
                  <div className="ml-5 pt-0.5 flex items-center gap-2">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider shrink-0">
                      Count:
                    </span>
                    <CustomSelect
                      options={[
                        { value: "1", label: "1 Image (1280x720 Cover)" },
                        { value: "2", label: "2 Images (Cover + Feature)" },
                        { value: "3", label: "3 Images (Cover + Graphic + Infographic)" },
                      ]}
                      value={String(imageCount)}
                      onChange={(val) => setImageCount(Number(val))}
                      className="flex-1 max-w-[260px]"
                    />
                  </div>
                )}
              </div>

              <label className="flex items-center gap-2 text-[12px] font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={referencePCQuest}
                  onChange={(e) => setReferencePCQuest(e.target.checked)}
                  className="checkbox-editorial"
                  style={{ accentColor: mag.accentHex }}
                />
                Link to related {mag.name} articles
              </label>
            </div>

            {/* Advanced Settings Accordion */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
              >
                <Settings2 className="w-3.5 h-3.5" />
                {showAdvanced ? "Hide Advanced Settings" : "Show Advanced Settings"}
                {showAdvanced ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>

              {showAdvanced && (
                <div className="mt-2 p-2.5 bg-zinc-50 dark:bg-[#111] border border-zinc-200 dark:border-zinc-800 space-y-3 rounded-xs animate-in fade-in duration-150">
                  {/* Custom Prompt Directives */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Custom Editorial Directives
                    </label>
                    <textarea
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="e.g., Emphasize 5G spectrum, include executive quotes..."
                      rows={2}
                      className="w-full px-2.5 py-1.5 text-[11px] bg-white dark:bg-[#161616] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-500 transition-all placeholder:text-zinc-400 resize-none font-mono"
                    />
                  </div>

                  {/* Magazine Specific Checks */}
                  <div>
                    <label className="flex items-center gap-2 text-[11px] font-semibold cursor-pointer text-zinc-700 dark:text-zinc-300">
                      <input
                        type="checkbox"
                        checked={handsOnData}
                        onChange={(e) => setHandsOnData(e.target.checked)}
                        className="checkbox-editorial"
                        style={{ accentColor: mag.accentHex }}
                      />
                      Include CyberMedia Labs Hands-on Testing Benchmark Data
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PINNED STICKY FOOTER: GENERATE BUTTON (ALWAYS VISIBLE WITHOUT SCROLLING) */}
      <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#141414] flex-shrink-0 space-y-2">
        <button
          onClick={handleGenerate}
          disabled={!canGenerate}
          style={canGenerate ? { backgroundColor: mag.accentHex } : undefined}
          className={`btn-primary w-full text-[13px] py-3 gap-2 ${!canGenerate
            ? "!bg-zinc-200 dark:!bg-zinc-800 !text-zinc-400 !cursor-not-allowed"
            : "cursor-pointer hover:opacity-95"
            }`}
        >
          <Sparkles className={`w-4 h-4 ${status === "generating" ? "animate-spin" : ""}`} />
          {status === "generating"
            ? `Generating step ${Math.min(currentStep, totalSteps)} of ${totalSteps}...`
            : "Generate Article"}
        </button>

        {status !== "idle" && (
          <button
            onClick={handleReset}
            className="btn-ghost w-full text-[11px] py-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" /> Start over
          </button>
        )}
      </div>
    </section>
  );
}
