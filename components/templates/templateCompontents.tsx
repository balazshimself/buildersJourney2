import React from "react";

// Define TypeScript types for the template components
export type StaticTextTemplateData = {
  title: string;
  text: string;
};

export type ProgressBarTemplateData = {
  label: string;
  checkpointData: string[];
  currentCheckpointIndex: number;
  reward: string;
};

export type ChoiceItem = {
  id: string;
  title: string;
  description: string;
  buttonString: string;
};

export type ChoiceTemplateData = {
  title: string;
  description: string;
  cards: {
    id: string;
    title: string;
    description: string;
    buttonString: string;
  }[];
};

export type CardComponent =
  | { type: "staticText"; data: StaticTextTemplateData }
  | { type: "progressBar"; data: ProgressBarTemplateData }
  | { type: "cardChoice"; data: ChoiceTemplateData };

export type DocumentUpdate = {
  document: "Marketing" | "Product Development" | "Management";
  component: CardComponent;
};

export type AIResponse =
  | { type: "rejected"; reason: string }
  | { type: "accepted"; content: DocumentUpdate[] };

// Static Text Template Component
export const StaticTextTemplate: React.FC<{
  data: StaticTextTemplateData;
  className?: string;
}> = ({ data, className }) => {
  return (
    <div className={`p-4 rounded-lg border bg-white shadow-sm ${className}`}>
      <h3 className="text-lg font-semibold mb-2">{data.title}</h3>
      <p className="text-sm text-gray-700 whitespace-pre-line">{data.text}</p>
    </div>
  );
};

// Progress Bar Template Component
export const ProgressBarTemplate: React.FC<{
  data: ProgressBarTemplateData;
  className?: string;
}> = ({ data, className }) => {
  const { label, checkpointData, currentCheckpointIndex, reward } = data;
  const totalCheckpoints = checkpointData.length;

  return (
    <div className={`p-4 rounded-lg border bg-white shadow-sm ${className}`}>
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm font-medium text-green-700">
          Reward: {reward}
        </span>
      </div>
      <div className="flex items-center mb-2">
        <span className="text-xs text-gray-500">
          Next task: {checkpointData[currentCheckpointIndex] || ""}
        </span>
      </div>
      <div className="flex space-x-1 mb-1">
        {checkpointData.map((_, idx) => (
          <div
            key={idx}
            className={`flex-1 h-3 rounded-full transition-colors ${
              idx < currentCheckpointIndex ? "bg-blue-600" : "bg-gray-200"
            }`}
          />
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-400">
        <span>0</span>
        <span>{totalCheckpoints}</span>
      </div>
    </div>
  );
};

// Card Choice Template Component
export const CardChoiceTemplate: React.FC<{
  data: ChoiceTemplateData;
  onSelectCard?: (card: ChoiceItem) => void;
  className?: string;
}> = ({ data, onSelectCard, className }) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="mb-4 border-b pb-2">
        <h2 className="text-xl font-bold mb-1">{data.title}</h2>
        <p className="text-base text-gray-600">{data.description}</p>
      </div>
      <div className="grid grid-flow-col auto-cols-[minmax(220px,1fr)] gap-4 overflow-x-auto">
        {data.cards.map((card, index) => (
          <div
            key={index}
            className="p-4 rounded-lg border bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer min-w-[220px]"
            onClick={() => onSelectCard && onSelectCard(card)}
          >
            <h3 className="text-lg font-semibold mb-1">{card.title}</h3>
            <p className="text-sm text-gray-700 mb-3">{card.description}</p>
            <button
              className="mt-2 px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              type="button"
            >
              {card.buttonString}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Template Renderer - renders the appropriate template based on type
export const TemplateRenderer: React.FC<{
  template: CardComponent;
  onSelectCard?: (card: ChoiceItem) => void;
  className?: string;
}> = ({ template, onSelectCard, className }) => {
  switch (template.type) {
    case "staticText":
      return <StaticTextTemplate data={template.data} className={className} />;
    case "progressBar":
      return <ProgressBarTemplate data={template.data} className={className} />;
    case "cardChoice":
      return (
        <CardChoiceTemplate
          data={template.data}
          onSelectCard={onSelectCard}
          className={className}
        />
      );
    default:
      return (
        <div className="p-4 border rounded-lg bg-gray-100">
          Unknown template type
        </div>
      );
  }
};
