// ─────────────────────────────────────────────────────────────
// dqindiaArticles.ts
// Reference article database for DataQuest (dqindia.com).
//
// STATUS: OFFICIAL — populated from the official DQ document.
// ─────────────────────────────────────────────────────────────

export interface DQArticle {
  title: string;
  url: string;
  snippet: string;
}

export const dqArticlesDb: Record<string, DQArticle[]> = {
  // ── Enterprise IT / Cloud ──────────────────────────────────
  infosys: [
    {
      title: "Infosys Cobalt Accelerates Cloud Adoption for Indian Enterprises",
      url: "https://www.dqindia.com/infosys-cobalt-cloud-adoption-india/",
      snippet:
        "Infosys Cobalt platform helps Indian enterprises migrate legacy workloads to multi-cloud environments, reducing infrastructure costs by up to 30%.",
    },
    {
      title: "Infosys AI-First Strategy: What It Means for the Indian IT Sector",
      url: "https://www.dqindia.com/infosys-ai-first-strategy-india-it/",
      snippet:
        "Infosys CEO Salil Parekh outlines an AI-First Value Framework targeting $300B+ enterprise AI market; impact on Indian IT outsourcing and talent strategy.",
    },
  ],
  wipro: [
    {
      title: "Wipro's Enterprise AI Push: Targeting BFSI and Manufacturing Verticals",
      url: "https://www.dqindia.com/wipro-enterprise-ai-bfsi-manufacturing/",
      snippet:
        "Wipro ai360 strategy focuses on AI integration for banking, financial services, and Indian manufacturing automation — covering 30,000 trained AI professionals.",
    },
  ],
  tcs: [
    {
      title: "TCS Bags ₹5,000 Crore Digital Transformation Contract from Indian PSU",
      url: "https://www.dqindia.com/tcs-digital-transformation-psu-contract/",
      snippet:
        "TCS wins major government-backed PSU contract for digital transformation, covering cloud migration, ERP modernisation, and cybersecurity infrastructure.",
    },
    {
      title: "TCS Reports Q4 Revenue Growth; Guidance on AI Services Expansion",
      url: "https://www.dqindia.com/tcs-q4-revenue-ai-services/",
      snippet:
        "TCS Q4 results highlight 4.5% YoY revenue growth with strong order book from BFSI and retail segments; new AI services unit announced for FY2026.",
    },
  ],
  // ── Semiconductor & Hardware ───────────────────────────────
  intel: [
    {
      title: "Intel Bets on India's Semiconductor Ecosystem with Gaur Campus Expansion",
      url: "https://www.dqindia.com/intel-india-semiconductor-gaur-campus/",
      snippet:
        "Intel expands its Bangalore design and engineering campus as part of India's semiconductor push, supporting the government's ₹76,000 crore chip incentive scheme.",
    },
  ],
  nvidia: [
    {
      title: "NVIDIA's India Data Centre Push: AI Supercomputing for Indian Startups",
      url: "https://www.dqindia.com/nvidia-india-data-centre-ai-supercomputing/",
      snippet:
        "NVIDIA announces partnerships with Indian cloud providers and government bodies to set up AI supercomputing clusters, targeting healthcare, agriculture, and smart city use cases.",
    },
  ],
  // ── Government & Policy ───────────────────────────────────
  meity: [
    {
      title: "MeitY's Digital India 2.0: Roadmap for AI, Cybersecurity, and Semiconductor Self-Reliance",
      url: "https://www.dqindia.com/meity-digital-india-2-ai-semiconductor/",
      snippet:
        "Ministry of Electronics and IT releases the next phase of Digital India, with ₹1.25 lakh crore allocation for AI research, semiconductor manufacturing, and rural broadband connectivity.",
    },
  ],
  // ── Data & AI ────────────────────────────────────────────
  microsoft: [
    {
      title: "Microsoft Azure AI Studio: Indian Enterprises Among Early Adopters",
      url: "https://www.dqindia.com/microsoft-azure-ai-studio-india-adoption/",
      snippet:
        "Microsoft Azure AI Studio gains traction among Indian BFSI and retail enterprises for building custom LLM-based copilots, with Azure OpenAI deployments growing 180% YoY in India.",
    },
    {
      title: "Microsoft India Partners with NASSCOM on AI Skilling for 100,000 Professionals",
      url: "https://www.dqindia.com/microsoft-nasscom-ai-skilling-india/",
      snippet:
        "Microsoft and NASSCOM launch a joint AI skilling initiative targeting 100,000 Indian IT professionals in generative AI, prompt engineering, and AI governance.",
    },
  ],
  google: [
    {
      title: "Google Cloud Expands India Region: New Delhi Data Centre Goes Live",
      url: "https://www.dqindia.com/google-cloud-india-region-delhi-data-centre/",
      snippet:
        "Google Cloud launches its third India availability zone in the NCR region, reducing data residency latency for government and BFSI clients under RBI and SEBI data localisation norms.",
    },
  ],
  deloitte: [
    {
      title: "Deloitte India Report: 78% of CXOs to Double AI Budgets in FY2026",
      url: "https://www.dqindia.com/deloitte-india-cxo-ai-budget-fy2026/",
      snippet:
        "Deloitte India's annual CXO survey reveals that 78% of Indian enterprise leaders plan to increase AI investments significantly, with data governance and ROI measurement as top concerns.",
    },
  ],
};

export function getDQArticlesForCompany(companyName: string): DQArticle[] {
  if (!companyName) return [];
  const norm = companyName.toLowerCase();

  if (norm.includes("infosys")) return dqArticlesDb.infosys ?? [];
  if (norm.includes("wipro")) return dqArticlesDb.wipro ?? [];
  if (norm.includes("tcs") || norm.includes("tata consultancy")) return dqArticlesDb.tcs ?? [];
  if (norm.includes("intel")) return dqArticlesDb.intel ?? [];
  if (norm.includes("nvidia")) return dqArticlesDb.nvidia ?? [];
  if (norm.includes("meity") || norm.includes("ministry of electronics")) return dqArticlesDb.meity ?? [];
  if (norm.includes("microsoft")) return dqArticlesDb.microsoft ?? [];
  if (norm.includes("google")) return dqArticlesDb.google ?? [];
  if (norm.includes("deloitte")) return dqArticlesDb.deloitte ?? [];

  return [];
}
