export enum TemplateType {
  StaticText = "static_text",
  ProgressBar = "progress_bar",
  CardChoice = "card_choice",
}

export type StaticTextTemplateData = {
  type: TemplateType.StaticText;
  title: string;
  text: string;
};

export type ProgressBarTemplateData = {
  type: TemplateType.ProgressBar;
  title: string;
  checkpointData: string[];
  currentCheckpointIndex?: number;
  reward: string;
};

export type CardData = {
  title: string;
  description: string;
  buttonString: string;
};

export type CardChoiceTemplateData = {
  type: TemplateType.CardChoice;
  title: string;
  description: string;
  cards: CardData[];
};

export type CardComponent =
  | StaticTextTemplateData
  | ProgressBarTemplateData
  | CardChoiceTemplateData;
