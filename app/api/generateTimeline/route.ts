// app/api/generateTimeline/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";

export const runtime = "edge";

const TEMPLATE = `You are an AI assistant for a business simulation game. Generate a realistic project timeline based on the following business plan.

BUSINESS PLAN: {businessPlan}

Create a project timeline with 4-8 tasks that represent the key milestones for launching this business. Each task should be realistic and actionable.

Consider:
- Product development phases
- Market research and validation
- Marketing and customer acquisition
- Team building and operations
- Launch preparation

For each task, provide:
- A clear, specific name
- Realistic start and end dates (spread over 3-6 months from {today})
- Progress percentage (should be 0% for future tasks)
- Dependencies between tasks where logical

Make the timeline realistic for a startup with limited resources.`;

const TaskSchema = z.object({
  id: z.string(),
  name: z.string(),
  start: z.string().describe("ISO date string"),
  end: z.string().describe("ISO date string"),
  progress: z.number().default(0),
  dependencies: z.string().nullable(),
  customClass: z.string().nullable(),
});

const TimelineSchema = z.object({
  tasks: z.array(TaskSchema),
  summary: z.string().describe("Brief summary of the timeline"),
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
    const { businessPlan } = body;

    if (!businessPlan) {
      return NextResponse.json(
        { error: "Business plan is required" },
        { status: 400 }
      );
    }

    const prompt = PromptTemplate.fromTemplate(TEMPLATE);
    const model = new ChatOpenAI({
      temperature: 0.7,
      model: "gpt-4o-mini",
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    const functionCallingModel = model.withStructuredOutput(TimelineSchema);
    const chain = prompt.pipe(functionCallingModel);

    const result = await chain.invoke({
      today: new Date().toISOString().split("T")[0],
      businessPlan:
        typeof businessPlan === "string"
          ? businessPlan
          : JSON.stringify(businessPlan),
    });

    return NextResponse.json(result, { status: 200 });
  } catch (e: any) {
    console.error("Error generating timeline:", e);
    return NextResponse.json(
      { error: e.message || "Failed to generate timeline" },
      { status: 500 }
    );
  }
}
