import { CardComponent } from "./templates";

export type AppPhase = "rules" | "problem" | "document" | "evaluation";

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
    [key: string]: any;
  };
}

export interface AppState {
  currentPhase: AppPhase;
  currentProblem: Problem | null;
  marketingCards: CardComponent[];
  productCards: CardComponent[];
  managementCards: CardComponent[];
  logs: Document[];
  rejectionReason?: string;
  timer: number;
  isLoading: boolean;
  businessPlan: Document | null;
  timeline: GanttTask[];
  companyValue: number;
}
