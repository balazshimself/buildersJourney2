export type AppPhase = "rules" | "problem" | "document" | "evaluation";

import { AIResponse } from "@/components/templates/templateCompontents";

export enum ResponseTypes {
  ACCEPTED = "accepted",
  REJECTED = "rejected",
}

export interface Problem {
  id: string;
  title: string;
  description: string;
  marketAnalysis: string;
}

export type GanttTask = {
  id: string;
  name: string;
  start: Date;
  end: Date;
  progress: number;
  dependencies?: string;
  customClass?: string;
};

export interface Document {
  id: string;
  title: string;
  content: React.ReactNode;
  countdown?: number;
  createdAt: Date;
  metadata?: {
    effect?: "positive" | "neutral" | "negative";
    cost?: number;
    return?: number;
    aiResponse?: AIResponse;
    [key: string]: any;
  };
}

export interface AppState {
  currentPhase: AppPhase;
  currentProblem: Problem | null;
  logs: Document[];
  userInput: string;
  timer: number;
  isPassed: boolean | null;
  isValidating: boolean;
  businessPlan: Document | null;
  rejectionReason?: string;
  timeline: GanttTask[];
}
