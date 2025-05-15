"use client";

import { useState, useCallback } from "react";
import {
  DocumentUpdate,
  AIResponse,
  CardChoiceItem,
} from "@/components/templates/templateCompontents";
import { SpecializedDocumentView } from "@/components/templates/specializedDocumentView";

export function useSpecializedDocuments() {
  // Store document updates by type
  const [marketingEntries, setMarketingEntries] = useState<DocumentUpdate[]>(
    []
  );
  const [productEntries, setProductEntries] = useState<DocumentUpdate[]>([]);
  const [managementEntries, setManagementEntries] = useState<DocumentUpdate[]>(
    []
  );

  // Handler for card selection
  const handleCardSelect = useCallback(
    (card: CardChoiceItem, documentType: string) => {
      console.log(`Selected card in ${documentType}:`, card);
      // You can implement additional logic here when a card is selected
    },
    []
  );

  // Add entries from an AI response
  const addEntriesFromAIResponse = useCallback((response: AIResponse) => {
    if (response.type === "accepted") {
      // Process each update by document type
      response.content.forEach((update) => {
        switch (update.document) {
          case "Marketing":
            setMarketingEntries((prev) => [update, ...prev]);
            break;
          case "Product Development":
            setProductEntries((prev) => [update, ...prev]);
            break;
          case "Management":
            setManagementEntries((prev) => [update, ...prev]);
            break;
        }
      });
    }
  }, []);

  // Functions to create each specialized document
  const showProductDocument = useCallback(() => {
    return {
      id: "product-document",
      type: "custom" as const,
      title: "Product Development",
      content: (
        <SpecializedDocumentView
          documentType="Product Development"
          entries={productEntries}
          onSelectCard={handleCardSelect}
        />
      ),
      editable: false,
      visible: true,
      createdAt: new Date(),
    };
  }, [productEntries, handleCardSelect]);

  const showMarketingDocument = useCallback(() => {
    return {
      id: "marketing-document",
      type: "custom" as const,
      title: "Marketing",
      content: (
        <SpecializedDocumentView
          documentType="Marketing"
          entries={marketingEntries}
          onSelectCard={handleCardSelect}
        />
      ),
      editable: false,
      visible: true,
      createdAt: new Date(),
    };
  }, [marketingEntries, handleCardSelect]);

  const showManagementDocument = useCallback(() => {
    return {
      id: "management-document",
      type: "custom" as const,
      title: "Management",
      content: (
        <SpecializedDocumentView
          documentType="Management"
          entries={managementEntries}
          onSelectCard={handleCardSelect}
        />
      ),
      editable: false,
      visible: true,
      createdAt: new Date(),
    };
  }, [managementEntries, handleCardSelect]);

  return {
    addEntriesFromAIResponse,
    showProductDocument,
    showMarketingDocument,
    showManagementDocument,
    marketingEntries,
    productEntries,
    managementEntries,
  };
}
