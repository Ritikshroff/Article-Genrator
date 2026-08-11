import React, { useState, useEffect } from "react";
import { 
  Copy, Check, FileDown, Briefcase, Cpu, Award, Users, 
  HelpCircle, Eye, ShieldAlert, Sparkles, Clipboard, ArrowRight,
  ExternalLink, Target, Code
} from "lucide-react";

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
  meta_description: string;
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
  DataQuest: {
    title: "Synthesizing DataQuest Enterprise Package...",
    details: [
      "Analyzing press release facts & executive announcements...",
      "Searching CyberMedia DataQuest archives & B2B RAG corpus...",
      "Structuring inverted pyramid story for IT decision makers...",
      "Formulating enterprise impact, CIO takeaways & market context...",
      "Generating SEO metadata, primary keywords & LSI tags...",
      "Auditing marketing claims & building fact-check checklist...",
      "Drafting LinkedIn & X (Twitter) social copy...",
      "Rendering custom AI enterprise cover visual..."
    ]
  },
  VoiceData: {
    title: "Synthesizing VoiceData Telecom Package...",
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
  PCQuest: {
    title: "Synthesizing PCQuest Tech Package...",
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
  steps = []
}) => {
  const [activeTab, setActiveTab] = useState<"news" | "seo" | "social" | "impact" | "interview" | "review">("news");
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"preview" | "code">("preview");
  const [phraseIndex, setPhraseIndex] = useState(0);

  const currentMagKey = (magazine && MAGAZINE_PHRASES[magazine]) ? magazine : "DataQuest";
  const currentPhrases = MAGAZINE_PHRASES[currentMagKey];

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

  const triggerCopy = async (text: string, identifier: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(identifier);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  const getTabLabel = (key: string) => {
    switch (key) {
      case "news": return "Article Text";
      case "seo": return "SEO Metadata";
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
  };

  // Get current active section content string for simple copy
  const getActiveTabContentString = (): string => {
    switch (activeTab) {
      case "news":
        return packageData.news ? `# ${packageData.news.headline}\n## ${packageData.news.subheadline}\n\n${packageData.news.article}` : "";
      case "seo":
        return packageData.seo ? JSON.stringify(packageData.seo, null, 2) : "";
      case "social":
        return packageData.social ? `LinkedIn Post:\n${packageData.social.linkedin_post}\n\nTwitter/X Post:\n${packageData.social.twitter_post}` : "";
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
          <Sparkles className="w-3.5 h-3.5 text-[#e30613]" />
          <span className="text-[11px] font-bold tracking-[0.14em] uppercase text-zinc-500 dark:text-zinc-400">
            Generated Package
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => triggerCopy(getActiveTabContentString(), "active-tab")}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors uppercase tracking-wide"
          >
            {copiedSection === "active-tab" ? (
              <><Check className="w-3 h-3 text-emerald-500" />Copied</>
            ) : (
              <><Copy className="w-3 h-3" />Copy</>
            )}
          </button>

          <button
            onClick={handleExportMarkdown}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors uppercase tracking-wide"
          >
            <FileDown className="w-3 h-3" />Markdown
          </button>

          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors uppercase tracking-wide"
          >
            <FileDown className="w-3 h-3" />JSON
          </button>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex overflow-x-auto border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#161616]">
        {availableTabs.map((tab) => {
          const isSelected = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 px-4 py-3 text-[12px] sm:text-[13px] font-semibold border-b-2 transition-all whitespace-nowrap ${
                isSelected
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
            <div className="w-16 h-16 bg-[#e30613]/10 border border-[#e30613]/20 text-[#e30613] font-black text-xl flex items-center justify-center shadow-inner rounded-xs">
              {magazine === "VoiceData" ? "V&D" : magazine === "PCQuest" ? "PCQ" : "DQ"}
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
                  <div className="flex items-center justify-between text-xs font-bold text-[#e30613]">
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 animate-spin text-[#e30613]" /> {currentPhrases.title}
                    </span>
                    <span className="text-zinc-500 font-mono text-[11px]">Step {currentStep || 1} of {steps?.length || 4}</span>
                  </div>
                  <div className="h-2 bg-zinc-100 dark:bg-zinc-800 overflow-hidden rounded-full">
                    <div
                      className="h-full bg-[#e30613] transition-all duration-300 shimmer"
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
                    <span className="w-1.5 h-1.5 bg-[#e30613] rounded-full" />
                    <span>Full article text — ready to publish</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#e30613] rounded-full" />
                    <span>SEO title, meta description & keywords</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#e30613] rounded-full" />
                    <span>LinkedIn & Twitter posts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#e30613] rounded-full" />
                    <span>Editorial review checklist</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#e30613] rounded-full" />
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
                  className={`flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold transition-all ${
                    viewMode === "preview"
                      ? "bg-[#e30613] text-white shadow-xs"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" /> Article Preview
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("code")}
                  className={`flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold transition-all ${
                    viewMode === "code"
                      ? "bg-[#e30613] text-white shadow-xs"
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

        {/* TAB 2: SEO Metadata */}
        {activeTab === "seo" && packageData.seo && (
          <div className="space-y-5 animate-fadeIn">
            {/* Google snippet preview */}
            <div className="p-4 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#1a1a1a] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">Google Search Preview</span>
                <Eye className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-600" />
              </div>
              <div className="space-y-0.5 font-sans">
                <div className="text-[#1a0dab] dark:text-[#8ab4f8] text-[15px] font-medium hover:underline cursor-pointer leading-tight">
                  {packageData.seo.seo_title}
                </div>
                <div className="text-[#006621] dark:text-[#34a853] text-[12px]">
                  https://www.dataquest.co.in/news/{packageData.seo.slug}
                </div>
                <div className="text-zinc-600 dark:text-zinc-400 text-[13px] leading-normal line-clamp-2 mt-0.5">
                  {packageData.seo.meta_description}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {packageData.seo.primary_keyword && (
                <div className="p-4 border border-[#e30613]/20 bg-[#e30613]/5 md:col-span-2 space-y-2">
                  <div className="text-[10px] font-bold text-[#e30613] uppercase tracking-widest flex items-center gap-1.5">
                    <Award className="w-3 h-3" /> Primary Keyword
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#e30613] text-white text-[13px] font-bold">
                    <Target className="w-3.5 h-3.5" /> {packageData.seo.primary_keyword}
                  </span>
                </div>
              )}

              <div className="p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#1a1a1a] space-y-1.5">
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">SEO Title</div>
                <p className="text-[13px] text-zinc-800 dark:text-zinc-200 font-medium leading-snug">{packageData.seo.seo_title}</p>
              </div>

              <div className="p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#1a1a1a] space-y-1.5">
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">URL Slug</div>
                <code className="text-[11px] bg-zinc-100 dark:bg-zinc-900 px-2 py-1 text-zinc-700 dark:text-zinc-300 font-mono block truncate">
                  {packageData.seo.slug}
                </code>
              </div>

              <div className="p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#1a1a1a] md:col-span-2 space-y-2.5">
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Focus Keywords</div>
                <div className="flex flex-wrap gap-1.5">
                  {packageData.seo.keywords.map((kw, i) => (
                    <span key={i} className="px-2.5 py-1 text-[11px] bg-[#e30613]/8 text-[#e30613] font-semibold border border-[#e30613]/20">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              {packageData.seo.semantic_keywords && packageData.seo.semantic_keywords.length > 0 && (
                <div className="p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#1a1a1a] md:col-span-2 space-y-2.5">
                  <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Cpu className="w-3 h-3" /> Semantic / LSI Keywords
                    <span className="ml-1 text-[9px] font-normal normal-case">(Topical Authority)</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {packageData.seo.semantic_keywords.map((kw, i) => (
                      <span key={i} className="px-2.5 py-1 text-[11px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

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
            <div className="border border-[#0a66c2]/20 bg-[#0a66c2]/5 dark:bg-[#0a66c2]/10">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#0a66c2]/15">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 bg-[#0a66c2] text-white flex items-center justify-center font-black text-[11px]">in</span>
                  <div>
                    <h4 className="text-[13px] font-bold text-zinc-800 dark:text-zinc-200">LinkedIn Post</h4>
                    <p className="text-[10px] text-zinc-500">Optimized for professional networks</p>
                  </div>
                </div>
                <button onClick={() => triggerCopy(packageData.social?.linkedin_post || "", "linkedin")}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wide bg-[#0a66c2] hover:bg-[#004182] text-white transition-colors">
                  {copiedSection === "linkedin" ? <><Check className="w-3 h-3" />Copied</> : <><Copy className="w-3 h-3" />Copy</>}
                </button>
              </div>
              <div className="p-4 text-[13px] text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap font-sans bg-white dark:bg-[#111] max-h-[220px] overflow-y-auto scroller">
                {packageData.social.linkedin_post}
              </div>
            </div>

            {/* X / Twitter */}
            <div className="border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/40">
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-black text-[13px]">𝕏</span>
                  <div>
                    <h4 className="text-[13px] font-bold text-zinc-800 dark:text-zinc-200">X / Twitter Post</h4>
                    <p className="text-[10px] text-zinc-500">Punchy summary under 280 characters</p>
                  </div>
                </div>
                <button onClick={() => triggerCopy(packageData.social?.twitter_post || "", "twitter")}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wide bg-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 dark:text-black text-white transition-colors">
                  {copiedSection === "twitter" ? <><Check className="w-3 h-3" />Copied</> : <><Copy className="w-3 h-3" />Copy</>}
                </button>
              </div>
              <div className="p-4 text-[13px] text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap font-sans bg-white dark:bg-[#111]">
                {packageData.social.twitter_post}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
