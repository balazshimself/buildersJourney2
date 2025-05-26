// app/api/evaluate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";

export const runtime = "edge";

const TEMPLATE = `You are an expert business evaluator for a startup simulation game. 
Evaluate the player's complete business journey including their initial plan and all decisions made.

ORIGINAL BUSINESS PLAN:
{businessPlan}

BUSINESS DECISIONS & BUILD LOGS:
{buildLogs}

FINAL COMPANY VALUE: {companyValue}

Your task is to provide a comprehensive evaluation including:

1. **Overall Score (0-100)**: Based on plan quality, decision consistency, market understanding, and execution
2. **Detailed Feedback**: Analyze strengths, weaknesses, and key insights
3. **Category Scores**: Rate each area out of 10:
   - Strategy & Planning
   - Market Understanding  
   - Product Development
   - Marketing & Sales
   - Financial Management
   - Adaptability & Learning

Consider:
- The quality of the initial business plan
- Quality and consistency of business decisions
- Evidence of learning and adaptation
- Realistic approach to challenges

Provide constructive feedback that highlights both successes and areas for improvement. It is vital, to be "cruel" if needed.
If the business isn't standing on a strong enough foundation, let the user know now, don't be afraid to score low.`;

const EvaluationSchema = z.object({
  overallScore: z.number(),
  categoryScores: z.object({
    strategy: z.number(),
    marketUnderstanding: z.number(),
    productDevelopment: z.number(),
    marketing: z.number(),
    financialManagement: z.number(),
    adaptability: z.number(),
  }),
  feedback: z.object({
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    keyInsights: z.array(z.string()),
    recommendations: z.array(z.string()),
  }),
  summary: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not set" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { businessPlan, buildLogs, companyValue } = body;

    const prompt = PromptTemplate.fromTemplate(TEMPLATE);
    const model = new ChatOpenAI({
      temperature: 0.7,
      model: "gpt-4o-mini",
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    const functionCallingModel = model.withStructuredOutput(EvaluationSchema);
    const chain = prompt.pipe(functionCallingModel);

    const result = await chain.invoke({
      businessPlan: businessPlan || "No business plan provided",
      buildLogs: buildLogs || "No build logs available",
      companyValue: companyValue || 0,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (e: any) {
    console.error("Error in evaluation:", e);
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}
