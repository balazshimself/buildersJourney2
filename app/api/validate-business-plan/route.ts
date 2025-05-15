import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";

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
3. If the plan is viable, create initial content for the three departments:
   - Product Development
   - Marketing
   - Management

IMPORTANT CRITERIA:
- Does the plan address the market gap identified in the problem?
- Is there a clear target audience?
- Is there a clear revenue model?
- Does the plan have some basic structure (product, marketing, etc.)?
- Is it specific enough to be actionable?

Even if the plan is not perfect, approve it if it has basic viability and addresses the core problem.
However, if the plan is completely insufficient, reject it.`;

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
      type: z.literal("staticText"),
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
          document: z.enum(["Product Development", "Marketing", "Management"]),
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

    const functionCallingModel = model.withStructuredOutput(ResponseSchema, {
      name: "output_formatter",
    });

    const chain = prompt.pipe(functionCallingModel);

    const result = await chain.invoke({
      problemStatement: problemStatement,
      businessPlan: businessPlan,
    });

    return NextResponse.json(result.result, { status: 200 });
  } catch (e: any) {
    console.error("Error validating business plan:", e);

    // Emergency fallback in case of complete failure
    const emergencyFallback = {
      type: "accepted",
      formalizedPlan:
        "# Formalized Business Plan\n\nYour business plan has been accepted. We'll proceed with development based on your outlined strategy.",
      content: [
        {
          document: "Product Development",
          component: {
            type: "staticText",
            data: {
              title: "Product Development",
              text: "Initial development phase starting now.",
            },
          },
        },
        {
          document: "Marketing",
          component: {
            type: "staticText",
            data: {
              title: "Marketing",
              text: "Marketing strategy in preparation.",
            },
          },
        },
        {
          document: "Management",
          component: {
            type: "staticText",
            data: {
              title: "Management",
              text: "Team structure being formed.",
            },
          },
        },
      ],
    };

    return NextResponse.json(emergencyFallback, { status: 200 });
  }
}
