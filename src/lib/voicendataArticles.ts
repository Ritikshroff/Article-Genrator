// ─────────────────────────────────────────────────────────────
// voicendataArticles.ts
// Reference article database for Voice & Data (voicendata.com).
//
// STATUS: PLACEHOLDER — seeded with representative entries.
// Replace / extend once editorial team shares the actual article list.
// Structure must match DQArticle interface exactly.
// ─────────────────────────────────────────────────────────────

export interface VnDArticle {
  title: string;
  url: string;
  snippet: string;
}

export const vndArticlesDb: Record<string, VnDArticle[]> = {
  // ── Telecom Operators ──────────────────────────────────────
  jio: [
    {
      title: "Jio's 5G Standalone Network: 700 MHz Coverage Reaches 700 Indian Cities",
      url: "https://www.voicendata.com/jio-5g-standalone-700-cities/",
      snippet:
        "Reliance Jio completes 5G SA rollout across 700 cities using the 700 MHz spectrum band, achieving sub-20ms latency for enterprise private network use cases.",
    },
    {
      title: "Jio AirFiber Crosses 5 Million Subscribers: What the Numbers Mean",
      url: "https://www.voicendata.com/jio-airfiber-5-million-subscribers/",
      snippet:
        "JioAirFiber's fixed wireless access service surpasses 5 million subscribers within 18 months of launch, challenging traditional FTTH providers in Tier-2 and Tier-3 cities.",
    },
  ],
  airtel: [
    {
      title: "Airtel 5G Plus: Coverage Milestones and Enterprise 5G Slicing Strategy",
      url: "https://www.voicendata.com/airtel-5g-plus-enterprise-slicing/",
      snippet:
        "Bharti Airtel outlines its network slicing strategy for enterprise 5G customers, targeting manufacturing, logistics, and smart ports with dedicated QoS guarantees.",
    },
    {
      title: "Airtel Business Launches SD-WAN for Indian Enterprises with 99.99% SLA",
      url: "https://www.voicendata.com/airtel-business-sd-wan-india/",
      snippet:
        "Airtel Business introduces a managed SD-WAN service with a 99.99% uptime SLA for multi-site Indian enterprises, underpinned by its pan-India MPLS backbone.",
    },
  ],
  bsnl: [
    {
      title: "BSNL 4G Rollout: TCS-Built Network Now Live in 4,500 Sites",
      url: "https://www.voicendata.com/bsnl-4g-rollout-tcs-4500-sites/",
      snippet:
        "BSNL's indigenous 4G network built by TCS goes live at 4,500 sites, marking a milestone for India's telecom self-reliance mission ahead of planned 5G upgrade.",
    },
  ],
  // ── Satellite & Emerging ───────────────────────────────────
  starlink: [
    {
      title: "Starlink India Commercial Launch: Pricing, Coverage, and TRAI Compliance",
      url: "https://www.voicendata.com/starlink-india-commercial-launch-trai/",
      snippet:
        "SpaceX Starlink officially commences commercial satellite broadband services in India after receiving DoT approvals, with plans to cover remote areas under BharatNet Phase III.",
    },
  ],
  oneweb: [
    {
      title: "OneWeb Eutelsat India Partnership: LEO Satellite for Rural Connectivity",
      url: "https://www.voicendata.com/oneweb-eutelsat-india-rural-leo/",
      snippet:
        "OneWeb (Eutelsat) expands India LEO satellite coverage with local ISP partnerships to deliver 150 Mbps broadband to underserved rural districts across Northeast India.",
    },
  ],
  // ── Enterprise Connectivity ────────────────────────────────
  cisco: [
    {
      title: "Cisco Catalyst SD-WAN Adoption Surges Among Indian Enterprises",
      url: "https://www.voicendata.com/cisco-catalyst-sd-wan-india-adoption/",
      snippet:
        "Cisco reports 65% YoY growth in Catalyst SD-WAN deployments across Indian BFSI and retail enterprises, driven by multi-cloud connectivity and security requirements.",
    },
  ],
  ericsson: [
    {
      title: "Ericsson and Airtel Deploy India's First Live 5G Network Slicing at Gurgaon Factory",
      url: "https://www.voicendata.com/ericsson-airtel-5g-slicing-gurgaon/",
      snippet:
        "Ericsson and Airtel complete a live 5G network slicing trial at a Gurgaon manufacturing facility, demonstrating 1ms latency for robotic arm control over a shared 5G RAN.",
    },
  ],
  nokia: [
    {
      title: "Nokia's India 5G Core Strategy: Private Networks for Smart Ports and Mines",
      url: "https://www.voicendata.com/nokia-india-5g-core-private-networks/",
      snippet:
        "Nokia India details its private 5G network roadmap for smart ports (JNPT) and mining operations, leveraging its AirScale radio platform and industrial-grade network edge compute.",
    },
  ],
  // ── Regulation & Policy ────────────────────────────────────
  trai: [
    {
      title: "TRAI Spectrum Consultation: 6 GHz Band Decision Expected by Q2 2026",
      url: "https://www.voicendata.com/trai-spectrum-6ghz-consultation-2026/",
      snippet:
        "TRAI initiates consultation on 6 GHz spectrum allocation, balancing demands from Wi-Fi 6E ecosystem players and IMT-2030 (6G) proponents; decision expected by mid-2026.",
    },
  ],
};

export function getVnDArticlesForCompany(companyName: string): VnDArticle[] {
  if (!companyName) return [];
  const norm = companyName.toLowerCase();

  if (norm.includes("jio") || norm.includes("reliance")) return vndArticlesDb.jio ?? [];
  if (norm.includes("airtel") || norm.includes("bharti")) return vndArticlesDb.airtel ?? [];
  if (norm.includes("bsnl")) return vndArticlesDb.bsnl ?? [];
  if (norm.includes("starlink") || norm.includes("spacex")) return vndArticlesDb.starlink ?? [];
  if (norm.includes("oneweb") || norm.includes("eutelsat")) return vndArticlesDb.oneweb ?? [];
  if (norm.includes("cisco")) return vndArticlesDb.cisco ?? [];
  if (norm.includes("ericsson")) return vndArticlesDb.ericsson ?? [];
  if (norm.includes("nokia")) return vndArticlesDb.nokia ?? [];
  if (norm.includes("trai")) return vndArticlesDb.trai ?? [];

  return [];
}
