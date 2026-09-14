import { Newspaper, Mic, PenTool, BookOpen, BarChart3 } from "lucide-react";

export type TopicType = "News" | "Interview" | "Opinion" | "Feature" | "CaseStudy" | "";

export const articleTypes = [
  { id: "News", label: "News Story", desc: "Factual news report", icon: Newspaper },
  { id: "Interview", label: "Interview Q&A", desc: "Question & answer format", icon: Mic },
  { id: "Opinion", label: "Opinion Piece", desc: "Expert viewpoint / editorial", icon: PenTool },
  { id: "Feature", label: "Feature Story", desc: "Long-form deep dive", icon: BookOpen },
  { id: "CaseStudy", label: "Case Study", desc: "Outcome & success report", icon: BarChart3 },
] as const;

export const defaultPrompts = {
  News: `SEO-optimised Dataquest news article:\n- Use H1/H2/H3 heading structure (## What Happened, ## India Perspective, ## What This Means, etc.)\n- Lead with inverted pyramid intro (Who, What, Where, When, Why in first 80 words)\n- Include primary keyword in first 100 words and in 2+ subheadings\n- Add India market angle section\n- End with FAQ section (4 Q&A pairs targeting long-tail queries)\n- Strip all marketing language`,
  Interview: `SEO-optimised interview-style or Q&A article:\n- Use H1/H2/H3 heading structure\n- Include primary keyword in first 100 words and in 2+ H2 subheadings\n- Structure Q&A with ## Q: [Question] and **A:** [Answer] format (min 5 pairs)\n- End with ## Key Takeaway section and FAQ (4 pairs)`,
  Opinion: `SEO-optimised expert opinion or editorial:\n- Use H1/H2/H3 heading structure\n- Include primary keyword in first 100 words and in subheadings\n- Include a ## The Other Side counter-argument section\n- End with ## The Bottom Line conclusion and FAQ (4 pairs)`,
  Feature: `SEO-optimised long-form feature or deep-dive:\n- Use H1/H2/H3 heading structure (## How It Works, ## Market Context, ## Why India Matters, etc.)\n- Include primary keyword in first 100 words and in 3+ subheadings\n- Every section must include a specific statistic or market figure\n- End with ## The Bigger Picture conclusion and FAQ (5 pairs)`,
  CaseStudy: `SEO-optimised corporate case study:\n- Use exact H2 structure: ## The Challenge → ## The Solution → ## The Results → ## Key Lessons\n- Include primary keyword in first 100 words and in Challenge + Results headings\n- Quantify outcomes in Results with hard numbers (%, time saved, scale)\n- End with ## What This Proves conclusion and FAQ (4 pairs)`,
};

export const wordPresets = {
  short: { label: "Short (approx. 500 words)", min: 400, max: 600 },
  medium: { label: "Medium (approx. 700 words)", min: 600, max: 800 },
  long: { label: "Long (approx. 1,000 words)", min: 900, max: 1100 },
  feature: { label: "Feature article (1,200+ words)", min: 1100, max: 1400 },
};
