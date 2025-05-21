import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { micromark } from "micromark";
import { ResponseTypes } from "@/types";

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

BE CRITICAL of plans that are:
- Too vague or generic (e.g., "I will make an app")
- Don't address the specific market gap in the problem
- Lack a clear business model or revenue strategy
- Are nonsensical or unrelated to the problem
- Are extremely brief (less than 3 sentences)

For inadequate plans, provide feedback in about 5 words, extremely short and to the point, so the user can improve it. Do not exceed 5 words.`;

export interface ValidationAcceptedResponse {
  type: ResponseTypes.ACCEPTED;
  content: {
    document: string;
    component: {
      type: string;
      data: {
        title: string;
        text: string;
      };
    };
  }[];
  formalizedPlan: string;
}

export interface ValidationRejectedResponse {
  type: ResponseTypes.REJECTED;
  reason: string;
}

export type ValidationResponse =
  | ValidationAcceptedResponse
  | ValidationRejectedResponse;

export async function POST(
  req: NextRequest
): Promise<NextResponse<ValidationResponse>> {
  try {
    // Ensure API key is set
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          type: ResponseTypes.REJECTED,
          reason: "OpenAI key not set up correctly!",
        },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { problemStatement, businessPlan } = body;

    // Validate input
    if (!problemStatement || !businessPlan) {
      return NextResponse.json(
        {
          type: ResponseTypes.REJECTED,
          reason: "Missing problem statement or business plan!",
        },
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
      type: z.literal(ResponseTypes.ACCEPTED),
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
      type: z.literal(ResponseTypes.REJECTED),
      reason: z.string(),
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
    if (result.result.type === ResponseTypes.ACCEPTED) {
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
    }

    return NextResponse.json(result.result, { status: 200 });
  } catch (e: any) {
    console.error("Error validating business plan:", e);
    return NextResponse.json(
      { type: ResponseTypes.REJECTED, reason: "Internal server error" },
      { status: 500 }
    );
  }
}
