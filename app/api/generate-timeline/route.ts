import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";

export const runtime = "edge";

const TEMPLATE = `You are an AI assistant for a business simulation game. The player is developing a startup business.

BUSINESS PLAN:
{businessPlan}

Based on the business plan above, create a realistic project timeline with tasks, milestones, and dependencies.
Generate a JSON array of Gantt chart tasks with the following properties:
- id: A unique task identifier (task-1, task-2, etc.)
- name: A concise, descriptive name for the task (max 30 chars)
- start: Start date in ISO format
- end: End date in ISO format
- progress: Percentage completion (0-100)
- dependencies: Optional comma-separated list of task IDs this task depends on
- customClass: Optional CSS class (task-milestone for significant events, task-critical for high-priority items)

Create a 6-month timeline starting from today's date. Include 8-12 tasks that cover:
1. Product development stages
2. Market research activities
3. Marketing and launch preparations
4. Funding or resource allocation
5. Important milestones

Make the timeline reflect a realistic product development cycle with appropriate task durations and dependencies.`;

export async function POST(req: NextRequest) {
  try {
    // Ensure API key is set
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not set" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const businessPlan = body.businessPlan || "No business plan available.";

    const prompt = PromptTemplate.fromTemplate(TEMPLATE);

    const model = new ChatOpenAI({
      temperature: 0.7,
      model: "gpt-4o-mini",
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    const schema = z
      .object({
        tasks: z
          .array(
            z.object({
              id: z.string(),
              name: z.string().max(30),
              start: z.string().datetime(),
              end: z.string().datetime(),
              progress: z.number().min(0).max(100),
              dependencies: z.string().optional(),
              customClass: z.string().optional(),
            })
          )
          .min(8)
          .max(15)
          .describe("Array of timeline tasks"),
      })
      .describe("Project timeline data");

    const functionCallingModel = model.withStructuredOutput(schema, {
      name: "timeline_formatter",
    });

    const chain = prompt.pipe(functionCallingModel);

    const result = await chain.invoke({
      businessPlan: businessPlan,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (e: any) {
    console.error("Error generating timeline:", e);

    // Return fallback tasks if there's an error
    const fallbackTasks = generateFallbackTasks();

    return NextResponse.json({ tasks: fallbackTasks }, { status: 200 });
  }
}

// Generate fallback tasks for the timeline if the AI generation fails
function generateFallbackTasks() {
  const today = new Date();
  const startDate = new Date();

  // Create dates relative to now
  function getDate(dayOffset: number) {
    const d = new Date(today);
    d.setDate(d.getDate() + dayOffset);
    return d.toISOString();
  }

  return [
    {
      id: "task-1",
      name: "Market Research",
      start: getDate(-15),
      end: getDate(15),
      progress: 100,
    },
    {
      id: "task-2",
      name: "Product Design",
      start: getDate(0),
      end: getDate(30),
      progress: 80,
    },
    {
      id: "task-3",
      name: "Prototype Development",
      start: getDate(20),
      end: getDate(50),
      progress: 30,
      dependencies: "task-2",
    },
    {
      id: "task-4",
      name: "User Testing",
      start: getDate(45),
      end: getDate(75),
      progress: 0,
      dependencies: "task-3",
    },
    {
      id: "task-5",
      name: "Marketing Strategy",
      start: getDate(30),
      end: getDate(60),
      progress: 10,
    },
    {
      id: "task-6",
      name: "Initial Funding Round",
      start: getDate(40),
      end: getDate(70),
      progress: 0,
    },
    {
      id: "task-7",
      name: "Final Production",
      start: getDate(70),
      end: getDate(100),
      progress: 0,
      dependencies: "task-3,task-4",
    },
    {
      id: "task-8",
      name: "Product Launch",
      start: getDate(100),
      end: getDate(101),
      progress: 0,
      dependencies: "task-5,task-7",
      customClass: "task-milestone",
    },
  ];
}
