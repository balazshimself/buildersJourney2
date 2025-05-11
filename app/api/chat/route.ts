import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";

console.log("HERE");

export const runtime = "edge";

const TEMPLATE = `You are an AI assistant for a business simulation game. The player is participating in a mock interview/business simulation where they are building a startup.

Based on the player's business decision, evaluate it and provide:
1. An assessment of whether the decision is likely to have a positive, negative, or neutral outcome
2. A realistic and detailed result of the decision
3. Consider factors like:
   - How detailed and well-thought-out the plan is
   - Whether it addresses a real market need
   - If there are obvious flaws or strengths
   - Realistic market conditions
   - The stage of the business

Input from player:

{input}`;

export async function POST(req: NextRequest) {
  console.log("HERE IT FUCKING IS!:)");
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

    const prompt = PromptTemplate.fromTemplate(TEMPLATE);

    const model = new ChatOpenAI({
      temperature: 0.7,
      model: "gpt-4o-mini", // Use the model specified in your original code
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
      })
      .describe("Response format for business simulation");

    const functionCallingModel = model.withStructuredOutput(schema, {
      name: "output_formatter",
    });

    const chain = prompt.pipe(functionCallingModel);

    const result = await chain.invoke({
      input: currentMessageContent,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}
