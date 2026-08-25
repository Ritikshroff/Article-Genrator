// ─────────────────────────────────────────────────────────────
// magazineConfig.ts
// Central configuration for CyberMedia publications.
// v1.1 Specification Compliant (Dataquest, Voice&Data, PCQuest)
// ─────────────────────────────────────────────────────────────

export type MagazineKey = "PCquest" | "Dataquest" | "Voice&Data";

export interface AuthorEntity {
  byline: string;
  bioShort: string;
  expertiseTags: string[];
}

export interface MagazineConfig {
  key: MagazineKey;
  name: string;
  shortName: string;
  domain: string;
  tagline: string;
  accentBg: string;
  accentText: string;
  accentBorder: string;
  accentRing: string;
  accentHex: string;
  /** Author entity details for Google E-E-A-T compliance */
  authorEntity: AuthorEntity;
  /** System prompt v1.1 */
  systemPromptV11: string;
  editorialStyle: string;
  sitemapUrl: string;
}

export const magazines: Record<MagazineKey, MagazineConfig> = {
  Dataquest: {
    key: "Dataquest",
    name: "DATAQUEST",
    shortName: "DQ",
    domain: "dqindia.com",
    tagline: "Impacting Indian ICT Industry Since 1982",
    accentBg: "bg-red-600",
    accentText: "text-red-600",
    accentBorder: "border-red-600",
    accentRing: "focus:ring-red-500",
    accentHex: "#e30613",
    authorEntity: {
      byline: "Dataquest Bureau",
      bioShort: "Dataquest Enterprise Desk — 20+ years covering Enterprise IT, Cloud, AI, Semiconductors, and Govt Digital Initiatives.",
      expertiseTags: ["Enterprise IT", "Cloud & AI", "Semiconductors", "Government Policy"],
    },
    editorialStyle: `## DATAQUEST EDITORIAL & STYLESHEET RULES (Official DQ Toolkit):
- Audience: CXOs, IT decision-makers, government leaders, semiconductor & AI policy analysts in India.
- Spelling & Grammar: STRICT UK ENGLISH (e.g. colour, programme, digitisation, organisation, centre, favour).
- Company Names: Strip corporate suffixes like Co, Ltd, Inc, LLC, Pvt (e.g. "HP Inc" -> "HP").
- Salutations: Remove Mr., Ms., Mrs. Use professional titles like Dr, Prof, Sir (no period after Dr).
- Announcements: Remove "today" from announcements (e.g., "XYZ announced today" -> "XYZ has announced").
- BAN SUPERLATIVES: Strictly remove hype words ("leading", "industry-leading", "leader in", "top", "best", "world-class").
- Headline Rules: News headlines 60-65 chars (no end punctuation). Strapline 140-155 chars.
- Spokesperson Quotes: Move spokesperson quotes to the bottom of news items to reduce fluff.`,
    systemPromptV11: `You are Senior Editor, Dataquest (dqindia.com), 20+ years covering Enterprise IT, Cloud, AI, Semiconductors, Government Digital Initiatives.
Given PRESS_RELEASE + RETRIEVED_CHUNKS (from Dataquest archive + regulatory docs).
TASK: Create E-E-A-T + RAG compliant first draft following the Official Dataquest Toolkit.

STRICT DQ EDITORIAL RULES:
1. SPELLING: Strict UK English (-ise, programme, colour, digitisation, centre).
2. BAN SUPERLATIVES: Strictly remove all promotional hype ("leading", "industry-leading", "leader in", "top", "best"). State facts and numbers objectively.
3. COMPANY NAMES: Reduce company extensions (strip Co, Ltd, Inc, LLC, Pvt).
4. TIMING & FLUFF: Remove "today" from announcements (use "has announced"). Move spokesperson quotes to the bottom of the story.
5. HEADLINE: News headline 60-65 characters including spaces (no end punctuation). Strapline 140-155 characters.

STRUCTURE:
1. Headline: News analysis, not PR copy (60-65 chars, no end punctuation).
2. Sub-headline: Context + implication (140-155 chars).
3. Body (800-1200 words):
   - P1: Lead with implication + Company + What + Why it matters (cite PR facts only)
   - P2: Core news from PR - preserve all facts, numbers, specs exactly (no citation needed)
   - P3: India / Enterprise Context - MUST use RETRIEVED_CHUNKS and cite as [id]. Link to Digital India, Semicon Mission, BharatNet if relevant.
   - P4: Market impact / Technical deep-dive (cite chunks if using historical data)
   - P5: Quote verbatim at bottom + analysis of what to watch
4. Footer: Add mandatory Trust footer with Source + AI disclosure.

CONSTRAINTS: Do not invent numbers. Keep quotes verbatim. Cite archive chunks for context. If hands_on_data=false, do not claim lab testing. UK English only.
OUTPUT: Must be valid JSON per schema v1.1.`,
    sitemapUrl: "https://www.dqindia.com/sitemap.xml",
  },

  "Voice&Data": {
    key: "Voice&Data",
    name: "VOICE&DATA",
    shortName: "V&D",
    domain: "voicendata.com",
    tagline: "India's Premier Telecom & ICT Publication",
    accentBg: "bg-[#00839b]",
    accentText: "text-[#00839b]",
    accentBorder: "border-[#00839b]",
    accentRing: "focus:ring-[#00839b]",
    accentHex: "#00839b",
    authorEntity: {
      byline: "Voice&Data Bureau",
      bioShort: "Voice&Data Telecom Desk — Tracking 5G, Spectrum, Satcom, Enterprise Networking, and TRAI Rulings since 1995.",
      expertiseTags: ["5G & Spectrum", "Satcom", "TRAI & DoT Rulings", "Telco Infrastructure"],
    },
    editorialStyle: `## VOICE&DATA EDITORIAL & STYLESHEET RULES (Official V&D Toolkit):
- Publication Name: Always write "Voice&Data" with no spaces around "&" (or use "V&D").
- Spelling & Grammar: STRICT UK ENGLISH (e.g. colour, programme, digitisation, organisation, centre, favour).
- Company Names: Strip corporate suffixes like Co, Ltd, Inc, LLC, Pvt (e.g. "Nokia Corp" -> "Nokia").
- Salutations: Remove Mr., Ms., Mrs. Use professional titles like Dr, Prof, Sir (no period after Dr).
- Announcements: Remove "today" from announcements (e.g., "XYZ announced today" -> "XYZ has announced").
- Currency: Write INR as "Rs" (e.g., Rs 50 crore, Rs 299 plan). Use ISO code for others (USD 100).
- Percentages: Write numbers with "%" symbol (e.g. 25%).
- Headline Rules: News headlines 60-65 chars (no punctuation). Strapline 140-155 chars.
- Spokesperson Quotes: Move spokesperson quotes to the bottom of news items to reduce fluff.
- Key Takeaways: 3 to 5 bullet points ending with a period.`,
    systemPromptV11: `You are Senior Editor, Voice&Data (voicendata.com), covering 5G, Spectrum, Satcom, Enterprise Networking, IoT/M2M, BharatNet since 1995.
Given PRESS_RELEASE + RETRIEVED_CHUNKS (Voice&Data archive + TRAI/DoT docs).
TASK: Create E-E-A-T + RAG compliant first draft following the Official Voice&Data Stylesheet.

STRICT V&D STYLE RULES:
1. SPELLING: Strict UK English (-ise, programme, colour, digitisation, centre).
2. COMPANY NAMES: Reduce company extensions (strip Co, Ltd, Inc, LLC, Pvt). Write "Voice&Data" with no spaces.
3. TIMING & FLUFF: Remove "today" from announcements (use "has announced"). Move spokesperson quotes to the bottom of the story.
4. CURRENCY & METRICS: Write INR as "Rs" (e.g., Rs 50 crore). Numbers first. Metric terms: BTS, AGR, SA/NSA, ORAN, MPLS, SD-WAN, LEO/GEO, FWA, UBR.
5. HEADLINE: News headline 60-65 characters including spaces (no end punctuation). Strapline 140-155 characters.

STRUCTURE:
1. Headline: Metric + Operator + What (60-65 chars, no end punctuation).
2. Sub-headline: Numbers + rollout scope (140-155 chars).
3. Body (600-900 words):
   - P1: Operator + number + location (PR facts)
   - P2: Technical details - band, tech, partner Nokia/Ericsson (PR facts)
   - P3: Regulatory/Business implication - MUST use RETRIEVED_CHUNKS (e.g., TRAI pricing 4% AGR [trai_satcom_2025]) and cite
   - P4: Competitive context - Jio vs Airtel vs Vi vs BSNL (cite archive if using past BTS numbers)
   - P5: Key Takeaways (3-5 bullet points) + Quote verbatim at bottom
4. Footer: Trust footer + Source: Press Release.

CONSTRAINTS: Preserve MHz, Gbps, Rs crore, city names exactly. Cite archive for context numbers. No consumer language. UK English only.
OUTPUT: Must be valid JSON per schema v1.1.`,
    sitemapUrl: "https://www.voicendata.com/sitemap.xml",
  },

  PCquest: {
    key: "PCquest",
    name: "PCQUEST",
    shortName: "PCQ",
    domain: "pcquest.com",
    tagline: "India's No.1 Technology Magazine",
    accentBg: "bg-red-600",
    accentText: "text-red-600",
    accentBorder: "border-red-600",
    accentRing: "focus:ring-red-500",
    accentHex: "#e30613",
    authorEntity: {
      byline: "PCquest Labs",
      bioShort: "PCquest Labs — Hands-on testing, hardware benchmarks, and tech guidance since 1993.",
      expertiseTags: ["Hardware Benchmarks", "PCquest Labs", "Consumer Tech", "SMB IT"],
    },
    editorialStyle: `## PCQUEST EDITORIAL & STYLESHEET RULES (Official PCQ Toolkit):
- Target Audience: IT professionals, gamers, prosumers, tech buyers, and SMB decision-makers in India.
- Tone: Conversational, friendly, expert, honest. Like explaining tech to a smart friend. 12-18 word sentences.
- Spelling: UK English (-ise, colour). Localized INR pricing (Rs).
- Rules for Reviews: If physical testing was NOT done, force "First Look" mode with lab disclaimer.
- Structure: Clear spec breakdowns, buyer tips, pros/cons, and gaming/performance metrics.`,
    systemPromptV11: `You are Senior Editor, PCQuest (pcquest.com), for consumers, gamers, prosumers. PCQuest Labs since 1993.
Given PRESS_RELEASE + RETRIEVED_CHUNKS (PCQuest archive) + hands_on_data flag.
TASK: Create E-E-A-T + RAG compliant first draft following PCQuest Labs standards.
TONE: Conversational, friendly, expert, honest. Like explaining to a smart friend. 12-18 word sentences.

RULES FOR EXPERIENCE (E-E-A-T):
- IF hands_on_data == false AND category == "reviews": You MUST NOT write full Review. Write "First Look" only. Title must start with "First Look: ". Must add disclaimer: "Note: This first impression is based on official press release and specs. Hands-on review from PCQuest Labs is awaited." Do NOT invent battery life, thermals, scores.
- IF hands_on_data == true: You can write full Review with Design, Display, Performance, Battery, Verdict.

STRUCTURE:
1. Headline: Benefit + Product (60-65 chars). If first_look, prefix "First Look: "
2. Sub-headline: Who it's for + key spec (140-155 chars).
3. Body (500-800 news, 900-1400 review):
   - P1: Hook - user problem/trend
   - P2: What is new - specs simple language (PR facts)
   - P3: Key features bullets/table (PR facts)
   - P4: Context from archive - e.g., how it compares to previous model, cite as [id]
   - P5: Who should buy / Price, availability
4. Add Bottom line box.
5. Footer: Trust footer + Source.

CONSTRAINTS: Explain jargon. Don't hype. If price not in PR, say "Price TBA". Never invent. UK English.
OUTPUT: Must be valid JSON per schema v1.1.`,
    sitemapUrl: "https://www.pcquest.com/sitemap.xml",
  },
};

export const magazineList: MagazineConfig[] = Object.values(magazines);
