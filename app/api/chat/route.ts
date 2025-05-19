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
2. A realistic and detailed result of the decision (3-5 sentences)
3. A short, catchy title for this project (max 15 characters)
4. How this decision affects THREE key areas of the business:
   - PRODUCT (Design/Development): Specific impacts on product features, development timeline, or technical aspects
   - MARKETING: How this affects marketing strategy, customer acquisition, or brand positioning
   - MANAGEMENT: Effects on team structure, operations, resource allocation, or company culture

5. For each of those three categories, provide:
   - A brief headline/title (10 words max)
   - A 1-2 sentence impact description
   - A tag indicating if this represents a "milestone", "update", or "risk" for that category

6. Consider factors like:
   - Whether the decision aligns with prior build logs and business strategy
   - If it addresses a real market need from the business plan
   - Whether there are obvious flaws or strengths in the approach
   - Realistic market conditions and competitive landscape
   - The stage of the business (early startup)

Your assessment should be balanced - not every decision needs to be perfect or terrible. Some may have mixed results.

Player's business decision:
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
            "The initial cost of implementing this decision (between 100-10000)"
          ),

        monetary_return: z
          .number()
          .describe(
            "The expected monetary return of the action (0 if none expected)"
          ),

        chat_response: z
          .string()
          .describe(
            "A detailed, specific outcome of the business decision (3-5 sentences)"
          ),

        title: z
          .string()
          .describe("A short, catchy title for this project (15 chars max)"),

        product: z.object({
          title: z.string().max(10).describe("Brief product update headline"),
          content: z
            .string()
            .describe("1-2 sentence product impact description"),
          tag: z
            .enum(["milestone", "update", "risk"])
            .describe("Type of product update"),
        }),

        marketing: z.object({
          title: z.string().describe("Brief marketing update headline"),
          content: z
            .string()
            .describe("1-2 sentence marketing impact description"),
          tag: z
            .enum(["milestone", "update", "risk"])
            .describe("Type of marketing update"),
        }),

        management: z.object({
          title: z.string().describe("Brief management update headline"),
          content: z
            .string()
            .describe("1-2 sentence management impact description"),
          tag: z
            .enum(["milestone", "update", "risk"])
            .describe("Type of management update"),
        }),
      })
      .describe("Response format for business simulation");

    const functionCallingModel = model.withStructuredOutput(schema, {
      name: "business_simulator",
    });

    const chain = prompt.pipe(functionCallingModel);

    const result = await chain.invoke({
      input: currentMessageContent,
      businessPlan: businessPlan,
      buildLogs: buildLogs,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (e: any) {
    console.error("Error in chat API:", e);
    return NextResponse.json(
      {
        error: e.message || "An unknown error occurred",
        tone: "neutral",
        title: "API Error",
        chat_response:
          "There was an error processing your request. Please try again with a different approach.",
        initial_cost: 500,
        monetary_return: 0,
      },
      { status: e.status || 500 }
    );
  }
}
