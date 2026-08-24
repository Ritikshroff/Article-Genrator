// ─────────────────────────────────────────────────────────────
// ragCorpus.ts
// Central RAG Knowledge Base and Regulatory Corpus for
// Dataquest, Voice&Data, and PCQuest (Spec v1.1 Compliant).
// ─────────────────────────────────────────────────────────────

import { dqArticlesDb, DQArticle } from "./dqindiaArticles";
import { vndArticlesDb, VnDArticle } from "./voicendataArticles";
import { pcquestArticlesDb } from "./pcquestArticles";

export interface RAGChunk {
  id: string;
  publication: "dataquest" | "voicedata" | "pcquest" | "regulatory";
  title: string;
  url: string;
  snippet: string;
  category?: string;
  publish_date?: string;
}

// ── Regulatory & Government Policy Corpus ─────────────────────
export const regulatoryCorpus: RAGChunk[] = [
  {
    id: "trai_satcom_2025",
    publication: "regulatory",
    title: "TRAI Spectrum Recommendations on Satellite Communications & Satcom Pricing",
    url: "https://www.trai.gov.in/recommendations-spectrum-assignment-space-based-communication-services",
    snippet: "TRAI May 2025 recommendations mandate administrative spectrum assignment for satellite broadband with a 4% Adjusted Gross Revenue (AGR) levy, opening LEO satellite deployment for rural connectivity.",
    publish_date: "2025-05-09",
  },
  {
    id: "trai_5g_private_networks",
    publication: "regulatory",
    title: "TRAI Consultation Paper on Captive Private 5G Networks for Industry 4.0",
    url: "https://www.trai.gov.in/consultation-paper-private-5g-networks-enterprises",
    snippet: "TRAI guidelines allow enterprises to obtain direct spectrum licenses for private 5G networks or lease bandwidth from telcos (Jio, Airtel, Vi) for smart factories, mining, and ports.",
    publish_date: "2024-11-14",
  },
  {
    id: "dot_m2m_guidelines",
    publication: "regulatory",
    title: "DoT M2M Telecommunication Service Provider (MTSP) Registration Guidelines",
    url: "https://dot.gov.in/m2m-guidelines-registration",
    snippet: "Department of Telecommunications requires all M2M and eSIM IoT service providers operating in India to comply with National Cybersecurity Directive and localized SIM profiles.",
    publish_date: "2024-08-20",
  },
  {
    id: "sanchar_saathi_dot",
    publication: "regulatory",
    title: "DoT Sanchar Saathi Portal & CEIR Handset Tracing Mandatory Directives",
    url: "https://sancharsaathi.gov.in/ceir-handset-tracing-directives",
    snippet: "DoT mandates device manufacturers and importers to register unique IMEI numbers on the Central Equipment Identity Register (CEIR) to combat handset theft and fraudulent SIM usage.",
    publish_date: "2024-06-12",
  },
  {
    id: "meity_semicon_2_0",
    publication: "regulatory",
    title: "MeitY India Semiconductor Mission (ISM 2.0) & Component Ecosystem Outlay",
    url: "https://www.meity.gov.in/india-semiconductor-mission-phase-2",
    snippet: "Union Cabinet approves Phase 2 of India Semiconductor Mission with ₹76,000 crore outlay supporting 300nm fab facilities, compound semiconductors, and ATMP/OSAT assembly plants in Gujarat and Assam.",
    publish_date: "2025-02-15",
  },
  {
    id: "digital_india_act",
    publication: "regulatory",
    title: "Digital Personal Data Protection (DPDP) Act & Digital India Act Framework",
    url: "https://www.meity.gov.in/dpdp-act-2023-implementation-rules",
    snippet: "Data Protection Board of India rules specify data fiduciary compliance, cross-border data transfer exemptions for enterprise cloud, and mandatory breach notification within 6 hours.",
    publish_date: "2024-09-05",
  },
];

/**
 * Retrieve top RAG context chunks for a given company, topic, and publication.
 */
export function getRAGChunks(
  company: string,
  topic: string,
  publicationKey: "Dataquest" | "Voice&Data" | "PCquest",
  pressReleaseText: string = ""
): RAGChunk[] {
  const results: RAGChunk[] = [];
  const compLower = (company || "").toLowerCase();
  const topicLower = (topic || "").toLowerCase();
  const fullTextLower = `${compLower} ${topicLower} ${pressReleaseText}`.toLowerCase();

  // 1. Search publication archives for matching articles
  const targetDb = publicationKey === "DataQuest" ? dqArticlesDb
    : publicationKey === "VoiceData" ? vndArticlesDb
    : pcquestArticlesDb;

  const pubCode = publicationKey === "DataQuest" ? "dq" : publicationKey === "VoiceData" ? "vd" : "pcq";

  Object.entries(targetDb).forEach(([key, articles]) => {
    articles.forEach((art, idx) => {
      const artText = `${art.title} ${art.snippet}`.toLowerCase();
      if (
        (compLower && (key.includes(compLower) || compLower.includes(key))) ||
        (topicLower && artText.includes(topicLower)) ||
        (fullTextLower.includes("5g") && artText.includes("5g")) ||
        (fullTextLower.includes("semicon") && artText.includes("semicon")) ||
        (fullTextLower.includes("telecom") && artText.includes("telecom")) ||
        (fullTextLower.includes("ai") && artText.includes("ai")) ||
        (fullTextLower.includes("data") && artText.includes("data"))
      ) {
        if (!results.some((r) => r.url === art.url)) {
          results.push({
            id: `${pubCode}_${key.substring(0, 10)}_${idx + 1}`,
            publication: publicationKey.toLowerCase() as any,
            title: art.title,
            url: art.url,
            snippet: art.snippet,
          });
        }
      }
    });
  });

  // 2. Add topic-based regulatory chunks (TRAI / DoT / MeitY)
  regulatoryCorpus.forEach((reg) => {
    const combined = `${reg.title} ${reg.snippet}`.toLowerCase();
    if (
      (compLower && combined.includes(compLower)) ||
      (topicLower && combined.includes(topicLower)) ||
      (fullTextLower.includes("5g") && combined.includes("5g")) ||
      (fullTextLower.includes("semicon") && combined.includes("semicon")) ||
      (fullTextLower.includes("telecom") && combined.includes("telecom")) ||
      (fullTextLower.includes("data") && combined.includes("data"))
    ) {
      if (!results.some((r) => r.id === reg.id)) {
        results.push(reg);
      }
    }
  });

  // Fallback: If still under 3 matches, pull top articles from database as related reading
  if (results.length < 3) {
    Object.values(targetDb).flat().slice(0, 3).forEach((art, idx) => {
      if (!results.some((r) => r.url === art.url)) {
        results.push({
          id: `${pubCode}_rel_${idx + 1}`,
          publication: publicationKey.toLowerCase() as any,
          title: art.title,
          url: art.url,
          snippet: art.snippet,
        });
      }
    });
  }

  return results.slice(0, 5);
}
