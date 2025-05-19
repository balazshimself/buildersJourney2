// Second route.ts (complete)
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { micromark } from "micromark";

export const runtime = "edge";

const TEMPLATE = `You are an AI business plan evaluator for a startup simulation game. 
The user has been presented with a business problem and has submitted their business plan solution.

PROBLEM STATEMENT:
{problemStatement}

USER'S BUSINESS PLAN:
{businessPlan}

Your task is to:
1. Evaluate if this is a viable business plan that addresses the problem statement
2. Create a formalized, well-structured version of the business plan
3. If the plan is viable, create initial content for the three departments

IMPORTANT CRITERIA:
- Does the plan address the market gap identified in the problem?
- Is there a clear target audience?
- Is there a clear revenue model?
- Does the plan have some basic structure (product, marketing, etc.)?
- Is it specific enough to be actionable?

BE CRITICAL of plans that are:
- Too vague or generic (e.g., "I will make an app")
- Don't address the specific market gap in the problem
- Lack a clear business model or revenue strategy
- Are nonsensical or unrelated to the problem
- Are extremely brief (less than 3 sentences)

For inadequate plans, provide a few words of feedback so the user can improve it.`;

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
    const { problemStatement, businessPlan } = body;

    // Validate input
    if (!problemStatement || !businessPlan) {
      return NextResponse.json(
        { error: "Missing required fields: problemStatement, businessPlan" },
        { status: 400 }
      );
    }

    // Define the schema for the static text component
    const StaticTextSchema = z.object({
      type: z.string(),
      data: z.object({
        title: z.string(),
        text: z.string(),
      }),
    });

    // Define the schema for accepted responses
    const AcceptedSchema = z.object({
      type: z.literal("accepted"),
      formalizedPlan: z.string(),
      content: z.array(
        z.object({
          document: z.string(),
          component: StaticTextSchema,
        })
      ),
    });

    // Define the schema for rejected responses
    const RejectedSchema = z.object({
      type: z.literal("rejected"),
      reason: z.string(),
      formalizedPlan: z.string(),
    });

    // Define the overall response schema
    const ResponseSchema = z.object({
      result: z.union([AcceptedSchema, RejectedSchema]),
    });

    const model = new ChatOpenAI({
      temperature: 0.7,
      model: "gpt-4o-mini",
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = PromptTemplate.fromTemplate(TEMPLATE);

    const functionCallingModel = model.withStructuredOutput(ResponseSchema);

    const chain = prompt.pipe(functionCallingModel);

    const result = await chain.invoke({
      problemStatement: problemStatement,
      businessPlan: businessPlan,
    });

    // Convert markdown to HTML using micromark
    if (result.result.type === "accepted") {
      // Convert formalized plan markdown to HTML
      result.result.formalizedPlan = micromark(result.result.formalizedPlan);

      // Convert content text to HTML
      if (result.result.content && Array.isArray(result.result.content)) {
        for (const item of result.result.content) {
          if (
            item.component &&
            item.component.type === "staticText" &&
            item.component.data &&
            item.component.data.text
          ) {
            item.component.data.text = micromark(item.component.data.text);
          }
        }
      }
    } else if (result.result.type === "rejected") {
      // Convert rejected reason to HTML
      if (result.result.reason) {
        result.result.reason = micromark(result.result.reason);
      }
      // Convert formalized plan in rejection case as well
      if (result.result.formalizedPlan) {
        result.result.formalizedPlan = micromark(result.result.formalizedPlan);
      }
    }

    return NextResponse.json(result.result, { status: 200 });
  } catch (e: any) {
    console.error("Error validating business plan:", e);

    // Emergency fallback in case of complete failure
    const emergencyFallback = {
      type: "accepted",
      formalizedPlan:
        "<h1>Formalized Business Plan</h1>\n<p>Your business plan has been accepted. We'll proceed with development based on your outlined strategy.</p>",
      content: [
        {
          document: "Product Development",
          component: {
            type: "staticText",
            data: {
              title: "Product Development",
              text: "<p>Initial development phase starting now.</p>",
            },
          },
        },
        {
          document: "Marketing",
          component: {
            type: "staticText",
            data: {
              title: "Marketing",
              text: "<p>Marketing strategy in preparation.</p>",
            },
          },
        },
        {
          document: "Management",
          component: {
            type: "staticText",
            data: {
              title: "Management",
              text: "<p>Team structure being formed.</p>",
            },
          },
        },
      ],
    };

    return NextResponse.json(emergencyFallback, { status: 200 });
  }
}
