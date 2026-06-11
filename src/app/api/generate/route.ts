import { GoogleGenerativeAI } from "@google/generative-ai";
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
    const { pressRelease, customApiKey } = await req.json();

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
        temperature: 0.1,
      },
    });

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // --- STEP 1: Generate News Article ---
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                type: "step",
                step: 1,
                message: "Refining press release into Dataquest-style news article...",
              }) + "\n"
            )
          );

          const newsPrompt = `Convert this press release into a Dataquest-style news article.

Requirements:
- Remove marketing language and hyperbolic claims.
- Lead with the most important business or technology development (invert the pyramid).
- Keep article length between 500–700 words.
- Include industry context and significance.
- Add relevant India market perspective and implications where applicable.
- Suggest a strong headline and descriptive sub-headline.
- Suggest a category and list of tags.

Press Release:
${pressRelease}

Expected JSON Schema:
{
  "headline": "string",
  "subheadline": "string",
  "article": "string (markdown formatted paragraphs)",
  "category": "string",
  "tags": ["string"]
}`;

          const newsResult = await model.generateContent(newsPrompt);
          const newsText = newsResult.response.text();
          let newsData;

          try {
            newsData = cleanAndParseJson(newsText);
          } catch (e) {
            console.error("News parsing failed. Raw text:", newsText);
            saveErrorLog(newsText);
            throw new Error(
              "Failed to parse generated news article into valid JSON. Raw output saved to error-raw-output.txt"
            );
          }

          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                type: "data",
                step: 1,
                key: "news",
                data: newsData,
              }) + "\n"
            )
          );

          // --- STEP 2: Generate SEO Metadata ---
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                type: "step",
                step: 2,
                message: "Optimizing content and generating SEO assets...",
              }) + "\n"
            )
          );

          const seoPrompt = `Generate SEO meta assets for this news article.

Article:
Headline: ${newsData.headline}
Subheadline: ${newsData.subheadline}
Article: ${newsData.article}

Requirements:
- Create an engaging SEO headline (under 60 characters).
- Create a meta description that summarizes the article and encourages clicks (under 160 characters).
- Generate a clean, SEO-friendly URL slug.
- Identify 5-10 focus keywords.

Expected JSON Schema:
{
  "seo_title": "string",
  "meta_description": "string",
  "slug": "string",
  "keywords": ["string"]
}`;

          const seoResult = await model.generateContent(seoPrompt);
          const seoText = seoResult.response.text();
          let seoData;

          try {
            seoData = cleanAndParseJson(seoText);
          } catch (e) {
            console.error("SEO parsing failed. Raw text:", seoText);
            saveErrorLog(seoText);
            throw new Error("Failed to parse generated SEO metadata into valid JSON. Raw output saved to error-raw-output.txt");
          }

          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                type: "data",
                step: 2,
                key: "seo",
                data: seoData,
              }) + "\n"
            )
          );

          // --- STEP 3: Generate Industry Impact Analysis ---
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                type: "step",
                step: 3,
                message: "Analyzing industry, business, and technology implications...",
              }) + "\n"
            )
          );

          const impactPrompt = `Explain the broader implications of this announcement.

Article:
Headline: ${newsData.headline}
Subheadline: ${newsData.subheadline}
Article: ${newsData.article}

Requirements:
- Explain why this announcement matters to the industry.
- List which industries are affected.
- Describe the business implications (market size, revenue shift, corporate decisions).
- Describe the technology implications (architectural shifts, developer impact).
- Describe the competitive landscape (how competitors might react, who loses/wins).

Expected JSON Schema:
{
  "why_it_matters": "string",
  "industries_affected": ["string"],
  "business_impact": "string",
  "technology_impact": "string",
  "competitive_landscape": "string"
}`;

          const impactResult = await model.generateContent(impactPrompt);
          const impactText = impactResult.response.text();
          let impactData;

          try {
            impactData = cleanAndParseJson(impactText);
          } catch (e) {
            console.error("Impact parsing failed. Raw text:", impactText);
            saveErrorLog(impactText);
            throw new Error("Failed to parse generated industry impact analysis into valid JSON. Raw output saved to error-raw-output.txt");
          }

          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                type: "data",
                step: 3,
                key: "impact",
                data: impactData,
              }) + "\n"
            )
          );

          // --- STEP 4: Generate Interview Opportunity Ideas ---
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                type: "step",
                step: 4,
                message: "Formulating interview queries and follow-up stories...",
              }) + "\n"
            )
          );

          const interviewPrompt = `Analyze the announcement and suggest interview angles.

Article:
Headline: ${newsData.headline}
Subheadline: ${newsData.subheadline}
Article: ${newsData.article}

Requirements:
- Identify potential interview candidates (executive roles, specific stakeholders, analysts).
- List exactly 10 high-quality, non-generic interview questions testing technical depth and strategic directions.
- Propose 3 follow-up investigative story opportunities.

Expected JSON Schema:
{
  "candidates": ["string"],
  "questions": ["string"],
  "follow_up_stories": ["string"]
}`;

          const interviewResult = await model.generateContent(interviewPrompt);
          const interviewText = interviewResult.response.text();
          let interviewData;

          try {
            interviewData = cleanAndParseJson(interviewText);
          } catch (e) {
            console.error("Interview parsing failed. Raw text:", interviewText);
            saveErrorLog(interviewText);
            throw new Error("Failed to parse interview opportunities into valid JSON. Raw output saved to error-raw-output.txt");
          }

          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                type: "data",
                step: 4,
                key: "interview",
                data: interviewData,
              }) + "\n"
            )
          );

          // --- STEP 5: Generate Editorial Review ---
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                type: "step",
                step: 5,
                message: "Running quality review and flagging issues...",
              }) + "\n"
            )
          );

          const reviewPrompt = `Perform an editorial review of the news article based on the original press release.

Article:
Headline: ${newsData.headline}
Subheadline: ${newsData.subheadline}
Article: ${newsData.article}

Original Press Release:
${pressRelease}

Requirements:
- Flag any excessive marketing/hype claims that remain or were in the original.
- Note missing data points or metrics that would improve the article.
- Note any gaps in customer/partner references.
- Assess the relevance and context provided for the Indian market.
- Detail potential items that require fact-checking or verification.

Expected JSON Schema:
{
  "marketing_claims": ["string"],
  "missing_data": ["string"],
  "customer_reference_gaps": ["string"],
  "india_relevance": "string",
  "fact_check_items": ["string"]
}`;

          const reviewResult = await model.generateContent(reviewPrompt);
          const reviewText = reviewResult.response.text();
          let reviewData;

          try {
            reviewData = cleanAndParseJson(reviewText);
          } catch (e) {
            console.error("Review parsing failed. Raw text:", reviewText);
            saveErrorLog(reviewText);
            throw new Error("Failed to parse editorial review into valid JSON. Raw output saved to error-raw-output.txt");
          }

          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                type: "data",
                step: 5,
                key: "review",
                data: reviewData,
              }) + "\n"
            )
          );

          // Done!
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
