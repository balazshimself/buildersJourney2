"use client";

import React, { useState, useCallback } from "react";
import {
  CardChoiceTemplate,
  ProgressBarTemplate,
  StaticTextTemplate,
} from "@/components/documentPhase/templates/templateCompontents";
import { TemplateType } from "@/types/templates";

export function useSpecializedDocuments() {
  const [marketingEntries, setMarketingEntries] = useState<
    { data: JSX.Element; timestamp: Date }[]
  >([]);
  const [managementEntries, setManagementEntries] = useState<
    { data: JSX.Element; timestamp: Date }[]
  >([]);

  const progressBarExample = (
    <ProgressBarTemplate
      data={{
        type: TemplateType.ProgressBar,
        title: "Prototype creation",
        checkpointData: [
          "Figure out wtf",
          "Iteration",
          "???",
          "Sourcing components",
          "Profit",
        ],
        currentCheckpointIndex: 0,
        reward: "1000$",
      }}
    />
  );

  const cardChoiceTemplate: React.ReactElement = (
    <CardChoiceTemplate
      data={{
        type: TemplateType.CardChoice,
        title: "Hire choice",
        description: "Choose who to hire!",
        cards: [
          {
            title: "Alice Johnson",
            description:
              "Experienced frontend developer with a passion for UI/UX.",
            buttonString: "Hire Alice",
          },
          {
            title: "Bob Smith",
            description: "Backend engineer specializing in scalable APIs.",
            buttonString: "Hire Bob",
          },
          {
            title: "Carol Lee",
            description: "Full-stack developer and agile team leader.",
            buttonString: "Hire Carol",
          },
        ],
      }}
    />
  );
  const [productEntries, setProductEntries] = useState<
    { data: JSX.Element; timestamp: Date }[]
  >([
    {
      data: progressBarExample,
      timestamp: new Date(),
    },
    {
      data: cardChoiceTemplate,
      timestamp: new Date(),
    },
  ]);

  // Functions to add entries to each specialized document
  const addProductEntry = useCallback(
    (entry: { data: JSX.Element; timestamp: Date }) => {
      setProductEntries((prev) =>
        [entry, ...prev].sort(
          (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
        )
      );
    },
    []
  );

  const addMarketingEntry = useCallback(
    (entry: { data: JSX.Element; timestamp: Date }) => {
      setMarketingEntries((prev) =>
        [entry, ...prev].sort(
          (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
        )
      );
    },
    []
  );

  const addManagementEntry = useCallback(
    (entry: { data: JSX.Element; timestamp: Date }) => {
      setManagementEntries((prev) =>
        [entry, ...prev].sort(
          (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
        )
      );
    },
    []
  );

  function ManagementStatsBadges({
    entities,
  }: {
    entities: {
      data: JSX.Element;
      timestamp: Date;
    }[];
  }) {
    const stats = {
      progress: entities.filter((e) => e.data.type === ProgressBarTemplate)
        .length,
      choice: entities.filter((e) => e.data.type === CardChoiceTemplate).length,
      update: entities.filter((e) => e.data.type === StaticTextTemplate).length,
    };
    return (
      <div className="flex gap-2">
        <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
          {stats.progress + stats.choice + stats.update} Total
        </span>
        {stats.progress > 0 && (
          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
            {stats.progress} Progress
          </span>
        )}
        {stats.choice > 0 && (
          <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-800">
            {stats.choice} Choice
          </span>
        )}
        {stats.update > 0 && (
          <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-blue-800">
            {stats.update} Update
          </span>
        )}
      </div>
    );
  }

  function showSpecializedDocument(
    entities: {
      data: JSX.Element;
      timestamp: Date;
    }[],
    docTitle: string,
    pageTitle: string,
    id?: string
  ) {
    return {
      id: id || crypto.randomUUID(),
      title: docTitle,
      content: (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-blue-900">{pageTitle}</h3>
            <div className="flex gap-2">
              <ManagementStatsBadges entities={entities} />
            </div>
          </div>

          <div className="space-y-4">
            {entities.length === 0 ? (
              <div className="p-6 border border-dashed border-gray-300 rounded-md text-gray-500 text-center bg-gray-50">
                <p className="font-medium mb-1">No activity yet!</p>
                <p className="text-sm">
                  Use the "Build Something" button to start development.
                </p>
              </div>
            ) : (
              entities.map((entry, index) => (
                <div
                  key={`product-entry-${index}-${entry.timestamp.getTime()}`}
                  className="p-4 bg-white rounded-md border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded border ${
                        entry.data.type === ProgressBarTemplate
                          ? "bg-green-100 text-green-800 border-green-200"
                          : entry.data.type === CardChoiceTemplate
                          ? "bg-blue-100 text-blue-800 border-blue-200"
                          : entry.data.type === StaticTextTemplate
                          ? "bg-amber-100 text-amber-800 border-amber-200"
                          : "bg-gray-100 text-gray-800 border-gray-200"
                      }`}
                    >
                      {entry.data.type === ProgressBarTemplate
                        ? "Progress"
                        : entry.data.type === CardChoiceTemplate
                        ? "Choice"
                        : entry.data.type === StaticTextTemplate
                        ? "Update"
                        : "Unknown Type"}
                    </span>
                  </div>
                  <div className="p-4 my-3 bg-gray-50 rounded">
                    <div className="[&>*]:w-full">
                      {React.cloneElement(entry.data, {
                        className: "w-full", // Ensure the component takes full width
                      })}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {entry.timestamp.toLocaleDateString()} at{" "}
                    {entry.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      ),
      createdAt: new Date(),
    };
  }

  const showProductDocument = useCallback(() => {
    return showSpecializedDocument(
      productEntries,
      "Product Design & Development",
      "Product Development Tracker"
    );
  }, [productEntries]);

  const showMarketingDocument = useCallback(() => {
    return showSpecializedDocument(
      marketingEntries,
      "Marketing",
      "Marketing & Customer Acquisition"
    );
  }, [marketingEntries]);

  const showManagementDocument = useCallback(() => {
    return showSpecializedDocument(
      managementEntries,
      "Management",
      "Team & Operations"
    );
  }, [managementEntries]);

  return {
    productEntries,
    marketingEntries,
    managementEntries,
    addProductEntry,
    addMarketingEntry,
    addManagementEntry,
    showProductDocument,
    showMarketingDocument,
    showManagementDocument,
  };
}
