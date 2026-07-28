import { GoogleGenerativeAI, SchemaType, Schema } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { getLocalArticlesForCompany } from "@/lib/pcquestArticles";
import { getDQArticlesForCompany } from "@/lib/dqindiaArticles";
import { getVnDArticlesForCompany } from "@/lib/voicendataArticles";
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
      if (char === '\n') {
        escaped += '\\n';
      } else if (char === '\r') {
        escaped += '\\r';
      } else if (char === '\t') {
        escaped += '\\t';
      } else {
        escaped += char;
      }
    } else {
      escaped += char;
    }
  }
  return escaped;
}

function saveErrorLog(text: string) {
  try {
    const fs = require('fs');
    fs.writeFileSync('/Users/Apple/Desktop/AI Article Genrator/error-raw-output.txt', text, 'utf8');
  } catch (fsErr) {
    console.error("Failed to write error-raw-output.txt", fsErr);
  }
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
  // Remove markdown code block wrappers if present
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  }
  // Extract the first mathematically balanced JSON object
  cleaned = extractFirstJSONObject(cleaned);
  // Escape raw newlines inside string values
  cleaned = escapeRawNewlinesInJSON(cleaned);
  return JSON.parse(cleaned);
}

async function getMagazineReferences(
  company: string,
  topic: string,
  magazineKey: MagazineKey
) {
  const articles: { title: string; url: string; snippet: string }[] = [];
  const mag = magazines[magazineKey];

  // 1. Get from local DB (instant, high accuracy for samples)
  if (company) {
    let local: { title: string; url: string; snippet: string }[] = [];
    if (magazineKey === "PCQuest") {
      local = getLocalArticlesForCompany(company);
    } else if (magazineKey === "DataQuest") {
      local = getDQArticlesForCompany(company);
    } else if (magazineKey === "VoiceData") {
      local = getVnDArticlesForCompany(company);
    }
    articles.push(...local);
  }

  // 2. Scan live sitemap index for recent articles (free, real-time)
  try {
    const sitemapRes = await fetch(mag.sitemapUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    if (sitemapRes.ok) {
      const sitemapXml = await sitemapRes.text();
      const subSitemaps = [...sitemapXml.matchAll(/<loc>([^<]+sitemap[^<]*\.xml)<\/loc>/g)].map(m => m[1]);

      const targetSubSitemaps = subSitemaps.slice(0, 3);
      for (const subUrl of targetSubSitemaps) {
        try {
          const subRes = await fetch(subUrl, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
          });
          if (subRes.ok) {
            const subXml = await subRes.text();
            const urls = [...subXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
            for (const url of urls) {
              const slug = url.substring(url.lastIndexOf("/") + 1).toLowerCase();
              const cleanCompany = company.toLowerCase().replace(/[^a-z0-9]/g, "");
              if (cleanCompany && slug.includes(cleanCompany)) {
                const titlePart = slug.replace(/-\d+$/, "");
                const title = titlePart.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
                if (!articles.some(a => a.url === url)) {
                  articles.push({
                    title,
                    url,
                    snippet: `Recent coverage about ${company} on ${mag.name}.`
                  });
                }
              }
            }
          }
        } catch (subErr) {
          console.error("Error reading daily sitemap:", subUrl, subErr);
        }
      }
    }
  } catch (sitemapErr) {
    console.error("Error scanning sitemaps:", sitemapErr);
  }

  // 3. Optional: Tavily API Search if TAVILY_API_KEY is configured
  const tavilyKey = process.env.TAVILY_API_KEY;
  if (tavilyKey && company) {
    try {
      const queryStr = `site:${mag.domain} ${company} ${topic}`;
      const tavilyRes = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: tavilyKey,
          query: queryStr,
          include_domains: [mag.domain],
          max_results: 5
        })
      });
      if (tavilyRes.ok) {
        const tavilyData = await tavilyRes.json();
        if (tavilyData.results && Array.isArray(tavilyData.results)) {
          for (const res of tavilyData.results) {
            if (!articles.some(a => a.url === res.url)) {
              articles.push({
                title: res.title || `${mag.name} Coverage`,
                url: res.url,
                snippet: res.content || ""
              });
            }
          }
        }
      }
    } catch (tavilyErr) {
      console.error("Tavily Search API failed:", tavilyErr);
    }
  }

  return articles.slice(0, 5);
}

export async function POST(req: NextRequest) {
  try {
    const { pressRelease, customApiKey, topicType, minWords, maxWords, customPrompt, generateImage, humanize = true, referencePCQuest = true, magazine: rawMagazine } = await req.json();
    const magazine: MagazineKey = (rawMagazine as MagazineKey) || "PCQuest";
    const mag = magazines[magazine];

    if (!pressRelease || pressRelease.trim() === "") {
      return NextResponse.json(
        { error: "Press release content is required." },
        { status: 400 }
      );
    }

    const apiKey = customApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === "") {
      return NextResponse.json(
        {
          error:
            "Gemini API Key is missing. Please set the GEMINI_API_KEY environment variable or enter it in the top settings panel.",
        },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-3.5-flash for speed and cost efficiency, suited for text transformation and schema outputs.
    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: humanize ? 0.7 : 0.1,
      },
    });

    const humanizeInstructions = `
1. **Banish Formal AI Signposts and Templates**:
   - Do NOT start sentences with passive participial phrases (e.g., "Organised by...", "Presented by...").
   - Do NOT use typical AI demonstrative summaries (e.g., "This high-profile panel reflects...", "This development comes as...", "This launch aligns...", "This initiative is designed to..."). Instead, start sentences directly with the action, subject, or a quick active clause.
   - Do NOT start sentences with generic temporal signposts (e.g., "During the ceremony...", "At the time...").
2. **Use Natural Conversational Contractions & Ticks**:
   - Write using natural contractions (e.g., use "it's", "doesn't", "we've", "there's", "they're", "you'll") to mimic authentic human writing. AI models rarely output contractions.
   - Use human-like conversational transitions occasionally (e.g. "Let's face it,", "Here's the catch,", "So what?", "Think about it:").
3. **Banish Parallel List Grammars**:
   - Do NOT use typical AI three-part list sentences (e.g., "They struggle with scaling, marketing, and hiring"). Instead, force the model to split list items into individual short, punchy sentences. E.g. "They struggle to find product-market fit. Scaling is a nightmare. Finding customers is even harder."
4. **Banish Biography Templates & Clichés**:
   - Do NOT use standard biographical transitions like "[Name]'s journey mirrors the evolution of...", "cut his teeth...", "[Name]'s story is a testament to...". State facts directly and informally.
5. **Strictly Ban AI Cliches & Buzzwords**:
   - Do NOT use any of the following terms or phrases: "furthermore", "moreover", "delve", "testament", "not only... but also", "crucial", "revolutionize", "groundbreaking", "beacon", "pivotal", "transformative", "seeks to", "aims to", "tapestry", "landscape", "in conclusion", "it is worth noting", "underscores", "spearheading", "empower", "unlock", "harness", "meticulously", "seamlessly", "depend heavily on", "cultivate a robust".
6. **Vary Sentence Length and Structure (Burstiness) & Punctuation**:
   - Mix extremely short, punchy sentences (3-8 words) with medium and longer ones.
   - Banish uniform sentence rhythms. Keep sentence lengths highly irregular.
   - Avoid starting consecutive sentences with the same grammatical structure or subject.
   - Use human-like punctuation such as em-dashes (—), colons, or parentheses for brief side-notes.
7. **Use Active Voice & Direct Storytelling**:
   - Write in a direct, engaging journalistic/blogging voice, explaining the news simply and dynamically.
   - Avoid complex, academic noun piles (e.g., replace "private sector mentorship in driving economic growth" with "mentoring's impact on business growth" or "how private business leaders can help new startups").
8. **100% Plagiarism-Free Rephrasing**:
   - Synthesize and rewrite the core facts and metrics from scratch. Never copy phrasing or clause structures from the original press release.
9. **Headline & Subheadline Guidelines (Crucial to bypass ZeroGPT)**:
   - Do NOT use typical academic templates like "Why [X] Marks a Shift...", "How [X] Influences [Y]", or conditional setups like "As [condition] remains high, [subject] are turning to...".
   - Banish dry, passive, or overly formal summaries.
   - Headlines must be active, punchy, conversational, and direct (e.g., "To rescue failing startups, India recruits corporate old-timers" or "Pradeep Gupta wins India's first-ever private mentoring award").
   - Subheadlines must be direct active statements, avoiding complex clauses and passive/participial setups.
`;

    const newsSchema: Schema = {
      type: SchemaType.OBJECT,
      properties: {
        headline: { type: SchemaType.STRING },
        subheadline: { type: SchemaType.STRING },
        article: { type: SchemaType.STRING },
        category: { type: SchemaType.STRING },
        tags: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        faq: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              question: { type: SchemaType.STRING },
              answer: { type: SchemaType.STRING }
            },
            required: ["question", "answer"]
          }
        }
      },
      required: ["headline", "subheadline", "article", "category", "tags", "faq"]
    };

    const seoSchema: Schema = {
      type: SchemaType.OBJECT,
      properties: {
        seo_title: { type: SchemaType.STRING },
        meta_description: { type: SchemaType.STRING },
        slug: { type: SchemaType.STRING },
        primary_keyword: { type: SchemaType.STRING },
        keywords: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        semantic_keywords: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
      },
      required: ["seo_title", "meta_description", "slug", "primary_keyword", "keywords", "semantic_keywords"]
    };

    const impactSchema: Schema = {
      type: SchemaType.OBJECT,
      properties: {
        why_it_matters: { type: SchemaType.STRING },
        industries_affected: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        business_impact: { type: SchemaType.STRING },
        technology_impact: { type: SchemaType.STRING },
        competitive_landscape: { type: SchemaType.STRING }
      },
      required: ["why_it_matters", "industries_affected", "business_impact", "technology_impact", "competitive_landscape"]
    };

    const interviewSchema: Schema = {
      type: SchemaType.OBJECT,
      properties: {
        candidates: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        questions: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        follow_up_stories: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
      },
      required: ["candidates", "questions", "follow_up_stories"]
    };

    const reviewSchema: Schema = {
      type: SchemaType.OBJECT,
      properties: {
        marketing_claims: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        missing_data: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        customer_reference_gaps: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        india_relevance: { type: SchemaType.STRING },
        fact_check_items: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        reporting_conflicts: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
      },
      required: ["marketing_claims", "missing_data", "customer_reference_gaps", "india_relevance", "fact_check_items", "reporting_conflicts"]
    };

    const socialSchema: Schema = {
      type: SchemaType.OBJECT,
      properties: {
        linkedin_post: { type: SchemaType.STRING },
        twitter_post: { type: SchemaType.STRING }
      },
      required: ["linkedin_post", "twitter_post"]
    };

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          let pcQuestArticles: { title: string; url: string; snippet: string }[] = [];
          
          if (referencePCQuest) {
            controller.enqueue(
              encoder.encode(
                JSON.stringify({
                  type: "step",
                  step: 1,
                  message: `Cross-referencing ${mag.name} coverage...`,
                }) + "\n"
              )
            );

            // 1. Extract company name and topic from PR using Gemini
            let company = "";
            let topic = "";
            try {
              const extractionModel = genAI.getGenerativeModel({
                model: "gemini-3.5-flash",
                generationConfig: {
                  responseMimeType: "application/json",
                  temperature: 0.1,
                },
              });
              const extractionPrompt = `Analyze this press release and extract the main organization/company/entity name it focuses on (e.g. "HP", "Infosys", "Deloitte") and a 1-3 word main topic. Respond ONLY with a JSON object in this format: {"company": "extracted company name", "topic": "extracted topic"}.
              
              Press Release:
              ${pressRelease}`;
              
              const extractRes = await extractionModel.generateContent(extractionPrompt);
              const text = extractRes.response.text();
              const obj = cleanAndParseJson(text);
              company = obj.company || "";
              topic = obj.topic || "";
              console.log("Extracted company:", company, "topic:", topic);
            } catch (err) {
              console.error("Failed to extract company/topic via Gemini:", err);
            }

            // 2. Fetch magazine reference articles
            if (company) {
              pcQuestArticles = await getMagazineReferences(company, topic, magazine);
              console.log(`Found ${mag.name} articles:`, pcQuestArticles.length);
            }
          }

          // Build referencesPrompt
          let referencesPrompt = "";
          if (referencePCQuest && pcQuestArticles.length > 0) {
            referencesPrompt = `\n\nRelated ${mag.name} Articles (Cross-Referencing Guidance):
We have fetched the following actual related articles from ${mag.name}. If any of them are contextually relevant to the paragraphs or topics you are generating, you must naturally embed a markdown reference link inside the article text (e.g., "[Click Here](URL)" or "[Anchor Text](URL)"). Do not reference articles that are not related, and do not make up or hallucinate URLs. ONLY use the exact URLs provided in this list.
${pcQuestArticles.map((a, idx) => `${idx + 1}. Title: "${a.title}"\n   URL: ${a.url}\n   Snippet: ${a.snippet}`).join("\n")}
`;
          }

          // Define workflows based on topicType
          let steps: { key: string; name: string; prompt: string; schema: Schema }[] = [];

          if (topicType === "Interview") {
            steps = [
              {
                key: "news",
                name: `Refining press release into interview article...`,
                schema: newsSchema,
                prompt: `Convert this press release into an engaging, SEO-optimised interview-style or Q&A article.

## SEO STRUCTURE RULES (MANDATORY — do not skip any):
1. HEADING HIERARCHY: Use "# [Headline]" as the single H1, "## [Section Title]" for major sections (minimum 3), and "### [Sub-section]" for sub-points where applicable.
2. PRIMARY KEYWORD: Identify the single most important search keyword from the topic. Include it naturally within the FIRST 100 WORDS of the article and in at least 2 H2 subheadings.
3. STRONG INTRO (first 60-80 words): Open with a punchy hook sentence stating the key news fact, followed by 1-2 sentences of context. The primary keyword MUST appear here.
4. STRUCTURED Q&A BODY: After the intro paragraph, present a structured Q&A with "## Q: [Question]" and "**A:** [Answer]" format. Minimum 5 Q&A pairs. Each question should target a natural long-tail search query a reader might ask.
5. STRONG CONCLUSION (last 80-100 words): End with a "## What This Means" or "## Key Takeaway" section summarising the significance and a subtle forward-looking statement.
6. FAQ SECTION (MANDATORY): After the conclusion, add a "## Frequently Asked Questions" section with exactly 4 Q&A pairs. Each question must target a different long-tail search query related to the article topic. Answers should be 2-4 sentences.
7. KEYWORD DENSITY: Use the primary keyword and closely related terms naturally throughout. Target 1–1.5% keyword density. Never keyword-stuff.
8. ARTICLE LENGTH: Keep total article length between ${minWords || 600}–${maxWords || 800} words (excluding FAQ section).
${customPrompt ? `\n## CUSTOM EDITORIAL GUIDELINES:\n${customPrompt}\n` : ""}
${humanize ? `\n## HUMANIZATION GUIDELINES (To bypass AI content detectors):\n${humanizeInstructions}` : ""}

Press Release:
${pressRelease}

Expected JSON Schema:
{
  "headline": "string (primary keyword near the start, max 70 chars)",
  "subheadline": "string (secondary keyword, max 120 chars)",
  "article": "string (full markdown article with H1/H2/H3 headings, Q&A body, conclusion, and FAQ section at bottom)",
  "category": "string",
  "tags": ["string"],
  "faq": [{"question": "string", "answer": "string"}]
}`
              },
              {
                key: "interview",
                name: "Formulating interview queries and angles...",
                schema: interviewSchema,
                prompt: `Analyze this interview article and suggest follow-up interview angles and prep material.

Article:
Headline: \${headline}
Subheadline: \${subheadline}
Article: \${article}

Requirements:
- Identify potential interview candidates (executive roles, specific stakeholders, analysts).
- List exactly 10 high-quality, non-generic interview questions testing technical depth and strategic directions.
- Propose 3 follow-up investigative story opportunities.
${humanize ? `\nStylistic Guidelines (To bypass AI content detectors and ensure uniqueness):\n${humanizeInstructions}` : ""}

Expected JSON Schema:
{
  "candidates": ["string"],
  "questions": ["string"],
  "follow_up_stories": ["string"]
}`
              },
              {
                key: "seo",
                name: "Optimizing content and generating SEO assets...",
                schema: seoSchema,
                prompt: `Generate comprehensive SEO meta assets for this interview article.

Article:
Headline: \${headline}
Subheadline: \${subheadline}
Article: \${article}

SEO Requirements:
- PRIMARY KEYWORD: Identify the single highest-value search keyword for this article (2-4 words ideally). This must appear in the seo_title.
- SEO TITLE: Compelling, under 60 characters, starts with or prominently features the primary keyword. Must be click-worthy.
- META DESCRIPTION: 140-160 characters. Include the primary keyword, communicate the key value/finding, and end with a subtle hook. Must be unique and non-generic.
- URL SLUG: Lowercase, hyphens only, 3-6 words, built around the primary keyword.
- FOCUS KEYWORDS: 6-10 specific keywords a user might search for to find this content.
- SEMANTIC KEYWORDS: 5-8 LSI (Latent Semantic Indexing) related terms and phrases that support the primary topic and help with topical authority. These should be variations, synonyms, and closely related concepts — NOT the same as focus keywords.

Expected JSON Schema:
{
  "seo_title": "string",
  "meta_description": "string",
  "slug": "string",
  "primary_keyword": "string",
  "keywords": ["string"],
  "semantic_keywords": ["string"]
}`
              }
            ];
          } else if (topicType === "Opinion") {
            steps = [
              {
                key: "news",
                name: `Refining press release into opinion piece...`,
                schema: newsSchema,
                prompt: `Convert this press release into an engaging, SEO-optimised opinion piece or expert editorial.

## SEO STRUCTURE RULES (MANDATORY — do not skip any):
1. HEADING HIERARCHY: Use "# [Headline]" as the single H1, "## [Section Title]" for major argument sections (minimum 3), and "### [Sub-point]" where needed.
2. PRIMARY KEYWORD: Identify the single most important search keyword. Include it within the FIRST 100 WORDS and in at least 2 H2 subheadings.
3. STRONG HOOK INTRO (60-80 words): Open with a bold, opinionated hook sentence stating your editorial stance directly. Include the primary keyword. Follow with 1-2 sentences of supporting context.
4. STRUCTURED ARGUMENT BODY: Each "## Section" must advance a specific argument point. Back each claim with a fact, statistic, or industry example.
5. COUNTER-ARGUMENT SECTION ("## The Other Side"): Include at least one section that steelmans the opposing view, then rebuts it. This builds topical authority.
6. STRONG CONCLUSION ("## The Bottom Line"): End with a direct 2-3 sentence summary of the editorial stance and a clear forward-looking statement. Include primary keyword.
7. FAQ SECTION (MANDATORY at the end): "## Frequently Asked Questions" with exactly 4 Q&A pairs targeting long-tail search queries around the opinion topic. Answers: 2-4 sentences.
8. ARTICLE LENGTH: ${minWords || 600}–${maxWords || 800} words (excluding FAQ).
${customPrompt ? `\n## CUSTOM EDITORIAL GUIDELINES:\n${customPrompt}\n` : ""}
${humanize ? `\n## HUMANIZATION GUIDELINES:\n${humanizeInstructions}` : ""}

Press Release:
${pressRelease}

Expected JSON Schema:
{
  "headline": "string (opinionated, includes primary keyword, max 70 chars)",
  "subheadline": "string (editorial stance summary, max 120 chars)",
  "article": "string (full markdown article with H1/H2/H3 structure, counter-argument, conclusion, and FAQ)",
  "category": "string",
  "tags": ["string"],
  "faq": [{"question": "string", "answer": "string"}]
}`
              },
              {
                key: "seo",
                name: "Optimizing content and generating SEO assets...",
                schema: seoSchema,
                prompt: `Generate comprehensive SEO meta assets for this editorial article.

Article:
Headline: \${headline}
Subheadline: \${subheadline}
Article: \${article}

SEO Requirements:
- PRIMARY KEYWORD: The single highest-value search keyword for this opinion piece (2-4 words). Must appear in seo_title.
- SEO TITLE: Under 60 characters, starts with or prominently features the primary keyword. Click-worthy and opinionated.
- META DESCRIPTION: 140-160 characters. Include primary keyword, communicate the editorial stance, end with a hook. Non-generic.
- URL SLUG: Lowercase, hyphens only, 3-6 words, primary keyword-based.
- FOCUS KEYWORDS: 6-10 specific keywords.
- SEMANTIC KEYWORDS: 5-8 LSI related terms and phrases that support topical authority.

Expected JSON Schema:
{
  "seo_title": "string",
  "meta_description": "string",
  "slug": "string",
  "primary_keyword": "string",
  "keywords": ["string"],
  "semantic_keywords": ["string"]
}`
              },
              {
                key: "review",
                name: "Running quality review and checking claims...",
                schema: reviewSchema,
                prompt: `Perform an editorial review of the opinion article based on the original press release.

Article:
Headline: \${headline}
Subheadline: \${subheadline}
Article: \${article}

Original Press Release:
${pressRelease}

Requirements:
- Flag any excessive marketing/hype claims that remain or were in the original.
- Note missing data points or metrics that would improve the article.
- Note any gaps in customer/partner references.
- Assess the relevance and context provided for the Indian market.
- Detail potential items that require fact-checking or verification.
- Detail potential conflicts with previous industry reporting, established facts, or historical timelines.
${humanize ? `\nStylistic Guidelines (To bypass AI content detectors and ensure uniqueness):\n${humanizeInstructions}` : ""}

Expected JSON Schema:
{
  "marketing_claims": ["string"],
  "missing_data": ["string"],
  "customer_reference_gaps": ["string"],
  "india_relevance": "string",
  "fact_check_items": ["string"],
  "reporting_conflicts": ["string"]
}`
              }
            ];
          } else if (topicType === "Feature") {
            steps = [
              {
                key: "news",
                name: `Refining press release into deep-dive feature...`,
                schema: newsSchema,
                prompt: `Convert this press release into a comprehensive, SEO-optimised long-form tech feature story or deep dive.

## SEO STRUCTURE RULES (MANDATORY — do not skip any):
1. HEADING HIERARCHY: Use "# [Headline]" as the single H1, "## [Section Title]" for major topic sections (minimum 4-5), and "### [Sub-section]" for technical deep-dives within sections.
2. PRIMARY KEYWORD: Identify the single most important search keyword. Include it within the FIRST 100 WORDS and in at least 3 H2 subheadings across the feature.
3. STRONG HOOK INTRO (80-100 words): Open with a compelling scene-setter or surprising fact. State the key development. Include primary keyword. Then provide 2 sentences of industry context.
4. DEEP-DIVE BODY: Each "## Section" must cover a distinct aspect: e.g. "## How It Works", "## Market Context", "## Why India Matters Here", "## Who Benefits", "## Challenges Ahead". Each section: 150-200 words minimum.
5. DATA & SPECIFICS: Every section must include at least one specific statistic, market figure, or technical detail. Vague claims are not acceptable.
6. STRONG CONCLUSION ("## The Bigger Picture"): 80-100 words. Synthesise the key insights and end with a forward-looking statement about the topic's trajectory.
7. FAQ SECTION (MANDATORY at the end): "## Frequently Asked Questions" with exactly 5 Q&A pairs. Questions must target long-tail search queries a reader researching this topic would ask. Answers: 3-5 sentences each.
8. ARTICLE LENGTH: ${minWords || 900}–${maxWords || 1400} words (excluding FAQ section).
${customPrompt ? `\n## CUSTOM EDITORIAL GUIDELINES:\n${customPrompt}\n` : ""}
${humanize ? `\n## HUMANIZATION GUIDELINES:\n${humanizeInstructions}` : ""}

Press Release:
${pressRelease}

Expected JSON Schema:
{
  "headline": "string (primary keyword near start, compelling, max 70 chars)",
  "subheadline": "string (supporting keyword, value proposition clear, max 130 chars)",
  "article": "string (full markdown feature with H1/H2/H3 structure, data points, conclusion, and FAQ at end)",
  "category": "string",
  "tags": ["string"],
  "faq": [{"question": "string", "answer": "string"}]
}`
              },
              {
                key: "impact",
                name: "Analyzing industry, business, and tech implications...",
                schema: impactSchema,
                prompt: `Explain the broader implications of this announcement.

Article:
Headline: \${headline}
Subheadline: \${subheadline}
Article: \${article}

Requirements:
- Explain why this announcement matters to the industry.
- List which industries are affected.
- Describe the business implications (market size, revenue shift, corporate decisions).
- Describe the technology implications (architectural shifts, developer impact).
- Describe the competitive landscape (how competitors might react, who loses/wins).
${humanize ? `\nStylistic Guidelines (To bypass AI content detectors and ensure uniqueness):\n${humanizeInstructions}` : ""}

Expected JSON Schema:
{
  "why_it_matters": "string",
  "industries_affected": ["string"],
  "business_impact": "string",
  "technology_impact": "string",
  "competitive_landscape": "string"
}`
              },
              {
                key: "seo",
                name: "Optimizing content and generating SEO assets...",
                schema: seoSchema,
                prompt: `Generate comprehensive SEO meta assets for this long-form feature article.

Article:
Headline: \${headline}
Subheadline: \${subheadline}
Article: \${article}

SEO Requirements:
- PRIMARY KEYWORD: Single highest-value search keyword (2-4 words). Must appear in seo_title.
- SEO TITLE: Under 60 characters, primary keyword prominent, informative and click-worthy.
- META DESCRIPTION: 140-160 characters. Primary keyword included, explains the depth of coverage, ends with a curiosity hook.
- URL SLUG: Lowercase, hyphens only, 4-6 words, keyword-rich.
- FOCUS KEYWORDS: 8-10 specific target keywords for this content.
- SEMANTIC KEYWORDS: 6-8 LSI related terms, synonyms, and contextual phrases that support topical authority for this feature.

Expected JSON Schema:
{
  "seo_title": "string",
  "meta_description": "string",
  "slug": "string",
  "primary_keyword": "string",
  "keywords": ["string"],
  "semantic_keywords": ["string"]
}`
              }
            ];
          } else if (topicType === "CaseStudy") {
            steps = [
              {
                key: "news",
                name: `Refining press release into corporate case study...`,
                schema: newsSchema,
                prompt: `Convert this press release into a structured, SEO-optimised corporate case study.

## SEO STRUCTURE RULES (MANDATORY — do not skip any):
1. HEADING HIERARCHY: Use "# [Headline]" as H1. Use the mandatory H2 sections below. Use "### [Sub-point]" for specifics within sections.
2. PRIMARY KEYWORD: Identify the single most important search keyword (usually combines company name + outcome/technology). Include it within the FIRST 100 WORDS and in the H2 subheadings for CHALLENGE and RESULTS sections.
3. MANDATORY CASE STUDY STRUCTURE (use exactly these H2 headings in this order):
   - "## The Challenge" — Describe the problem the company faced. What was at stake? Include any relevant metrics on the difficulty (e.g. "costs were 40% above industry average").
   - "## The Solution" — How was the challenge addressed? What technology/approach/partner was involved? Be specific about features and implementation.
   - "## The Results" — Quantify outcomes with hard numbers wherever possible (%, time saved, revenue impact, scale achieved). This is the most SEO-valuable section.
   - "## Key Lessons" — 3-4 bullet points of transferable insights from this case study.
4. STRONG INTRO (60-80 words): Before the first H2, write a scene-setting paragraph naming the company, the problem, and the headline result. Include primary keyword.
5. STRONG CONCLUSION ("## What This Proves"): 60-80 words. Reinforce the key outcome and broaden its significance to the industry.
6. FAQ SECTION (MANDATORY at the end): "## Frequently Asked Questions" with exactly 4 Q&A pairs targeting long-tail queries someone researching this case study topic would ask.
7. ARTICLE LENGTH: ${minWords || 500}–${maxWords || 750} words (excluding FAQ).
${customPrompt ? `\n## CUSTOM EDITORIAL GUIDELINES:\n${customPrompt}\n` : ""}
${humanize ? `\n## HUMANIZATION GUIDELINES:\n${humanizeInstructions}` : ""}

Press Release:
${pressRelease}

Expected JSON Schema:
{
  "headline": "string (result-focused, primary keyword prominent, max 70 chars)",
  "subheadline": "string (company + key outcome summary, max 120 chars)",
  "article": "string (full markdown case study with H1, Challenge/Solution/Results/Lessons H2 sections, conclusion, and FAQ at end)",
  "category": "string",
  "tags": ["string"],
  "faq": [{"question": "string", "answer": "string"}]
}`
              },
              {
                key: "seo",
                name: "Optimizing content and generating SEO assets...",
                schema: seoSchema,
                prompt: `Generate comprehensive SEO meta assets for this case study.

Article:
Headline: \${headline}
Subheadline: \${subheadline}
Article: \${article}

SEO Requirements:
- PRIMARY KEYWORD: Single highest-value search keyword. Should combine the company/technology with the business outcome (e.g., "cloud migration cost savings"). Must appear in seo_title.
- SEO TITLE: Under 60 characters, result-focused, primary keyword prominent.
- META DESCRIPTION: 140-160 characters. Include primary keyword, highlight the quantified result, create curiosity.
- URL SLUG: Lowercase, hyphens only, 4-6 words, outcome-keyword-focused.
- FOCUS KEYWORDS: 6-10 specific keywords someone researching this case study would search.
- SEMANTIC KEYWORDS: 5-8 LSI terms (related technologies, industries, outcomes) supporting topical authority.

Expected JSON Schema:
{
  "seo_title": "string",
  "meta_description": "string",
  "slug": "string",
  "primary_keyword": "string",
  "keywords": ["string"],
  "semantic_keywords": ["string"]
}`
              },
              {
                key: "review",
                name: "Running quality review and checking claims...",
                schema: reviewSchema,
                prompt: `Perform an editorial review of the case study based on the original press release.

Article:
Headline: \${headline}
Subheadline: \${subheadline}
Article: \${article}

Original Press Release:
${pressRelease}

Requirements:
- Flag any excessive marketing/hype claims that remain or were in the original.
- Note missing data points or metrics that would improve the case study.
- Note any gaps in customer/partner references.
- Assess the relevance and context provided for the Indian market.
- Detail potential items that require fact-checking or verification.
- Detail potential conflicts with previous industry reporting, established facts, or historical timelines.
${humanize ? `\nStylistic Guidelines (To bypass AI content detectors and ensure uniqueness):\n${humanizeInstructions}` : ""}

Expected JSON Schema:
{
  "marketing_claims": ["string"],
  "missing_data": ["string"],
  "customer_reference_gaps": ["string"],
  "india_relevance": "string",
  "fact_check_items": ["string"],
  "reporting_conflicts": ["string"]
}`
              }
            ];
          } else {
            // Default: News / Dataquest News
            steps = [
              {
                key: "news",
                name: `Refining press release into news article...`,
                schema: newsSchema,
                prompt: `Convert this press release into a Dataquest-style news article that is fully optimised for SEO and Google ranking.

## SEO STRUCTURE RULES (MANDATORY — do not skip any):
1. HEADING HIERARCHY: Use "# [Headline]" as the single H1, "## [Section Title]" for major news sections (minimum 3), and "### [Sub-section]" for specifics. NEVER use flat paragraph-only structure.
2. PRIMARY KEYWORD: Identify the single most important search keyword. Include it within the FIRST 100 WORDS of the article and in at least 2 H2 subheadings.
3. INVERTED PYRAMID INTRO (60-80 words): The very first paragraph (before any H2) must answer Who, What, Where, When, Why — the most important fact first. Include primary keyword. Remove ALL marketing language.
4. STRUCTURED NEWS BODY: Use H2 sections such as "## What Happened", "## What This Means for the Industry", "## India Perspective", "## What Experts Are Saying" (if applicable), "## What Comes Next". Each section: 80-120 words minimum.
5. INDIA MARKET ANGLE: At least ONE dedicated H2 section must address India-specific implications, market context, or regional impact.
6. DATA-DRIVEN WRITING: Every section must include at least one specific fact, statistic, product detail, or market figure from the press release. No vague generalisations.
7. STRONG CONCLUSION ("## What This Means"): 60-80 words. Synthesise the development's significance and end with a forward-looking statement.
8. FAQ SECTION (MANDATORY at the end): "## Frequently Asked Questions" with exactly 4 Q&A pairs targeting long-tail search queries a reader would ask about this news. Answers: 2-4 sentences each.
9. REMOVE ALL MARKETING LANGUAGE: Strip phrases like "world-class", "industry-leading", "cutting-edge", "innovative solution", "best-in-class". Replace with neutral, factual language.
10. ARTICLE LENGTH: ${minWords || 550}–${maxWords || 750} words (excluding FAQ section).
${customPrompt ? `\n## CUSTOM EDITORIAL GUIDELINES:\n${customPrompt}\n` : ""}
${humanize ? `\n## HUMANIZATION GUIDELINES (To bypass AI content detectors):\n${humanizeInstructions}` : ""}

Press Release:
${pressRelease}

Expected JSON Schema:
{
  "headline": "string (primary keyword near start, news-focused, max 70 chars)",
  "subheadline": "string (supporting context, secondary keyword, max 130 chars)",
  "article": "string (full markdown article with # H1, ## H2 sections, conclusion, and FAQ at end)",
  "category": "string",
  "tags": ["string"],
  "faq": [{"question": "string", "answer": "string"}]
}`
              },
              {
                key: "seo",
                name: "Optimizing content and generating SEO assets...",
                schema: seoSchema,
                prompt: `Generate comprehensive SEO meta assets for this news article.

Article:
Headline: \${headline}
Subheadline: \${subheadline}
Article: \${article}

SEO Requirements:
- PRIMARY KEYWORD: The single highest-value search keyword for this news article (2-4 words ideally). This MUST appear in the seo_title.
- SEO TITLE: Under 60 characters. Starts with or prominently features the primary keyword. Must be click-worthy and news-oriented (use power words like "Launches", "Reveals", "Why", "How", numbers).
- META DESCRIPTION: 140-160 characters. Include primary keyword in first half. Communicate the key news fact. End with a subtle hook or question. Must be unique — NOT a copy of the headline.
- URL SLUG: Lowercase, hyphens only, 3-6 words, built around the primary keyword. No stop words.
- FOCUS KEYWORDS: 6-10 specific keywords a journalist or reader would search to find this article.
- SEMANTIC KEYWORDS: 5-8 LSI (Latent Semantic Indexing) related terms — synonyms, related products, technologies, industry terms — that strengthen topical authority. These must be different from focus keywords.

Expected JSON Schema:
{
  "seo_title": "string",
  "meta_description": "string",
  "slug": "string",
  "primary_keyword": "string",
  "keywords": ["string"],
  "semantic_keywords": ["string"]
}`
              },
              {
                key: "social",
                name: "Generating social media copy...",
                schema: socialSchema,
                prompt: `Generate engaging social media copy to promote this article on LinkedIn and Twitter/X.

Article:
Headline: \${headline}
Subheadline: \${subheadline}
Article: \${article}

Requirements:
- Generate 1 LinkedIn post: professional, engaging, highlighting key business value, with emojis and hashtags.
- Generate 1 Twitter/X post: punchy, under 280 characters, highly hooky, with hashtags.
${humanize ? `\nStylistic Guidelines (To bypass AI content detectors and ensure uniqueness):\n${humanizeInstructions}` : ""}

Expected JSON Schema:
{
  "linkedin_post": "string",
  "twitter_post": "string"
}`
              },
              {
                key: "review",
                name: "Running quality review and checking claims...",
                schema: reviewSchema,
                prompt: `Perform an editorial review of the news article based on the original press release.

Article:
Headline: \${headline}
Subheadline: \${subheadline}
Article: \${article}

Original Press Release:
${pressRelease}

Requirements:
- Flag any excessive marketing/hype claims that remain or were in the original.
- Note missing data points or metrics that would improve the article.
- Note any gaps in customer/partner references.
- Assess the relevance and context provided for the Indian market.
- Detail potential items that require fact-checking or verification.
- Detail potential conflicts with previous industry reporting, established facts, or historical timelines.
${humanize ? `\nStylistic Guidelines (To bypass AI content detectors and ensure uniqueness):\n${humanizeInstructions}` : ""}

Expected JSON Schema:
{
  "marketing_claims": ["string"],
  "missing_data": ["string"],
  "customer_reference_gaps": ["string"],
  "india_relevance": "string",
  "fact_check_items": ["string"],
  "reporting_conflicts": ["string"]
}`
              }
            ];
          }

          // Inject magazine editorial style + references into the "news" step prompt dynamically!
          const newsStep = steps.find(s => s.key === "news");
          if (newsStep) {
            // Always inject the magazine editorial style guide
            const editorialBlock = `\n\n${mag.editorialStyle}\n`;
            newsStep.prompt = newsStep.prompt.replace(
              "Press Release:",
              `${editorialBlock}\n\nPress Release:`
            );
            // Additionally inject reference articles if available
            if (referencePCQuest && pcQuestArticles.length > 0) {
              newsStep.prompt = newsStep.prompt.replace(
                "Press Release:",
                `${referencesPrompt}\n\nPress Release:`
              );
            }
          }

          let newsData: any = null;

          // Sequentially process each workflow step
          for (let i = 0; i < steps.length; i++) {
            const step = steps[i];

            // Inform client of active step execution
            controller.enqueue(
              encoder.encode(
                JSON.stringify({
                  type: "step",
                  step: i + 1,
                  message: step.name,
                }) + "\n"
              )
            );

            // Interpolate news article variables if it was already generated in Step 1
            let finalPrompt = step.prompt;
            if (newsData) {
              finalPrompt = finalPrompt
                .replace(/\$\{headline\}/g, newsData.headline || "")
                .replace(/\$\{subheadline\}/g, newsData.subheadline || "")
                .replace(/\$\{article\}/g, newsData.article || "");
            }

            const result = await model.generateContent({
              contents: [{ role: "user", parts: [{ text: finalPrompt }] }],
              generationConfig: {
                responseMimeType: "application/json",
                responseSchema: step.schema,
                temperature: humanize ? 0.7 : 0.1,
              }
            });

            const text = result.response.text();
            let parsedData;
            try {
              parsedData = cleanAndParseJson(text);
            } catch (e) {
              console.error(`Step parsing failed for key [${step.key}]. Raw output text:`, text);
              saveErrorLog(text);
              throw new Error(`Failed to parse generated ${step.key} into valid JSON. Raw output saved to error-raw-output.txt`);
            }

            if (step.key === "news") {
              newsData = parsedData;
            }

            // Stream parsed data block back to client
            controller.enqueue(
              encoder.encode(
                JSON.stringify({
                  type: "data",
                  step: i + 1,
                  key: step.key,
                  data: parsedData,
                }) + "\n"
              )
            );
          }

          // Optional Step: Cover Banner Creative Image
          if (generateImage && newsData) {
            const imageStepId = steps.length + 1;
            controller.enqueue(
              encoder.encode(
                JSON.stringify({
                  type: "step",
                  step: imageStepId,
                  message: "Generating creative cover banner image...",
                }) + "\n"
              )
            );

            try {
              const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`;
              const imagePrompt = `A high-quality enterprise news banner image. Flat minimalist vector art style, vibrant gradient background, representing: ${newsData.headline}. Tech, modern, clean, no text, no words, no letters.`;

              const imgBody = {
                instances: [
                  {
                    prompt: imagePrompt
                  }
                ],
                parameters: {
                  sampleCount: 1,
                  aspectRatio: "16:9"
                }
              };

              const imgRes = await fetch(url, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify(imgBody)
              });

              if (imgRes.ok) {
                const imgData = await imgRes.json();
                if (imgData.predictions && imgData.predictions.length > 0) {
                  const pred = imgData.predictions[0];
                  const base64 = pred.bytesBase64Encoded || (pred.image && pred.image.imageBytes);
                  const mimeType = pred.mimeType || "image/png";

                  if (base64) {
                    controller.enqueue(
                      encoder.encode(
                        JSON.stringify({
                          type: "data",
                          step: imageStepId,
                          key: "creative",
                          data: {
                            base64,
                            mimeType
                          }
                        }) + "\n"
                      )
                    );
                  }
                }
              } else {
                console.error("Imagen API call failed. Status:", imgRes.status, await imgRes.text());
              }
            } catch (imgErr) {
              console.error("Error during Imagen generation step:", imgErr);
            }
          }

          // Complete stream
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                type: "done",
              }) + "\n"
            )
          );
          controller.close();
        } catch (err: any) {
          console.error("Stream generation error:", err);
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                type: "error",
                message: err.message || "An unknown error occurred during generation.",
              }) + "\n"
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("API /api/generate master error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
