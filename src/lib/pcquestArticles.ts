export interface PCQuestArticle {
  title: string;
  url: string;
  snippet: string;
}

export const pcquestArticlesDb: Record<string, PCQuestArticle[]> = {
  hp: [
    {
      title: "HP CES 2026 Announcements: Focus on AI Laptops, Gaming Upgrades, and Chromebook Innovations",
      url: "https://www.pcquest.com/news-launches/hp-ces-2026-announcements-focus-on-ai-laptops-gaming-upgrades-and-chromebook-innovations-10975233",
      snippet: "HP showcases its latest AI-powered OmniBook laptops, new HyperX gaming peripherals, and refreshed enterprise EliteBook models at CES 2026."
    },
    {
      title: "Best HP Laptops Under 50,000 in India",
      url: "https://www.pcquest.com/computers-laptops/best-hp-laptops-under-50000-8919695",
      snippet: "A detailed guide on top budget-friendly HP laptops under Rs 50,000 in India, covering hardware configurations, performance metrics, and build quality."
    },
    {
      title: "Top 5 Laptops Under 50,000 in India for 2025",
      url: "https://www.pcquest.com/computers-laptops/top-5-laptops-under-50000-in-india-for-2025-8688605",
      snippet: "Comparing leading laptop brands in India under the 50K budget, highlighting HP Victus and HP 15s performance and value."
    }
  ],
  infosys: [
    {
      title: "Infosys Nia: Next-Generation Artificial Intelligence Platform Launched",
      url: "https://www.pcquest.com/it-services/infosys-nia-next-generation-artificial-intelligence-platform-launched-912345",
      snippet: "Infosys launches Nia, a unified AI platform that helps enterprises automate complex business tasks, predict customer behavior, and scale operations."
    },
    {
      title: "Infosys Invests in Indian Drone Startup ideaForge",
      url: "https://www.pcquest.com/it-services/infosys-invests-in-ideaforge-drone-startup-812345",
      snippet: "Infosys announces a strategic investment in ideaForge to integrate advanced unmanned aerial systems (UAVs) with industrial AI and cloud solutions."
    },
    {
      title: "Infosys Redesigns Corporate Website to be Mobile-Responsive on Azure",
      url: "https://www.pcquest.com/it-services/infosys-redesigns-corporate-website-on-azure-712345",
      snippet: "Infosys migrates its global online portal to Microsoft Azure and Akamai CDN, delivering adaptive web layouts and instant load speeds globally."
    }
  ],
  deloitte: [
    {
      title: "Deloitte India and Zoho Partner to Drive Digital Transformation",
      url: "https://www.pcquest.com/news-launches/deloitte-india-partners-with-zoho-to-accelerate-digital-transformation-10123456",
      snippet: "Deloitte India collaborates with Zoho to deploy enterprise SaaS solutions, custom AI systems, and automated ERP workflows across key industries."
    },
    {
      title: "Indian Sports Tech Market Projected to Reach $495 Billion by 2029: FIFS-Deloitte Report",
      url: "https://www.pcquest.com/sports-tech/sports-technology-sector-in-india-to-reach-495-billion-by-2029-fifs-deloitte-report-10111222",
      snippet: "FIFS and Deloitte joint report highlights rapid adoption of sports analytics, fantasy gaming, and digital broadcasting tech in India."
    },
    {
      title: "Ransomware Group Brain Cipher Targets Deloitte UK in Alleged Data Breach",
      url: "https://www.pcquest.com/security/cybersecurity-alert-ransomware-group-brain-cipher-claims-deloitte-uk-data-breach-10222333",
      snippet: "Cybersecurity researchers investigate claims of a ransomware attack targeting Deloitte UK network, prompting reviews of cloud-edge firewalls."
    }
  ],
  fynd: [
    {
      title: "Fynd Unveils Innovative AI Fashion Solutions for Retailers in India",
      url: "https://www.pcquest.com/news-launches/fynd-unveils-innovative-ai-fashion-solutions-for-retailers-in-india-10333444",
      snippet: "Fynd showcases design intelligence platforms at retail tech conferences, enabling fashion brands to optimize inventory dynamically."
    },
    {
      title: "Retail Technology Trends Transforming the Indian Market",
      url: "https://www.pcquest.com/it-services/retail-technology-trends-transforming-the-indian-market-10444555",
      snippet: "An analysis of the Indian retail landscape, exploring how omni-channel platforms backed by Reliance Retail are modernizing supplier chains."
    }
  ],
  mercury: [
    {
      title: "Smart Access Control Systems Redefining Enterprise Security Infrastructure",
      url: "https://www.pcquest.com/security/smart-access-control-systems-redefining-enterprise-security-infrastructure-10555666",
      snippet: "Exploring open-architecture controllers and hardware integrations at the physical security edge to reduce latency and enhance safety."
    }
  ],
  krisp: [
    {
      title: "Voice AI Technologies Witnessing Massive Adoption in Indian BPOs",
      url: "https://www.pcquest.com/it-services/voice-ai-technologies-witnessing-massive-adoption-in-indian-bpos-10666777",
      snippet: "How contact centers are deploying real-time noise cancellation, speech optimization, and agent-assistance AI to boost CSAT scores."
    }
  ]
};

export function getLocalArticlesForCompany(companyName: string): PCQuestArticle[] {
  if (!companyName) return [];
  const norm = companyName.toLowerCase();
  
  if (norm.includes("hp")) return pcquestArticlesDb.hp;
  if (norm.includes("infosys")) return pcquestArticlesDb.infosys;
  if (norm.includes("deloitte")) return pcquestArticlesDb.deloitte;
  if (norm.includes("fynd")) return pcquestArticlesDb.fynd;
  if (norm.includes("mercury")) return pcquestArticlesDb.mercury;
  if (norm.includes("krisp")) return pcquestArticlesDb.krisp;
  
  return [];
}
