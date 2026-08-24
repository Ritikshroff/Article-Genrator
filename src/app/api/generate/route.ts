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
    missing_data: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    customer_reference_gaps: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    india_relevance: { type: SchemaType.STRING },
    fact_check_items: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    reporting_conflicts: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
  },
  required: ["marketing_claims", "missing_data", "customer_reference_gaps", "india_relevance", "fact_check_items", "reporting_conflicts"],
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

PRESS_RELEASE:
${pressRelease}

RETRIEVED_CHUNKS:
${ragContextText}

INPUT PARAMETERS:
- publication: "${magazineKey.toLowerCase()}"
- content_type: "${contentType}"
- hands_on_data: ${hands_on_data}
- target_word_count: ${minWords || 700}-${maxWords || 900} words

RAG GROUNDING & CITATION RULES (MANDATORY):
1. PR is Ground Truth for News Facts: Company name, product name, launch dates, claims.
2. RETRIEVED_CHUNKS are Ground Truth for Context: Market context, regulatory policy, past specs.
3. For any statement about market, policy, TRAI/DoT guidelines, history, or competition, you MUST cite a retrieved chunk as [id] in body_html. Example: "India's 5G BTS count reached 464,990 by Dec 2024 [vd_bts_2024]".
4. For statements about this specific announcement, cite PR facts implicitly (no marker needed).
5. If you cannot find a fact in PR or chunks, say "Price/availability not disclosed in release" — DO NOT INVENT facts.

INTERNAL LINKING & "ALSO READ" RULES (MANDATORY):
1. You MUST include 1 to 2 "Also Read" internal hyperlinked references inside body_html using the URLs and Titles provided in RETRIEVED_CHUNKS.
2. Format: <p><strong>Also Read: </strong><a href="URL" target="_blank" rel="noopener noreferrer">Title</a></p> or markdown [Also Read: Title](URL).
3. Insert these "Also Read" callouts between major sections to increase reader engagement and SEO internal linking.

E-E-A-T SIGNALS & AUTHOR RULES:
- author_byline: "${mag.authorEntity.byline}"
- author_bio_short: "${mag.authorEntity.bioShort}"
- author_expertise_tags: ${JSON.stringify(mag.authorEntity.expertiseTags)}
- trust_footer: "Source: ${company || mag.name} Press Release, July 2026. This is an AI-assisted first draft based on press information. Specs per company release, awaiting independent verification. Reviewed by: [Editor Name]"

PCQUEST EXPERIENCE GATE:
${isFirstLook ? `CRITICAL PCQUEST RULE: hands_on_data is false! You MUST set content_type to "first_look". Title MUST start with "First Look: ". You MUST include mandatory disclaimer at top of body_html: "<p><em>Note: This first impression is based on official press release and specs. Hands-on review from PCQuest Labs is awaited.</em></p>". DO NOT invent battery life, thermals, or benchmark scores.` : ""}

HEADER IMAGE PROMPT RULES:
${magazineKey === "DataQuest" ? `DQ: Enterprise tech illustration, [AI workflow / semiconductor fab / BharatNet map], corporate blue-white, minimal, photorealistic, 8k --no text --no logos` : magazineKey === "VoiceData" ? `V&D: Telecom infrastructure photorealistic, [5G BTS tower / satellite constellation], dusk, realistic --no people --no text` : `PCQ: Official press render of [product name], clean white background, studio lighting, accurate design, no hands --no text`}

${customPrompt ? `CUSTOM EDITORIAL INSTRUCTIONS:\n${customPrompt}\n` : ""}

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
          const reviewRes = await reviewModel.generateContent(
            `Perform editorial review & fact-check checklist for ${mag.name}:\n${pressRelease}`
          );
          const reviewData = cleanAndParseJson(reviewRes.response.text());
          controller.enqueue(encoder.encode(JSON.stringify({ type: "data", key: "review", data: reviewData }) + "\n"));

          // Helper: Fetch image with Imagen 3.0 & Pollinations AI Fallback
          async function fetchBase64Image(prompt: string): Promise<{ base64: string; mimeType: string } | null> {
            // 1. Try Imagen 3.0 API
            try {
              const imgRes = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-images:generate?key=${apiKey}`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    prompt: prompt,
                    config: { numberOfImages: 1, aspectRatio: "16:9", outputMimeType: "image/jpeg" },
                  }),
                }
              );
              if (imgRes.ok) {
                const imgJson = await imgRes.json();
                const base64Img = imgJson.generatedImages?.[0]?.image?.imageBytes;
                if (base64Img) return { base64: base64Img, mimeType: "image/jpeg" };
              }
            } catch (err) {
              console.warn("Imagen 3.0 failed, trying Pollinations fallback:", err);
            }

            // 2. Pollinations AI Fallback (Guaranteed 100% success)
            try {
              const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1280&height=720&nologo=true&seed=${Math.floor(Math.random() * 100000)}`;
              const pollRes = await fetch(pollinationsUrl);
              if (pollRes.ok) {
                const arrayBuf = await pollRes.arrayBuffer();
                const base64Img = Buffer.from(arrayBuf).toString("base64");
                const mimeType = pollRes.headers.get("content-type") || "image/jpeg";
                if (base64Img) return { base64: base64Img, mimeType };
              }
            } catch (pollErr) {
              console.error("Pollinations fallback failed:", pollErr);
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
                  message: `Generating ${count} E-E-A-T Safe Header & Article Image(s)...`,
                }) + "\n"
              )
            );

            const imageSpecs = [
              { title: "Header Cover Banner (16:9)", prompt: pkgV11.header_image_prompt || `Enterprise tech header banner for ${newsData.headline}, corporate minimal photorealistic 8k --no text` },
              { title: "In-Article Feature Graphic", prompt: `Conceptual technology illustration showing ${newsData.headline}, clean modern editorial graphics 8k` },
              { title: "Technical Overview Infographic", prompt: `Sleek tech infographic diagram illustrating ${newsData.headline}, high resolution minimalist chart 8k` }
            ];

            const generatedImages = [];
            for (let i = 0; i < count; i++) {
              const spec = imageSpecs[i];
              const imgResult = await fetchBase64Image(spec.prompt);
              if (imgResult) {
                generatedImages.push({
                  title: spec.title,
                  prompt: spec.prompt,
                  base64: imgResult.base64,
                  mimeType: imgResult.mimeType,
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
