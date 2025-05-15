import React from "react";
import {
  AIResponse,
  DocumentUpdate,
  TemplateRenderer,
  CardChoiceItem,
} from "@/components/templates/templateCompontents";

interface SpecializedDocumentViewProps {
  documentType: "Marketing" | "Product Development" | "Management";
  entries: DocumentUpdate[];
  onSelectCard?: (card: CardChoiceItem, documentType: string) => void;
}

export function SpecializedDocumentView({
  documentType,
  entries,
  onSelectCard,
}: SpecializedDocumentViewProps) {
  // Color theming based on document type
  const getDocumentTheme = () => {
    switch (documentType) {
      case "Marketing":
        return "border-emerald-100 bg-emerald-50";
      case "Product Development":
        return "border-blue-100 bg-blue-50";
      case "Management":
        return "border-purple-100 bg-purple-50";
      default:
        return "border-gray-100 bg-gray-50";
    }
  };

  const getHeaderTheme = () => {
    switch (documentType) {
      case "Marketing":
        return "text-emerald-700 border-emerald-200";
      case "Product Development":
        return "text-blue-700 border-blue-200";
      case "Management":
        return "text-purple-700 border-purple-200";
      default:
        return "text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="space-y-4 p-2">
      <h3
        className={`text-lg font-medium ${
          getHeaderTheme().split(" ")[0]
        } pb-2 border-b ${getHeaderTheme().split(" ")[1]}`}
      >
        {documentType} Dashboard
      </h3>

      <div className="space-y-4">
        {entries.length === 0 ? (
          <div className="p-4 border border-dashed border-gray-300 rounded-md text-gray-500 text-center">
            No {documentType.toLowerCase()} activities yet. Use the "Build
            Something" button to start.
          </div>
        ) : (
          entries.map((entry, index) => (
            <div
              key={`${documentType}-entry-${index}`}
              className={`p-2 rounded-md border ${getDocumentTheme()} mb-4`}
            >
              <TemplateRenderer
                template={entry.component}
                onSelectCard={(card) =>
                  onSelectCard && onSelectCard(card, documentType)
                }
                className=""
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
