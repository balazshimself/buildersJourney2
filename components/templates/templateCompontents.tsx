import React from "react";

// Define TypeScript types for the template components
export type StaticTextTemplateData = {
  title: string;
  text: string;
};

export type ProgressBarTemplateData = {
  label: string;
  currentValue: number;
  targetValue?: number;
};

export type CardChoiceItem = {
  title: string;
  description: string;
  cost: number;
  budgetImpact: number;
  effects: {
    metric: string;
    change: number;
  }[];
};

export type CardChoiceTemplateData = CardChoiceItem[];

export type TemplateData =
  | { type: "staticText"; data: StaticTextTemplateData }
  | { type: "progressBar"; data: ProgressBarTemplateData }
  | { type: "cardChoice"; data: CardChoiceTemplateData };

export type DocumentUpdate = {
  document: "Marketing" | "Product Development" | "Management";
  component: TemplateData;
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
  const { label, currentValue, targetValue } = data;

  // Calculate percentage for the progress bar
  const percentage = targetValue
    ? Math.min(100, (currentValue / targetValue) * 100)
    : Math.min(100, currentValue);

  return (
    <div className={`p-4 rounded-lg border bg-white shadow-sm ${className}`}>
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm font-medium">
          {currentValue}
          {targetValue ? ` / ${targetValue}` : "%"}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-blue-600 h-2.5 rounded-full"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

// Card Choice Template Component
export const CardChoiceTemplate: React.FC<{
  data: CardChoiceTemplateData;
  onSelectCard?: (card: CardChoiceItem) => void;
  className?: string;
}> = ({ data, onSelectCard, className }) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {data.map((card, index) => (
        <div
          key={index}
          className="p-4 rounded-lg border bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onSelectCard && onSelectCard(card)}
        >
          <h3 className="text-lg font-semibold mb-1">{card.title}</h3>
          <p className="text-sm text-gray-700 mb-3">{card.description}</p>

          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-500">
              Cost: ${card.cost.toLocaleString()}
            </span>
            <span
              className={`font-medium ${
                card.budgetImpact >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              Impact: {card.budgetImpact >= 0 ? "+" : ""}$
              {card.budgetImpact.toLocaleString()}
            </span>
          </div>

          {card.effects.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-gray-500 mb-1">Effects:</p>
              <div className="space-y-1">
                {card.effects.map((effect, eIndex) => (
                  <div key={eIndex} className="flex justify-between text-xs">
                    <span>{effect.metric}</span>
                    <span
                      className={
                        effect.change >= 0 ? "text-green-600" : "text-red-600"
                      }
                    >
                      {effect.change >= 0 ? "+" : ""}
                      {effect.change}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Template Renderer - renders the appropriate template based on type
export const TemplateRenderer: React.FC<{
  template: TemplateData;
  onSelectCard?: (card: CardChoiceItem) => void;
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
