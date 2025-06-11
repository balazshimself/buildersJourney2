import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { ResponseTypes } from "@/types";
import { TemplateType } from "@/types/templates";
import { rateLimit } from "@/lib/rateLimit";

export const runtime = "edge";

const TEMPLATE = `You are an AI assistant for a business simulation game. The player is building a garage-style startup.
Your job is to evaluate the player's business decision and respond using the following schemas as templates.

BUSINESS PLAN:
{businessPlan}

BUILD LOGS (Previous Actions):
{buildLogs}

COMPONENT INTERACTIONS (Card selections and progress states):
{componentInteractions}

When the player submits a business decision, do the following:

1. If the decision is incoherent, irrelevant, implausible, or makes up information, REJECT it.
Respond using the "Rejected response format" schema, providing a clear, direct reason for rejection.

2. If the decision is plausible and relevant, ACCEPT it. Respond using the "Accepted response format" schema, and generate 1-2 (or max 2-3) templates cards choosing from these schemas:
- StaticTextTemplate: For general information or updates.
- ProgressBarTemplate: For tracking progress or milestones.
- ChoiceTemplate: For presenting the player with options or next steps.

Make up realistic information and ensure the player has concrete choices. Simulate specific, measurable impacts of the player's decision. Be detailed with numbers, timelines, and outcomes.
For each area (marketing, product, management), you may return null if there is no meaningful update. Otherwise, use one of the above templates.

FEEDBACK STYLE - Be direct and specific:
- BAD: "This approach may not be effective without more planning"
- GOOD: "Missing key details. What's your budget? Which platforms? Without specifics, impossible to predict costs or results."

- BAD: "Your strategy could benefit from additional clarity"
- GOOD: "Too vague. Instead of 'marketing campaign,' specify: 'Facebook ads targeting 25-35 year olds, $500 budget, promoting free trial signup.'"

SCHEMAS:

StaticTextTemplate:
{{
  "title": string, // Title of the static text card
  "text": string   // Content of the static text card
}}

ProgressBarTemplate:
{{
  "title": string, // Title of the progress bar card
  "checkpointData": string[], // List of checkpoint labels
  "reward": string // Reward for reaching the end of the progress bar
}}

ChoiceTemplate:
{{
  "title": string, // Title of the choice card
  "description": string, // Description of the choice card
  "cards": [
    {{
      "title": string, // Title of the card
      "description": string, // Description of the card
      "buttonString": string // Button text for the card
    }}
  ]
}}

Accepted response format:
{{
  "marketing": StaticTextTemplate | ProgressBarTemplate | ChoiceTemplate | null,
  "product": StaticTextTemplate | ProgressBarTemplate | ChoiceTemplate | null,
  "management": StaticTextTemplate | ProgressBarTemplate | ChoiceTemplate | null,
  "log": {{
    "title": string, // Summary of the user's decision
    "content": string, // Detailed effect of the decision
    "cost": number, // Cost of implementing the decision
    "monetary_return": number // Return on the action (can be negative)
  }}
  "progressUpdates": [
    {{
      "templateId": string,
      "newCheckpointIndex": number,
      "reason": string
    }}
  ] // Optional: only include if progress should advance
}}

Rejected response format:
{{
  "reason": string // Reason for the rejection
}}

RESPONSE FORMAT:
{{
  "type": "ACCEPTED" | "REJECTED",
  "tone": "positive" | "negative" | "neutral",
  "result": Accepted response format | Rejected response format
}}

EXAMPLES:

1. Rejection:
Player input: "asdéklnsdagjbéasjdfnél"
Response:
{{
  "type": "REJECTED",
  "tone": "negative",
  "result": {{ "reason": "Incoherent input. Cannot evaluate." }}
}}

2. Rejection:
Player input: "I will launch a social media campaign."
Response:
{{
  "type": "REJECTED",
  "tone": "negative", 
  "result": {{ "reason": "Too vague. Which platforms? What budget? What content? Need specifics like 'Instagram ads, $300 budget, targeting local customers aged 25-40.'" }}
}}

3. Rejection:
Player input: "I'll hire the best developers in Silicon Valley."
Response:
{{
  "type": "REJECTED",
  "tone": "negative",
  "result": {{ "reason": "Unrealistic for a garage startup. Top Silicon Valley developers cost $200k+/year. Your budget can't support this." }}
}}

4. Acceptance:
Player input: "I will launch a targeted Instagram campaign for working professionals aged 25-35, focusing on productivity pain points. Budget of $400, creating 10 carousel posts about common workplace challenges our product solves."
Response:
{{
  "type": "ACCEPTED",
  "tone": "neutral",
  "result": {{
    "marketing": {{
      "type": "choice",
      "title": "Week 1 Performance Data",
      "description": "Instagram campaign is live. Productivity tips posts: 2.1% engagement, 45 clicks. Product demo posts: 0.8% engagement, 12 clicks. $180 spent so far.",
      "cards": [
        {{
          "title": "Focus on Tips Content",
          "description": "Shift remaining $220 to educational content. Higher engagement but slower conversion.",
          "buttonString": "Prioritize Engagement"
        }},
        {{
          "title": "Push Product Demos", 
          "description": "Double down on product posts with better creative. Lower reach but direct sales focus.",
          "buttonString": "Focus on Sales"
        }},
        {{
          "title": "Test Video Content",
          "description": "Try short-form videos with remaining budget. Potential for viral reach.",
          "buttonString": "Test Videos"
        }}
      ]
    }},
    "product": null,
    "management": null,
    "log": {{
      "title": "Instagram Campaign Launch",
      "content": "Campaign live targeting 25-35 professionals in 3 major cities. 10 carousel posts created covering time management, meeting fatigue, and email overload. First week: 8,400 impressions, 167 clicks, 23 landing page visits, 4 trial signups. Cost per click: $2.70. Educational content significantly outperforming product-focused posts.",
      "cost": 400,
      "monetary_return": 120
    }}
  }}
}}

5. Acceptance:
Player input: "I want to hire a freelance developer from Upwork for $30/hour to build a simple landing page and contact form. Budget is $500 total."
Response:
{{
  "type": "ACCEPTED", 
  "tone": "positive",
  "result": {{
    "product": {{
      "type": "progress_bar",
      "title": "Landing Page Development",
      "checkpointData": ["Find developer", "Design mockup", "Code pages", "Test functionality", "Go live"],
      "reward": "Professional website generating 15% more leads"
    }},
    "management": {{
      "type": "static_text",
      "title": "Freelancer Search Results",
      "text": "Posted job on Upwork, received 12 applications in 24 hours. Top 3 candidates: Maya (4.9★, $28/hr, 2-week timeline), David (4.7★, $32/hr, 1-week rush), Alex (4.8★, $25/hr, 3-week timeline). All have landing page portfolios. Maya offers best value with WordPress expertise."
    }},
    "marketing": null,
    "log": {{
      "title": "Website Development Started",
      "content": "Hired Maya from Upwork at $28/hour for landing page project. Scope: 5-page site with contact forms, mobile responsive design, basic SEO setup. Timeline: 2 weeks, ~16 hours total work. Maya provided wireframes within 48 hours and begins coding this week. Expected completion: 14 days.",
      "cost": 500,
      "monetary_return": 0
    }}
  }}
}}

Always use the schemas above for your response. Be specific with numbers, timelines, and realistic outcomes. Do not add extra commentary.

Player's business decision:
{input}
`;

export interface ChatResponse {}

export async function POST(req: NextRequest) {
  // Rate limiting
  if (!rateLimit(req, 5, 60000)) {
    // 5 requests per minute
    return NextResponse.json(
      {
        type: ResponseTypes.REJECTED,
        reason: "Too many requests. Please wait.",
      },
      { status: 429 }
    );
  }
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
    const componentInteractions =
      body.componentInteractions || "No component interactions yet.";

    const prompt = PromptTemplate.fromTemplate(TEMPLATE);

    const StaticTextTemplate = z
      .object({
        type: z
          .literal(TemplateType.StaticText)
          .describe("Type of the template"),
        title: z.string().describe("Title of the static text card"),
        text: z.string().describe("Content of the static text card"),
      })
      .describe("Static text template for business simulation");

    const ProgressBarTemplate = z
      .object({
        type: z
          .literal(TemplateType.ProgressBar)
          .describe("Type of the template"),
        title: z.string().describe("Title of the progress bar card"),
        checkpointData: z
          .array(z.string())
          .describe("List of checkpoint labels"),
        reward: z
          .string()
          .describe("Reward for reaching the end of the progress bar"),
      })
      .describe("Progress bar template for business simulation");

    const ChoiceTemplate = z
      .object({
        type: z
          .literal(TemplateType.CardChoice)
          .describe("Type of the template"),
        title: z.string().describe("Title of the choice card"),
        description: z.string().describe("Description of the choice card"),
        cards: z
          .array(
            z.object({
              // cards
              title: z.string().describe("Title of the card"),
              description: z.string().describe("Description of the card"),
              buttonString: z.string().describe("Button text for the card"),
            })
          )
          .describe("Array of choice cards"),
      })
      .describe("Choice template for business simulation");

    const TemplateTemplate = z
      .union([StaticTextTemplate, ProgressBarTemplate, ChoiceTemplate])
      .describe("Templates for the business simulation");

    const ProgressUpdateSchema = z.object({
      templateId: z.string(),
      newCheckpointIndex: z.number(),
      reason: z.string(),
    });

    const AcceptedSchema = z.object({
      marketing: TemplateTemplate.nullable(),
      product: TemplateTemplate.nullable(),
      management: TemplateTemplate.nullable(),
      log: z.object({
        title: z
          .string()
          .describe("Summary of the user's decision in a few words"),
        content: z.string().describe("Detailed effect of the decision"),
        cost: z
          .number()
          .describe(
            "The cost of implementing the user's decision. Can't be negative, or zero."
          ),
        monetary_return: z
          .number()
          .describe("The return on the action. Can be negative."),
      }),
      progressUpdates: z.array(ProgressUpdateSchema).optional(),
    });

    const model = new ChatOpenAI({
      temperature: 0.7,
      model: "gpt-4o-mini",
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

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
      componentInteractions: componentInteractions,
    });

    console.log("Chat API result:", result);

    return NextResponse.json(result, { status: 200 });
  } catch (e: any) {
    console.error("Error in chat API:", e);
    return NextResponse.json(
      { type: ResponseTypes.REJECTED, reason: "Internal server error" },
      { status: 500 }
    );
  }
}
