import React, { useState } from "react";
import { 
  Copy, Check, FileDown, Briefcase, Cpu, Award, Users, 
  HelpCircle, Eye, ShieldAlert, Sparkles, Clipboard, ArrowRight 
} from "lucide-react";

interface NewsData {
  headline: string;
  subheadline: string;
  article: string;
  category: string;
  tags: string[];
}

interface SeoData {
  seo_title: string;
  meta_description: string;
  slug: string;
  keywords: string[];
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
}

export interface EditorialPackage {
  news?: NewsData;
  seo?: SeoData;
  impact?: ImpactData;
  interview?: InterviewData;
  review?: ReviewData;
}

interface OutputPanelProps {
  packageData: EditorialPackage;
}

export const OutputPanel: React.FC<OutputPanelProps> = ({ packageData }) => {
  const [activeTab, setActiveTab] = useState<"news" | "seo" | "impact" | "interview" | "review">("news");
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

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
      case "news": return "News Article";
      case "seo": return "SEO Metadata";
      case "impact": return "Industry Impact";
      case "interview": return "Interview Opportunities";
      case "review": return "Editorial Review";
      default: return "";
    }
  };

  // Build markdown structure for export
  const buildMarkdownReport = (): string => {
    const { news, seo, impact, interview, review } = packageData;
    let md = `# DQ AI Editorial Copilot - Consolidated Editorial Package\n\n`;

    if (news) {
      md += `## News Article\n\n`;
      md += `### ${news.headline}\n`;
      md += `*${news.subheadline}*\n\n`;
      md += `**Category:** ${news.category}  \n`;
      md += `**Tags:** ${news.tags.join(", ")}\n\n`;
      md += `${news.article}\n\n`;
      md += `---\n\n`;
    }

    if (seo) {
      md += `## SEO Metadata\n\n`;
      md += `- **SEO Title:** ${seo.seo_title}\n`;
      md += `- **Meta Description:** ${seo.meta_description}\n`;
      md += `- **Slug:** ${seo.slug}\n`;
      md += `- **Keywords:** ${seo.keywords.join(", ")}\n\n`;
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
    <div className="w-full flex flex-col h-full bg-white dark:bg-zinc-950/60 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 shadow-xl overflow-hidden backdrop-blur-md">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border-b border-zinc-200 dark:border-zinc-800/80 gap-3 bg-zinc-50/50 dark:bg-zinc-900/30">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
          <span className="font-semibold text-zinc-800 dark:text-zinc-200 text-sm tracking-wide">
            GENERATED PACKAGE
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => triggerCopy(getActiveTabContentString(), "active-tab")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900/80 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
          >
            {copiedSection === "active-tab" ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                Copied Tab
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy Current
              </>
            )}
          </button>

          <button
            onClick={handleExportMarkdown}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900/80 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
          >
            <FileDown className="w-3.5 h-3.5 text-indigo-500" />
            Markdown
          </button>

          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900/80 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
          >
            <FileDown className="w-3.5 h-3.5 text-purple-500" />
            JSON
          </button>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex overflow-x-auto scrollbar-thin border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/20 dark:bg-zinc-950/20">
        {(["news", "seo", "impact", "interview", "review"] as const).map((tab) => {
          const isSelected = activeTab === tab;
          const isAvailable = !!packageData[tab];

          return (
            <button
              key={tab}
              onClick={() => isAvailable && setActiveTab(tab)}
              disabled={!isAvailable}
              className={`flex-shrink-0 px-4 sm:px-5 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all relative ${
                isSelected
                  ? "border-blue-500 text-blue-600 dark:text-blue-400 bg-white/40 dark:bg-zinc-900/10"
                  : isAvailable
                  ? "border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-200"
                  : "border-transparent text-zinc-300 dark:text-zinc-800 cursor-not-allowed"
              }`}
            >
              {getTabLabel(tab)}
              {!isAvailable && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-800" />
              )}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 scroller scrollbar-thin max-h-[550px] sm:max-h-[600px] min-h-[350px]">
        
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
            </div>

            <hr className="border-zinc-200 dark:border-zinc-800" />

            <div className="prose prose-zinc dark:prose-invert max-w-none text-zinc-700 dark:text-zinc-300 text-sm sm:text-base leading-relaxed space-y-4">
              {packageData.news.article.split("\n\n").map((para, i) => (
                <p key={i} className="whitespace-pre-wrap">
                  {para}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: SEO Metadata */}
        {activeTab === "seo" && packageData.seo && (
          <div className="space-y-6 animate-fadeIn">
            <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/30 dark:bg-zinc-900/10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase">
                  Google Search Snippet Preview
                </span>
                <Eye className="w-3.5 h-3.5 text-zinc-400" />
              </div>
              <div className="space-y-1 font-sans">
                <div className="text-[#1a0dab] dark:text-[#8ab4f8] text-lg font-medium hover:underline cursor-pointer truncate leading-tight">
                  {packageData.seo.seo_title}
                </div>
                <div className="text-[#006621] dark:text-[#34a853] text-xs truncate">
                  https://www.dataquest.co.in/news/{packageData.seo.slug}
                </div>
                <div className="text-zinc-600 dark:text-zinc-400 text-sm leading-normal line-clamp-2">
                  {packageData.seo.meta_description}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/20 space-y-1.5">
                <div className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  SEO Title
                </div>
                <p className="text-sm text-zinc-800 dark:text-zinc-200 font-medium">
                  {packageData.seo.seo_title}
                </p>
              </div>

              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/20 space-y-1.5">
                <div className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  URL Slug
                </div>
                <code className="text-xs bg-zinc-100 dark:bg-zinc-900 px-2 py-1 rounded text-zinc-700 dark:text-zinc-300 font-mono block truncate">
                  {packageData.seo.slug}
                </code>
              </div>

              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/20 md:col-span-2 space-y-3">
                <div className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  Focus Keywords
                </div>
                <div className="flex flex-wrap gap-2">
                  {packageData.seo.keywords.map((kw, i) => (
                    <span key={i} className="px-2.5 py-1 text-xs bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium rounded-md border border-indigo-500/20">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Industry Impact Analysis */}
        {activeTab === "impact" && packageData.impact && (
          <div className="space-y-6 animate-fadeIn">
            {/* Why it matters card */}
            <div className="p-5 rounded-2xl border border-blue-500/20 bg-blue-500/5 dark:bg-blue-950/10 space-y-2">
              <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4" /> Why It Matters
              </h3>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                {packageData.impact.why_it_matters}
              </p>
            </div>

            {/* Grid for other impacts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/20 space-y-2">
                <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-zinc-500" /> Business Implications
                </h4>
                <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  {packageData.impact.business_impact}
                </p>
              </div>

              <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/20 space-y-2">
                <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-indigo-500" /> Technology Shift
                </h4>
                <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  {packageData.impact.technology_impact}
                </p>
              </div>

              <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/20 md:col-span-2 space-y-2">
                <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-purple-500" /> Competitive Landscape
                </h4>
                <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  {packageData.impact.competitive_landscape}
                </p>
              </div>

              <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/20 md:col-span-2 space-y-2">
                <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  Industries Affected
                </h4>
                <div className="flex flex-wrap gap-2 pt-1">
                  {packageData.impact.industries_affected.map((ind, i) => (
                    <span key={i} className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 rounded font-medium text-xs border border-zinc-200 dark:border-zinc-800">
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
          <div className="space-y-6 animate-fadeIn">
            {/* Candidates card */}
            <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/20 space-y-3">
              <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-purple-500" /> Recommended Interview Candidates
              </h3>
              <ul className="space-y-2">
                {packageData.interview.candidates.map((cand, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    {cand}
                  </li>
                ))}
              </ul>
            </div>

            {/* Questions List */}
            <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/20 space-y-4">
              <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-indigo-500" /> 10 Interview Questions
              </h3>
              <ol className="divide-y divide-zinc-200 dark:divide-zinc-800/80">
                {packageData.interview.questions.slice(0, 10).map((q, i) => (
                  <li key={i} className="py-3 flex items-start gap-3 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    <span className="font-bold text-indigo-500 flex-shrink-0 w-5 text-right">
                      {i + 1}.
                    </span>
                    <span className="flex-1">{q}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Story Opportunities */}
            <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/20 space-y-3">
              <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                Follow-up Story Angles
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {packageData.interview.follow_up_stories.map((story, i) => (
                  <div key={i} className="p-3 rounded-lg border border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-950/20 flex flex-col justify-between">
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                      {story}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-blue-500 mt-3 hover:underline cursor-pointer">
                      Explore Angle <ArrowRight className="w-2.5 h-2.5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Editorial Review */}
        {activeTab === "review" && packageData.review && (
          <div className="space-y-6 animate-fadeIn">
            {/* Warnings/Claims */}
            <div className="p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 dark:bg-amber-950/10 space-y-3">
              <h3 className="text-sm font-bold text-amber-600 dark:text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" /> Fluffed Marketing Claims to Strip
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

            {/* India relevance */}
            <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/20 space-y-2">
              <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                India Market Alignment Check
              </h4>
              <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                {packageData.review.india_relevance}
              </p>
            </div>

            {/* Review Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/20 space-y-3">
                <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  Missing Data & Metrics
                </h4>
                <ul className="space-y-2">
                  {packageData.review.missing_data.map((item, i) => (
                    <li key={i} className="text-xs text-zinc-600 dark:text-zinc-400 flex items-start gap-1.5">
                      <span className="text-zinc-400 dark:text-zinc-600 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/20 space-y-3">
                <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  Customer Testimonial/Reference Gaps
                </h4>
                <ul className="space-y-2">
                  {packageData.review.customer_reference_gaps.map((gap, i) => (
                    <li key={i} className="text-xs text-zinc-600 dark:text-zinc-400 flex items-start gap-1.5">
                      <span className="text-zinc-400 dark:text-zinc-600 font-bold">•</span>
                      <span>{gap}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/20 md:col-span-2 space-y-3">
                <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-500" /> Fact-Checking Checklist
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {packageData.review.fact_check_items.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 rounded bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-900">
                      <input
                        type="checkbox"
                        id={`check-${i}`}
                        className="mt-0.5 rounded border-zinc-300 dark:border-zinc-800 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                      />
                      <label htmlFor={`check-${i}`} className="text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
                        {item}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
