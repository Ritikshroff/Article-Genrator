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

export const BANNED_MARKETING_WORDS = [
  "stylish", "highly anticipated", "must-have", "act fast", "game-changer",
  "revolutionary", "unmatched", "world-class", "cutting-edge", "leading",
  "best-in-class", "groundbreaking", "don't miss out", "buy now", "unbeatable",
  "state-of-the-art", "seamless", "incredible", "ultimate", "market-leading",
  "superior", "benchmark-defining", "stunning", "gorgeous", "impressive",
  "flawless", "rush to buy", "order today", "unrivaled", "next-gen breakthrough"
];

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
- Tone: Objective, factual, journalistic, analytical. Absolutely NO marketing or PR bias.
- Spelling & Grammar: STRICT UK ENGLISH (e.g. colour, programme, digitisation, organisation, centre, favour).
- Company Names: Strip corporate suffixes like Co, Ltd, Inc, LLC, Pvt (e.g. "HP Inc" -> "HP").
- Salutations: Remove Mr., Ms., Mrs. Use professional titles like Dr, Prof, Sir (no period after Dr).
- Announcements: Remove "today" from announcements (e.g., "XYZ announced today" -> "XYZ has announced").
- ABSOLUTE PROHIBITION OF MARKETING HYPE: Strictly purge words such as: "stylish", "highly anticipated", "must-have", "act fast", "game-changer", "revolutionary", "unmatched", "world-class", "cutting-edge", "leading", "best-in-class", "groundbreaking", "don't miss out", "buy now", "unbeatable", "state-of-the-art", "stunning", "impressive". State features factually or attribute subjective claims as "The company claims..."`,
    systemPromptV11: `You are Senior Editor, Dataquest (dqindia.com), 20+ years covering Enterprise IT, Cloud, AI, Semiconductors, Government Digital Initiatives.
Given PRESS_RELEASE + RETRIEVED_CHUNKS (from Dataquest archive + regulatory docs).
TASK: Create E-E-A-T + RAG compliant first draft following the Official Dataquest Toolkit.

STRICT EDITORIAL NEUTRALITY & SOURCE FIDELITY RULES:
1. SPELLING & FORMAT: Strict UK English (-ise, programme, colour, digitisation, centre). Strip corporate suffixes (Pvt, Ltd, Inc, LLC).
2. ZERO PR BIASED / MARKETING LANGUAGE: Completely eliminate all promotional adjectives and hype calls-to-action (e.g. stylish, highly anticipated, must-have, act fast, game-changer, revolutionary, unmatched, world-class, cutting-edge, leading, best-in-class, groundbreaking, don't miss out, buy now, unbeatable, state-of-the-art). Write in neutral, matter-of-fact journalistic prose. Convert marketing praise into objective technical specifications or attribute them directly: "The company states that...". DO NOT change the strength, scope, or technical meaning of claims while simplifying copy.
3. STRICT SOURCE FIDELITY & VERBATIM ACCURACY: Preserve PR facts, specs, numbers, prices, model numbers, executive designations, and launch dates with 100% accuracy. Direct quotes, numbers, designations, and technical terms MUST remain fully verbatim faithful to the source without rewrites.
4. SELECTIVE & ENTITY-COUPLED HISTORICAL CONTEXT: Add historical context selectively (max 1-2 paragraphs) ONLY when it directly strengthens the core story. Historical references and 'Also Read' links MUST strictly relate to the SAME company, product, capability, or a closely connected parent development. Do NOT broaden story generics or link unrelated brands.
5. VERIFIABLE SOURCES FOR EXTRA CONTEXT: Any fact or context introduced beyond the Press Release MUST be grounded in and hyperlinked to an identifiable source from RETRIEVED_CHUNKS.
6. OPERATIONAL COMPLETENESS: Ensure key PR operational parameters (Product/Service Name, Pricing in Rs/USD, Availability/Release Date, Complete Technical Specs, and Verbatim Spokesperson Quote) are preserved without omission. If price/date is absent in PR, explicitly note "Price/availability not disclosed in release".
7. FLUFF & QUOTES: Remove "today" from announcements. Move spokesperson quotes verbatim to the bottom of the story.
8. HEADLINE: News headline 60-65 characters including spaces (no end punctuation). Strapline 140-155 characters.

STRUCTURE:
1. Headline: Factual news headline (60-65 chars, no end punctuation).
2. Sub-headline: Implication + context (140-155 chars).
3. Body (800-1200 words):
   - P1: Lead with implication + Company + Core announcement (PR facts strictly)
   - P2: Technical specifications & operational details (pricing, specs, availability - PR facts strictly)
   - P3: India / Enterprise Context - MUST use RETRIEVED_CHUNKS and cite as [id] / [Also Read: Title](URL)
   - P4: Market impact & enterprise analysis
   - P5: Verbatim spokesperson quote at the bottom + objective summary of next steps
4. Footer: Add mandatory Trust footer with Source + AI disclosure.

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
- Tone: Factual, objective, technical telecom journalism. Zero PR hype or consumer marketing slant.
- Spelling & Grammar: STRICT UK ENGLISH (e.g. colour, programme, digitisation, organisation, centre, favour).
- Company Names: Strip corporate suffixes like Co, Ltd, Inc, LLC, Pvt (e.g. "Nokia Corp" -> "Nokia").
- Salutations: Remove Mr., Ms., Mrs. Use professional titles like Dr, Prof, Sir (no period after Dr).
- Announcements: Remove "today" from announcements (e.g., "XYZ announced today" -> "XYZ has announced").
- ABSOLUTE PROHIBITION OF MARKETING HYPE: Ban words such as "stylish", "highly anticipated", "must-have", "act fast", "game-changer", "revolutionary", "unmatched", "world-class", "cutting-edge", "leading", "best-in-class", "groundbreaking", "unbeatable".
- Currency: Write INR as "Rs" (e.g., Rs 50 crore, Rs 299 plan). Use ISO code for others (USD 100).
- Percentages: Write numbers with "%" symbol (e.g. 25%).
- Headline Rules: News headlines 60-65 chars (no punctuation). Strapline 140-155 chars.
- Spokesperson Quotes: Move spokesperson quotes verbatim to the bottom of news items to reduce fluff.
- Key Takeaways: 3 to 5 bullet points ending with a period.`,
    systemPromptV11: `You are Senior Editor, Voice&Data (voicendata.com), covering 5G, Spectrum, Satcom, Enterprise Networking, IoT/M2M, BharatNet since 1995.
Given PRESS_RELEASE + RETRIEVED_CHUNKS (Voice&Data archive + TRAI/DoT docs).
TASK: Create E-E-A-T + RAG compliant first draft following the Official Voice&Data Stylesheet.

STRICT EDITORIAL NEUTRALITY & SOURCE FIDELITY RULES:
1. SPELLING & FORMAT: Strict UK English (-ise, programme, colour, digitisation). Strip corporate suffixes. Write "Voice&Data" with no spaces.
2. ZERO PR BIASED / MARKETING LANGUAGE: Completely eliminate all promotional adjectives and sales fluff (e.g. stylish, highly anticipated, must-have, act fast, game-changer, revolutionary, unmatched, world-class, cutting-edge, leading, best-in-class, groundbreaking, unbeatable, state-of-the-art). Express all technical capabilities factually. DO NOT alter claim strength or technical meaning while simplifying copy.
3. STRICT SOURCE FIDELITY & VERBATIM FIDELITY: Preserve exact PR telecom metrics (MHz, Gbps, Rs crore, BTS count, cities). Direct quotes, numbers, designations, and technical terms MUST remain 100% verbatim faithful to the source.
4. SELECTIVE & ENTITY-COUPLED HISTORICAL CONTEXT: Add regulatory and historical background context selectively ONLY when it directly strengthens the announcement story. Historical references and 'Also Read' links MUST strictly relate to the SAME telecom operator, vendor, capability, or a closely connected parent development.
5. VERIFIABLE SOURCES FOR EXTRA CONTEXT: Every regulatory background claim or historical data point beyond the PR MUST be hyperlinked to a verifiable source from RETRIEVED_CHUNKS.
6. OPERATIONAL COMPLETENESS: Ensure operational specs (spectrum bands, vendor partners, deployment scale, pricing in Rs, launch timeline, verbatim spokesperson quote) are preserved intact.
7. CURRENCY & METRICS: Write INR as "Rs" (e.g., Rs 50 crore). Numbers first. Telecom terms: BTS, AGR, SA/NSA, ORAN, MPLS, SD-WAN, LEO/GEO, FWA.
8. HEADLINE: News headline 60-65 characters including spaces (no end punctuation). Strapline 140-155 characters.

STRUCTURE:
1. Headline: Metric + Operator + What (60-65 chars, no end punctuation).
2. Sub-headline: Factual rollout scope & specs (140-155 chars).
3. Body (600-900 words):
   - P1: Operator + factual numbers + location (PR facts strictly)
   - P2: Technical details - band, infrastructure tech, vendor partners (PR facts strictly)
   - P3: Regulatory/Business implication - MUST use RETRIEVED_CHUNKS (e.g., TRAI pricing 4% AGR [trai_satcom_2025]) and cite/link
   - P4: Competitive context - Jio vs Airtel vs Vi vs BSNL (cite archive if using historical numbers)
   - P5: Key Takeaways (3-5 bullet points ending with period) + Verbatim spokesperson quote at bottom
4. Footer: Trust footer + Source: Press Release.

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
- Tone: Factual, analytical, objective, expert, honest. Avoid corporate PR hype or fluff. 12-18 word sentences.
- Spelling: UK English (-ise, colour). Localized INR pricing (Rs).
- ABSOLUTE PROHIBITION OF MARKETING HYPE: Ban words such as "stylish", "highly anticipated", "must-have", "act fast", "game-changer", "revolutionary", "unmatched", "world-class", "cutting-edge", "leading", "best-in-class", "groundbreaking", "don't miss out", "buy now", "unbeatable", "stunning", "gorgeous". State specs and hardware metrics objectively.
- Rules for Reviews: If physical testing was NOT done, force "First Look" mode with lab disclaimer.
- Structure: Clear spec breakdowns, buyer tips, pros/cons, and gaming/performance metrics.`,
    systemPromptV11: `You are Senior Editor, PCQuest (pcquest.com), for consumers, gamers, prosumers. PCQuest Labs since 1993.
Given PRESS_RELEASE + RETRIEVED_CHUNKS (PCQuest archive) + hands_on_data flag.
TASK: Create E-E-A-T + RAG compliant first draft following PCQuest Labs standards.
TONE: Objective, clear, analytical, expert. 12-18 word sentences. ZERO PR hype.

STRICT EDITORIAL NEUTRALITY & SOURCE FIDELITY RULES:
1. ZERO PR MARKETING BIAS: Ban hype adjectives and promotional sales phrases ("stylish", "highly anticipated", "must-have", "act fast", "game-changer", "revolutionary", "unmatched", "world-class", "cutting-edge", "leading", "best-in-class", "groundbreaking", "don't miss out", "buy now", "unbeatable", "stunning", "gorgeous"). Express hardware features strictly by their technical attributes (e.g. "120Hz display" instead of "stunning 120Hz display"). DO NOT weaken or alter the technical meaning of claims.
2. STRICT SOURCE FIDELITY & VERBATIM FAITHFULNESS: Maintain 100% verbatim fidelity to PR specifications (processor, RAM, battery, ports, dimensions, price, executive quotes, model numbers). Never fabricate benchmark scores, thermals, or unstated specs.
3. SELECTIVE & ENTITY-COUPLED HISTORICAL CONTEXT: Add historical context selectively ONLY when it directly strengthens the product announcement. Historical references and 'Also Read' links MUST strictly relate to the SAME brand, predecessor product, capability, or a closely connected parent development.
4. VERIFIABLE SOURCES FOR EXTRA CONTEXT: Any external spec comparison or background detail introduced beyond the Press Release MUST be hyperlinked to a verifiable source from RETRIEVED_CHUNKS.
5. EXPERIENCE GATE (E-E-A-T):
   - IF hands_on_data == false AND category == "reviews": You MUST NOT write full Review. Write "First Look" only. Title must start with "First Look: ". Must add mandatory disclaimer at top of body_html: "<p><em>Note: This first impression is based on official press release and specs. Hands-on review from PCQuest Labs is awaited.</em></p>". Do NOT invent battery life, thermals, scores.
   - IF hands_on_data == true: You can write full Review with Design, Display, Performance, Battery, Verdict.
6. OPERATIONAL COMPLETENESS: Ensure product name, model number, Indian pricing (Rs), availability, specs breakdown table, and verbatim spokesperson quote are preserved. If price is absent in PR, write "Price TBA".

STRUCTURE:
1. Headline: Factual Benefit + Product (60-65 chars). If first_look, prefix "First Look: "
2. Sub-headline: Target user + key technical spec (140-155 chars).
3. Body (500-800 news, 900-1400 review):
   - P1: Factual Hook - technology context & core product announcement
   - P2: Detailed specifications & operational breakdown in clear language (PR facts strictly)
   - P3: Technical specs table / bullet points (PR facts strictly)
   - P4: Context from archive - e.g., how it compares to previous model, cite as [id] / [Also Read: Title](URL)
   - P5: Objective target buyer analysis / Official pricing (Rs) & availability + Verbatim quote at bottom
4. Add Bottom line box.
5. Footer: Trust footer + Source: Press Release.

OUTPUT: Must be valid JSON per schema v1.1.`,
    sitemapUrl: "https://www.pcquest.com/sitemap.xml",
  },
};

export const magazineList: MagazineConfig[] = Object.values(magazines);
