import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";

export const runtime = "edge";

const TEMPLATE = `You are an AI assistant for a business simulation game. The player is participating in a mock interview/business simulation where they are building a startup.

BUSINESS PLAN:
{businessPlan}

BUILD LOGS (Previous Actions):
{buildLogs}

Based on the player's business decision, evaluate it in the context of their existing business plan and previous actions, then provide:

1. An assessment of whether the decision is likely to have a positive, negative, or neutral outcome
2. A realistic and detailed result of the decision
3. How this decision affects THREE key areas of the business:
   - PRODUCT (Design/Development): Specific impacts on product features, development timeline, or technical aspects
   - MARKETING: How this affects marketing strategy, customer acquisition, or brand positioning
   - MANAGEMENT: Effects on team structure, operations, resource allocation, or company culture

4. For each of those three categories, provide:
   - A brief headline/title (10 words max)
   - A 1-2 sentence impact description
   - Whether this represents a "milestone", "update", or "event" for that category

5. Consider factors like:
   - How the decision aligns with prior build logs and business strategy
   - Whether it addresses a real market need from the business plan
   - If there are obvious flaws or strengths in the approach
   - Realistic market conditions
   - The stage of the business

Input from player:

{input}`;

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
    const messages = body.messages ?? [];
    const currentMessageContent = messages[messages.length - 1].content;

    // Extract business plan and build logs from request if available
    const businessPlan = body.businessPlan || "No business plan available.";
    const buildLogs = body.buildLogs || "No previous build logs available.";

    const prompt = PromptTemplate.fromTemplate(TEMPLATE);

    const model = new ChatOpenAI({
      temperature: 0.7,
      model: "gpt-4o-mini",
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    const schema = z
      .object({
        tone: z
          .enum(["positive", "negative", "neutral"])
          .describe(
            "The overall expected outcome of the business decision (positive, negative, or neutral)"
          ),
        initial_cost: z
          .number()
          .describe(
            "The initial cost of starting this project. Positive integer"
          ),
        monetary_return: z
          .number()
          .describe("The expected monetary return of the specified actions"),
        chat_response: z
          .string()
          .describe(
            "A detailed, specific outcome of the business decision, including specific details about market reactions, revenue implications, and potential obstacles or successes"
          ),
        title: z
          .string()
          .max(15)
          .describe("A short, catchy title for this project (15 chars max)"),
        product: z
          .object({
            title: z.string().max(10).describe("Brief product update headline"),
            content: z
              .string()
              .describe("1-2 sentence product impact description"),
            tag: z
              .string()
              .max(10)
              .nullable()
              .describe("Type of product update"),
          })
          .nullable()
          .describe("Product development impact. Only return if there is any."),
        marketing: z
          .object({
            title: z
              .string()
              .max(10)
              .describe("Brief marketing update headline"),
            content: z
              .string()
              .describe("1-2 sentence marketing impact description"),
            tag: z
              .string()
              .max(10)
              .nullable()
              .describe("Type of marketing update"),
          })
          .nullable()
          .describe("Marketing impact. Only return if there is any."),
        management: z
          .object({
            title: z
              .string()
              .max(10)
              .describe("Brief management update headline"),
            content: z
              .string()
              .describe("1-2 sentence management impact description"),
            tag: z
              .string()
              .max(10)
              .nullable()
              .describe("Type of management update"),
          })
          .nullable()
          .describe("Management impact. Only return if there is any."),
      })
      .describe("Response format for business simulation");

    const functionCallingModel = model.withStructuredOutput(schema, {
      name: "output_formatter",
    });

    const chain = prompt.pipe(functionCallingModel);

    const result = await chain.invoke({
      input: currentMessageContent,
      businessPlan: businessPlan,
      buildLogs: buildLogs,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}
