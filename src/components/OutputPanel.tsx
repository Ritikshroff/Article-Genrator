import React, { useState, useEffect } from "react";
import {
  Copy, Check, FileDown, Briefcase, Cpu, Award, Users,
  HelpCircle, Eye, ShieldAlert, Sparkles, Clipboard, ArrowRight,
  ExternalLink, Target, Code, Save
} from "lucide-react";
import { magazines, MagazineKey } from "../lib/magazineConfig";
import { apiFetch } from "../lib/apiClient";

interface NewsData {
  headline: string;
  subheadline: string;
  article: string;
  category: string;
  tags: string[];
  faq?: { question: string; answer: string }[];
  author_byline?: string;
  author_bio_short?: string;
  author_expertise_tags?: string[];
  trust_footer?: string;
  rag_sources?: { id: string; url: string; title: string; snippet: string }[];
  header_image_prompt?: string;
  header_image_alt?: string;
  is_first_look?: boolean;
}

interface SeoData {
  seo_title: string;
  english_title?: string;
  permalink?: string;
  summary?: string;
  meta_title?: string;
  meta_description: string;
  og_title?: string;
  og_description?: string;
  twitter_title?: string;
  twitter_description?: string;
  meta_keywords?: string[];
  meta_news_keywords?: string[];
  slug: string;
  primary_keyword?: string;
  keywords: string[];
  semantic_keywords?: string[];
}

interface ImpactData {
  why_it_matters: string;
  industries_affected: string[];
  business_impact: string;
  technology_impact: string;
  competitive_landscape: string;
}

interface InterviewData {
  candidates: string[];
  questions: string[];
  follow_up_stories: string[];
}

interface ReviewData {
  marketing_claims: string[];
  missing_data: string[];
  customer_reference_gaps: string[];
  india_relevance: string;
  fact_check_items: string[];
  reporting_conflicts: string[];
}

interface SocialData {
  linkedin_post: string;
  twitter_post: string;
}

export interface EditorialPackage {
  news?: NewsData;
  seo?: SeoData;
  impact?: ImpactData;
  interview?: InterviewData;
  review?: ReviewData;
  social?: SocialData;
  creative?: {
    base64?: string;
    mimeType?: string;
    images?: {
      title: string;
      prompt: string;
      base64: string;
      mimeType: string;
    }[];
  };
}

interface OutputPanelProps {
  packageData: EditorialPackage;
  magazine?: string;
  status?: "idle" | "generating" | "completed" | "error";
  currentStep?: number;
  stepMessage?: string;
  steps?: { id: number; name: string }[];
  articleId?: string;
  readOnly?: boolean;
  onSaveBackend?: (updatedPackage: EditorialPackage) => Promise<void>;
}

const renderParagraphWithLinks = (text: string) => {
  const regex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const matchIndex = match.index;
    if (matchIndex > lastIndex) {
      parts.push(text.substring(lastIndex, matchIndex));
    }
    const anchorText = match[1];
    const url = match[2];
    parts.push(
      <a
        key={matchIndex}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#e30613] hover:underline font-bold"
      >
        {anchorText}
      </a>
    );
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts;
};

const formatArticleBody = (text: string) => {
  if (!text) return "";
  let clean = text.replace(/<(?!a\b|span\b|\/a\b|\/span\b)[^>]+>/gi, "");
  clean = clean.replace(
    /\[([a-zA-Z0-9_-]+)\]/g,
    '<span class="inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-bold bg-[#e30613]/10 text-[#e30613] border border-[#e30613]/20 rounded-xs mx-0.5">$1</span>'
  );

  return clean;
};

const formatHtmlForPreview = (html: string) => {
  if (!html) return "";
  let clean = html.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-[#e30613] underline hover:text-[#b8040f] font-medium">$1</a>'
  );
  clean = clean.replace(
    /\[([a-zA-Z0-9_-]+)\]/g,
    '<button type="button" onclick="const el=document.getElementById(\'rag-source-$1\'); if(el){el.scrollIntoView({behavior:\'smooth\',block:\'center\'}); el.classList.add(\'ring-2\',\'ring-[#e30613]\',\'bg-[#e30613]/5\'); setTimeout(()=>el.classList.remove(\'ring-2\',\'ring-[#e30613]\',\'bg-[#e30613]/5\'), 2500);}" class="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-bold bg-[#e30613]/10 hover:bg-[#e30613]/25 text-[#e30613] border border-[#e30613]/30 rounded-xs mx-0.5 cursor-pointer transition-all hover:scale-105" title="Click to view RAG Grounding Citation Source">$1 ↗</button>'
  );
  return clean;
};

const MAGAZINE_PHRASES: Record<string, { title: string; details: string[] }> = {
  Dataquest: {
    title: "Synthesizing Dataquest Enterprise Package...",
    details: [
      "Analyzing press release facts & executive announcements...",
      "Searching CyberMedia Dataquest archives & B2B RAG corpus...",
      "Structuring inverted pyramid story for IT decision makers...",
      "Formulating enterprise impact, CIO takeaways & market context...",
      "Generating SEO metadata, primary keywords & LSI tags...",
      "Auditing marketing claims & building fact-check checklist...",
      "Drafting LinkedIn & X (Twitter) social copy...",
      "Rendering custom AI enterprise cover visual..."
    ]
  },
  "Voice&Data": {
    title: "Synthesizing Voice&Data Telecom Package...",
    details: [
      "Parsing telecom announcement & spectrum details...",
      "Retrieving TRAI & DoT regulatory context from archives...",
      "Structuring telecom news report & 5G/6G market analysis...",
      "Formulating industry impact & enterprise connectivity insights...",
      "Generating telecom SEO keywords & meta descriptions...",
      "Auditing regulatory compliance & fact-check items...",
      "Crafting social media copy for telecom professionals...",
      "Rendering custom AI telecom infrastructure visual..."
    ]
  },
  PCquest: {
    title: "Synthesizing PCquest Tech Package...",
    details: [
      "Analyzing hardware specs & technology announcement...",
      "Cross-referencing PCQuest Labs testing benchmark data...",
      "Structuring First Look & product evaluation framework...",
      "Formulating consumer & enterprise technology impact...",
      "Generating tech SEO title & meta description...",
      "Auditing marketing claims & specs verification checklist...",
      "Rendering studio-quality AI product visual asset..."
    ]
  }
};

export const OutputPanel: React.FC<OutputPanelProps> = ({
  packageData,
  magazine = "DataQuest",
  status = "idle",
  currentStep = 0,
  stepMessage = "",
  steps = [],
  articleId,
  readOnly = false,
  onSaveBackend
}) => {
  const [activeTab, setActiveTab] = useState<"news" | "seo" | "social" | "impact" | "interview" | "review">("news");
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"preview" | "code">("preview");
  const [phraseIndex, setPhraseIndex] = useState(0);

  const normalizedMagKey =
    (magazine === "VoiceData" || magazine === "Voice&Data") ? "Voice&Data"
      : (magazine === "PCQuest" || magazine === "PCquest") ? "PCquest"
        : "Dataquest";

  const currentPhrases = MAGAZINE_PHRASES[normalizedMagKey] || MAGAZINE_PHRASES["Dataquest"];

  useEffect(() => {
    if (status !== "generating") {
      setPhraseIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % currentPhrases.details.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [status, currentPhrases.details.length]);

  const tabOrder: ("news" | "seo" | "social" | "impact" | "interview" | "review")[] = [
    "news",
    "seo",
    "social",
    "impact",
    "interview",
    "review"
  ];

  const availableTabs = tabOrder.filter(tab => !!packageData[tab]);

  React.useEffect(() => {
    if (availableTabs.length > 0 && !availableTabs.includes(activeTab)) {
      setActiveTab(availableTabs[0]);
    }
  }, [packageData]);

  const [socialFields, setSocialFields] = useState({
    linkedin: "",
    twitter: "",
  });
  const [initialSocialFields, setInitialSocialFields] = useState({
    linkedin: "",
    twitter: "",
  });

  const [metaFields, setMetaFields] = useState({
    title: "", englishTitle: "", permalink: "", summary: "",
    metaTitle: "", metaDescription: "", ogTitle: "", ogDescription: "",
    twitterTitle: "", twitterDescription: "", keywords: ""
  });
  const [initialMetaFields, setInitialMetaFields] = useState({
    title: "", englishTitle: "", permalink: "", summary: "",
    metaTitle: "", metaDescription: "", ogTitle: "", ogDescription: "",
    twitterTitle: "", twitterDescription: "", keywords: ""
  });

  // Toast Notifications State
  const [toasts, setToasts] = useState<{ id: string; message: string; type: "success" | "info" | "warning" }[]>([]);

  const showToast = (message: string, type: "success" | "info" | "warning" = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev.slice(-3), { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  useEffect(() => {
    if (packageData.social) {
      const init = {
        linkedin: packageData.social.linkedin_post || "",
        twitter: packageData.social.twitter_post || "",
      };
      setSocialFields(init);
      setInitialSocialFields(init);
    }
  }, [packageData.social]);

  const extractKeywords = (seo: any): string => {
    if (!seo) return "";
    const kw = seo.meta_keywords ?? seo.keywords ?? seo.meta_news_keywords;
    if (!kw) return "";
    if (Array.isArray(kw)) return kw.join(", ");
    if (typeof kw === "string") return kw;
    return String(kw);
  };

  useEffect(() => {
    if (packageData.seo) {
      const init = {
        title: packageData.seo.seo_title || packageData.news?.headline || "",
        englishTitle: packageData.seo.english_title || packageData.news?.headline || "",
        permalink: packageData.seo.permalink || packageData.seo.slug || "",
        summary: packageData.seo.summary || packageData.news?.subheadline || "",
        metaTitle: packageData.seo.meta_title || packageData.seo.seo_title || "",
        metaDescription: packageData.seo.meta_description || "",
        ogTitle: packageData.seo.og_title || packageData.seo.seo_title || "",
        ogDescription: packageData.seo.og_description || packageData.seo.meta_description || "",
        twitterTitle: packageData.seo.twitter_title || packageData.seo.seo_title || "",
        twitterDescription: packageData.seo.twitter_description || packageData.seo.meta_description || "",
        keywords: extractKeywords(packageData.seo),
      };
      setMetaFields(init);
      setInitialMetaFields(init);
    }
  }, [packageData.seo, packageData.news]);

  const isLinkedInDirty = socialFields.linkedin !== initialSocialFields.linkedin;
  const isTwitterDirty = socialFields.twitter !== initialSocialFields.twitter;
  const isMetaDirty = JSON.stringify(metaFields) !== JSON.stringify(initialMetaFields);

  const syncToBackendDB = async (updatedPackage: EditorialPackage) => {
    if (articleId) {
      try {
        await apiFetch(`/articles/${articleId}`, {
          method: "PUT",
          body: JSON.stringify({
            title: updatedPackage.news?.headline || updatedPackage.seo?.seo_title || "Untitled",
            publication: magazine,
            news_data: updatedPackage.news,
            seo_data: updatedPackage.seo,
            social_data: updatedPackage.social,
            impact_data: updatedPackage.impact,
            interview_data: updatedPackage.interview,
            review_data: updatedPackage.review,
          }),
        });
        showToast("☁️ Saved & Synced to MongoDB Database!", "success");
      } catch (err: any) {
        console.error("Backend DB sync error:", err);
        showToast(`⚠️ Saved locally, but DB sync error: ${err.message || "Network error"}`, "warning");
      }
    } else if (onSaveBackend) {
      await onSaveBackend(updatedPackage);
    }
  };

  const handleSaveLinkedIn = async () => {
    if (!isLinkedInDirty) return;
    if (packageData.social) {
      packageData.social.linkedin_post = socialFields.linkedin;
    }
    setInitialSocialFields((prev) => ({ ...prev, linkedin: socialFields.linkedin }));
    showToast("💾 LinkedIn post saved!", "success");
    await syncToBackendDB(packageData);
  };

  const handleSaveTwitter = async () => {
    if (!isTwitterDirty) return;
    if (packageData.social) {
      packageData.social.twitter_post = socialFields.twitter;
    }
    setInitialSocialFields((prev) => ({ ...prev, twitter: socialFields.twitter }));
    showToast("💾 X / Twitter post saved!", "success");
    await syncToBackendDB(packageData);
  };

  const handleSaveMetadata = async () => {
    if (!isMetaDirty) return;
    if (packageData.seo) {
      packageData.seo.seo_title = metaFields.title;
      packageData.seo.english_title = metaFields.englishTitle;
      packageData.seo.permalink = metaFields.permalink;
      packageData.seo.summary = metaFields.summary;
      packageData.seo.meta_title = metaFields.metaTitle;
      packageData.seo.meta_description = metaFields.metaDescription;
      packageData.seo.og_title = metaFields.ogTitle;
      packageData.seo.og_description = metaFields.ogDescription;
      packageData.seo.twitter_title = metaFields.twitterTitle;
      packageData.seo.twitter_description = metaFields.twitterDescription;
      const kwArray = metaFields.keywords.split(",").map(s => s.trim()).filter(Boolean);
      packageData.seo.meta_keywords = kwArray;
      packageData.seo.keywords = kwArray;
      (packageData.seo as any).meta_news_keywords = kwArray;
    }
    setInitialMetaFields({ ...metaFields });
    showToast("💾 All 11 Metadata fields saved!", "success");
    await syncToBackendDB(packageData);
  };

  const getActiveTabHTML = (): string => {
    if (activeTab === "news" && packageData.news) {
      const h1 = `<h1>${packageData.news.headline}</h1>`;
      const h2 = packageData.news.subheadline ? `<h2>${packageData.news.subheadline}</h2>` : "";
      const body = packageData.news.article || "";
      let faqHtml = "";
      if (packageData.news.faq && packageData.news.faq.length > 0) {
        faqHtml = `<h2>Frequently Asked Questions</h2>` + packageData.news.faq.map((f, i) => `<h3>${i + 1}. ${f.question}</h3><p>${f.answer}</p>`).join("");
      }
      return `<div>${h1}${h2}${body}${faqHtml}</div>`;
    }
    if (activeTab === "seo") {
      return `<div style="font-family: sans-serif; line-height: 1.6;">
        <h2 style="color: #e30613; margin-bottom: 16px;">PubLive CMS 11-Field Metadata Package</h2>
        <ol style="padding-left: 20px;">
          <li style="margin-bottom: 12px;"><strong>Article Title (Headline):</strong> <p>${metaFields.title}</p></li>
          <li style="margin-bottom: 12px;"><strong>English Title:</strong> <p>${metaFields.englishTitle}</p></li>
          <li style="margin-bottom: 12px;"><strong>Permalink (URL Slug):</strong> <p>${metaFields.permalink}</p></li>
          <li style="margin-bottom: 12px;"><strong>Article Summary / Excerpt:</strong> <p>${metaFields.summary}</p></li>
          <li style="margin-bottom: 12px;"><strong>Meta Title (SEO Title):</strong> <p>${metaFields.metaTitle}</p></li>
          <li style="margin-bottom: 12px;"><strong>Meta Description:</strong> <p>${metaFields.metaDescription}</p></li>
          <li style="margin-bottom: 12px;"><strong>OG Title (Social Graph):</strong> <p>${metaFields.ogTitle}</p></li>
          <li style="margin-bottom: 12px;"><strong>OG Description (Social Graph):</strong> <p>${metaFields.ogDescription}</p></li>
          <li style="margin-bottom: 12px;"><strong>Twitter Title (X Card):</strong> <p>${metaFields.twitterTitle}</p></li>
          <li style="margin-bottom: 12px;"><strong>Twitter Description (X Card):</strong> <p>${metaFields.twitterDescription}</p></li>
          <li style="margin-bottom: 12px;"><strong>Meta Keywords & News Keywords:</strong> <p>${metaFields.keywords}</p></li>
        </ol>
      </div>`;
    }
    return getActiveTabContentString();
  };

  const triggerCopy = async (text: string, identifier: string, htmlContent?: string) => {
    try {
      const htmlToCopy = htmlContent || (activeTab === "news" ? getActiveTabHTML() : null);

      if (htmlToCopy && typeof ClipboardItem !== "undefined") {
        const blobText = new Blob([text], { type: "text/plain" });
        const blobHtml = new Blob([htmlToCopy], { type: "text/html" });
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/plain": blobText,
            "text/html": blobHtml,
          }),
        ]);
      } else {
        await navigator.clipboard.writeText(text);
      }
      setCopiedSection(identifier);
      const label = identifier === "active-tab" ? "Formatted Article & Package"
        : identifier === "linkedin" ? "LinkedIn Post"
        : identifier === "twitter" ? "X / Twitter Post"
        : identifier === "img-prompt" ? "Header Image Prompt"
        : identifier === "raw-html" ? "Raw HTML Code"
        : "Content";
      showToast(`📋 Copied ${label} to clipboard!`, "success");
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (err) {
      try {
        await navigator.clipboard.writeText(text);
        setCopiedSection(identifier);
        showToast(`📋 Copied content to clipboard!`, "success");
        setTimeout(() => setCopiedSection(null), 2000);
      } catch (fallbackErr) {
        console.error("Failed to copy text:", fallbackErr);
        showToast("⚠️ Could not copy text to clipboard", "warning");
      }
    }
  };

  const getTabLabel = (key: string) => {
    switch (key) {
      case "news": return "Article Text";
      case "seo": return " Metadata ";
      case "social": return "Social Media";
      case "impact": return "Industry Impact";
      case "interview": return "Story Leads";
      case "review": return "Editorial Review";
      default: return "";
    }
  };

  // Build markdown structure for export
  const buildMarkdownReport = (): string => {
    const { news, seo, social, impact, interview, review } = packageData;
    let md = `# DQ AI Editorial Copilot - Consolidated Editorial Package\n\n`;

    if (news) {
      md += `## Article Text\n\n`;
      md += `### ${news.headline}\n`;
      md += `*${news.subheadline}*\n\n`;
      md += `**Category:** ${news.category}  \n`;
      md += `**Tags:** ${news.tags.join(", ")}\n\n`;
      md += `${news.article}\n\n`;
      md += `---\n\n`;
    }

    if (seo) {
      md += `## SEO Metadata\n\n`;
      if (seo.primary_keyword) md += `- **Primary Keyword:** ${seo.primary_keyword}\n`;
      md += `- **SEO Title:** ${seo.seo_title}\n`;
      md += `- **Meta Description:** ${seo.meta_description}\n`;
      md += `- **Slug:** ${seo.slug}\n`;
      md += `- **Focus Keywords:** ${seo.keywords.join(", ")}\n`;
      if (seo.semantic_keywords && seo.semantic_keywords.length > 0) {
        md += `- **Semantic/LSI Keywords:** ${seo.semantic_keywords.join(", ")}\n`;
      }
      md += `\n---\n\n`;
    }

    if (social) {
      md += `## Social Media Copy\n\n`;
      md += `### LinkedIn Post\n\n${social.linkedin_post}\n\n`;
      md += `### Twitter / X Post\n\n${social.twitter_post}\n\n`;
      md += `---\n\n`;
    }

    if (impact) {
      md += `## Industry Impact\n\n`;
      md += `### Why It Matters\n${impact.why_it_matters}\n\n`;
      md += `### Industries Affected\n${impact.industries_affected.join(", ")}\n\n`;
      md += `### Business Impact\n${impact.business_impact}\n\n`;
      md += `### Technology Impact\n${impact.technology_impact}\n\n`;
      md += `### Competitive Landscape\n${impact.competitive_landscape}\n\n`;
      md += `---\n\n`;
    }

    if (interview) {
      md += `## Interview Opportunities\n\n`;
      md += `### Potential Interview Candidates\n${interview.candidates.map(c => `- ${c}`).join("\n")}\n\n`;
      md += `### 10 Interview Questions\n${interview.questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}\n\n`;
      md += `### Follow-up Stories\n${interview.follow_up_stories.map(s => `- ${s}`).join("\n")}\n\n`;
      md += `---\n\n`;
    }

    if (review) {
      md += `## Editorial Review Warnings & Checks\n\n`;
      md += `### Marketing Claims Flagged\n${review.marketing_claims.map(c => `- ${c}`).join("\n")}\n\n`;
      md += `### Missing Data Points\n${review.missing_data.map(d => `- ${d}`).join("\n")}\n\n`;
      md += `### Customer Reference Gaps\n${review.customer_reference_gaps.map(g => `- ${g}`).join("\n")}\n\n`;
      md += `### India Market Relevance\n${review.india_relevance}\n\n`;
      md += `### Fact-Check Checklists\n${review.fact_check_items.map(i => `- ${i}`).join("\n")}\n\n`;
      if (review.reporting_conflicts && review.reporting_conflicts.length > 0) {
        md += `### Potential Conflicts with Previous Reporting\n${review.reporting_conflicts.map(i => `- ${i}`).join("\n")}\n\n`;
      }
    }

    return md;
  };

  const handleExportMarkdown = () => {
    const mdContent = buildMarkdownReport();
    const blob = new Blob([mdContent], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `editorial_package_${packageData.seo?.slug || "export"}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("📥 Exported Editorial Package as Markdown (.md)", "info");
  };

  const handleExportJSON = () => {
    const jsonContent = JSON.stringify(packageData, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `editorial_package_${packageData.seo?.slug || "export"}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("📥 Exported Editorial Package as JSON (.json)", "info");
  };

  // Get current active section content string for simple copy (includes FAQs & Formatted Metadata)
  const getActiveTabContentString = (): string => {
    switch (activeTab) {
      case "news": {
        if (!packageData.news) return "";
        let text = `# ${packageData.news.headline}\n## ${packageData.news.subheadline}\n\n${packageData.news.article}`;
        if (packageData.news.faq && packageData.news.faq.length > 0) {
          text += `\n\n## Frequently Asked Questions\n\n` + packageData.news.faq.map((f, i) => `### ${i + 1}. ${f.question}\n${f.answer}`).join("\n\n");
        }
        return text;
      }
      case "seo": {
        return `PUBLIVE CMS 11-FIELD METADATA PACKAGE
-----------------------------------------
1. Article Title (Headline): ${metaFields.title}
2. English Title: ${metaFields.englishTitle}
3. Permalink (URL Slug): ${metaFields.permalink}
4. Article Summary / Excerpt: ${metaFields.summary}
5. Meta Title (SEO Title): ${metaFields.metaTitle}
6. Meta Description: ${metaFields.metaDescription}
7. OG Title (Social Graph): ${metaFields.ogTitle}
8. OG Description (Social Graph): ${metaFields.ogDescription}
9. Twitter Title (X Card): ${metaFields.twitterTitle}
10. Twitter Description (X Card): ${metaFields.twitterDescription}
11. Meta Keywords & News Keywords: ${metaFields.keywords}`;
      }
      case "social":
        return `LinkedIn Post:\n${socialFields.linkedin}\n\nTwitter/X Post:\n${socialFields.twitter}`;
      case "impact":
        return packageData.impact ? JSON.stringify(packageData.impact, null, 2) : "";
      case "interview":
        return packageData.interview ? JSON.stringify(packageData.interview, null, 2) : "";
      case "review":
        return packageData.review ? JSON.stringify(packageData.review, null, 2) : "";
      default:
        return "";
    }
  };

  return (
    <div className="w-full flex flex-col h-full bg-white dark:bg-[#161616] border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 gap-3 bg-zinc-50 dark:bg-[#1a1a1a]">
        <div className="flex items-center gap-2">
          <Sparkles className={`w-3.5 h-3.5 ${magazine === "Voice&Data" || magazine === "VoiceData" ? "text-[#e59e19]" : "text-[#e30613]"}`} />
          <span className="text-[11px] font-bold tracking-[0.14em] uppercase text-zinc-500 dark:text-zinc-400">
            Generated Package
          </span>
        </div>

        {!!(packageData?.news || packageData?.seo || packageData?.social) && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => triggerCopy(getActiveTabContentString(), "active-tab", getActiveTabHTML())}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors uppercase tracking-wide cursor-pointer bg-white dark:bg-zinc-800 rounded-xs shadow-2xs"
              title="Copy formatted article text (HTML + Plain text)"
            >
              {copiedSection === "active-tab" ? (
                <><Check className="w-3 h-3 text-emerald-500" />Copied</>
              ) : (
                <><Copy className="w-3 h-3" />Copy</>
              )}
            </button>

            <button
              onClick={handleExportMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors uppercase tracking-wide cursor-pointer bg-white dark:bg-zinc-800 rounded-xs shadow-2xs"
            >
              <FileDown className="w-3 h-3" />Markdown
            </button>

            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors uppercase tracking-wide cursor-pointer bg-white dark:bg-zinc-800 rounded-xs shadow-2xs"
            >
              <FileDown className="w-3 h-3" />JSON
            </button>
          </div>
        )}
      </div>

      {/* Tabs list */}
      <div className="flex overflow-x-auto border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#161616]">
        {availableTabs.map((tab) => {
          const isSelected = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 px-4 py-3 text-[12px] sm:text-[13px] font-semibold border-b-2 transition-all whitespace-nowrap ${isSelected
                ? "border-[#e30613] text-[#e30613]"
                : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
            >
              {getTabLabel(tab)}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-6 scroller">

        {/* Empty State / Generator Progress State */}
        {!packageData?.news && !packageData?.seo && !packageData?.social && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-5 my-auto">
            <div className={`w-16 h-16 ${magazine === "Voice&Data" || magazine === "VoiceData" ? "bg-[#00839b]/10 border-[#00839b]/20 text-[#00839b]" : "bg-[#e30613]/10 border-[#e30613]/20 text-[#e30613]"} border font-black text-xl flex items-center justify-center shadow-inner rounded-xs`}>
              {magazine === "Voice&Data" ? "V&D" : magazine === "PCquest" ? "PCQ" : "DQ"}
            </div>

            <div className="max-w-sm space-y-1.5">
              <h3 className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-50">
                Ready for {magazine || "CYBERMEDIA"}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Complete the 3 steps on the left and click <strong className="text-zinc-800 dark:text-zinc-200">"Generate Article"</strong> to produce a grounded {magazine || "CYBERMEDIA"} draft.
              </p>
            </div>

            {status === "generating" ? (
              <div className="w-full space-y-6 text-left animate-fadeIn">
                {/* Generation Progress Bar */}
                <div className="p-4 bg-white dark:bg-[#161616] border border-zinc-200 dark:border-zinc-800 space-y-2.5 shadow-xs">
                  <div className={`flex items-center justify-between text-xs font-bold ${magazine === "Voice&Data" || magazine === "VoiceData" ? "text-[#00839b]" : "text-[#e30613]"}`}>
                    <span className="flex items-center gap-2">
                      <Sparkles className={`w-4 h-4 animate-spin ${magazine === "Voice&Data" || magazine === "VoiceData" ? "text-[#00839b]" : "text-[#e30613]"}`} /> {currentPhrases.title}
                    </span>
                    <span className="text-zinc-500 font-mono text-[11px]">Step {currentStep || 1} of {steps?.length || 4}</span>
                  </div>
                  <div className="h-2 bg-zinc-100 dark:bg-zinc-800 overflow-hidden rounded-full">
                    <div
                      className={`h-full ${magazine === "Voice&Data" || magazine === "VoiceData" ? "bg-[#00839b]" : "bg-[#e30613]"} transition-all duration-300 shimmer`}
                      style={{ width: `${Math.max(15, ((currentStep || 1) / (steps?.length || 4)) * 100)}%` }}
                    />
                  </div>
                  <p key={phraseIndex} className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 italic animate-in fade-in duration-200">
                    {stepMessage || currentPhrases.details[phraseIndex] || "Analyzing press release & generating AI editorial package..."}
                  </p>
                </div>

                {/* Article Shimmer Skeleton Preview */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-24 bg-zinc-200 dark:bg-zinc-800 shimmer rounded-xs" />
                    <div className="h-5 w-16 bg-zinc-200 dark:bg-zinc-800 shimmer rounded-xs" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-7 w-11/12 bg-zinc-200 dark:bg-zinc-800 shimmer rounded-xs" />
                    <div className="h-7 w-3/4 bg-zinc-200 dark:bg-zinc-800 shimmer rounded-xs" />
                  </div>
                  <div className="h-4 w-2/3 bg-zinc-200 dark:bg-zinc-800 shimmer rounded-xs" />
                  <div className="h-12 w-full bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 shimmer rounded-xs" />
                  <div className="h-52 w-full bg-zinc-200 dark:bg-zinc-800 shimmer rounded-xs" />
                  <div className="space-y-2.5 pt-2">
                    <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 shimmer rounded-xs" />
                    <div className="h-4 w-11/12 bg-zinc-200 dark:bg-zinc-800 shimmer rounded-xs" />
                    <div className="h-4 w-4/5 bg-zinc-200 dark:bg-zinc-800 shimmer rounded-xs" />
                    <div className="h-4 w-5/6 bg-zinc-200 dark:bg-zinc-800 shimmer rounded-xs" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-sm border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 p-4 space-y-2 text-left text-xs">
                <p className="font-bold text-zinc-400 uppercase tracking-wider text-[10px]">What You'll Receive:</p>
                <ul className="space-y-1.5 text-zinc-600 dark:text-zinc-400">
                  <li className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 ${magazine === "Voice&Data" || magazine === "VoiceData" ? "bg-[#e59e19]" : "bg-[#e30613]"} rounded-full`} />
                    <span>Full article text — ready to publish</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 ${magazine === "Voice&Data" || magazine === "VoiceData" ? "bg-[#e59e19]" : "bg-[#e30613]"} rounded-full`} />
                    <span>SEO title, meta description & keywords</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 ${magazine === "Voice&Data" || magazine === "VoiceData" ? "bg-[#e59e19]" : "bg-[#e30613]"} rounded-full`} />
                    <span>LinkedIn & Twitter posts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 ${magazine === "Voice&Data" || magazine === "VoiceData" ? "bg-[#e59e19]" : "bg-[#e30613]"} rounded-full`} />
                    <span>Editorial review checklist</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 ${magazine === "Voice&Data" || magazine === "VoiceData" ? "bg-[#e59e19]" : "bg-[#e30613]"} rounded-full`} />
                    <span>AI-generated cover image</span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        )}

        {/* TAB 1: News Article */}
        {activeTab === "news" && packageData.news && (
          <div className="space-y-6 animate-fadeIn">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 uppercase tracking-wider rounded">
                  {packageData.news.category || "Technology"}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {packageData.news.tags?.map((t, idx) => (
                    <span key={idx} className="px-1.5 py-0.5 text-[9px] bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 rounded-full font-medium">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 font-heading leading-tight">
                {packageData.news.headline}
              </h1>
              <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 italic">
                {packageData.news.subheadline}
              </p>

              {/* Author Byline & E-E-A-T Entity Box */}
              {packageData.news.author_byline && (
                <div className="flex flex-wrap items-center justify-between p-3 border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/40 text-[12px] gap-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-[#e30613]" />
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">By {packageData.news.author_byline}</span>
                    {packageData.news.author_bio_short && (
                      <span className="text-zinc-400 dark:text-zinc-500 hidden sm:inline">• {packageData.news.author_bio_short}</span>
                    )}
                  </div>
                  {packageData.news.author_expertise_tags && (
                    <div className="flex flex-wrap gap-1">
                      {packageData.news.author_expertise_tags.map((tag, idx) => (
                        <span key={idx} className="px-2 py-0.5 text-[10px] font-semibold bg-[#e30613]/10 text-[#e30613] border border-[#e30613]/20">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* PCQuest First Look Disclaimer */}
            {packageData.news.is_first_look && (
              <div className="p-3 border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 text-[12px] font-medium leading-relaxed">
                ⚠️ <strong>Note:</strong> This first impression is based on official press release and specs. Hands-on review from PCQuest Labs is awaited.
              </div>
            )}

            {packageData.creative && (
              <div className="space-y-3 my-3">
                {packageData.creative.images && packageData.creative.images.length > 1 ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      <span>Generated Article Visual Assets ({packageData.creative.images.length} Images)</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {packageData.creative.images.map((img, idx) => (
                        <div key={idx} className="group relative border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 rounded-sm overflow-hidden">
                          <img
                            src={`data:${img.mimeType || "image/jpeg"};base64,${img.base64}`}
                            alt={img.title}
                            className="w-full h-36 object-cover"
                          />
                          <div className="p-2 bg-white dark:bg-[#111] border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                            <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 truncate max-w-[170px]">
                              {img.title}
                            </span>
                            <a
                              href={`data:${img.mimeType || "image/jpeg"};base64,${img.base64}`}
                              download={`article_image_${idx + 1}.jpg`}
                              className="px-2 py-0.5 text-[10px] font-bold bg-[#e30613] text-white hover:bg-[#b8040f] transition-colors"
                            >
                              Download
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : packageData.creative.base64 ? (
                  <div className="w-full relative group rounded-xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800/80 shadow-md">
                    <img
                      src={`data:${packageData.creative.mimeType || "image/jpeg"};base64,${packageData.creative.base64}`}
                      alt="Article Banner Creative"
                      className="w-full h-auto max-h-[320px] object-cover transition-transform duration-500 group-hover:scale-[1.01]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent pointer-events-none" />
                  </div>
                ) : null}
              </div>
            )}

            {/* View Mode Switcher Bar (Rendered Preview vs Raw HTML Code) */}
            <div className="flex items-center justify-between border-y border-zinc-200 dark:border-zinc-800 py-2 my-4">
              <div className="flex items-center gap-1 p-0.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-sm">
                <button
                  type="button"
                  onClick={() => setViewMode("preview")}
                  className={`flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold transition-all ${viewMode === "preview"
                    ? magazine === "Voice&Data" || magazine === "VoiceData" ? "bg-[#00839b] text-white shadow-xs" : "bg-[#e30613] text-white shadow-xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                    }`}
                >
                  <Eye className="w-3.5 h-3.5" /> Article Preview
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("code")}
                  className={`flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold transition-all ${viewMode === "code"
                    ? magazine === "Voice&Data" || magazine === "VoiceData" ? "bg-[#00839b] text-white shadow-xs" : "bg-[#e30613] text-white shadow-xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                    }`}
                >
                  <Code className="w-3.5 h-3.5" /> Raw HTML Code
                </button>
              </div>
              <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider hidden sm:inline">
                {viewMode === "preview" ? "Formatted Visual Mode" : "CMS Copy-Paste Mode"}
              </span>
            </div>

            {/* Article Content Display */}
            {viewMode === "preview" ? (
              <div
                className="prose prose-zinc dark:prose-invert max-w-none text-zinc-800 dark:text-zinc-200 text-sm sm:text-base leading-relaxed [&>h2]:text-lg [&>h2]:font-bold [&>h2]:mt-6 [&>h2]:mb-3 [&>h2]:border-b [&>h2]:border-zinc-200 dark:[&>h2]:border-zinc-800 [&>h2]:pb-1.5 [&>h3]:text-base [&>h3]:font-bold [&>h3]:mt-5 [&>h3]:mb-2 [&>p]:mb-4 [&>p]:leading-relaxed [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-4 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:mb-4 [&>li]:mb-1.5 [&>blockquote]:border-l-4 [&>blockquote]:border-[#e30613] [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:my-4 font-sans"
                dangerouslySetInnerHTML={{ __html: formatHtmlForPreview(packageData.news.article) }}
              />
            ) : (
              <div className="space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                  <span>Raw HTML Source Code (WordPress Ready)</span>
                  <button
                    type="button"
                    onClick={() => triggerCopy(packageData.news?.article || "", "raw-html")}
                    className="text-[#e30613] hover:underline font-bold"
                  >
                    {copiedSection === "raw-html" ? "Copied!" : "Copy HTML Code"}
                  </button>
                </div>
                <textarea
                  readOnly
                  value={packageData.news.article}
                  className="w-full h-96 p-4 font-mono text-[12px] bg-zinc-950 text-emerald-400 border border-zinc-800 rounded-sm focus:outline-none scroller select-all"
                />
              </div>
            )}

            {/* E-E-A-T Trust Footer */}
            {packageData.news.trust_footer && (
              <div className="p-3.5 border-t-2 border-[#e30613] bg-zinc-50 dark:bg-zinc-900/60 text-[11px] text-zinc-600 dark:text-zinc-400 font-mono leading-relaxed mt-6">
                {packageData.news.trust_footer}
              </div>
            )}

            {/* RAG Sources Citations Box */}
            {packageData.news.rag_sources && packageData.news.rag_sources.length > 0 && (
              <div className="p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#1a1a1a] space-y-2 mt-4">
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5 text-[#e30613]" /> RAG Grounding Citation Sources
                </div>
                <div className="space-y-1.5 pt-1">
                  {packageData.news.rag_sources.map((src, i) => (
                    <div
                      key={i}
                      id={`rag-source-${src.id}`}
                      className="text-[12px] flex items-start gap-2 p-2 rounded-xs border border-transparent transition-all duration-300 hover:border-zinc-200 dark:hover:border-zinc-800"
                    >
                      <span className="font-mono text-[10px] px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-[#e30613] font-bold flex-shrink-0">
                        [{src.id}]
                      </span>
                      <a href={src.url} target="_blank" rel="noopener noreferrer" className="text-zinc-700 dark:text-zinc-300 hover:text-[#e30613] hover:underline flex-1">
                        <strong className="font-bold">{src.title}</strong> — <span className="text-zinc-500 dark:text-zinc-400">{src.snippet}</span>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FAQ Accordion */}
            {packageData.news.faq && packageData.news.faq.length > 0 && (
              <div className="mt-6 space-y-3 animate-fadeIn">
                <div className="flex items-center gap-2 mb-3">
                  <HelpCircle className="w-4 h-4 text-[#e30613]" />
                  <h3 className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Frequently Asked Questions</h3>
                </div>
                {packageData.news.faq.map((item, i) => (
                  <details
                    key={i}
                    className="group border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-[#1a1a1a]"
                  >
                    <summary className="flex items-center justify-between px-4 py-3 cursor-pointer text-[13px] font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors list-none gap-2">
                      <span className="flex items-center gap-2.5">
                        <span className="text-[#e30613] font-black text-[10px] w-5 h-5 border border-[#e30613]/30 flex items-center justify-center flex-shrink-0">{i + 1}</span>
                        {item.question}
                      </span>
                      <span className="text-zinc-400 text-xs group-open:rotate-180 transition-transform duration-200">▼</span>
                    </summary>
                    <div className="px-4 py-3 text-[13px] text-zinc-600 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-[#111] leading-relaxed">
                      {item.answer}
                    </div>
                  </details>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PubLive CMS & SEO Metadata (11 Fields) */}
        {activeTab === "seo" && packageData.seo && (
          <div className="space-y-5 animate-fadeIn">
            {/* Read-Only Notice Banner */}
            {readOnly && (
              <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-semibold flex items-center gap-2 rounded-xs">
                <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>🔒 Article is currently submitted for review / approved. Authors cannot edit content during review.</span>
              </div>
            )}

            {/* Google snippet preview with Actual Domain */}
            <div className="p-4 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#1a1a1a] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">Google & SERP Live Preview</span>
                <Eye className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-600" />
              </div>
              <div className="space-y-0.5 font-sans">
                <div className="text-[#1a0dab] dark:text-[#8ab4f8] text-[15px] font-medium hover:underline cursor-pointer leading-tight">
                  {metaFields.metaTitle || metaFields.title}
                </div>
                <div className="text-[#006621] dark:text-[#34a853] text-[12px]">
                  https://www.{(magazines[magazine as MagazineKey] || magazines["Dataquest"]).domain}/news/{metaFields.permalink || packageData.seo.slug}
                </div>
                <div className="text-zinc-600 dark:text-zinc-400 text-[13px] leading-normal line-clamp-2 mt-0.5">
                  {metaFields.metaDescription}
                </div>
              </div>
            </div>

            {/* Universal Save Bar */}
            <div className="flex items-center justify-between p-3.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xs">
              <div>
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider block">Metadata</span>
                <span className="text-[11px] text-zinc-500">Edit any values below and click Save Changes to persist your updates.</span>
              </div>
              <button
                type="button"
                onClick={handleSaveMetadata}
                disabled={readOnly || !isMetaDirty}
                className={`flex items-center gap-1.5 whitespace-nowrap px-4 py-2 text-xs font-bold transition-all shadow-2xs rounded-xs ${
                  readOnly
                    ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed opacity-60"
                    : isMetaDirty
                    ? magazine === "Voice&Data" || magazine === "VoiceData"
                      ? "bg-[#00839b] hover:bg-[#006b80] text-white cursor-pointer opacity-100"
                      : "bg-[#e30613] hover:bg-[#b8040f] text-white cursor-pointer opacity-100"
                    : "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed opacity-60"
                }`}
                title={readOnly ? "Article is locked while in review" : isMetaDirty ? "Save changes to metadata" : "No unsaved changes"}
              >
                {readOnly ? (
                  <><ShieldAlert className="w-3.5 h-3.5 text-amber-500" /> Article Locked</>
                ) : isMetaDirty ? (
                  <><Save className="w-3.5 h-3.5" /> Save Metadata Changes</>
                ) : (
                  <><Check className="w-3.5 h-3.5 text-emerald-500" /> Metadata Saved</>
                )}
              </button>
            </div>



            {/* 11 METADATA FIELDS EDITABLE GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Field 1: Title */}
              <div className="p-3.5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#1a1a1a] space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">1. Article Title (Headline)</label>
                <input
                  type="text"
                  readOnly={readOnly}
                  disabled={readOnly}
                  value={metaFields.title}
                  onChange={(e) => setMetaFields({ ...metaFields, title: e.target.value })}
                  className="w-full text-xs font-semibold p-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xs focus:ring-1 focus:ring-[#e30613] disabled:opacity-75 disabled:cursor-not-allowed"
                />
              </div>

              {/* Field 2: English Title */}
              <div className="p-3.5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#1a1a1a] space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">2. English Title</label>
                <input
                  type="text"
                  readOnly={readOnly}
                  disabled={readOnly}
                  value={metaFields.englishTitle}
                  onChange={(e) => setMetaFields({ ...metaFields, englishTitle: e.target.value })}
                  className="w-full text-xs font-semibold p-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xs focus:ring-1 focus:ring-[#e30613] disabled:opacity-75 disabled:cursor-not-allowed"
                />
              </div>

              {/* Field 3: Permalink / Slug */}
              <div className="p-3.5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#1a1a1a] space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">3. Permalink (URL Slug)</label>
                <input
                  type="text"
                  readOnly={readOnly}
                  disabled={readOnly}
                  value={metaFields.permalink}
                  onChange={(e) => setMetaFields({ ...metaFields, permalink: e.target.value })}
                  className="w-full text-xs font-mono p-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-xs focus:ring-1 focus:ring-[#e30613] disabled:opacity-75 disabled:cursor-not-allowed"
                />
              </div>

              {/* Field 4: Summary */}
              <div className="p-3.5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#1a1a1a] space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">4. Article Summary / Excerpt</label>
                <textarea
                  rows={2}
                  readOnly={readOnly}
                  disabled={readOnly}
                  value={metaFields.summary}
                  onChange={(e) => setMetaFields({ ...metaFields, summary: e.target.value })}
                  className="w-full text-xs p-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-xs focus:ring-1 focus:ring-[#e30613] resize-none disabled:opacity-75 disabled:cursor-not-allowed"
                  style={{ resize: "none" }}
                />
              </div>

              {/* Field 5: Meta Title */}
              <div className="p-3.5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#1a1a1a] space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">5. Meta Title (SEO Title)</label>
                <input
                  type="text"
                  readOnly={readOnly}
                  disabled={readOnly}
                  value={metaFields.metaTitle}
                  onChange={(e) => setMetaFields({ ...metaFields, metaTitle: e.target.value })}
                  className="w-full text-xs font-semibold p-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xs focus:ring-1 focus:ring-[#e30613] disabled:opacity-75 disabled:cursor-not-allowed"
                />
              </div>

              {/* Field 6: Meta Description */}
              <div className="p-3.5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#1a1a1a] space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">6. Meta Description</label>
                <textarea
                  rows={2}
                  readOnly={readOnly}
                  disabled={readOnly}
                  value={metaFields.metaDescription}
                  onChange={(e) => setMetaFields({ ...metaFields, metaDescription: e.target.value })}
                  className="w-full text-xs p-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-xs focus:ring-1 focus:ring-[#e30613] resize-none disabled:opacity-75 disabled:cursor-not-allowed"
                  style={{ resize: "none" }}
                />
              </div>

              {/* Field 7: OG Title */}
              <div className="p-3.5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#1a1a1a] space-y-1.5">
                <label className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">7. OG Title (Social Graph)</label>
                <input
                  type="text"
                  readOnly={readOnly}
                  disabled={readOnly}
                  value={metaFields.ogTitle}
                  onChange={(e) => setMetaFields({ ...metaFields, ogTitle: e.target.value })}
                  className="w-full text-xs font-semibold p-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xs focus:ring-1 focus:ring-[#e30613] disabled:opacity-75 disabled:cursor-not-allowed"
                />
              </div>

              {/* Field 8: OG Description */}
              <div className="p-3.5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#1a1a1a] space-y-1.5">
                <label className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">8. OG Description (Social Graph)</label>
                <textarea
                  rows={2}
                  readOnly={readOnly}
                  disabled={readOnly}
                  value={metaFields.ogDescription}
                  onChange={(e) => setMetaFields({ ...metaFields, ogDescription: e.target.value })}
                  className="w-full text-xs p-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-xs focus:ring-1 focus:ring-[#e30613] resize-none disabled:opacity-75 disabled:cursor-not-allowed"
                  style={{ resize: "none" }}
                />
              </div>

              {/* Field 9: Twitter Title */}
              <div className="p-3.5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#1a1a1a] space-y-1.5">
                <label className="text-[10px] font-bold text-sky-500 uppercase tracking-wider block">9. Twitter Title (X Card)</label>
                <input
                  type="text"
                  readOnly={readOnly}
                  disabled={readOnly}
                  value={metaFields.twitterTitle}
                  onChange={(e) => setMetaFields({ ...metaFields, twitterTitle: e.target.value })}
                  className="w-full text-xs font-semibold p-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xs focus:ring-1 focus:ring-[#e30613] disabled:opacity-75 disabled:cursor-not-allowed"
                />
              </div>

              {/* Field 10: Twitter Description */}
              <div className="p-3.5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#1a1a1a] space-y-1.5">
                <label className="text-[10px] font-bold text-sky-500 uppercase tracking-wider block">10. Twitter Description (X Card)</label>
                <textarea
                  rows={2}
                  readOnly={readOnly}
                  disabled={readOnly}
                  value={metaFields.twitterDescription}
                  onChange={(e) => setMetaFields({ ...metaFields, twitterDescription: e.target.value })}
                  className="w-full text-xs p-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-xs focus:ring-1 focus:ring-[#e30613] resize-none disabled:opacity-75 disabled:cursor-not-allowed"
                  style={{ resize: "none" }}
                />
              </div>

              {/* Field 11: Meta Keywords */}
              <div className="p-3.5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#1a1a1a] md:col-span-2 space-y-1.5">
                <label className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">11. Meta Keywords & Meta News Keywords</label>
                <input
                  type="text"
                  readOnly={readOnly}
                  disabled={readOnly}
                  value={metaFields.keywords}
                  onChange={(e) => setMetaFields({ ...metaFields, keywords: e.target.value })}
                  className="w-full text-xs font-medium p-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xs focus:ring-1 focus:ring-[#e30613] disabled:opacity-75 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {packageData.news?.header_image_prompt && (
              <div className="p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#1a1a1a] md:col-span-2 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-[#e30613]" /> E-E-A-T Safe Header Image Prompt
                  </div>
                  <button
                    onClick={() => triggerCopy(packageData.news?.header_image_prompt || "", "img-prompt")}
                    className="text-[10px] font-bold text-[#e30613] hover:underline"
                  >
                    {copiedSection === "img-prompt" ? "Copied" : "Copy Prompt"}
                  </button>
                </div>
                <code className="text-[11px] bg-zinc-50 dark:bg-zinc-900/60 p-2.5 border border-zinc-100 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono block leading-relaxed">
                  {packageData.news.header_image_prompt}
                </code>
                {packageData.news.header_image_alt && (
                  <p className="text-[11px] text-zinc-500 mt-1">
                    <strong>SEO Alt Text:</strong> {packageData.news.header_image_alt}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Industry Impact Analysis */}
        {activeTab === "impact" && packageData.impact && (
          <div className="space-y-4 animate-fadeIn">
            <div className="p-4 border border-[#e30613]/20 bg-[#e30613]/5 space-y-2">
              <h3 className="text-[10px] font-bold text-[#e30613] uppercase tracking-widest flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" /> Why It Matters
              </h3>
              <p className="text-[13px] text-zinc-700 dark:text-zinc-300 leading-relaxed">{packageData.impact.why_it_matters}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#1a1a1a] space-y-2">
                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Briefcase className="w-3 h-3" /> Business Impact
                </h4>
                <p className="text-[13px] text-zinc-700 dark:text-zinc-300 leading-relaxed">{packageData.impact.business_impact}</p>
              </div>

              <div className="p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#1a1a1a] space-y-2">
                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Cpu className="w-3 h-3" /> Technology Shift
                </h4>
                <p className="text-[13px] text-zinc-700 dark:text-zinc-300 leading-relaxed">{packageData.impact.technology_impact}</p>
              </div>

              <div className="p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#1a1a1a] md:col-span-2 space-y-2">
                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Users className="w-3 h-3" /> Competitive Landscape
                </h4>
                <p className="text-[13px] text-zinc-700 dark:text-zinc-300 leading-relaxed">{packageData.impact.competitive_landscape}</p>
              </div>

              <div className="p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#1a1a1a] md:col-span-2 space-y-2">
                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Industries Affected</h4>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {packageData.impact.industries_affected.map((ind, i) => (
                    <span key={i} className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-medium text-[11px] border border-zinc-200 dark:border-zinc-800">
                      {ind}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Interview & Questions */}
        {activeTab === "interview" && packageData.interview && (
          <div className="space-y-4 animate-fadeIn">
            <div className="p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#1a1a1a] space-y-3">
              <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> Suggested Interview Candidates
              </h3>
              <ul className="space-y-2">
                {packageData.interview.candidates.map((cand, i) => (
                  <li key={i} className="flex items-center gap-2 text-[13px] text-zinc-700 dark:text-zinc-300">
                    <span className="w-1.5 h-1.5 bg-[#e30613] flex-shrink-0" />
                    {cand}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#1a1a1a] space-y-3">
              <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5" /> Interview Questions
              </h3>
              <ol className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {packageData.interview.questions.slice(0, 10).map((q, i) => (
                  <li key={i} className="py-2.5 flex items-start gap-3 text-[13px] text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    <span className="font-black text-[#e30613] flex-shrink-0 w-5 text-right text-[11px]">{i + 1}.</span>
                    <span className="flex-1">{q}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#1a1a1a] space-y-3">
              <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Follow-up Story Angles</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {packageData.interview.follow_up_stories.map((story, i) => (
                  <div key={i} className="p-3 border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-[#111] flex items-start gap-2">
                    <ArrowRight className="w-3.5 h-3.5 text-[#e30613] flex-shrink-0 mt-0.5" />
                    <p className="text-[12px] text-zinc-600 dark:text-zinc-400 leading-relaxed">{story}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Editorial Review */}
        {activeTab === "review" && packageData.review && (
          <div className="space-y-4 animate-fadeIn">
            <div className="p-4 border border-amber-500/20 bg-amber-500/5 dark:bg-amber-950/10 space-y-3">
              <h3 className="text-[10px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" /> Marketing Claims to Strip
              </h3>
              {packageData.review.marketing_claims.length > 0 ? (
                <ul className="space-y-2">
                  {packageData.review.marketing_claims.map((claim, i) => (
                    <li key={i} className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 flex items-start gap-2">
                      <span className="text-amber-500 font-bold mt-0.5 select-none">•</span>
                      <span>{claim}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs sm:text-sm text-zinc-500 italic">
                  No excessive marketing claims identified.
                </p>
              )}
            </div>

            <div className="p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#1a1a1a] space-y-2">
              <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">India Market Alignment</h4>
              <p className="text-[13px] text-zinc-700 dark:text-zinc-300 leading-relaxed">{packageData.review.india_relevance}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#1a1a1a] space-y-2.5">
                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Missing Data & Metrics</h4>
                <ul className="space-y-1.5">
                  {packageData.review.missing_data.map((item, i) => (
                    <li key={i} className="text-[12px] text-zinc-600 dark:text-zinc-400 flex items-start gap-1.5">
                      <span className="text-zinc-300 dark:text-zinc-700 font-bold mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#1a1a1a] space-y-2.5">
                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Reference Gaps</h4>
                <ul className="space-y-1.5">
                  {packageData.review.customer_reference_gaps.map((gap, i) => (
                    <li key={i} className="text-[12px] text-zinc-600 dark:text-zinc-400 flex items-start gap-1.5">
                      <span className="text-zinc-300 dark:text-zinc-700 font-bold mt-0.5">•</span>
                      <span>{gap}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#1a1a1a] md:col-span-2 space-y-2.5">
                <h4 className="text-[10px] font-bold text-rose-500 uppercase tracking-widest flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" /> Fact-Checking Checklist
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {packageData.review.fact_check_items.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 bg-zinc-50 dark:bg-[#111] border border-zinc-100 dark:border-zinc-800">
                      <input type="checkbox" id={`check-${i}`}
                        className="mt-0.5 accent-[#e30613] w-3.5 h-3.5 flex-shrink-0" />
                      <label htmlFor={`check-${i}`} className="text-[12px] text-zinc-700 dark:text-zinc-300 cursor-pointer leading-snug">{item}</label>
                    </div>
                  ))}
                </div>
              </div>

              {packageData.review.reporting_conflicts && packageData.review.reporting_conflicts.length > 0 && (
                <div className="p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#1a1a1a] md:col-span-2 space-y-2.5 animate-fadeIn">
                  <h4 className="text-[10px] font-bold text-orange-500 uppercase tracking-widest flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" /> Conflicts with Previous Reporting
                  </h4>
                  <ul className="space-y-1.5">
                    {packageData.review.reporting_conflicts.map((conflict, i) => (
                      <li key={i} className="text-[12px] text-zinc-700 dark:text-zinc-300 flex items-start gap-1.5">
                        <span className="text-orange-500 font-bold mt-0.5">•</span>
                        <span>{conflict}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 6: Social Media Copy */}
        {activeTab === "social" && packageData.social && (
          <div className="space-y-4 animate-fadeIn">
            {/* LinkedIn */}
            <div className="border border-[#0a66c2]/20 bg-[#0a66c2]/5 dark:bg-[#0a66c2]/10 rounded-xs overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#0a66c2]/15 bg-white/50 dark:bg-zinc-900/50">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 bg-[#0a66c2] text-white flex items-center justify-center font-black text-[11px] rounded-xs shadow-2xs">in</span>
                  <div>
                    <h4 className="text-[13px] font-bold text-zinc-800 dark:text-zinc-200">LinkedIn Post</h4>
                    <p className="text-[10px] text-zinc-500">Optimized for professional networks</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleSaveLinkedIn}
                    disabled={readOnly || !isLinkedInDirty}
                    className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide transition-all rounded-xs shadow-2xs ${
                      readOnly
                        ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed opacity-60"
                        : isLinkedInDirty
                        ? "bg-[#0a66c2] hover:bg-[#004182] text-white cursor-pointer opacity-100"
                        : "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed opacity-60"
                    }`}
                    title={readOnly ? "Article is locked while in review" : isLinkedInDirty ? "Save changes to LinkedIn post" : "No unsaved changes"}
                  >
                    {readOnly ? (
                      <><ShieldAlert className="w-3 h-3 text-amber-500" /> Locked</>
                    ) : isLinkedInDirty ? (
                      <><Save className="w-3 h-3 text-white" /> Save</>
                    ) : (
                      <><Check className="w-3 h-3 text-emerald-500" /> Saved</>
                    )}
                  </button>
                  <button
                    onClick={() => triggerCopy(socialFields.linkedin, "linkedin")}
                    className="flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide bg-[#0a66c2] hover:bg-[#004182] text-white transition-colors cursor-pointer rounded-xs shadow-2xs"
                  >
                    {copiedSection === "linkedin" ? <><Check className="w-3 h-3" />Copied</> : <><Copy className="w-3 h-3" />Copy</>}
                  </button>
                </div>
              </div>
              <div className="p-3 bg-white dark:bg-[#111]">
                <textarea
                  rows={7}
                  readOnly={readOnly}
                  disabled={readOnly}
                  value={socialFields.linkedin}
                  onChange={(e) => setSocialFields({ ...socialFields, linkedin: e.target.value })}
                  className="w-full text-[13px] text-zinc-800 dark:text-zinc-200 leading-relaxed font-sans bg-transparent border border-zinc-200 dark:border-zinc-800 p-3 focus:outline-none focus:ring-1 focus:ring-[#0a66c2] rounded-xs resize-none disabled:opacity-75 disabled:cursor-not-allowed"
                  style={{ resize: "none" }}
                  placeholder="Edit LinkedIn post content..."
                />
              </div>
            </div>

            {/* X / Twitter */}
            <div className="border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/40 rounded-xs overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-black text-[13px] rounded-xs shadow-2xs">𝕏</span>
                  <div>
                    <h4 className="text-[13px] font-bold text-zinc-800 dark:text-zinc-200">X / Twitter Post</h4>
                    <p className="text-[10px] text-zinc-500">Punchy summary under 280 characters</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleSaveTwitter}
                    disabled={readOnly || !isTwitterDirty}
                    className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide transition-all rounded-xs shadow-2xs ${
                      readOnly
                        ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed opacity-60"
                        : isTwitterDirty
                        ? "bg-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-black cursor-pointer opacity-100"
                        : "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed opacity-60"
                    }`}
                    title={readOnly ? "Article is locked while in review" : isTwitterDirty ? "Save changes to X/Twitter post" : "No unsaved changes"}
                  >
                    {readOnly ? (
                      <><ShieldAlert className="w-3 h-3 text-amber-500" /> Locked</>
                    ) : isTwitterDirty ? (
                      <><Save className="w-3 h-3" /> Save</>
                    ) : (
                      <><Check className="w-3 h-3 text-emerald-500" /> Saved</>
                    )}
                  </button>
                  <button
                    onClick={() => triggerCopy(socialFields.twitter, "twitter")}
                    className="flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide bg-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 dark:text-black text-white transition-colors cursor-pointer rounded-xs shadow-2xs"
                  >
                    {copiedSection === "twitter" ? <><Check className="w-3 h-3" />Copied</> : <><Copy className="w-3 h-3" />Copy</>}
                  </button>
                </div>
              </div>
              <div className="p-3 bg-white dark:bg-[#111]">
                <textarea
                  rows={6}
                  readOnly={readOnly}
                  disabled={readOnly}
                  value={socialFields.twitter}
                  onChange={(e) => setSocialFields({ ...socialFields, twitter: e.target.value })}
                  className="w-full text-[13px] text-zinc-800 dark:text-zinc-200 leading-relaxed font-sans bg-transparent border border-zinc-200 dark:border-zinc-800 p-3 focus:outline-none focus:ring-1 focus:ring-zinc-400 rounded-xs resize-none disabled:opacity-75 disabled:cursor-not-allowed"
                  style={{ resize: "none" }}
                  placeholder="Edit X / Twitter post content..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Global Floating Toast Notifications Container */}
        {toasts.length > 0 && (
          <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
            {toasts.map((t) => (
              <div
                key={t.id}
                className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 text-xs font-bold text-white shadow-2xl rounded-xs transition-all animate-in slide-in-from-bottom-2 duration-200 ${
                  t.type === "success"
                    ? "bg-emerald-600 border border-emerald-500"
                    : t.type === "info"
                    ? "bg-sky-600 border border-sky-500"
                    : "bg-amber-600 border border-amber-500"
                }`}
              >
                <div className="flex items-center gap-2">
                  {t.type === "success" && <Check className="w-4 h-4 flex-shrink-0" />}
                  {t.type === "info" && <FileDown className="w-4 h-4 flex-shrink-0" />}
                  <span>{t.message}</span>
                </div>
                <button
                  onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
                  className="text-white/80 hover:text-white font-bold ml-2 text-sm leading-none cursor-pointer"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
