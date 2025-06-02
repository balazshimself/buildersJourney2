// lib/validation.ts
import { z } from "zod";

export const businessPlanSchema = z.object({
  problemStatement: z.string().min(10).max(5000),
  businessPlan: z.string().min(50).max(2000),
  previousPrompts: z.array(z.string()).optional(),
});

export const chatMessageSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "system", "assistant"]),
        content: z.string().min(1).max(2000),
      })
    )
    .min(1)
    .max(10),
  businessPlan: z.string().optional(),
  buildLogs: z.string().optional(),
  componentInteractions: z.string().optional(),
});
