import { CardComponent } from "./templates";

export type AppPhase = "rules" | "problem" | "document" | "evaluation";

export enum ResponseTypes {
  ACCEPTED = "accepted",
  REJECTED = "rejected",
}

export interface Problem {
  id: string;
  sections: {
    problemOverview: {
      title: string;
      desc: string;
    };
    keyPainPoints: {
      title: string;
      desc: string;
    }[];
    targetSegment: {
      title: string;
      segments: {
        title: string;
        desc: string;
      }[];
    };
  };
}

export interface BusinessPlanSection {
  id: string;
  title: string;
  placeholder: string;
  value: string;
  maxLength: number;
}

export interface SectionFeedback {
  sectionId: string;
  isValid: boolean;
  feedback?: string;
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
  sectionFeedback: SectionFeedback[];
  timer: number;
  businessPlan: LogData | null;
  companyValue: number;
}
