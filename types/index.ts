export type AppPhase = 'rules' | 'problem' | 'document';

export interface Problem {
  id: string;
  title: string;
  description: string;
  marketAnalysis: string;
}

export interface Document {
  id: string;
  type: 'business-plan' | 'timeline' | 'notification' | 'market-research' | 'competitor-analysis' | 'custom' | 'event';
  title: string;
  content: string;
  editable: boolean;
  visible: boolean;
  createdAt: Date;
}

export interface AppState {
  currentPhase: AppPhase;
  currentProblem: Problem | null;
  documents: Document[];
  userSolution: string;
  timer: number;
  isPassed: boolean | null;
}