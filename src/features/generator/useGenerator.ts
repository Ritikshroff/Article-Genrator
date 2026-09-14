"use client";
// ─────────────────────────────────────────────────────────────
// useGenerator.ts
// Custom hook managing editorial generation state, streaming, and save logic
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import { magazineList, MagazineKey } from "@/lib/magazineConfig";
import { EditorialPackage } from "@/components/OutputPanel";
import { apiFetch } from "@/lib/apiClient";
import { useToast } from "@/lib/toastContext";
import { wordPresets, TopicType } from "./constants";

export function useGenerator(isEditor: boolean = false) {
  const { toast } = useToast();

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
  const [topicType, setTopicType] = useState<TopicType>("");
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
    if (saved) {
      setCustomApiKey(saved);
      setIsApiKeySaved(true);
    }
  }, []);

  const handleClearPR = useCallback(() => {
    setPressRelease("");
    toast.info("Press release input cleared.");
  }, [toast]);

  const handleReset = useCallback(async () => {
    if (packageData.news || pressRelease.trim()) {
      const ok = await toast.confirm(
        "Start over and clear all generated content? Any unsaved changes will be lost.",
        { title: "Start Over", confirmText: "Reset", isDestructive: true }
      );
      if (!ok) return;
    }
    setStatus("idle");
    setCurrentStep(0);
    setStepMessage("");
    setErrorMessage("");
    setPackageData({});
    setSavedArticleId(null);
    toast.info("Workspace reset.");
  }, [packageData.news, pressRelease, toast]);

  const getStepsForTopic = useCallback(() => {
    let steps: { id: number; name: string }[] = [];
    if (topicType === "Interview") {
      steps = [
        { id: 1, name: "Interview Q&A" },
        { id: 2, name: "Interview Prep & Queries" },
        { id: 3, name: "SEO Assets" },
      ];
    } else if (topicType === "Opinion") {
      steps = [
        { id: 1, name: "Opinion Piece" },
        { id: 2, name: "SEO Assets" },
        { id: 3, name: "Editorial Review" },
      ];
    } else if (topicType === "Feature") {
      steps = [
        { id: 1, name: "Feature Article" },
        { id: 2, name: "Industry Impact Analysis" },
        { id: 3, name: "SEO Assets" },
      ];
    } else if (topicType === "CaseStudy") {
      steps = [
        { id: 1, name: "Case Study" },
        { id: 2, name: "SEO Assets" },
        { id: 3, name: "Editorial Review" },
      ];
    } else {
      steps = [
        { id: 1, name: "News Article" },
        { id: 2, name: "SEO Assets" },
        { id: 3, name: "Social Media" },
        { id: 4, name: "Editorial Review" },
      ];
    }
    if (generateImage) {
      steps.push({ id: steps.length + 1, name: "Cover Banner" });
    }
    return steps;
  }, [topicType, generateImage]);

  const handleGenerate = async () => {
    if (isEditor) {
      setErrorMessage("Article generation is restricted to Authors.");
      setStatus("error");
      toast.error("Article generation is restricted to Authors.");
      return;
    }
    if (!topicType) {
      setErrorMessage("Please select an Article Type first.");
      setStatus("error");
      toast.error("Please select an Article Type first.");
      return;
    }
    if (!pressRelease.trim()) {
      setErrorMessage("Please paste a press release first.");
      setStatus("error");
      toast.error("Please paste a press release first.");
      return;
    }

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
          topicType,
          minWords,
          maxWords,
          customPrompt,
          generateImage,
          imageCount,
          humanize,
          referencePCQuest,
          hands_on_data: handsOnData,
          magazine,
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
            if (payload.type === "step") {
              setCurrentStep(payload.step);
              setStepMessage(payload.message);
            } else if (payload.type === "data") {
              setPackageData((prev) => ({ ...prev, [payload.key]: payload.data }));
            } else if (payload.type === "done") {
              setStatus("completed");
              toast.success("Editorial package generated successfully! All sections are ready.");
              import("canvas-confetti").then((m) =>
                m.default({
                  particleCount: 120,
                  spread: 70,
                  origin: { y: 0.6 },
                  colors: [mag.accentHex, "#ffffff", "#111111"],
                })
              );
            } else if (payload.type === "error") {
              throw new Error(payload.message);
            }
          } catch (jsonErr: any) {
            if (line.includes('"type":"error"')) throw new Error(jsonErr.message || "Error.");
          }
        }
      }
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message || "An unexpected error occurred.");
      toast.error(err.message || "An unexpected error occurred during generation.");
    }
  };

  const handleSaveArticle = async () => {
    if (isEditor) {
      toast.error("Article saving is restricted to Authors.");
      return;
    }
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
          creative_data: packageData.creative || null,
        }),
      });
      setSavedArticleId(res.id);
      toast.success("Article saved successfully!");
    } catch (err: any) {
      toast.error("Failed to save article: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    // Magazine
    magazine,
    setMagazine,
    mag,

    // PR input
    pressRelease,
    setPressRelease,
    handleClearPR,
    wordCount,

    // API Key
    customApiKey,
    setCustomApiKey,
    showApiKey,
    setShowApiKey,
    isApiKeySaved,

    // Status & Progress
    status,
    currentStep,
    stepMessage,
    errorMessage,
    packageData,
    canGenerate,
    getStepsForTopic,

    // Parameters
    topicType,
    setTopicType,
    wordPreset,
    setWordPreset,
    minWords,
    maxWords,
    customPrompt,
    setCustomPrompt,
    generateImage,
    setGenerateImage,
    imageCount,
    setImageCount,
    humanize,
    setHumanize,
    referencePCQuest,
    setReferencePCQuest,
    handsOnData,
    setHandsOnData,
    showAdvanced,
    setShowAdvanced,

    // Saving
    isSaving,
    savedArticleId,

    // Actions
    handleReset,
    handleGenerate,
    handleSaveArticle,
  };
}
