// app/api/evaluate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";

export const runtime = "edge";

const TEMPLATE = `You are a business evaluator for a startup simulation game, where the player has 30 minutes to come up with a business
based on a problem statement and "build it" iteratively, through prompting an AI.
Evaluate the player's complete business journey honesty, but fairly - most startups fail sugar-coating helps no one, but keep in mind that
these plans are created in 30 minutes, not multiple months.

Here is the player's journey:

PROBLEM STATEMENT:
{problemStatement}

REJECTED PLANS:
{rejectedPlans}

BUSINESS PLAN:
{businessPlan}

BUSINESS DECISIONS & BUILD LOGS:
{buildLogs}

FINAL COMPANY VALUE: {companyValue}

Your task is to provide a comprehensive evaluation including:

1. **Overall Score (0-100)**: Most players should score 40-80. **CRUCIAL** the player has 5 minutes to come up with an idea, and 25 minutes to build it. About 70% of the points should come from the decisions made and the logs.
2. **Direct Feedback**: Call out what worked, what didn't, and what was outright bad
3. **Category Scores**: Rate each area out of 10:
   - Strategy & Planning
   - Market Understanding  
   - Product Development
   - Marketing & Sales
   - Financial Management
   - Adaptability & Learning

SCORING GUIDELINES:
- 85-100: Very strong (would likely get real funding)
- 70-84: Good (viable business with room to grow)
- 60-69: Decent (some good ideas, execution issues)
- 50-59: Mediocre (some flaws but ideas are there)
- 40-49: Poor (fundamental problems, but some redeeming qualities)
- 30-39: Bad (would likely fail quickly)
- 0-29: Terrible (completely unrealistic, or no accepted business plan)

EVALUATION CRITERIA:
- Business plan: Was it realistic? Specific enough? Addressed the actual problem?
- Decision consistency: Did choices align with the plan? Learn from feedback?
- Market understanding: Knew the target audience? Realistic about competition?
- Execution: Made smart resource allocation? Avoided obvious mistakes?

FEEDBACK STYLE - Be direct and honest:
- DON'T SAY: "Your approach shows promise but could benefit from refinement"
- DO SAY: "Your target market was way too broad. 'Everyone who eats food' isn't a customer segment."

- DON'T SAY: "Consider exploring additional revenue streams"  
- DO SAY: "You burned through cash with no clear path to profitability. That's not sustainable."

- DON'T SAY: "Your marketing strategy demonstrates creativity"
- DO SAY: "Spending 60% of budget on Instagram ads without testing was reckless."

Consider the full journey:
- Initial plan quality and realism
- Learning from rejections and feedback
- Smart vs wasteful spending decisions
- Evidence of understanding market dynamics
- Ability to pivot when needed

Be constructive but if someone built a weak foundation, tell them directly. 
If they made amateur mistakes, call them out. 
If they did well, acknowledge it clearly.`;

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
    const {
      businessPlan,
      buildLogs,
      companyValue,
      rejectedPlans,
      problemStatement,
    } = body;

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
      rejectedPlans: rejectedPlans || "No rejected plans",
      companyValue: companyValue || 0,
      problemStatement: problemStatement || "No problem statement provided",
    });

    return NextResponse.json(result, { status: 200 });
  } catch (e: any) {
    console.error("Error in evaluation:", e);
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}
