import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { micromark } from "micromark";
import { BusinessPlanSection, ResponseTypes } from "@/types";
import { TemplateType } from "@/types/templates";
import { rateLimit } from "@/lib/rateLimit";

export const runtime = "edge";

const TEMPLATE = `You are an AI business plan evaluator for a startup simulation game. 
The user has ~5 minutes to think of, and type out a business plan, so expect quick brainstorming-level ideas, not polished coherent plans. However, the core concept must be solid enough to build on top.

PROBLEM STATEMENT:
{problemStatement}

BUSINESS PLAN SECTIONS:
{businessPlanSections}

PREVIOUS SUBMISSION FEEDBACK (if any):
{previousFeedback}

Your task is to evaluate each section individually and provide specific feedback:

EVALUATION CRITERIA (for 5-minute brainstorming):
- problem-solution: Does it address the specific market gap? Is the solution realistic and buildable?
- target-audience: Is it specific enough to identify real customers? Are basic demographics and needs clear?
- implementation: Are the first steps actionable with realistic resource requirements?

RESPONSE GUIDELINES:
- If ALL sections show viable ideas, respond with type "ACCEPTED" and create a comprehensive formalized business plan PLUS 1-2 initial templates.
  The player is going to provide rough ideas, due to the time constraint, so be VERY forgiving. 
- If ANY section is too vague, unrealistic, or doesn't address the problem, respond with type "REJECTED" and provide section-specific feedback
- **CRITICAL**: Use ONLY these exact section IDs in your sectionFeedback: {sectionIDS}

TEMPLATES FOR ACCEPTED PLANS:
When accepting, include 1-2 templates to give the player initial momentum:

IMPORTANT: 
- The formalizedPlan should ONLY contain the business plan text in markdown format
- The initialTemplates should be separate JSON objects in the response structure
- Do NOT include template examples or JSON code blocks in the formalizedPlan text

StaticTextTemplate (for updates/events):
{{
  "type": "static_text",
  "title": "Event Title",
  "text": "Description of what happened"
}}

ProgressBarTemplate (for trackable goals):
{{
  "type": "progress_bar", 
  "title": "Goal Name",
  "checkpointData": ["Step 1", "Step 2", "Step 3", "Final Step"],
  "reward": "What they get when complete"
}}

CardChoiceTemplate (for decisions):
{{
  "type": "card_choice",
  "title": "Decision Title",
  "description": "Context for the choice",
  "cards": [
    {{
      "title": "Option 1",
      "description": "What this choice does",
      "buttonString": "Choose Option 1"
    }},
    {{
      "title": "Option 2", 
      "description": "What this choice does",
      "buttonString": "Choose Option 2"
    }}
  ]
}}

TEMPLATE EXAMPLES FOR RESTAURANT ORDERING PLATFORM:

Example Marketing Template:
{{
  "type": "progress_bar",
  "title": "Local Restaurant Outreach",
  "checkpointData": ["Contact 5 restaurants", "Get 2 interested", "Schedule demos", "Sign first partner"],
  "reward": "First restaurant partnership + $200 revenue"
}}

Example Product Template:
{{
  "type": "card_choice",
  "title": "Platform Development Priority",
  "description": "You need to build your ordering platform. What should you focus on first?",
  "cards": [
    {{
      "title": "Restaurant Dashboard",
      "description": "Build the admin panel for restaurants to manage orders and menus",
      "buttonString": "Build Dashboard First"
    }},
    {{
      "title": "Customer App",
      "description": "Create the customer-facing ordering interface and discovery features", 
      "buttonString": "Build App First"
    }},
    {{
      "title": "MVP Website",
      "description": "Start with a simple website that handles basic ordering",
      "buttonString": "Build Website First"
    }}
  ]
}}

Example Management Template:
{{
  "type": "static_text",
  "title": "Angel Investor Interest",
  "text": "A local angel investor heard about your restaurant platform through a mutual connection. They're interested in learning more about your business model and early traction. This could be an opportunity for seed funding, but you'll need to show some initial restaurant partnerships first."
}}

FEEDBACK STYLE - Be direct and concise:
- BAD: "Your target audience could benefit from additional specificity and demographic details to better understand your customer base"
- GOOD: "Too vague. Instead of 'small businesses,' specify: 'Local restaurants with X employees struggling with online presence'"

- BAD: "Your solution presents an interesting approach but would benefit from more concrete implementation details"  
- GOOD: "Missing key features. What does your app do? Add specifics like 'commission-free ordering platform'"

- BAD: "Your implementation strategy shows promise but requires more detailed planning"
- GOOD: "No clear first steps. Try: 'Week 1: Build landing page, Week 2: Contact 10 local restaurants, Week 3: Launch pilot'"

For repeat submissions:
- Note improvements briefly
- Focus only on remaining issues
- After multiple rejections, be blunt: "This still doesn't work because..." and give specific fixes needed

EXAMPLE EVALUATION - ACCEPTANCE:

User inputs for the 3 sections:

Section problem-solution: "Build a simple website platform that lets local restaurants take orders directly without paying huge fees to delivery apps. Restaurants get their own ordering page and can manage everything through a basic dashboard. Customers can find local restaurants nearby and order directly from them instead of going through expensive third-party apps."

Section target-audience: "Small family restaurants that are struggling with delivery app fees but need online ordering. I'll reach out to restaurant owners directly, maybe partner with local food bloggers, and post in neighborhood Facebook groups where restaurant owners hang out. Focus on places that aren't big chains."

Section financials: "Charge restaurants a low monthly fee instead of taking a percentage of every order like the big apps do. This way restaurants keep more of their money. Start with just a few local restaurants and grow from there. Maybe add payment processing for a small fee to make money that way too."

Response:
{{
  "type": "ACCEPTED",
  "response": {{
    "formalizedPlan": "# Local Restaurant Direct Ordering Platform\n\n## Problem Statement\nLocal restaurants face a dilemma: customers increasingly expect online ordering and delivery options, but platforms like DoorDash and UberEats charge 15-30% commission fees that devastate already thin profit margins...\n\n## Solution\nA commission-free online ordering platform that allows local restaurants to take orders directly through their own branded ordering pages...\n\n## Target Market\nFamily-owned restaurants with 2-15 employees who are currently losing 15-30% of profits to delivery platforms...\n\n## Revenue Model\nFlat monthly subscription fee of $49 per restaurant instead of per-order commissions...",
    "initialTemplates": {{
      "marketing": {{
        "type": "progress_bar",
        "title": "Local Restaurant Outreach",
        "checkpointData": ["Contact 5 restaurants", "Get 2 interested", "Schedule demos", "Sign first partner"],
        "reward": "First restaurant partnership + $200 revenue"
      }},
      "product": {{
        "type": "card_choice",
        "title": "Platform Development Priority",
        "description": "You need to build your ordering platform. What should you focus on first?",
        "cards": [
          {{
            "title": "Restaurant Dashboard",
            "description": "Build the admin panel for restaurants to manage orders and menus",
            "buttonString": "Build Dashboard First"
          }},
          {{
            "title": "Customer App",
            "description": "Create the customer-facing ordering interface and discovery features",
            "buttonString": "Build App First"
          }}
        ]
      }},
      "management": null
    }}
  }}
}}`;

const StaticTextTemplateSchema = z.object({
  type: z.literal(TemplateType.StaticText),
  title: z.string(),
  text: z.string(),
});

const ProgressBarTemplateSchema = z.object({
  type: z.literal(TemplateType.ProgressBar),
  title: z.string(),
  checkpointData: z.array(z.string()),
  reward: z.string(),
});

const CardChoiceTemplateSchema = z.object({
  type: z.literal(TemplateType.CardChoice),
  title: z.string(),
  description: z.string(),
  cards: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      buttonString: z.string(),
    })
  ),
});

const TemplateSchema = z.union([
  StaticTextTemplateSchema,
  ProgressBarTemplateSchema,
  CardChoiceTemplateSchema,
]);

const AcceptedResponseSchema = z.object({
  formalizedPlan: z
    .string()
    .describe(
      "A comprehensive, well-structured business plan that combines all sections into a cohesive document"
    ),
  initialTemplates: z
    .object({
      marketing: TemplateSchema.nullable(),
      product: TemplateSchema.nullable(),
      management: TemplateSchema.nullable(),
    })
    .describe(
      "1-2 initial templates to give the player momentum in the document phase"
    ),
});

const RejectedResponseSchema = z.object({
  sectionFeedback: z.array(
    z.object({
      sectionId: z.string(),
      isValid: z.boolean(),
      feedback: z.string(),
    })
  ),
  overallMessage: z
    .string()
    .describe(
      "Brief encouraging message about overall progress and next steps"
    ),
});

const ValidationResponseSchema = z.object({
  type: z.enum([ResponseTypes.ACCEPTED, ResponseTypes.REJECTED]),
  response: z.union([AcceptedResponseSchema, RejectedResponseSchema]),
});

export interface ValidationResponse {
  type: ResponseTypes.ACCEPTED | ResponseTypes.REJECTED;
  response: {
    formalizedPlan?: string;
    initialTemplates?: {
      marketing?: any;
      product?: any;
      management?: any;
    };
    sectionFeedback?: Array<{
      sectionId: string;
      isValid: boolean;
      feedback?: string;
    }>;
    overallMessage?: string;
  };
}

export async function POST(
  req: NextRequest
): Promise<NextResponse<ValidationResponse>> {
  if (!rateLimit(req, 5, 60000)) {
    return NextResponse.json(
      {
        type: ResponseTypes.REJECTED,
        response: {
          overallMessage:
            "Too many requests. Please wait a moment before trying again.",
          sectionFeedback: [],
        },
      },
      { status: 429 }
    );
  }

  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          type: ResponseTypes.REJECTED,
          response: {
            overallMessage:
              "Server configuration error. Please try again later.",
            sectionFeedback: [],
          },
        },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { problemStatement, businessPlanSections, previousAttempts } = body;

    const sectionIds = businessPlanSections.map((section: any) => section.id);

    if (!problemStatement || !businessPlanSections) {
      return NextResponse.json(
        {
          type: ResponseTypes.REJECTED,
          response: {
            overallMessage:
              "Missing required information. Please complete all sections.",
            sectionFeedback: [],
          },
        },
        { status: 400 }
      );
    }

    // Validate input lengths to prevent abuse
    for (const section of businessPlanSections) {
      if (section.value && section.value.length > section.maxLength + 100) {
        // Allow slight buffer
        return NextResponse.json(
          {
            type: ResponseTypes.REJECTED,
            response: {
              overallMessage: "One or more sections exceed the maximum length.",
              sectionFeedback: [
                {
                  sectionId: section.id,
                  isValid: false,
                  feedback: `This section is too long (${section.value.length} characters). Please keep it under ${section.maxLength} characters.`,
                },
              ],
            },
          },
          { status: 400 }
        );
      }
    }

    // Format sections for the AI - only send ID, placeholder, and value
    const sectionsForAI = businessPlanSections.map((section: any) => ({
      id: section.id,
      placeholder: section.placeholder,
      value: section.value || "",
    }));

    const sectionsText = sectionsForAI
      .map(
        (section: BusinessPlanSection) =>
          `**Section ${section.id}**:\nPrompt: ${
            section.placeholder
          }\nUser Response: ${section.value || "(Not provided)"}\n`
      )
      .join("\n");

    const previousFeedbackText =
      previousAttempts?.length > 0
        ? `This is submission attempt #${
            previousAttempts.length + 1
          }. The user has been working on improving their plan. Acknowledge any improvements and focus on remaining issues.`
        : "This is the first submission. Provide comprehensive feedback.";

    const prompt = PromptTemplate.fromTemplate(TEMPLATE);
    const model = new ChatOpenAI({
      temperature: 0.7,
      model: "gpt-4o-mini",
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    const functionCallingModel = model.withStructuredOutput(
      ValidationResponseSchema
    );
    const chain = prompt.pipe(functionCallingModel);

    const result = await chain.invoke({
      problemStatement,
      businessPlanSections: sectionsText,
      previousFeedback: previousFeedbackText,
      sectionIDS: sectionIds.join(", "),
    });

    // Convert markdown to HTML for accepted responses
    if (
      result.type === ResponseTypes.ACCEPTED &&
      "formalizedPlan" in result.response
    ) {
      result.response.formalizedPlan = micromark(
        result.response.formalizedPlan
      );
    }

    console.log("Validation result:", result);

    return NextResponse.json(result, { status: 200 });
  } catch (e: any) {
    console.error("Error validating business plan:", e);
    return NextResponse.json(
      {
        type: ResponseTypes.REJECTED,
        response: {
          overallMessage:
            "Something went wrong while evaluating your plan. Please try again.",
          sectionFeedback: [],
        },
      },
      { status: 500 }
    );
  }
}
