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

export interface LogData {
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
  logs: LogData[];
  rejectionReason?: string;
  timer: number;
  isLoading: boolean;
  businessPlan: LogData | null;
  companyValue: number;
}
