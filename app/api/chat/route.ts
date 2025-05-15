// First route.ts file - fixed version
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";

export const runtime = "edge";

const TEMPLATE = ` You are an AI assistant for a business simulation game. The player is participating in a mock business simulation where they are building a startup to solve the following problem:

PROBLEM STATEMENT: {problemStatement}

Their goal is to increase the value of their business by as much as possible.

BUSINESS PLAN: {businessPlan}

Their current budget is:

BUDGET: {budget}

BUILD LOGS (Previous Actions): {buildLogs}

Based on the player's business decision, evaluate it in the context of the problem they're trying to solve, their existing business plan, current budget, and previous actions.
Here's how to respond:
- The information you provide should be specific and creative.
- The player CANNOT make information up (e.g., "I have a rich friend to grant me a starting loan," "I know how to make the product myself, I don't need to hire anyone").
- You should be ruthless in your responses if they are not providing good and specific enough ideas to keep their business afloat.
- You can REJECT their proposal if:
  - It isn't relevant (e.g., they write a shopping list, they ramble).
  - They aren't specific enough (e.g., "I want to build a prototype," "I want to hire someone").
  - It exceeds their current budget without a clear funding plan.

Here is what to provide:
- An assessment of whether the decision is likely to have a positive, negative, or neutral outcome.
- A realistic and detailed result of the decision, considering the current budget and how it affects available resources.
- How this decision affects THREE key areas of the business:
  - PRODUCT (Design/Development): Specific impacts on product features, development timeline, or technical aspects.
  - MARKETING: How this affects marketing strategy, customer acquisition, or brand positioning.
  - MANAGEMENT: Effects on team structure, operations, resource allocation, or company culture.

For each of those three categories, provide:
- A brief headline/title (max 10 words).
- A 1-2 sentence impact description.
- Whether this represents a "milestone," "update," or "event" for that category.

Consider factors like:
- How well the decision addresses the problem statement.
- How it aligns with prior build logs and business strategy.
- Whether it fits within the current budget or requires additional funding.
- Realistic market conditions and the stage of the business.

Input from player:
{input} `;

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
    const problemStatement =
      body.problemStatement || "No problem statement available.";
    const budget = body.budget || "No budget available.";
    const businessPlan = body.businessPlan || "No business plan available.";
    const buildLogs = body.buildLogs || "No previous build logs available.";

    const prompt = PromptTemplate.fromTemplate(TEMPLATE);

    const model = new ChatOpenAI({
      temperature: 0.7,
      model: "gpt-4o-mini",
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    // Define the data structure for each template type
    const StaticTextSchema = z.object({
      type: z.literal("staticText"),
      data: z.object({
        title: z.string(),
        text: z.string(),
      }),
    });

    const ProgressBarSchema = z.object({
      type: z.literal("progressBar"),
      data: z.object({
        label: z.string(),
        currentValue: z.number(),
        targetValue: z.number().nullable(),
      }),
    });

    const CardChoiceSchema = z.object({
      type: z.literal("cardChoice"),
      data: z.array(
        z.object({
          title: z.string(),
          description: z.string(),
          cost: z.number(),
          budgetImpact: z.number(),
          effects: z.array(
            z.object({
              metric: z.string(),
              change: z.number(),
            })
          ),
        })
      ),
    });

    // Define the schema for document updates
    const DocumentUpdateSchema = z.object({
      document: z.enum(["Marketing", "Product Development", "Management"]),
      component: z.union([
        StaticTextSchema,
        ProgressBarSchema,
        CardChoiceSchema,
      ]),
    });

    // Define the overall response schema with discriminated union
    const ResponseSchema = z.object({
      responseType: z.enum(["accepted", "rejected"]),
      reason: z.string().nullable(),
      content: z.array(DocumentUpdateSchema).nullable(),
    });

    const functionCallingModel = model.withStructuredOutput(ResponseSchema);

    const chain = prompt.pipe(functionCallingModel);

    const result = await chain.invoke({
      problemStatement: problemStatement,
      budget: budget,
      input: currentMessageContent,
      businessPlan: businessPlan,
      buildLogs: buildLogs,
    });

    // Transform the result to match the expected format in your application
    let finalResult;
    if (result.responseType === "rejected") {
      finalResult = {
        type: "rejected",
        reason: result.reason,
      };
    } else {
      finalResult = {
        type: "accepted",
        content: result.content,
      };
    }

    return NextResponse.json(finalResult, { status: 200 });
  } catch (e: any) {
    console.error("Error in chat:", e);
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}
