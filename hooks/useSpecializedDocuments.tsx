"use client";

import React, { useState, useCallback, useMemo } from "react";
import { LogData as DocumentType } from "@/types";
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

  // Count entries by type for badges/summaries
  const productStats = useMemo(
    () => ({
      progress: productEntries.filter(
        (e) => e.data.type === ProgressBarTemplate
      ).length,
      choice: productEntries.filter((e) => e.data.type === CardChoiceTemplate)
        .length,
      update: productEntries.filter((e) => e.data.type === StaticTextTemplate)
        .length,
    }),
    [productEntries]
  );

  const marketingStats = useMemo(
    () => ({
      progress: marketingEntries.filter(
        (e) => e.data.type === ProgressBarTemplate
      ).length,
      choice: marketingEntries.filter((e) => e.data.type === CardChoiceTemplate)
        .length,
      update: marketingEntries.filter((e) => e.data.type === StaticTextTemplate)
        .length,
    }),
    [marketingEntries]
  );

  const managementStats = useMemo(
    () => ({
      progress: managementEntries.filter(
        (e) => e.data.type === ProgressBarTemplate
      ).length,
      choice: managementEntries.filter(
        (e) => e.data.type === CardChoiceTemplate
      ).length,
      update: managementEntries.filter(
        (e) => e.data.type === StaticTextTemplate
      ).length,
    }),
    [managementEntries]
  );

  // Get tag color for UI display
  const getTagColor = useCallback((tag: string) => {
    switch (tag) {
      case "milestone":
        return "bg-green-100 text-green-800 border-green-200";
      case "update":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "risk":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  }, []);

  function ManagementStatsBadges({
    progress,
    choice,
    update,
  }: {
    progress: number;
    choice: number;
    update: number;
  }) {
    return (
      <div className="flex gap-2">
        <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
          {progress + choice + update} Total
        </span>
        {progress > 0 && (
          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
            {progress} Progress
          </span>
        )}
        {choice > 0 && (
          <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-800">
            {choice} Choice
          </span>
        )}
        {update > 0 && (
          <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-blue-800">
            {update} Updates
          </span>
        )}
      </div>
    );
  }

  // Functions to create each specialized document
  const showProductDocument = useCallback((): DocumentType => {
    return {
      id: "product-document",
      title: "Product Design & Development",
      content: (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-blue-900">
              Product Development Tracker
            </h3>
            <div className="flex gap-2">
              <ManagementStatsBadges
                progress={productStats.progress}
                choice={productStats.choice}
                update={productStats.update}
              />
            </div>
          </div>

          <div className="space-y-3">
            {productEntries.length === 0 ? (
              <div className="p-6 border border-dashed border-gray-300 rounded-md text-gray-500 text-center bg-gray-50">
                <p className="font-medium mb-1">
                  No product development activities yet
                </p>
                <p className="text-sm">
                  Use the "Build Something" button to start development.
                </p>
              </div>
            ) : (
              productEntries.map((entry, index) => (
                <div
                  key={`product-entry-${index}-${entry.timestamp.getTime()}`}
                  className="p-4 bg-white rounded-md border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded border ${getTagColor(
                        entry.data.type === ProgressBarTemplate
                          ? "milestone"
                          : entry.data.type === CardChoiceTemplate
                          ? "update"
                          : entry.data.type === StaticTextTemplate
                          ? "risk"
                          : "other"
                      )}`}
                    >
                      {entry.data.type === ProgressBarTemplate
                        ? "milestone"
                        : entry.data.type === CardChoiceTemplate
                        ? "update"
                        : entry.data.type === StaticTextTemplate
                        ? "risk"
                        : "other"}
                    </span>
                  </div>
                  {entry.data}
                  <p className="text-xs text-gray-500">
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
  }, [productEntries, productStats, getTagColor]);

  const showMarketingDocument = useCallback((): DocumentType => {
    return {
      id: "marketing-document",
      title: "Marketing & Customer Acquisition",
      content: (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-emerald-900">
              Marketing Strategy
            </h3>
            <div className="flex gap-2">
              <ManagementStatsBadges
                progress={marketingStats.progress}
                choice={marketingStats.choice}
                update={marketingStats.update}
              />
            </div>
          </div>

          <div className="space-y-3">
            {marketingEntries.length === 0 ? (
              <div className="p-6 border border-dashed border-gray-300 rounded-md text-gray-500 text-center bg-gray-50">
                <p className="font-medium mb-1">No marketing activities yet</p>
                <p className="text-sm">
                  Use the "Build Something" button to start marketing
                  initiatives.
                </p>
              </div>
            ) : (
              marketingEntries.map((entry, index) => (
                <div
                  key={`product-entry-${index}-${entry.timestamp.getTime()}`}
                  className="p-4 bg-white rounded-md border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded border ${getTagColor(
                        entry.data.type === ProgressBarTemplate
                          ? "progress"
                          : entry.data.type === CardChoiceTemplate
                          ? "choice"
                          : entry.data.type === StaticTextTemplate
                          ? "update"
                          : "unknown"
                      )}`}
                    >
                      {entry.data.type === ProgressBarTemplate
                        ? "progress"
                        : entry.data.type === CardChoiceTemplate
                        ? "choice"
                        : entry.data.type === StaticTextTemplate
                        ? "update"
                        : "unknown"}
                    </span>
                  </div>
                  {entry.data}
                  <p className="text-xs text-gray-500">
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
  }, [marketingEntries, marketingStats, getTagColor]);

  const showManagementDocument = useCallback((): DocumentType => {
    return {
      id: "management-document",
      title: "Team & Operations",
      content: (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-purple-900">
              Management Dashboard
            </h3>
            <div className="flex gap-2">
              <ManagementStatsBadges
                progress={managementStats.progress}
                choice={managementStats.choice}
                update={managementStats.update}
              />
            </div>
          </div>

          <div className="space-y-3">
            {managementEntries.length === 0 ? (
              <div className="p-6 border border-dashed border-gray-300 rounded-md text-gray-500 text-center bg-gray-50">
                <p className="font-medium mb-1">No management activities yet</p>
                <p className="text-sm">
                  Use the "Build Something" button to start team building.
                </p>
              </div>
            ) : (
              managementEntries.map((entry, index) => (
                <div
                  key={`product-entry-${index}-${entry.timestamp.getTime()}`}
                  className="p-4 bg-white rounded-md border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded border ${getTagColor(
                        entry.data.type === ProgressBarTemplate
                          ? "milestone"
                          : entry.data.type === CardChoiceTemplate
                          ? "update"
                          : entry.data.type === StaticTextTemplate
                          ? "risk"
                          : "other"
                      )}`}
                    >
                      {entry.data.type === ProgressBarTemplate
                        ? "milestone"
                        : entry.data.type === CardChoiceTemplate
                        ? "update"
                        : entry.data.type === StaticTextTemplate
                        ? "risk"
                        : "other"}
                    </span>
                  </div>
                  {entry.data}
                  <p className="text-xs text-gray-500">
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
  }, [managementEntries, managementStats, getTagColor]);

  return {
    productEntries,
    marketingEntries,
    managementEntries,
    productStats,
    marketingStats,
    managementStats,
    addProductEntry,
    addMarketingEntry,
    addManagementEntry,
    showProductDocument,
    showMarketingDocument,
    showManagementDocument,
    getTagColor,
  };
}
