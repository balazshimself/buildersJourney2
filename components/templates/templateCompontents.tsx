import React from "react";
import {
  CardChoiceTemplateData,
  CardComponent,
  CardData,
  ProgressBarTemplateData,
  StaticTextTemplateData,
  TemplateType,
} from "../../types/templates";

// Static Text Template Component
export const StaticTextTemplate: React.FC<{
  data: StaticTextTemplateData;
  className?: string;
}> = ({ data, className }) => {
  const { title, text } = data;
  return (
    <div className={`p-4 rounded-lg border bg-white shadow-sm ${className}`}>
      <h3 className="text-lg font-semibold mb-2">{title ?? "NO TITLE"}</h3>
      <p className="text-sm text-gray-700 whitespace-pre-line">
        {text ?? "NO DESCRIPTION"}
      </p>
    </div>
  );
};

// Progress Bar Template Component
export const ProgressBarTemplate: React.FC<{
  data: ProgressBarTemplateData;
  className?: string;
}> = ({ data, className }) => {
  const { title, checkpointData, currentCheckpointIndex = 0, reward } = data;
  const totalCheckpoints = checkpointData ? checkpointData.length : 0;

  return (
    <div className={`p-4 rounded-lg border bg-white shadow-sm ${className}`}>
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium">{title}</span>
        <span className="text-sm font-medium text-green-700">
          Reward: {reward}
        </span>
      </div>
      <div className="flex items-center mb-2">
        <span className="text-xs text-gray-500">
          Next task:{" "}
          {checkpointData ? checkpointData[currentCheckpointIndex] : ""}
        </span>
      </div>
      <div className="flex space-x-1 mb-1">
        {checkpointData.map((_, idx) => (
          <div
            key={`checkpoint-${idx}`}
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
  data: CardChoiceTemplateData;
  onSelectCard?: (card: CardData) => void;
  className?: string;
}> = ({ data, onSelectCard, className }) => {
  let { title, description, cards = [], selectedCardId } = data;

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="mb-4 border-b pb-2">
        <h2 className="text-xl font-bold mb-1">{title ?? "NO TITLE"}</h2>
        <p className="text-base text-gray-600">
          {description ?? "NO DESCRIPTION"}
        </p>
      </div>
      <div className="grid grid-flow-col auto-cols-[minmax(220px,1fr)] gap-4 overflow-x-auto">
        {cards.map((card, index) => {
          const isSelected: boolean = !!card.id && card.id === selectedCardId;
          return (
            <div
              key={`card-${index}-${card.title}`}
              className={`p-4 rounded-lg border shadow-sm transition-shadow min-w-[220px] cursor-pointer ${
                isSelected
                  ? "bg-gray-200 opacity-50 pointer-events-none"
                  : "bg-white shadow-md"
              }`}
            >
              <h3 className="text-lg font-semibold mb-1">{card.title}</h3>
              <p className="text-sm text-gray-700 mb-3">{card.description}</p>
              <button
                className={`mt-2 px-4 py-1 rounded transition ${
                  isSelected
                    ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
                type="button"
                disabled={isSelected}
                onClick={() => {
                  if (!isSelected) {
                    console.log("Card selected:", card);
                    if (onSelectCard) onSelectCard(card);
                    selectedCardId = card.id;
                  }
                }}
              >
                {card.buttonString}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Template Renderer - renders the appropriate template based on type
export const TemplateRenderer: React.FC<{
  template: CardComponent;
  onSelectCard?: (card: CardData) => void;
  className?: string;
}> = ({ template, onSelectCard, className }) => {
  console.log("here is something: ", template);
  switch (template.type) {
    case TemplateType.StaticText:
      return <StaticTextTemplate data={template} className={className} />;
    case TemplateType.ProgressBar:
      return <ProgressBarTemplate data={template} className={className} />;
    case TemplateType.CardChoice:
      return (
        <CardChoiceTemplate
          data={template}
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
