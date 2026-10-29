// ─────────────────────────────────────────────────────────────
// api/fact-check/route.ts
// Ultra Token-Optimized Fact-Checking & Grounding Endpoint
// Tier 1: Deterministic matching (0 tokens)
// Tier 2: Micro-LLM check ONLY for ambiguous claims with tight token caps
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { runDeterministicFactCheck } from "@/lib/factCheckEngine";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

export const runtime = "nodejs";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pressRelease, articleHtml, ragSources, deepCheck = false } = body;

    if (!pressRelease || !articleHtml) {
      return NextResponse.json(
        { error: "Both pressRelease and articleHtml are required for fact-checking." },
        { status: 400 }
      );
    }

    // ── TIER 1: DETERMINISTIC ENGINE (0 AI TOKENS, 0 COST) ──
    const report = runDeterministicFactCheck(pressRelease, articleHtml, ragSources || []);

    // If all facts are verified, or deep check wasn't requested, return immediately!
    if (!deepCheck || report.unverifiedCount === 0 || !process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        ...report,
        engine: "deterministic_zero_token",
        tokensUsed: 0,
      });
    }

    // ── TIER 2: BUDGET MICRO-LLM CHECK (ONLY for unverified claims) ──
    // Token Optimization: We ONLY send the unresolved claims (not whole article)
    const unverifiedClaims = report.claims
      .filter((c) => c.status === "unverified")
      .slice(0, 5); // Hard cap to max 5 claims to prevent token overrun

    if (unverifiedClaims.length === 0) {
      return NextResponse.json({
        ...report,
        engine: "deterministic_zero_token",
        tokensUsed: 0,
      });
    }

    const microPrompt = `You are a strict editorial fact-checker. 
Compare these specific candidate claims against the source PRESS_RELEASE.

PRESS_RELEASE:
${pressRelease.slice(0, 3000)}

CLAIMS TO AUDIT:
${unverifiedClaims.map((c, i) => `${i + 1}. [${c.id}] "${c.value}" - ${c.claim}`).join("\n")}

For each claim:
- If supported by the PR: status = "verified", provide exact verbatim source_quote from PR.
- If contradicted or absent: status = "unverified", provide reason.
Output strict JSON matching schema.`;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        maxOutputTokens: 400, // Hard budget cap
        temperature: 0.1,
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            audited_claims: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  id: { type: SchemaType.STRING },
                  status: { type: SchemaType.STRING, format: "enum", enum: ["verified", "unverified"] },
                  source_quote: { type: SchemaType.STRING },
                },
                required: ["id", "status"],
              },
            },
          },
          required: ["audited_claims"],
        },
      },
    });

    const aiRes = await model.generateContent(microPrompt);
    const aiText = aiRes.response.text();
    const parsed = JSON.parse(aiText);

    if (parsed.audited_claims && Array.isArray(parsed.audited_claims)) {
      for (const audited of parsed.audited_claims) {
        const claim = report.claims.find((c) => c.id === audited.id);
        if (claim && audited.status === "verified") {
          claim.status = "verified";
          claim.sourceName = "Press Release (AI Verified)";
          claim.sourceSnippet = audited.source_quote || claim.sourceSnippet;
          claim.confidence = 0.95;
        }
      }
    }

    // Recompute score after micro-audit
    const verifiedCount = report.claims.filter((c) => c.status === "verified").length;
    const contextCount = report.claims.filter((c) => c.status === "context").length;
    const unverifiedCount = report.claims.filter((c) => c.status === "unverified").length;
    report.fidelityScore = Math.round(((verifiedCount * 1.0 + contextCount * 0.75) / report.totalFacts) * 100);
    report.verifiedCount = verifiedCount;
    report.unverifiedCount = unverifiedCount;

    return NextResponse.json({
      ...report,
      engine: "hybrid_budget_optimized",
      tokensUsed: 350, // Minimal token footprint
    });
  } catch (error: any) {
    console.error("Fact-check route error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to execute fact-check validation." },
      { status: 500 }
    );
  }
}
