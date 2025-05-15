import { AIResponse } from "./templateCompontents";

/**
 * Example 1: Accepted response with mixed template types
 */
export const SAMPLE_ACCEPTED_RESPONSE: AIResponse = {
  type: "accepted",
  content: [
    {
      document: "Product Development",
      component: {
        type: "staticText",
        data: {
          title: "New Feature Development",
          text: "Your team has begun development on the automated editing feature. Initial user testing shows positive reactions, with 87% of beta testers finding it easier to use than manual editing tools. Development is expected to take 6 weeks before full release.",
        },
      },
    },
    {
      document: "Marketing",
      component: {
        type: "progressBar",
        data: {
          label: "Social Media Campaign Progress",
          currentValue: 65,
          targetValue: 100,
        },
      },
    },
    {
      document: "Management",
      component: {
        type: "cardChoice",
        data: [
          {
            title: "Hire Senior Developer",
            description:
              "Bring on an experienced developer to accelerate product development and improve code quality.",
            cost: 12000,
            budgetImpact: -12000,
            effects: [
              { metric: "Development Speed", change: 25 },
              { metric: "Product Quality", change: 15 },
              { metric: "Team Morale", change: 10 },
            ],
          },
          {
            title: "Outsource Development",
            description:
              "Contract with an external company to handle development work for the next phase.",
            cost: 8000,
            budgetImpact: -8000,
            effects: [
              { metric: "Development Speed", change: 20 },
              { metric: "Product Quality", change: -5 },
              { metric: "Capital Preservation", change: 15 },
            ],
          },
        ],
      },
    },
  ],
};

/**
 * Example 2: Rejected response
 */
export const SAMPLE_REJECTED_RESPONSE: AIResponse = {
  type: "rejected",
  reason:
    "Your proposal lacks specific details about implementation and exceeds your current budget without a clear funding plan. Please revise with more concrete steps and ensure it fits within your financial constraints.",
};

/**
 * Example 3: Research & Development project
 */
export const SAMPLE_RD_RESPONSE: AIResponse = {
  type: "accepted",
  content: [
    {
      document: "Product Development",
      component: {
        type: "staticText",
        data: {
          title: "R&D Project Initiated",
          text: "Your team has started investigating AI-powered video stabilization technology. Initial research suggests this could reduce processing time by 40% and improve quality in low-light conditions. The research phase will take approximately 3 weeks to complete.",
        },
      },
    },
    {
      document: "Product Development",
      component: {
        type: "progressBar",
        data: {
          label: "R&D Project Progress",
          currentValue: 15,
          targetValue: 100,
        },
      },
    },
    {
      document: "Management",
      component: {
        type: "staticText",
        data: {
          title: "Resource Allocation",
          text: "You've assigned 2 engineers and allocated computing resources to this project. This represents approximately 25% of your current engineering capacity.",
        },
      },
    },
  ],
};

/**
 * Example 4: Marketing Campaign
 */
export const SAMPLE_MARKETING_RESPONSE: AIResponse = {
  type: "accepted",
  content: [
    {
      document: "Marketing",
      component: {
        type: "staticText",
        data: {
          title: "Social Media Campaign Launched",
          text: "Your team has launched a targeted social media campaign focusing on family users and travel enthusiasts. Initial engagement metrics show a 23% higher click-through rate than industry average.",
        },
      },
    },
    {
      document: "Marketing",
      component: {
        type: "cardChoice",
        data: [
          {
            title: "Increase Ad Spend",
            description:
              "Double down on successful channels by increasing ad budget.",
            cost: 5000,
            budgetImpact: -5000,
            effects: [
              { metric: "Brand Awareness", change: 30 },
              { metric: "Customer Acquisition", change: 25 },
            ],
          },
          {
            title: "Expand to New Platform",
            description:
              "Extend your campaign to a new social media platform to reach different demographics.",
            cost: 3500,
            budgetImpact: -3500,
            effects: [
              { metric: "Audience Diversity", change: 40 },
              { metric: "Brand Awareness", change: 15 },
            ],
          },
          {
            title: "Optimize Current Campaign",
            description:
              "Refine targeting and messaging based on initial data without increasing spend.",
            cost: 1000,
            budgetImpact: -1000,
            effects: [
              { metric: "ROI", change: 20 },
              { metric: "Conversion Rate", change: 15 },
            ],
          },
        ],
      },
    },
  ],
};

/**
 * Example 5: Team Management
 */
export const SAMPLE_MANAGEMENT_RESPONSE: AIResponse = {
  type: "accepted",
  content: [
    {
      document: "Management",
      component: {
        type: "staticText",
        data: {
          title: "Team Restructuring Complete",
          text: "You've successfully reorganized your team into three focused departments: Core Development, User Experience, and Customer Support. This new structure is expected to improve communication and accelerate feature delivery by eliminating silos.",
        },
      },
    },
    {
      document: "Management",
      component: {
        type: "progressBar",
        data: {
          label: "Team Efficiency",
          currentValue: 72,
          targetValue: 100,
        },
      },
    },
    {
      document: "Product Development",
      component: {
        type: "staticText",
        data: {
          title: "Development Velocity Increased",
          text: "With the new team structure, sprint velocity has increased by 35%. Your development team is now able to deliver features faster with fewer cross-team dependencies.",
        },
      },
    },
  ],
};
