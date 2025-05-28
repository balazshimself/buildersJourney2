import React, { useState } from "react";
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
  const isComplete = currentCheckpointIndex >= totalCheckpoints;

  return (
    <div
      className={`p-4 rounded-lg border bg-white shadow-sm ${className}`}
      data-component-type="progress-bar" // NEW: For tracking
      data-progress={`${currentCheckpointIndex}/${totalCheckpoints}`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-1">{title}</h3>
          {isComplete ? (
            <div className="text-sm text-green-600 font-medium">
              ✓ Complete! Reward: {reward}
            </div>
          ) : (
            <div className="text-sm text-gray-600">
              Next: {checkpointData[currentCheckpointIndex] || "Unknown"}
            </div>
          )}
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-gray-700">
            {currentCheckpointIndex}/{totalCheckpoints}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex space-x-1">
          {checkpointData.map((_, idx) => (
            <div
              key={`checkpoint-${idx}`}
              className={`flex-1 h-3 rounded-full transition-colors ${
                idx < currentCheckpointIndex
                  ? "bg-blue-600"
                  : idx === currentCheckpointIndex
                  ? "bg-blue-300 animate-pulse"
                  : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        <div className="flex justify-between text-xs text-gray-500">
          <span>Start</span>
          <span className="text-green-600 font-medium">{reward}</span>
        </div>
      </div>
    </div>
  );
};

// Card Choice Template Component
export const CardChoiceTemplate: React.FC<{
  data: CardChoiceTemplateData;
  className?: string;
  onSelectCard?: (selectedCard: CardData | null) => void;
}> = ({ data, className, onSelectCard }) => {
  const { title, description, cards = [] } = data;
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const handleCardClick = (card: CardData, index: number) => {
    if (selectedCardId) return;

    const cardId = card.id || `card-${index}`;
    setSelectedCardId(cardId);

    // Notify parent of selection
    onSelectCard?.(card);
    console.log("Card selected:", card);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Component JSX remains the same... */}
      <div className="mb-4 border-b pb-2">
        <h2 className="text-xl font-bold mb-1">{title ?? "NO TITLE"}</h2>
        <p className="text-base text-gray-600">
          {description ?? "NO DESCRIPTION"}
        </p>
        {selectedCardId && (
          <div className="mt-2 text-sm text-green-600 font-medium">
            ✓ Decision locked in
          </div>
        )}
      </div>

      <div className="grid grid-flow-col auto-cols-[minmax(220px,1fr)] gap-4 overflow-x-auto">
        {cards.map((card, index) => {
          const cardId = card.id || `card-${index}`;
          const isSelected = selectedCardId === cardId;
          const isLocked = selectedCardId !== null;

          return (
            <div
              key={`card-${index}-${card.title}`}
              className={`p-4 rounded-lg border shadow-sm min-w-[220px] transition-all ${
                isSelected
                  ? "bg-blue-50 border-blue-300"
                  : isLocked
                  ? "bg-gray-50 border-gray-200 opacity-50"
                  : "bg-white border-gray-200 hover:shadow-md hover:border-blue-200 cursor-pointer"
              }`}
              onClick={() => !isLocked && handleCardClick(card, index)}
            >
              <h3 className="text-lg font-semibold mb-1">{card.title}</h3>
              <p className="text-sm text-gray-700 mb-3">{card.description}</p>
              <button
                className={`mt-2 px-4 py-1 rounded transition text-sm font-medium ${
                  isSelected
                    ? "bg-blue-600 text-white"
                    : isLocked
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
                type="button"
                disabled={isLocked}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isLocked) handleCardClick(card, index);
                }}
              >
                {isSelected ? "Selected" : card.buttonString}
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
  onSelectCard?: (card: CardData | null) => void;
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
