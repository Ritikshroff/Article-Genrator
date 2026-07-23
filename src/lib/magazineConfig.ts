// ─────────────────────────────────────────────────────────────
// magazineConfig.ts
// Central configuration for all three Cybermedia publications.
// Add / expand data here as editorial teams share brand guides.
// ─────────────────────────────────────────────────────────────

export type MagazineKey = "PCQuest" | "DataQuest" | "VoiceData";

export interface MagazineConfig {
  key: MagazineKey;
  /** Full display name */
  name: string;
  /** Short badge label */
  shortName: string;
  /** Website domain (for sitemap crawl + SEO URL preview) */
  domain: string;
  /** Tagline shown below the brand name in the header */
  tagline: string;
  /**
   * Tailwind class for the brand accent colour applied to:
   * - header icon background
   * - active tab indicator
   * - generate button
   * etc.
   * Values must be static Tailwind classes (no dynamic interpolation).
   */
  accentBg: string;
  accentText: string;
  accentBorder: string;
  accentRing: string;
  /** Hex value used for confetti particles on success */
  accentHex: string;
  /**
   * Editorial style instructions injected as an extra block into
   * the Step 1 (article generation) Gemini prompt.
   * Replace placeholder text below with official brand guides when received.
   */
  editorialStyle: string;
  /** Sitemap base URL used for live article cross-referencing */
  sitemapUrl: string;
}

export const magazines: Record<MagazineKey, MagazineConfig> = {
  PCQuest: {
    key: "PCQuest",
    name: "PCQuest",
    shortName: "PCQ",
    domain: "pcquest.com",
    tagline: "India's No.1 Technology Magazine",
    accentBg: "bg-red-600",
    accentText: "text-red-600",
    accentBorder: "border-red-600",
    accentRing: "focus:ring-red-500",
    accentHex: "#e30613",
    editorialStyle: `## PCQuest EDITORIAL VOICE:
- Target audience: IT professionals, tech enthusiasts, CIOs, developers, and gadget lovers in India.
- Tone: Practical, hands-on, technically detailed yet accessible. Use concrete specs and benchmarks.
- Coverage focus: Hardware reviews, software tutorials, enterprise IT solutions, cybersecurity, networking, Indian SMB technology adoption.
- Writing style: Direct, factual, jargon where necessary (explained on first use). Avoid corporate fluff.
- India context: Always localise pricing (INR), compare to Indian market alternatives, reference Indian regulations where applicable.`,
    sitemapUrl: "https://www.pcquest.com/sitemap.xml",
  },

  DataQuest: {
    key: "DataQuest",
    name: "Dataquest",
    shortName: "DQ",
    domain: "dqindia.com",
    tagline: "Impacting Indian ICT Industry Since 1982",
    accentBg: "bg-red-600",
    accentText: "text-red-600",
    accentBorder: "border-red-600",
    accentRing: "focus:ring-red-500",
    accentHex: "#e30613",
    editorialStyle: `## DATAQUEST EDITORIAL VOICE:
- Target audience: CXOs, IT decision-makers, government technology leaders, enterprise IT managers, and policy analysts in India.
- Tone: Authoritative, business-strategic, policy-aware. Balance technology depth with business impact.
- Coverage focus: Enterprise IT strategy, government digital initiatives (BharatNet, Digital India, IndiaStack), semiconductors, data governance, AI/ML enterprise adoption, IT services sector, industry rankings (DQ Top 20, DQ Best Employer).
- Writing style: Executive-level language. Lead with business outcomes and strategic significance. Include market figures and analyst perspectives.
- India context: Strong focus on Indian IT industry, government schemes, NASSCOM data, IT exports, and public sector digitisation.
- Sections to use: "Government & Policy", "Data & AI", "Business Technologies", "Semiconductors", "Leadership Insights", "Upskilling".
- NOTE: Editorial style guide pending — placeholder above based on public website analysis. Replace when official guide is received.`,
    sitemapUrl: "https://www.dqindia.com/sitemap.xml",
  },

  VoiceData: {
    key: "VoiceData",
    name: "Voice&Data",
    shortName: "V&D",
    domain: "voicendata.com",
    tagline: "India's Premier Telecom & ICT Publication",
    accentBg: "bg-red-600",
    accentText: "text-red-600",
    accentBorder: "border-red-600",
    accentRing: "focus:ring-red-500",
    accentHex: "#e30613",
    editorialStyle: `## VOICE & DATA EDITORIAL VOICE:
- Target audience: Telecom executives, network engineers, spectrum policy makers, enterprise connectivity decision-makers, and ICT infrastructure leaders in India.
- Tone: Technical, policy-informed, and forward-looking. Strong on regulatory nuance and network architecture.
- Coverage focus: 5G/6G deployment in India, spectrum auctions, telecom operator strategies (Jio, Airtel, BSNL, Vi), satellite communications (OneWeb, Starlink India), enterprise connectivity (SD-WAN, MPLS, private 5G), TRAI regulations, optical fibre infrastructure, and IoT/M2M.
- Writing style: Precise technical language for network and connectivity topics. Use standard telecom terminology (ARPU, RAN, core network, backhaul). Back claims with subscriber data and network capacity figures.
- India context: Reference DoT/TRAI rulings, BharatNet progress, Indian spectrum bands, and state-level connectivity initiatives.
- Sections to use: "5G", "Telecom", "Enterprise Connectivity", "Policy & Regulation", "Satellite", "IoT".
- NOTE: Editorial style guide pending — placeholder above based on public website analysis. Replace when official guide is received.`,
    sitemapUrl: "https://www.voicendata.com/sitemap.xml",
  },
};

export const magazineList: MagazineConfig[] = Object.values(magazines);
