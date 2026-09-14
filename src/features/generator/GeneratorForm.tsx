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
  const inputCls = `w-full text-[14px] px-3.5 py-2.5 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-[#111] text-zinc-900 dark:text-zinc-100 focus:outline-none ${
    magazine === "Voice&Data" ? "focus:border-[#00839b]" : "focus:border-[#e30613]"
  } transition-colors placeholder:text-zinc-400 dark:placeholder:text-zinc-600`;
  const stepBadge = `inline-flex items-center justify-center w-6 h-6 rounded-full ${
    magazine === "Voice&Data" ? "bg-[#00839b]" : "bg-[#e30613]"
  } text-white text-[11px] font-black flex-shrink-0 mr-2`;

  return (
    <section className="bg-white dark:bg-[#161616] border border-zinc-200 dark:border-zinc-800 flex flex-col h-full min-h-0 overflow-hidden">
      <div className="px-5 py-2.5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-[#1a1a1a] flex-shrink-0 flex items-center justify-between">
        <div>
          <h2 className="text-[14px] font-bold text-zinc-800 dark:text-zinc-200">Create Article</h2>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Follow the 3 steps below to generate a ready-to-publish article.
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-extrabold ${
            magazine === "Voice&Data"
              ? "bg-[#e59e19] text-zinc-950 font-black"
              : "bg-[#e30613] text-white"
          } tracking-wider uppercase`}
        >
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
              <button
                onClick={handleClearPR}
                className="text-[12px] text-zinc-400 hover:text-red-500 transition-colors flex items-center gap-1 cursor-pointer"
              >
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
                  onClick={() => setTopicType(type.id as TopicType)}
                  className={`p-3 border text-left transition-all cursor-pointer ${
                    isSelected
                      ? magazine === "Voice&Data"
                        ? "border-[#00839b] bg-[#00839b]/5 dark:bg-[#00839b]/10"
                        : "border-[#e30613] bg-[#e30613]/5 dark:bg-[#e30613]/10"
                      : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon
                      className={`w-4 h-4 ${
                        isSelected
                          ? magazine === "Voice&Data"
                            ? "text-[#00839b]"
                            : "text-[#e30613]"
                          : "text-zinc-400"
                      }`}
                    />
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
                onChange={(val) => setWordPreset(val as keyof typeof wordPresets)}
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[13px] font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={humanize}
                  onChange={(e) => setHumanize(e.target.checked)}
                  className="checkbox-editorial"
                  style={{ accentColor: magazine === "Voice&Data" ? "#00839b" : "#e30613" }}
                />
                Natural Human Journalist Tone
              </label>

              <div className="space-y-1">
                <label className="flex items-center gap-2 text-[13px] font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={generateImage}
                    onChange={(e) => setGenerateImage(e.target.checked)}
                    className="checkbox-editorial"
                    style={{ accentColor: magazine === "Voice&Data" ? "#00839b" : "#e30613" }}
                  />
                  Generate Cover Banner Image
                </label>
                {generateImage && (
                  <div className="ml-6 pt-1 flex items-center gap-2">
                    <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider shrink-0">
                      Count:
                    </span>
                    <CustomSelect
                      options={[
                        { value: "1", label: "1 Image (Main 1280x720 Header Cover)" },
                        { value: "2", label: "2 Images (Header Banner + Feature Graphic)" },
                        { value: "3", label: "3 Images (Header + Feature + Infographic)" },
                      ]}
                      value={String(imageCount)}
                      onChange={(val) => setImageCount(Number(val))}
                      className="flex-1 max-w-[280px]"
                    />
                  </div>
                )}
              </div>

              <label className="flex items-center gap-2 text-[13px] font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={referencePCQuest}
                  onChange={(e) => setReferencePCQuest(e.target.checked)}
                  className="checkbox-editorial"
                  style={{ accentColor: magazine === "Voice&Data" ? "#00839b" : "#e30613" }}
                />
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
                {showAdvanced ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
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
            className={`btn-primary w-full text-[13px] py-4 gap-2.5 ${
              !canGenerate
                ? "!bg-zinc-200 dark:!bg-zinc-800 !text-zinc-400 !cursor-not-allowed"
                : "cursor-pointer"
            }`}
          >
            <Sparkles className={`w-4 h-4 ${status === "generating" ? "animate-spin" : ""}`} />
            {status === "generating"
              ? `Generating step ${currentStep} of ${totalSteps}...`
              : "Generate Article"}
          </button>

          {status !== "idle" && (
            <button
              onClick={handleReset}
              className="btn-ghost w-full text-[12px] py-2 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Start over
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
