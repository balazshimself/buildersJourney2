// app/api/validateBusinessPlan/route.ts - Fixed version
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { micromark } from "micromark";
import { BusinessPlanSection, ResponseTypes } from "@/types";
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
- If ALL sections show a viable business concept (even if rough), respond with type "ACCEPTED" and create a comprehensive formalized business plan
- If ANY section is too vague, unrealistic, or doesn't address the problem, respond with type "REJECTED" and provide section-specific feedback
- **CRITICAL**: Use ONLY these exact section IDs in your sectionFeedback: {sectionIDS}

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

EXAMPLE EVALUATIONS:

Example 1 - REJECTION (too vague):
User input in the problem-solution input: "I will create an app for restaurants"
Response: {{
  "type": "REJECTED",
  "response": {{
    "sectionFeedback": [
      {{
        "sectionId": "problem-solution",
        "isValid": false,
        "feedback": "What does the app actually do? The problem is high delivery fees - how does your app solve this?"
      }},
      ...
    ],
    "overallMessage": "Too generic. Need specific features and clear target market."
  }}
}}

Example 2 - ACCEPTANCE (good brainstorm):
User input: "Commission-free ordering platform for small restaurants. Target family-owned places with less than 10 employees. Charge monthly instead of 15% per order. Use connections for pilot testing."
Response: {{
  "type": "ACCEPTED", 
  "response": {{
    "formalizedPlan": "Local Restaurant Direct Ordering Platform\n\nProblem: Independent restaurants lose 15-30% profit to delivery platforms...\n\nSolution: Commission-free ordering platform charging flat $49/month...\n\n[Full formatted business plan]"
  }}
}}

Example 3 - BLUNT REJECTION (repeat offender):
User input: "Make restaurants better with technology"
Response: {{
  "type": "REJECTED",
  "response": {{
    "sectionFeedback": [
      {{
        "sectionId": "problem-solution",
        "isValid": false, 
        "feedback": "This still doesn't work. 'Make better with technology' isn't a solution. The problem is delivery fees - propose something concrete like 'direct ordering system' or 'loyalty app.'"
      }}
    ],
    "overallMessage": "Third attempt still too vague. You need actual features and implementation steps."
  }}
}}
  
Example 3 - BLUNT REJECTION (irrelevant input):
User input: "ASDAGsdsasd I like pizza"
Response: {{
  "type": "REJECTED",
  "response": {{
    "sectionFeedback": [
      {{
        "sectionId": "problem-solution",
        "isValid": false, 
        "feedback": "Your input does not provide any relevant information."
      }}
    ],
    "overallMessage": "Attempt way too vague. You need actual features and implementation steps."
  }}
}}`;

const AcceptedResponseSchema = z.object({
  formalizedPlan: z
    .string()
    .describe(
      "A comprehensive, well-structured business plan that combines all sections into a cohesive document"
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
