"use client";

import React, { useState, useEffect } from "react";
import { 
  Sparkles, Key, FileText, ChevronRight, AlertCircle, Trash2, 
  BookOpen, HelpCircle, FileJson, CheckCircle2, RotateCcw 
} from "lucide-react";
import { samplePRs, SamplePR } from "@/lib/samplePRs";
import { ThemeToggle } from "@/components/ThemeToggle";
import { StepProgress } from "@/components/StepProgress";
import { OutputPanel, EditorialPackage } from "@/components/OutputPanel";

export default function Dashboard() {
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

  // Load API key from sessionStorage on mount
  useEffect(() => {
    const savedKey = sessionStorage.getItem("gemini_api_key");
    if (savedKey) {
      setCustomApiKey(savedKey);
      setIsApiKeySaved(true);
    }
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
    if (val === "") {
      setPressRelease("");
    } else {
      const found = samplePRs.find((p) => p.id === val);
      if (found) {
        setPressRelease(found.content);
      }
    }
  };

  const handleClearPR = () => {
    setPressRelease("");
    setSelectedSample("");
  };

  const handleReset = () => {
    setStatus("idle");
    setCurrentStep(0);
    setStepMessage("");
    setErrorMessage("");
    setPackageData({});
  };

  const handleGenerate = async () => {
    if (!pressRelease.trim()) return;

    setStatus("generating");
    setCurrentStep(1);
    setStepMessage("Initializing connection to Gemini API...");
    setErrorMessage("");
    setPackageData({});

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pressRelease,
          customApiKey: customApiKey.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate editorial package.");
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response reader available from the stream.");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        // Save the last potentially incomplete line back to the buffer
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.trim() === "") continue;

          try {
            const payload = JSON.parse(line);

            if (payload.type === "step") {
              setCurrentStep(payload.step);
              setStepMessage(payload.message);
            } else if (payload.type === "data") {
              setPackageData((prev) => ({
                ...prev,
                [payload.key]: payload.data,
              }));
            } else if (payload.type === "done") {
              setStatus("completed");
              // Trigger success confetti effect
              import("canvas-confetti").then((module) => {
                module.default({
                  particleCount: 150,
                  spread: 80,
                  origin: { y: 0.6 },
                  colors: ["#3b82f6", "#6366f1", "#a855f7", "#ec4899"],
                });
              });
            } else if (payload.type === "error") {
              throw new Error(payload.message);
            }
          } catch (jsonErr: any) {
            console.error("Failed to parse stream chunk:", line, jsonErr);
            // Ignore parse errors on incomplete payloads, but propagate model execution issues
            if (line.includes('"type":"error"')) {
              throw new Error(jsonErr.message || "Model execution error.");
            }
          }
        }
      }
    } catch (err: any) {
      console.error("Generation failed:", err);
      setStatus("error");
      setErrorMessage(err.message || "An unexpected error occurred during processing.");
    }
  };

  const wordCount = pressRelease.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-300">
      
      {/* HEADER SECTION */}
      <header className="border-b border-zinc-200 dark:border-zinc-900 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 dark:bg-indigo-500/10 text-white dark:text-indigo-400 p-2 rounded-xl border border-indigo-600 dark:border-indigo-500/20 shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-700 dark:from-zinc-50 dark:via-zinc-200 dark:to-zinc-400 bg-clip-text text-transparent">
                DQ AI Editorial Copilot
              </h1>
              <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                Transform Press Releases into Dataquest-style editorial content
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            
            {/* API Key configuration control */}
            <div className="relative">
              {isApiKeySaved ? (
                <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-1.5 rounded-lg text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">API Key Ready</span>
                  <button 
                    onClick={handleClearApiKey}
                    className="ml-1 hover:text-rose-500 text-zinc-400 dark:text-zinc-500 font-bold text-xs"
                    title="Remove API Key"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                    showApiKey 
                      ? "bg-zinc-100 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800" 
                      : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800/80 hover:bg-zinc-50 dark:hover:bg-zinc-900/60"
                  }`}
                >
                  <Key className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                  <span>Configure Gemini API Key</span>
                </button>
              )}

              {/* API Key Popover form */}
              {showApiKey && !isApiKeySaved && (
                <div className="absolute right-0 mt-2 w-72 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 shadow-2xl backdrop-blur-md z-50 animate-fadeIn">
                  <form onSubmit={handleSaveApiKey} className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                        Google Gemini API Key
                      </label>
                      <input
                        type="password"
                        placeholder="Paste key starting with AIza..."
                        value={customApiKey}
                        onChange={(e) => setCustomApiKey(e.target.value)}
                        className="w-full text-xs px-2.5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                        required
                      />
                    </div>
                    <p className="text-[10px] text-zinc-500 leading-normal">
                      Stored locally in your temporary session storage. If not set, the app defaults to the system's <code>GEMINI_API_KEY</code> environment variable.
                    </p>
                    <div className="flex justify-end gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowApiKey(false)}
                        className="px-2.5 py-1.5 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 dark:text-zinc-400 font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-sm"
                      >
                        Save Key
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* DASHBOARD BODY */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Input Form (5 cols) */}
        <section className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-zinc-950/40 rounded-2xl border border-zinc-200 dark:border-zinc-900/80 p-5 sm:p-6 shadow-sm backdrop-blur-sm">
            <div className="space-y-4">
              
              {/* Selector */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">
                    1. Select Sample Press Release
                  </label>
                  {selectedSample && (
                    <span className="text-[10px] text-indigo-500 font-bold bg-indigo-500/10 px-1.5 py-0.2 rounded">
                      Sample loaded
                    </span>
                  )}
                </div>
                <select
                  value={selectedSample}
                  onChange={handleSampleChange}
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold cursor-pointer"
                >
                  <option value="">-- Paste Custom PR or Select Sample --</option>
                  <option value="deloitte-quantum">Deloitte Quantum Centre QCoDE Launch</option>
                  <option value="infosys-ai-services">Infosys Investor AI Day Capabilities</option>
                  <option value="fynd-create">Fynd Launches AI Platform 'Fynd Create'</option>
                  <option value="mercury-security">Mercury Security MP Controllers Edge App</option>
                  <option value="krisp-appointment">Krisp Appoints CGO Graham Brown</option>
                </select>
              </div>

              {/* Textarea */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">
                    2. Press Release Content
                  </label>
                  {pressRelease.trim() && (
                    <button
                      onClick={handleClearPR}
                      className="text-[10px] font-semibold text-rose-500 hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Clear Text
                    </button>
                  )}
                </div>
                
                <div className="relative">
                  <textarea
                    placeholder="Paste corporate press release here to convert..."
                    value={pressRelease}
                    onChange={(e) => {
                      setPressRelease(e.target.value);
                      setSelectedSample(""); // remove selection status on manual input edit
                    }}
                    rows={12}
                    className="w-full text-xs sm:text-sm p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono resize-y leading-relaxed placeholder:text-zinc-400"
                  />
                  {pressRelease.trim() && (
                    <div className="absolute bottom-3 right-3 text-[10px] font-bold bg-zinc-200/80 dark:bg-zinc-900/80 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded">
                      {wordCount} words
                    </div>
                  )}
                </div>
              </div>

              {/* Generate Button CTA */}
              <button
                onClick={handleGenerate}
                disabled={status === "generating" || !pressRelease.trim()}
                className={`w-full py-3 px-4 rounded-xl text-sm font-bold tracking-wide shadow-lg shadow-indigo-500/10 flex items-center justify-center gap-2 transition-all select-none ${
                  !pressRelease.trim()
                    ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed shadow-none"
                    : status === "generating"
                    ? "bg-zinc-100 dark:bg-zinc-900 text-indigo-500 border border-indigo-500/20 cursor-wait shadow-none"
                    : "bg-indigo-600 hover:bg-indigo-500 text-white hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                }`}
              >
                <Sparkles className={`w-4.5 h-4.5 ${status === "generating" ? "animate-spin text-indigo-500" : ""}`} />
                <span>
                  {status === "generating"
                    ? `Running Prompt Step ${currentStep}/5...`
                    : "Generate Editorial Package"}
                </span>
              </button>

              {status !== "idle" && (
                <button
                  onClick={handleReset}
                  className="w-full py-2 px-4 rounded-xl text-xs font-semibold border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900/60 transition-colors flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Dashboard
                </button>
              )}

            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: Stepper or Outputs (7 cols) */}
        <section className="lg:col-span-7 flex flex-col h-full min-h-[500px]">
          
          {/* 1. Idle placeholder state */}
          {status === "idle" && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-12 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-900 bg-white/40 dark:bg-zinc-950/20 backdrop-blur-sm text-center space-y-6">
              <div className="bg-zinc-100 dark:bg-zinc-900/80 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-md">
                <FileText className="w-10 h-10 text-zinc-400 dark:text-zinc-500" />
              </div>
              <div className="space-y-2 max-w-sm">
                <h3 className="text-base sm:text-lg font-bold text-zinc-800 dark:text-zinc-200">
                  Awaiting Input Press Release
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Select a predefined template or paste your own press release on the left. The copilot will process it sequentially across 5 Gemini AI stages.
                </p>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-w-lg w-full text-left pt-4">
                {[
                  "News Article Conversion",
                  "SEO Metadata Generation",
                  "Broader Industry Impact",
                  "Interview Angles & Qs",
                  "Editorial Review Warnings"
                ].map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950/50 flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 font-bold text-[9px] flex items-center justify-center flex-shrink-0">
                      {idx + 1}
                    </div>
                    <span className="text-[10px] font-semibold text-zinc-600 dark:text-zinc-400 truncate">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Generating / Progress Stepper state */}
          {status === "generating" && (
            <div className="space-y-6 flex-1 flex flex-col">
              
              {/* Stepper tracker */}
              <StepProgress
                currentStep={currentStep}
                stepMessage={stepMessage}
                status={status}
              />

              {/* Dynamic skeleton loader previews */}
              <div className="flex-1 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-900 bg-white/50 dark:bg-zinc-950/30 backdrop-blur-md space-y-4 animate-pulse">
                <div className="flex gap-2">
                  <div className="w-16 h-4 bg-zinc-200 dark:bg-zinc-800 rounded" />
                  <div className="w-24 h-4 bg-zinc-200 dark:bg-zinc-800 rounded" />
                </div>
                <div className="h-6 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded" />
                <div className="h-4 w-1/2 bg-zinc-200 dark:bg-zinc-800 rounded" />
                <hr className="border-zinc-200 dark:border-zinc-800" />
                <div className="space-y-2 pt-2">
                  <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-full" />
                  <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-5/6" />
                  <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-11/12" />
                  <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-4/5" />
                </div>
              </div>
            </div>
          )}

          {/* 3. Success / Complete state */}
          {status === "completed" && (
            <div className="flex-1 animate-fadeIn flex flex-col">
              <OutputPanel packageData={packageData} />
            </div>
          )}

          {/* 4. Error state */}
          {status === "error" && (
            <div className="space-y-6 flex-1 flex flex-col">
              <StepProgress
                currentStep={currentStep}
                stepMessage={stepMessage}
                status={status}
                errorMessage={errorMessage}
              />
              
              {/* Fallback output show if partial data exists */}
              {Object.keys(packageData).length > 0 && (
                <div className="flex-1 border border-rose-500/10 rounded-2xl overflow-hidden flex flex-col">
                  <div className="bg-rose-500/5 px-4 py-2 border-b border-rose-500/10 text-xs font-semibold text-rose-500 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Partial content generated before failure is listed below:
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
      
      {/* Footer bar */}
      <footer className="border-t border-zinc-200 dark:border-zinc-900 bg-white/30 dark:bg-zinc-950/20 py-4 text-center">
        <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-500 font-medium">
          DQ AI Editorial Copilot POC • Powered by Google Gemini 1.5 Flash • For Editorial Quality Verification
        </p>
      </footer>
    </div>
  );
}
