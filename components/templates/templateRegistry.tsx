/**
 * Template registry to organize all available templates
 * This makes it easy to register new templates and access them throughout the application
 */

import React from "react";
import {
  TemplateData,
  TemplateRenderer,
  StaticTextTemplate,
  ProgressBarTemplate,
  CardChoiceTemplate,
  CardChoiceItem,
} from "./templateCompontents";

// Register all template components
const templateComponents = {
  staticText: StaticTextTemplate,
  progressBar: ProgressBarTemplate,
  cardChoice: CardChoiceTemplate,
};

// Template factory functions to help create template instances
export const createStaticTextTemplate = (
  title: string,
  text: string
): TemplateData => ({
  type: "staticText",
  data: { title, text },
});

export const createCardChoiceTemplate = (
  cards: CardChoiceItem[]
): TemplateData => ({
  type: "cardChoice",
  data: cards,
});

export const createCardChoiceItem = (
  title: string,
  description: string,
  cost: number,
  budgetImpact: number,
  effects: { metric: string; change: number }[] = []
): CardChoiceItem => ({
  title,
  description,
  cost,
  budgetImpact,
  effects,
});

// Helper to render any template by type and data
export const renderTemplate = (
  template: TemplateData,
  onSelectCard?: (card: CardChoiceItem) => void,
  className?: string
) => {
  return (
    <TemplateRenderer
      template={template}
      onSelectCard={onSelectCard}
      className={className}
    />
  );
};

// Document category colors for consistent styling
export const documentColors = {
  Marketing: {
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    text: "text-emerald-800",
    accent: "bg-emerald-500",
  },
  ProductDevelopment: {
    bg: "bg-blue-50",
    border: "border-blue-100",
    text: "text-blue-800",
    accent: "bg-blue-500",
  },
  Management: {
    bg: "bg-purple-50",
    border: "border-purple-100",
    text: "text-purple-800",
    accent: "bg-purple-500",
  },
};

export const getDocumentCategoryColor = (category: string) => {
  switch (category) {
    case "Marketing":
      return documentColors.Marketing;
    case "Product Development":
      return documentColors.ProductDevelopment;
    case "Management":
      return documentColors.Management;
    default:
      return {
        bg: "bg-gray-50",
        border: "border-gray-200",
        text: "text-gray-800",
        accent: "bg-gray-500",
      };
  }
};

// Common template types that can be used for reference
export type TemplateRegistry = {
  StaticText: typeof createStaticTextTemplate;
  CardChoice: typeof createCardChoiceTemplate;
  CardChoiceItem: typeof createCardChoiceItem;
  render: typeof renderTemplate;
  colors: typeof documentColors;
  getColor: typeof getDocumentCategoryColor;
};

// Export a templates object with all factory functions
export const templates: TemplateRegistry = {
  StaticText: createStaticTextTemplate,
  CardChoice: createCardChoiceTemplate,
  CardChoiceItem: createCardChoiceItem,
  render: renderTemplate,
  colors: documentColors,
  getColor: getDocumentCategoryColor,
};

export default templates;
