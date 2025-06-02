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
Respond using the "Rejected response format" schema, providing a clear reason for rejection.

2. If the decision is plausible and relevant, ACCEPT it. Respond using the "Accepted response format" schema, and generate 1-2 (or max 2-3) templates cards choosing from these schemas:
- StaticTextTemplate: For general information or updates.
- ProgressBarTemplate: For tracking progress or milestones.
- ChoiceTemplate: For presenting the player with options or next steps.

Make up information as needed, and ensure the player has choices and clear paths to choose from. Your task as this point is to simulate a likely impact of
the player's decision. Be as specific as possible with information.
For each area (marketing, product, management), you may return null if there is no meaningful update. Otherwise, use one of the above templates.

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
  "result": {{ "reason": "Incoherent prompt. Impossible to evaluate." }}
}}

2. Rejection:
Player input: "I will launch a social media campaign."
Response:
{{
  "type": "REJECTED",
  "tone": "negative", 
  "result": {{ "reason": "Social media campaigns can be effective, but this lacks specificity. What platforms will you use? What's your target demographic? What's your budget and content strategy? Without these details, it's impossible to predict realistic outcomes or costs." }}
}}

3. Acceptance:
Player input: "I will launch a targeted Instagram campaign for working professionals aged 25-35, focusing on productivity pain points. Budget of $400 for 2 weeks of promoted posts, creating 10 carousel posts about common workplace challenges our product solves."
Response:
{{
  "type": "ACCEPTED",
  "tone": "neutral",
  "result": {{
    "marketing": {{
      "type": "choice",
      "title": "Content Performance Tracking",
      "description": "Your first week of posts are live. Early data shows mixed results - productivity tips perform well, but product demos get low engagement.",
      "cards": [
        {{
          "title": "Double Down on Tips",
          "description": "Focus remaining budget on educational content that's performing well, build audience first",
          "buttonString": "Pivot Strategy"
        }},
        {{
          "title": "A/B Test Product Focus", 
          "description": "Split remaining budget between tips and different product demo formats",
          "buttonString": "Test Approach"
        }},
        {{
          "title": "Influencer Collaboration",
          "description": "Partner with a micro-influencer in productivity space for authentic endorsement",
          "buttonString": "Find Partner"
        }}
      ]
    }},
    "product": null,
    "management": null,
    "log": {{
      "title": "Instagram Marketing Launch",
      "content": "Campaign reached 2,400 professionals with 180 click-throughs to your landing page. Cost per click averaged $2.20. Educational content shows 3x higher engagement than direct product promotion. Generated 23 email signups and 3 demo requests. Performance suggests audience prefers value-first approach.",
      "cost": 400,
      "monetary_return": 280
    }}
  }}
}}


4. Acceptance:
Player input: "I want to hire a part-time developer to help build our mobile app prototype. Budget around $2000 for a month of work."
Response:
{{
  "type": "ACCEPTED", 
  "tone": "positive",
  "result": {{
    "product": {{
      "type": "progress_bar",
      "title": "Mobile App Development",
      "checkpointData": ["Requirements gathering", "UI mockups", "Core features", "Testing & debugging", "App store preparation"],
      "reward": "Functional prototype ready for user testing"
    }},
    "management": {{
      "type": "choice",
      "title": "Developer Hiring Decision",
      "description": "You've received applications from 3 candidates within your budget. Each brings different strengths to your project.",
      "cards": [
        {{
          "title": "Sarah - React Native Expert",
          "description": "3 years mobile dev experience, $50/hour, available 20 hrs/week. Strong portfolio but no startup experience.",
          "buttonString": "Hire Sarah"
        }},
        {{
          "title": "Marcus - Full-Stack Generalist", 
          "description": "5 years experience, $45/hour, 25 hrs/week. Less mobile focus but has worked at 2 early-stage startups.",
          "buttonString": "Hire Marcus"
        }},
        {{
          "title": "Alex - Junior Developer",
          "description": "1 year experience, $30/hour, 30 hrs/week. Eager learner, lower cost but will need more guidance.",
          "buttonString": "Hire Alex"
        }}
      ]
    }},
    "marketing": null,
    "log": {{
      "title": "Developer Search Complete",
      "content": "Posted job on 3 freelance platforms and received 12 applications. After initial screening calls, you've identified 3 viable candidates within budget. Each has different experience levels and hourly rates. Your choice will impact development speed, code quality, and how much oversight you'll need to provide.",
      "cost": 150,
      "monetary_return": 0
    }}
  }}
}}

5. Acceptance:
Player input: "I want to build a basic website prototype to test our concept with potential customers. I'll use a website builder and spend about $500 on design and basic functionality."
Response:
{{
  "type": "ACCEPTED",
  "tone": "positive", 
  "result": {{
    "product": {{
      "type": "progress_bar",
      "title": "Website Prototype Development",
      "checkpointData": ["Domain & hosting setup", "Choose template & branding", "Core pages creation", "Contact/signup forms", "Mobile optimization", "User testing prep"],
      "reward": "$300 in early customer pre-orders"
    }},
    "marketing": {{
      "type": "static_text",
      "title": "Landing Page Strategy",
      "text": "Your prototype website is taking shape with a clean, professional design. The value proposition is clear on the homepage, and you've set up basic analytics tracking. Early feedback from 5 friends suggests the pricing section needs work - visitors are confused about what's included in each tier."
    }},
    "management": null,
    "log": {{
      "title": "Website Prototype Build",
      "content": "Selected Webflow as your platform and purchased a premium template ($89). Customized branding and created 5 core pages: home, features, pricing, about, and contact. Set up basic lead capture forms and Google Analytics. Estimated 2 weeks to complete with current pace of 1-2 hours daily work.",
      "cost": 500,
      "monetary_return": 0
    }}
  }}
}}

Always use the schemas above for your response. Do not add extra commentary.

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
