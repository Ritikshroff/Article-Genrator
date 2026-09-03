import { GoogleGenerativeAI, SchemaType, Schema } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { getRAGChunks, RAGChunk } from "@/lib/ragCorpus";
import { magazines, MagazineKey } from "@/lib/magazineConfig";

export const runtime = "nodejs";

function escapeRawNewlinesInJSON(str: string): string {
  let inQuote = false;
  let escaped = "";
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (char === '"') {
      let backslashCount = 0;
      let j = i - 1;
      while (j >= 0 && str[j] === '\\') {
        backslashCount++;
        j--;
      }
      if (backslashCount % 2 === 0) {
        inQuote = !inQuote;
      }
    }

    if (inQuote) {
      if (char === '\n') escaped += '\\n';
      else if (char === '\r') escaped += '\\r';
      else if (char === '\t') escaped += '\\t';
      else escaped += char;
    } else {
      escaped += char;
    }
  }
  return escaped;
}

function extractFirstJSONObject(str: string): string {
  const startIdx = str.indexOf("{");
  if (startIdx === -1) return str;

  let braceCount = 0;
  let inQuote = false;

  for (let i = startIdx; i < str.length; i++) {
    const char = str[i];
    if (char === '"') {
      let backslashCount = 0;
      let j = i - 1;
      while (j >= 0 && str[j] === '\\') {
        backslashCount++;
        j--;
      }
      if (backslashCount % 2 === 0) {
        inQuote = !inQuote;
      }
    }

    if (!inQuote) {
      if (char === "{") {
        braceCount++;
      } else if (char === "}") {
        braceCount--;
        if (braceCount === 0) {
          return str.substring(startIdx, i + 1);
        }
      }
    }
  }
  return str.substring(startIdx);
}

function cleanAndParseJson(text: string): any {
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  }
  cleaned = extractFirstJSONObject(cleaned);
  cleaned = escapeRawNewlinesInJSON(cleaned);
  return JSON.parse(cleaned);
}

// ── JSON Schema v1.1 (E-E-A-T + RAG Specification) ───────────
const jsonSchemaV11: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    publication: { type: SchemaType.STRING },
    content_type: { type: SchemaType.STRING },
    hands_on_data: { type: SchemaType.BOOLEAN },
    title_seo: { type: SchemaType.STRING },
    slug: { type: SchemaType.STRING },
    meta_description: { type: SchemaType.STRING },
    excerpt: { type: SchemaType.STRING },
    focus_keywords: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    tags: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    category: { type: SchemaType.STRING },
    author_byline: { type: SchemaType.STRING },
    author_bio_short: { type: SchemaType.STRING },
    author_expertise_tags: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    h1: { type: SchemaType.STRING },
    h2s: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    body_html: { type: SchemaType.STRING },
    faqs: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          q: { type: SchemaType.STRING },
          a: { type: SchemaType.STRING },
        },
        required: ["q", "a"],
      },
    },
    rag_sources: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          id: { type: SchemaType.STRING },
          url: { type: SchemaType.STRING },
          title: { type: SchemaType.STRING },
          snippet: { type: SchemaType.STRING },
        },
        required: ["id", "url", "title", "snippet"],
      },
    },
    sources_list: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    citations_in_body: { type: SchemaType.BOOLEAN },
    confidence_score: { type: SchemaType.STRING },
    ai_generated_draft: { type: SchemaType.BOOLEAN },
    fact_checked: { type: SchemaType.BOOLEAN },
    human_review_required: { type: SchemaType.BOOLEAN },
    trust_footer: { type: SchemaType.STRING },
    schema_type: { type: SchemaType.STRING },
    header_image_prompt: { type: SchemaType.STRING },
    header_image_alt: { type: SchemaType.STRING },
  },
  required: [
    "publication", "content_type", "hands_on_data", "title_seo", "slug",
    "meta_description", "excerpt", "focus_keywords", "tags", "category",
    "author_byline", "author_bio_short", "author_expertise_tags",
    "h1", "h2s", "body_html", "faqs", "rag_sources", "sources_list",
    "citations_in_body", "confidence_score", "ai_generated_draft",
    "fact_checked", "human_review_required", "trust_footer",
    "schema_type", "header_image_prompt", "header_image_alt"
  ],
};

const seoSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    seo_title: { type: SchemaType.STRING },
    english_title: { type: SchemaType.STRING },
    permalink: { type: SchemaType.STRING },
    summary: { type: SchemaType.STRING },
    meta_title: { type: SchemaType.STRING },
    meta_description: { type: SchemaType.STRING },
    og_title: { type: SchemaType.STRING },
    og_description: { type: SchemaType.STRING },
    twitter_title: { type: SchemaType.STRING },
    twitter_description: { type: SchemaType.STRING },
    meta_keywords: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    meta_news_keywords: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    primary_keyword: { type: SchemaType.STRING },
    keywords: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    semantic_keywords: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
  },
  required: [
    "seo_title", "english_title", "permalink", "summary", "meta_title",
    "meta_description", "og_title", "og_description", "twitter_title",
    "twitter_description", "meta_keywords", "meta_news_keywords",
    "primary_keyword", "keywords", "semantic_keywords"
  ],
};

const impactSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    why_it_matters: { type: SchemaType.STRING },
    industries_affected: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    business_impact: { type: SchemaType.STRING },
    technology_impact: { type: SchemaType.STRING },
    competitive_landscape: { type: SchemaType.STRING },
  },
  required: ["why_it_matters", "industries_affected", "business_impact", "technology_impact", "competitive_landscape"],
};

const interviewSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    candidates: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    questions: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    follow_up_stories: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
  },
  required: ["candidates", "questions", "follow_up_stories"],
};

const reviewSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    marketing_claims: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    neutralized_terms: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    source_fidelity_checks: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    operational_checklist: {
      type: SchemaType.OBJECT,
      properties: {
        product_name_verified: { type: SchemaType.BOOLEAN },
        pricing_preserved: { type: SchemaType.BOOLEAN },
        release_date_verified: { type: SchemaType.BOOLEAN },
        specs_table_present: { type: SchemaType.BOOLEAN },
        quote_verbatim_bottom: { type: SchemaType.BOOLEAN },
      },
      required: ["product_name_verified", "pricing_preserved", "release_date_verified", "specs_table_present", "quote_verbatim_bottom"],
    },
    missing_data: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    customer_reference_gaps: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    india_relevance: { type: SchemaType.STRING },
    fact_check_items: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    reporting_conflicts: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
  },
  required: [
    "marketing_claims", "neutralized_terms", "source_fidelity_checks",
    "operational_checklist", "missing_data", "customer_reference_gaps",
    "india_relevance", "fact_check_items", "reporting_conflicts"
  ],
};

const socialSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    linkedin_post: { type: SchemaType.STRING },
    twitter_post: { type: SchemaType.STRING },
  },
  required: ["linkedin_post", "twitter_post"],
};

export async function POST(req: NextRequest) {
  try {
    let reqBody: any;
    try {
      reqBody = await req.json();
    } catch (parseErr: any) {
      try {
        const rawText = await req.text();
        const cleanedText = escapeRawNewlinesInJSON(rawText);
        reqBody = JSON.parse(cleanedText);
      } catch (fallbackErr: any) {
        return NextResponse.json(
          { error: `Invalid JSON payload: ${parseErr?.message || fallbackErr?.message}` },
          { status: 400 }
        );
      }
    }

    const {
      pressRelease,
      customApiKey,
      topicType = "News",
      minWords,
      maxWords,
      customPrompt,
      generateImage,
      imageCount = 1,
      humanize = true,
      hands_on_data = false,
      magazine: rawMagazine,
    } = reqBody;

    const magazineKey: MagazineKey = (rawMagazine as MagazineKey) || "Dataquest";
    const mag = magazines[magazineKey];

    if (!pressRelease || pressRelease.trim() === "") {
      return NextResponse.json(
        { error: "Press release content is required." },
        { status: 400 }
      );
    }

    // ── Compute proportional word count target ───────────────
    const inputWordCount = pressRelease.trim().split(/\s+/).length;
    // Allow output to be at most 20% above input word count; floor at 200 so very short PRs still produce readable articles
    const wordTargetMin = Math.max(Math.round(inputWordCount * 0.9), 150);
    const wordTargetMax = Math.max(Math.round(inputWordCount * 1.2), 200);
    // If the user overrides with explicit minWords/maxWords, honour their ceiling (take the smaller cap)
    const effectiveMin = minWords ? Math.min(Number(minWords), wordTargetMin) : wordTargetMin;
    const effectiveMax = maxWords ? Math.min(Number(maxWords), wordTargetMax) : wordTargetMax;

    const apiKey = customApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === "") {
      return NextResponse.json(
        { error: "Gemini API Key is missing. Please configure GEMINI_API_KEY in .env.local or enter it in Advanced Settings." },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: humanize ? 0.7 : 0.1,
      },
    });

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // ── STEP 1: RAG Context Retrieval ───────────────────────────
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                type: "step",
                step: 1,
                message: `Retrieving RAG ground truth & regulatory context for ${mag.name}...`,
              }) + "\n"
            )
          );

          // Extract company and topic using Gemini
          let company = "";
          let topic = "";
          try {
            const extractionModel = genAI.getGenerativeModel({
              model: "gemini-3.5-flash",
              generationConfig: { responseMimeType: "application/json", temperature: 0.1 },
            });
            const extractRes = await extractionModel.generateContent(
              `Analyze this press release and extract the main organization/company name and 1-3 word main topic. Respond ONLY with JSON: {"company": "name", "topic": "topic"}.\n\nPress Release:\n${pressRelease}`
            );
            const obj = cleanAndParseJson(extractRes.response.text());
            company = obj.company || "";
            topic = obj.topic || "";
          } catch (err) {
            console.error("Extraction error:", err);
          }

          // Retrieve context chunks from RAG corpus
          const ragChunks: RAGChunk[] = getRAGChunks(company, topic, magazineKey, pressRelease);

          // Format RAG context for prompt
          const ragContextText = ragChunks.length > 0
            ? ragChunks.map((c) => `[${c.id}] ${c.title}: ${c.snippet} (URL: ${c.url})`).join("\n")
            : "No specific archive chunks found. Write context based strictly on press release facts.";

          // Determine content_type & PCQuest Experience Gate
          let contentType = topicType === "Interview" ? "analysis"
            : topicType === "CaseStudy" ? "review"
            : topicType === "Feature" ? "analysis"
            : "news";

          let isFirstLook = false;
          if (magazineKey === "PCquest" && contentType === "review" && !hands_on_data) {
            contentType = "first_look";
            isFirstLook = true;
          }

          // ── STEP 2: Generate Schema v1.1 Package ────────────────────
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                type: "step",
                step: 2,
                message: `Generating E-E-A-T + RAG compliant draft for ${mag.name}...`,
              }) + "\n"
            )
          );

          const mainPrompt = `
${mag.systemPromptV11}

You are given:
1. PRESS_RELEASE (primary source for facts)
2. RETRIEVED_CHUNKS (archive context & regulatory filings, each with id, title, snippet, url)

*** HARD RULES — NON-NEGOTIABLE (override any conflicting instruction above) ***
A. PROPORTIONAL LENGTH: The Press Release below is approximately ${inputWordCount} words.
   Your body_html output MUST be between ${effectiveMin} and ${effectiveMax} words.
   DO NOT add paragraphs, bullet points, or sentences beyond what is needed to faithfully report the PR facts.
   DO NOT pad with generic industry commentary, boilerplate phrases, or speculative context.
B. ZERO FABRICATION: Every single sentence must be traceable to PRESS_RELEASE or a cited RETRIEVED_CHUNK.
   Do NOT add any claim, statistic, company history, product detail, market share figure, or contextual
   statement that is not present in those two sources. If you cannot source a fact — omit it.
C. UNBIASED NATURAL AUTHOR: Write as a neutral journalist reporting facts, not as a PR amplifier.
   Do not exaggerate impact, significance, or scale beyond what the source states.
*** END HARD RULES ***

PRESS_RELEASE:
${pressRelease}

RETRIEVED_CHUNKS:
${ragContextText}

INPUT PARAMETERS:
- publication: "${magazineKey.toLowerCase()}"
- content_type: "${contentType}"
- hands_on_data: ${hands_on_data}
- target_word_count: ${effectiveMin}-${effectiveMax} words (MANDATORY — do not exceed)

RAG GROUNDING & CITATION RULES (MANDATORY):
1. PR is Ground Truth for News Facts: Company name, product name, launch dates, claims.
2. RETRIEVED_CHUNKS are Ground Truth for Context: Market context, regulatory policy, past specs.
3. HYPERLINK ALL CITATIONS DIRECTLY IN HTML: For any statement using historical data, TRAI/DoT guidelines, or background from RETRIEVED_CHUNKS, embed a clean HTML hyperlink using the exact chunk URL. Example: <a href="URL" target="_blank" rel="noopener noreferrer">Title/Topic</a>. DO NOT output raw bracket tag markers like [vd_jio_1] or [vd_bts_2024] directly in paragraph prose.
4. For statements about this specific announcement, cite PR facts implicitly (no marker needed).
5. If you cannot find a fact in PR or chunks, say "Price/availability not disclosed in release" — DO NOT INVENT facts.

INTERNAL LINKING & "ALSO READ" RULES (MANDATORY):
1. You MUST include 1 to 2 "Also Read" internal hyperlinked references inside body_html using the URLs and Titles provided in RETRIEVED_CHUNKS.
2. Format STRICTLY as: <p><strong>Also Read: </strong><a href="URL" target="_blank" rel="noopener noreferrer">Exact Article Title</a></p>. Never leave the "Also Read" title unlinked.
3. Insert these "Also Read" callouts between major sections to increase reader engagement and SEO internal linking.

E-E-A-T SIGNALS & AUTHOR RULES:
- author_byline: "${mag.authorEntity.byline}"
- author_bio_short: "${mag.authorEntity.bioShort}"
- author_expertise_tags: ${JSON.stringify(mag.authorEntity.expertiseTags)}
- trust_footer: "Source: ${company || mag.name} Press Release, July 2026. This is an AI-assisted first draft based on press information. Specs per company release, awaiting independent verification. Reviewed by: [Editor Name]"

PCQUEST EXPERIENCE GATE:
${isFirstLook ? 'CRITICAL PCQUEST RULE: hands_on_data is false! You MUST set content_type to "first_look". Title MUST start with "First Look: ". You MUST include mandatory disclaimer at top of body_html: "<p><em>Note: This first impression is based on official press release and specs. Hands-on review from PCquest Labs is awaited.</em></p>". DO NOT invent battery life, thermals, or benchmark scores.' : ''}

HEADER IMAGE PROMPT RULES:
Create a custom, dynamic, E-E-A-T compliant image generation prompt (16:9 aspect ratio, 1280x720 resolution) specifically derived from the key subject, product name, and main entity of THIS input press release. DO NOT use generic boilerplate text. Format: "16:9 editorial banner, [specific product/technology/event from this press release], 1280x720 resolution, ${magazineKey === "Voice&Data" ? "telecom blue and amber lighting" : magazineKey === "PCquest" ? "studio hardware rendering" : "enterprise tech corporate style"}, photorealistic, 8k --no text --no brand logos".

${customPrompt ? `CUSTOM EDITORIAL INSTRUCTIONS:\n${customPrompt}\n` : ''}

Generate the complete draft adhering STRICTLY to the JSON Schema v1.1.
`;

          const articleModel = genAI.getGenerativeModel({
            model: "gemini-3.5-flash",
            generationConfig: {
              responseMimeType: "application/json",
              responseSchema: jsonSchemaV11,
              temperature: 0.2,
            },
          });

          const v11Res = await articleModel.generateContent(mainPrompt);
          const v11Text = v11Res.response.text();
          const pkgV11 = cleanAndParseJson(v11Text);

          // Convert v1.1 JSON into news object compatible with OutputPanel
          const newsData = {
            headline: pkgV11.h1 || pkgV11.title_seo,
            subheadline: pkgV11.excerpt || pkgV11.meta_description,
            article: pkgV11.body_html,
            category: pkgV11.category || "Technology",
            tags: pkgV11.tags || [],
            faq: (pkgV11.faqs || []).map((f: any) => ({ question: f.q || f.question, answer: f.a || f.answer })),
            author_byline: pkgV11.author_byline,
            author_bio_short: pkgV11.author_bio_short,
            author_expertise_tags: pkgV11.author_expertise_tags,
            trust_footer: pkgV11.trust_footer,
            rag_sources: pkgV11.rag_sources || ragChunks,
            header_image_prompt: pkgV11.header_image_prompt,
            header_image_alt: pkgV11.header_image_alt,
            is_first_look: isFirstLook,
          };

          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                type: "data",
                key: "news",
                data: newsData,
              }) + "\n"
            )
          );

          // ── STEP 3: SEO Assets ─────────────────────────────────────
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                type: "step",
                step: 3,
                message: "Generating E-E-A-T & SEO metadata...",
              }) + "\n"
            )
          );

          const seoData = {
            seo_title: pkgV11.title_seo,
            meta_description: pkgV11.meta_description,
            slug: pkgV11.slug,
            primary_keyword: pkgV11.focus_keywords?.[0] || topic || "Technology",
            keywords: pkgV11.focus_keywords || [],
            semantic_keywords: pkgV11.tags || [],
          };

          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                type: "data",
                key: "seo",
                data: seoData,
              }) + "\n"
            )
          );

          // ── STEP 4: Industry Impact & Social Media ──────────────────
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                type: "step",
                step: 4,
                message: "Generating Industry Impact & Social Media assets...",
              }) + "\n"
            )
          );

          // Generate Impact data
          const impactModel = genAI.getGenerativeModel({
            model: "gemini-3.5-flash",
            generationConfig: { responseMimeType: "application/json", responseSchema: impactSchema, temperature: 0.3 },
          });
          const impactRes = await impactModel.generateContent(
            `Analyze this news for ${mag.name} readers and produce Industry Impact analysis in JSON:\n${pressRelease}`
          );
          const impactData = cleanAndParseJson(impactRes.response.text());
          controller.enqueue(encoder.encode(JSON.stringify({ type: "data", key: "impact", data: impactData }) + "\n"));

          // Generate Social Media data
          const socialModel = genAI.getGenerativeModel({
            model: "gemini-3.5-flash",
            generationConfig: { responseMimeType: "application/json", responseSchema: socialSchema, temperature: 0.5 },
          });
          const socialRes = await socialModel.generateContent(
            `Write LinkedIn & Twitter posts for ${mag.name} based on this headline: "${newsData.headline}"\n${pressRelease}`
          );
          const socialData = cleanAndParseJson(socialRes.response.text());
          controller.enqueue(encoder.encode(JSON.stringify({ type: "data", key: "social", data: socialData }) + "\n"));

          // Generate Story Leads (Interview) data
          const interviewModel = genAI.getGenerativeModel({
            model: "gemini-3.5-flash",
            generationConfig: { responseMimeType: "application/json", responseSchema: interviewSchema, temperature: 0.4 },
          });
          const interviewRes = await interviewModel.generateContent(
            `Formulate 10 interview questions, candidates, and follow-up story angles for ${mag.name}:\n${pressRelease}`
          );
          const interviewData = cleanAndParseJson(interviewRes.response.text());
          controller.enqueue(encoder.encode(JSON.stringify({ type: "data", key: "interview", data: interviewData }) + "\n"));

          // Generate Editorial Review data
          const reviewModel = genAI.getGenerativeModel({
            model: "gemini-3.5-flash",
            generationConfig: { responseMimeType: "application/json", responseSchema: reviewSchema, temperature: 0.2 },
          });
          const reviewAuditPrompt = "Perform a thorough Editorial Neutrality, Source Fidelity and Operational Checklist Audit for " + mag.name + ":\n\n" +
"ARTICLE DRAFT HEADLINE: " + JSON.stringify(newsData.headline || "") + "\n" +
"ARTICLE DRAFT BODY: " + JSON.stringify((newsData.article || "").slice(0, 2000)) + "\n" +
"ORIGINAL PRESS RELEASE: " + JSON.stringify((pressRelease || "").slice(0, 3000)) + "\n\n" +
"AUDIT INSTRUCTIONS:\n" +
"1. marketing_claims: List marketing hype claims from PR flagged for neutralization.\n" +
"2. neutralized_terms: List promotional words sanitized into objective text.\n" +
"3. source_fidelity_checks: 3 to 5 bullet points verifying draft claims match PR facts strictly with 0 percent inference.\n" +
"4. operational_checklist: Return boolean flags for product_name_verified, pricing_preserved, release_date_verified, specs_table_present, quote_verbatim_bottom.\n" +
"5. missing_data: List missing specs or metrics.\n" +
"6. customer_reference_gaps: List customer reference gaps.\n" +
"7. india_relevance: Assess India market relevance.\n" +
"8. fact_check_items: 4 to 6 specific facts to check.\n" +
"9. reporting_conflicts: Conflicts with previous reporting.";

          const reviewRes = await reviewModel.generateContent(reviewAuditPrompt);
          const reviewData = cleanAndParseJson(reviewRes.response.text());
          controller.enqueue(encoder.encode(JSON.stringify({ type: "data", key: "review", data: reviewData }) + "\n"));

          // Helper: Direct Native Google Gemini Image Generation (nano-banana-pro-preview & gemini-3.1-flash-image)
          async function fetchBase64Image(prompt: string): Promise<{ base64: string; mimeType: string } | null> {
            const masterPrompt = `${prompt}, octane render, vibrant 3d tech illustration, ultra-vivid rich colors, bright studio lighting, sharp 8k focus, commercial technology magazine visual --no text, --no watermark, --no brand logos, --no dark depressing room, --no blurry, --no out of focus, --no low res`;

            const nativeGeminiModels = [
              "nano-banana-pro-preview",
              "gemini-3.1-flash-image",
              "gemini-3-pro-image",
              "gemini-2.5-flash-image"
            ];

            for (const modelName of nativeGeminiModels) {
              try {
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
                const res = await fetch(url, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    contents: [
                      {
                        parts: [{ text: masterPrompt }]
                      }
                    ]
                  })
                });

                if (res.ok) {
                  const data = await res.json();
                  const parts = data.candidates?.[0]?.content?.parts || [];
                  for (const p of parts) {
                    if (p.inlineData?.data) {
                      return {
                        base64: p.inlineData.data,
                        mimeType: p.inlineData.mimeType || "image/jpeg"
                      };
                    }
                  }
                }
              } catch (err) {
                console.warn(`Native Gemini image model ${modelName} failed:`, err);
              }
            }

            return null;
          }

          // ── STEP 5: Creative Cover Image(s) ─────────────────────────
          if (generateImage) {
            const count = Math.min(Math.max(Number(reqBody.imageCount) || 1, 1), 3);
            controller.enqueue(
              encoder.encode(
                JSON.stringify({
                  type: "step",
                  step: 5,
                  message: `Crafting Master Dataquest 3D Cover Visual & Generating ${count} High-Impact Image(s)...`,
                }) + "\n"
              )
            );

            // 🎨 Master AI Visual Art Director (Dataquest Editorial 3D Conceptual Art Formula)
            let masterArtPrompt = pkgV11.header_image_prompt || "";
            try {
              const visualDirector = genAI.getGenerativeModel({
                model: "gemini-3.5-flash",
                generationConfig: { temperature: 0.7 },
              });
              const artPromptRes = await visualDirector.generateContent(
                `You are the Chief Creative Officer for Dataquest India & CyberMedia publications (${mag.name}).
Study this article and create a vibrant, high-contrast, breathtaking 16:9 editorial cover illustration prompt.

ARTICLE HEADLINE: "${newsData.headline}"
SUBHEADLINE: "${newsData.subheadline || ""}"
PRESS RELEASE SUMMARY: "${pressRelease.slice(0, 600)}"

DATAQUEST VISUAL COVER ART FORMULA:
1. CONCEPTUAL & HIGH IMPACT: Do NOT generate dull, flat, out-of-focus portraits or dark dim room photos. Create a vibrant 3D tech conceptual illustration or high-contrast digital visual (Unreal Engine 5 style / Octane Render).
2. CORE VISUAL SUBJECTS: Visually depict the key subjects of THIS article with rich detail:
   - Example 1 (AI Education): Indian students enthusiastically using laptops with a glowing friendly blue AI sphere mascot floating between them, with colorful glowing floating icons for Q&A, math formulas, digital learning graphics.
   - Example 2 (Automotive AI): Sleek luxury sports car connected to a glowing 3D AI neural brain in a high-tech facility.
   - Example 3 (Semiconductors): Engineers in clean suits working on glowing microchips or silicon wafers with cyan data streams.
3. LIGHTING & COLOR: Ultra-vivid saturated colors (cyan, gold, royal blue, amber), bright warm lighting, sharp 8k focus, glossy commercial tech magazine cover quality.
4. NEGATIVE RULES: "--no text, --no watermark, --no brand logos, --no dark depressing room, --no blurry, --no out of focus, --no low res".

Output ONLY the final English prompt string without any introductory text. Max 80 words.`
              );
              const generatedPromptText = artPromptRes.response.text().trim();
              if (generatedPromptText && generatedPromptText.length > 20) {
                masterArtPrompt = generatedPromptText.replace(/^["']|["']$/g, "");
              }
            } catch (promptErr) {
              console.warn("AI Visual Director failed, using fallback prompt:", promptErr);
            }

            if (!masterArtPrompt) {
              masterArtPrompt = `Vibrant 3D tech conceptual illustration representing ${newsData.headline}, glowing holographic icons, bright warm lighting, ultra-vivid colors, octane render, 8k resolution`;
            }

            const imageSpecs = [
              {
                title: "Header Cover Banner (16:9)",
                prompt: masterArtPrompt
              },
              {
                title: "In-Article Feature Graphic",
                prompt: `Vivid 3D conceptual visual of ${newsData.headline}, glowing neon accents, modern enterprise technology, octane render 8k`
              },
              {
                title: "Technical Overview Infographic",
                prompt: `Sleek high-tech 3D render illustrating ${newsData.headline}, bright cyan and gold lighting, futuristic digital architecture`
              }
            ];

            const generatedImages = [];
            for (let i = 0; i < count; i++) {
              const spec = imageSpecs[i];
              const imgResult = await fetchBase64Image(spec.prompt);
              if (imgResult) {
                generatedImages.push({
                  title: spec.title,
                  prompt: spec.prompt,
                  mimeType: imgResult.mimeType,
                  base64: imgResult.base64,
                });
              }
            }

            if (generatedImages.length > 0) {
              controller.enqueue(
                encoder.encode(
                  JSON.stringify({
                    type: "data",
                    key: "creative",
                    data: {
                      base64: generatedImages[0].base64,
                      mimeType: generatedImages[0].mimeType,
                      images: generatedImages,
                    },
                  }) + "\n"
                )
              );
            }
          }

          // Complete
          controller.enqueue(encoder.encode(JSON.stringify({ type: "done" }) + "\n"));
          controller.close();
        } catch (err: any) {
          console.error("Pipeline execution error:", err);
          controller.enqueue(
            encoder.encode(
              JSON.stringify({ type: "error", message: err.message || "An unexpected generation error occurred." }) + "\n"
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "application/x-ndjson",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server Error" }, { status: 500 });
  }
}
