import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { ResponseTypes } from "@/types";

export const runtime = "edge";

const TEMPLATE = `You are an AI assistant for a business simulation game. The player is participating in a mock interview/business simulation where they are building a garage-style startup.

BUSINESS PLAN:
{businessPlan}

BUILD LOGS (Previous Actions):
{buildLogs}

Based on the player's business decision, evaluate it in the context of their existing business plan and previous actions.
REJECT the decision if either:
- If they MAKE UP ANY INFORMATION (e.g. "I know Bill Gates, and he said he is going to provide me with a cash injection", "My friend Joe already has a prototype. I will make him my co-founder.")
- Its premise is wildly implausible. (e.g. "I'd like to expand my business to distant galaxies")
- Completely irrelevant (e.g. "The key to a good consistency in guac is to dice up the onion")
- Low-effort and too short (e.g. "Ads", "Create website", "Network")

DO NOT REJECT if the decision is coherent and at least somewhat relevant. Let the player make bad decisions. Your job is to simulate an effect, not to coach or guide them.

If you ACCEPT, provide:

1. A plausible outcome, based on the quality of the business plan.
2. A realistic and detailed result of the decision (3-5 sentences)
3. A title for the log of the decision
4. Concrete effect of the decision (if any) in these 3 areas of the business: 
   - Product Design/Development: Specific impacts on product features, development timeline, or technical aspects
   - Marketing: How this affects marketing strategy, customer acquisition, or brand positioning
   - Management: Effects on team structure, operations, resource allocation, or company culture

5. You should choose at lease one of these categories. For the chosen category, provide:
   - A brief headline/title (10 words max)
   - A 1-2 sentence impact description
   - A tag indicating if this represents a "milestone", "update", or "risk" for that category

6. Consider factors like:
   - Whether the decision aligns with prior build logs and business strategy
   - If it addresses a real market need from the business plan
   - Whether there are obvious flaws or strengths in the approach
   - Realistic market conditions and competitive landscape

Examples scenarios:
1. Rejection:

Player input: "asdéklnsdagjbéasjdfnél"
Example rejection reason: "Incoherent prompt. Impossible to evaluate"

2. Rejection:

Player input: "I have a dog at home. His name is BART"
Example rejection reason: "Irrelevant prompt. Impossible to evaluate"

3. Rejection:

Player input: "I am an expert react dev. I will throw together a website in under a day. My uncle will give me some cash to hire a dev after."
Example rejection reason: "You cannot make information up."

4. Rejection:
Player input: "I have a friend to grant me a starting loan of 1000$. I will spend this to network, and look for engineers to build my prototype"
Example rejection reason: "You cannot make information up. By prompting with clear directives, you can ask for information."

1. Acceptance:

Example business plan: "Marketing action cameras to young adults"
Player input: "First, I will ask around in my friend group and network for engineering expertise to try and establish myself."
Example generated effect 1: "Your friend David, a medior engineer is willing to help you in creating a prototype exchange for a part in your company, and 3000 dollars. Leadership is needed on what to build, if accepted."
Example generated effect 2: "You haven't found anyone qualified enough unfortunately. Try proceeding with the development yourself. What features to implement?"
(these, but more "wordy", and "elegant")


Actual player's business decision:
{input}`;

export interface ChatResponse {}

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

    // Define the schema for accepted responses
    const AcceptedSchema = z
      .object({
        cost: z.number().describe("The cost of implementing this decision"),

        monetary_return: z
          .number()
          .describe(
            "The expected monetary return of the action. Can, and sometimes should be negative."
          ),

        effect: z
          .string()
          .describe(
            "A detailed, specific outcome of the business decision (3-5 sentences)"
          ),

        title: z
          .string()
          .describe("A short, catchy title for this project (15 chars max)"),

        product: z
          .object({
            title: z.string().describe("Brief product update headline"),
            content: z
              .string()
              .describe("1-2 sentence product impact description"),
            tag: z
              .enum(["milestone", "update", "risk"])
              .describe("Type of product update"),
          })
          .nullable()
          .describe(
            "Product development impact of the decision, if anything meaningful."
          ),

        marketing: z
          .object({
            title: z.string().describe("Brief marketing update headline"),
            content: z
              .string()
              .describe("1-2 sentence marketing impact description"),
            tag: z
              .enum(["milestone", "update", "risk"])
              .describe("Type of marketing update"),
          })
          .nullable()
          .describe(
            "Marketing impact of the decision, if anything meaningful."
          ),

        management: z
          .object({
            title: z.string().describe("Brief management update headline"),
            content: z
              .string()
              .describe("1-2 sentence management impact description"),
            tag: z
              .enum(["milestone", "update", "risk"])
              .describe("Type of management update"),
          })
          .optional()
          .describe(
            "Management impact of the decision, if anything meaningful."
          ),
      })
      .describe("Accepted response format for business simulation");

    // Define the schema for rejected responses
    const RejectedSchema = z
      .object({
        reason: z.string().describe("Reason for the rejection"),
      })
      .describe("Rejected response format for business simulation");

    // Define the overall response schema
    const ResponseSchema = z.object({
      type: z.enum([ResponseTypes.ACCEPTED, ResponseTypes.REJECTED]),
      tone: z
        .enum(["positive", "negative", "neutral"])
        .describe(
          "The overall expected outcome of the business decision (positive, negative, or neutral)"
        ),
      result: z.union([AcceptedSchema, RejectedSchema]),
    });

    const functionCallingModel = model.withStructuredOutput(ResponseSchema, {
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
      { type: ResponseTypes.REJECTED, reason: "Internal server error" },
      { status: 500 }
    );
  }
}
