import { GoogleGenerativeAI, SchemaType, Schema } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

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

export async function POST(req: NextRequest) {
  try {
    const { pressRelease, customApiKey, topicType, minWords, maxWords, customPrompt, generateImage, humanize = true } = await req.json();

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
        tags: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
      },
      required: ["headline", "subheadline", "article", "category", "tags"]
    };

    const seoSchema: Schema = {
      type: SchemaType.OBJECT,
      properties: {
        seo_title: { type: SchemaType.STRING },
        meta_description: { type: SchemaType.STRING },
        slug: { type: SchemaType.STRING },
        keywords: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
      },
      required: ["seo_title", "meta_description", "slug", "keywords"]
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
        fact_check_items: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
      },
      required: ["marketing_claims", "missing_data", "customer_reference_gaps", "india_relevance", "fact_check_items"]
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
          // Define workflows based on topicType
          let steps: { key: string; name: string; prompt: string; schema: Schema }[] = [];

          if (topicType === "Interview") {
            steps = [
              {
                key: "news",
                name: `Refining press release into interview article...`,
                schema: newsSchema,
                prompt: `Convert this press release info into an engaging, structured interview-style or Q&A article.
Lead with a brief introductory overview paragraph, then present a structured Q&A format.
Requirements:
- Keep article length between ${minWords || 500}–${maxWords || 700} words.
${customPrompt ? `- Custom Guidelines: ${customPrompt}\n` : ""}- Suggest a strong headline and descriptive sub-headline.
- Suggest a category and list of tags.
${humanize ? `\nStylistic Guidelines (To bypass AI content detectors and ensure uniqueness):\n${humanizeInstructions}` : ""}

Press Release:
${pressRelease}

Expected JSON Schema:
{
  "headline": "string",
  "subheadline": "string",
  "article": "string (markdown formatted Q&A or transcript style)",
  "category": "string",
  "tags": ["string"]
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
                prompt: `Generate SEO meta assets for this interview article.

Article:
Headline: \${headline}
Subheadline: \${subheadline}
Article: \${article}

Requirements:
- Create an engaging SEO headline (under 60 characters).
- Create a meta description that summarizes the article (under 160 characters).
- Generate a clean, SEO-friendly URL slug.
- Identify 5-10 focus keywords.
${humanize ? `\nStylistic Guidelines (To bypass AI content detectors and ensure uniqueness):\n${humanizeInstructions}` : ""}

Expected JSON Schema:
{
  "seo_title": "string",
  "meta_description": "string",
  "slug": "string",
  "keywords": ["string"]
}`
              }
            ];
          } else if (topicType === "Opinion") {
            steps = [
              {
                key: "news",
                name: `Refining press release into opinion piece...`,
                schema: newsSchema,
                prompt: `Convert this press release info into an engaging, subjective opinion piece, editor's blog post, or expert analysis piece.
Use a strong, personalized perspective.
Requirements:
- Keep article length between ${minWords || 500}–${maxWords || 700} words.
${customPrompt ? `- Custom Guidelines: ${customPrompt}\n` : ""}- Suggest a strong headline and descriptive sub-headline.
- Suggest a category and list of tags.
${humanize ? `\nStylistic Guidelines (To bypass AI content detectors and ensure uniqueness):\n${humanizeInstructions}` : ""}

Press Release:
${pressRelease}

Expected JSON Schema:
{
  "headline": "string",
  "subheadline": "string",
  "article": "string (markdown formatted opinion post)",
  "category": "string",
  "tags": ["string"]
}`
              },
              {
                key: "seo",
                name: "Optimizing content and generating SEO assets...",
                schema: seoSchema,
                prompt: `Generate SEO meta assets for this editorial article.

Article:
Headline: \dots \${headline}
Subheadline: \dots \${subheadline}
Article: \dots \${article}

Requirements:
- Create an engaging SEO headline (under 60 characters).
- Create a meta description that summarizes the article (under 160 characters).
- Generate a clean, SEO-friendly URL slug.
- Identify 5-10 focus keywords.
${humanize ? `\nStylistic Guidelines (To bypass AI content detectors and ensure uniqueness):\n${humanizeInstructions}` : ""}

Expected JSON Schema:
{
  "seo_title": "string",
  "meta_description": "string",
  "slug": "string",
  "keywords": ["string"]
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
${humanize ? `\nStylistic Guidelines (To bypass AI content detectors and ensure uniqueness):\n${humanizeInstructions}` : ""}

Expected JSON Schema:
{
  "marketing_claims": ["string"],
  "missing_data": ["string"],
  "customer_reference_gaps": ["string"],
  "india_relevance": "string",
  "fact_check_items": ["string"]
}`
              }
            ];
          } else if (topicType === "Feature") {
            steps = [
              {
                key: "news",
                name: `Refining press release into deep-dive feature...`,
                schema: newsSchema,
                prompt: `Convert this press release info into a comprehensive, long-form tech feature story, explainer, or deep dive.
Requirements:
- Keep article length between ${minWords || 800}–${maxWords || 1200} words.
- Deeply explain the technical mechanics and market context.
${customPrompt ? `- Custom Guidelines: ${customPrompt}\n` : ""}- Suggest a strong headline and descriptive sub-headline.
- Suggest a category and list of tags.
${humanize ? `\nStylistic Guidelines (To bypass AI content detectors and ensure uniqueness):\n${humanizeInstructions}` : ""}

Press Release:
${pressRelease}

Expected JSON Schema:
{
  "headline": "string",
  "subheadline": "string",
  "article": "string (markdown formatted feature story)",
  "category": "string",
  "tags": ["string"]
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
                prompt: `Generate SEO meta assets for this feature article.

Article:
Headline: \${headline}
Subheadline: \${subheadline}
Article: \${article}

Requirements:
- Create an engaging SEO headline (under 60 characters).
- Create a meta description that summarizes the article (under 160 characters).
- Generate a clean, SEO-friendly URL slug.
- Identify 5-10 focus keywords.
${humanize ? `\nStylistic Guidelines (To bypass AI content detectors and ensure uniqueness):\n${humanizeInstructions}` : ""}

Expected JSON Schema:
{
  "seo_title": "string",
  "meta_description": "string",
  "slug": "string",
  "keywords": ["string"]
}`
              }
            ];
          } else if (topicType === "CaseStudy") {
            steps = [
              {
                key: "news",
                name: `Refining press release into corporate case study...`,
                schema: newsSchema,
                prompt: `Convert this press release info into a structured corporate case study.
Requirements:
- Organize the article text strictly into three core sections: CHALLENGE, SOLUTION, and RESULTS.
- Keep article length between ${minWords || 500}–${maxWords || 700} words.
${customPrompt ? `- Custom Guidelines: ${customPrompt}\n` : ""}- Suggest a strong headline and descriptive sub-headline.
- Suggest a category and list of tags.
${humanize ? `\nStylistic Guidelines (To bypass AI content detectors and ensure uniqueness):\n${humanizeInstructions}` : ""}

Press Release:
${pressRelease}

Expected JSON Schema:
{
  "headline": "string",
  "subheadline": "string",
  "article": "string (markdown formatted case study with CHALLENGE, SOLUTION, and RESULTS)",
  "category": "string",
  "tags": ["string"]
}`
              },
              {
                key: "seo",
                name: "Optimizing content and generating SEO assets...",
                schema: seoSchema,
                prompt: `Generate SEO meta assets for this case study.

Article:
Headline: \${headline}
Subheadline: \${subheadline}
Article: \${article}

Requirements:
- Create an engaging SEO headline (under 60 characters).
- Create a meta description that summarizes the case study (under 160 characters).
- Generate a clean, SEO-friendly URL slug.
- Identify 5-10 focus keywords.
${humanize ? `\nStylistic Guidelines (To bypass AI content detectors and ensure uniqueness):\n${humanizeInstructions}` : ""}

Expected JSON Schema:
{
  "seo_title": "string",
  "meta_description": "string",
  "slug": "string",
  "keywords": ["string"]
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
${humanize ? `\nStylistic Guidelines (To bypass AI content detectors and ensure uniqueness):\n${humanizeInstructions}` : ""}

Expected JSON Schema:
{
  "marketing_claims": ["string"],
  "missing_data": ["string"],
  "customer_reference_gaps": ["string"],
  "india_relevance": "string",
  "fact_check_items": ["string"]
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
                prompt: `Convert this press release into a Dataquest-style news article.
Requirements:
- Remove marketing language and hyperbolic claims.
- Lead with the most important business or technology development (invert the pyramid).
- Keep article length between ${minWords || 500}–${maxWords || 700} words.
${customPrompt ? `- Custom Guidelines: ${customPrompt}\n` : ""}- Include industry context and significance.
- Add relevant India market perspective and implications where applicable.
- Suggest a strong headline and descriptive sub-headline.
- Suggest a category and list of tags.
${humanize ? `\nStylistic Guidelines (To bypass AI content detectors and ensure uniqueness):\n${humanizeInstructions}` : ""}

Press Release:
${pressRelease}

Expected JSON Schema:
{
  "headline": "string",
  "subheadline": "string",
  "article": "string (markdown formatted paragraphs)",
  "category": "string",
  "tags": ["string"]
}`
              },
              {
                key: "seo",
                name: "Optimizing content and generating SEO assets...",
                schema: seoSchema,
                prompt: `Generate SEO meta assets for this news article.

Article:
Headline: \${headline}
Subheadline: \dots \${subheadline}
Article: \dots \${article}

Requirements:
- Create an engaging SEO headline (under 60 characters).
- Create a meta description that summarizes the article and encourages clicks (under 160 characters).
- Generate a clean, SEO-friendly URL slug.
- Identify 5-10 focus keywords.
${humanize ? `\nStylistic Guidelines (To bypass AI content detectors and ensure uniqueness):\n${humanizeInstructions}` : ""}

Expected JSON Schema:
{
  "seo_title": "string",
  "meta_description": "string",
  "slug": "string",
  "keywords": ["string"]
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
${humanize ? `\nStylistic Guidelines (To bypass AI content detectors and ensure uniqueness):\n${humanizeInstructions}` : ""}

Expected JSON Schema:
{
  "marketing_claims": ["string"],
  "missing_data": ["string"],
  "customer_reference_gaps": ["string"],
  "india_relevance": "string",
  "fact_check_items": ["string"]
}`
              }
            ];
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
