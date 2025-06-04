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
The user has submitted a structured business plan with different sections addressing a specific market problem.

PROBLEM STATEMENT:
{problemStatement}

BUSINESS PLAN SECTIONS:
{businessPlanSections}

PREVIOUS SUBMISSION FEEDBACK (if any):
{previousFeedback}

Your task is to evaluate each section individually and provide specific feedback:

EVALUATION CRITERIA:
- problem-solution: Does it address the specific market gap? Is the solution feasible and realistic?
- target-audience: Is it specific enough? Are demographics, needs, and pain points clearly defined? Are marketing channels appropriate?
- implementation: Are the first steps actionable with realistic resource requirements?

RESPONSE GUIDELINES:
- If ALL sections are satisfactory and work together cohesively, respond with type "ACCEPTED" and create a comprehensive formalized business plan
- If ANY section needs improvement, respond with type "REJECTED" and provide section-specific feedback
- **CRITICAL**: Use ONLY these exact section IDs in your sectionFeedback: "problem-solution", "target-audience", "implementation"

Be specific and actionable in your feedback. Examples of good feedback:
- "Your target audience is too broad. Instead of 'working professionals,' specify: 'Marketing managers aged 28-45 at mid-size companies (50-500 employees) struggling with campaign attribution'"
- "Your solution lacks concrete features. Consider: 'A mobile app with push notifications, local business partnerships, and AI-powered event recommendations based on user preferences'"
- "Your implementation plan needs specific steps. Try: 'Week 1-2: Build MVP landing page, Week 3-4: Partner with 5 local venues, Week 5-6: Launch beta with 50 users'"

For repeat submissions:
- Acknowledge what has improved since the last attempt
- Focus feedback only on sections that still need work
- Be encouraging about progress while maintaining standards
- If someone keeps submitting inadequate plans, be more direct about the specific improvements needed`;

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
