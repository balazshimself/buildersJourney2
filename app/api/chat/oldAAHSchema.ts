// // Define the schema for accepted responses
// const AcceptedSchema = z
//   .object({
//     cost: z.number().describe("The cost of implementing this decision"),

//     monetary_return: z
//       .number()
//       .describe(
//         "The expected monetary return of the action. Can, and sometimes should be negative."
//       ),

//     effect: z
//       .string()
//       .describe("Detailed outcome of the business decision (3-5 sentences)"),

//     title: z
//       .string()
//       .describe("A short, catchy title for this project (15 chars max)"),

//     product: z
//       .object({
//         title: z.string().describe("Brief product update headline"),
//         content: z.string().describe("1-2 sentence product impact description"),
//         tag: z
//           .enum(["milestone", "update", "risk"])
//           .describe("Type of product update"),
//       })
//       .nullable()
//       .describe(
//         "Product development impact of the decision, if anything meaningful."
//       ),

//     marketing: z
//       .object({
//         title: z.string().describe("Brief marketing update headline"),
//         content: z
//           .string()
//           .describe("1-2 sentence marketing impact description"),
//         tag: z
//           .enum(["milestone", "update", "risk"])
//           .describe("Type of marketing update"),
//       })
//       .nullable()
//       .describe("Marketing impact of the decision, if anything meaningful."),

//     management: z
//       .object({
//         title: z.string().describe("Brief management update headline"),
//         content: z
//           .string()
//           .describe("1-2 sentence management impact description"),
//         tag: z
//           .enum(["milestone", "update", "risk"])
//           .describe("Type of management update"),
//       })
//       .optional()
//       .describe("Management impact of the decision, if anything meaningful."),
//   })
//   .describe("Accepted response format for business simulation");
