"use client";

import { useState, useCallback, useMemo } from "react";
import { Document as DocumentType } from "@/types";

// Define the structure for entries in the specialized documents
export interface DocumentEntry {
  id: string;
  title: string;
  content: string;
  timestamp: Date;
  tag: string;
}

export function useSpecializedDocuments() {
  const [productEntries, setProductEntries] = useState<DocumentEntry[]>([]);
  const [marketingEntries, setMarketingEntries] = useState<DocumentEntry[]>([]);
  const [managementEntries, setManagementEntries] = useState<DocumentEntry[]>(
    []
  );

  // Functions to add entries to each specialized document
  const addProductEntry = useCallback((entry: DocumentEntry) => {
    setProductEntries((prev) =>
      [entry, ...prev].sort(
        (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
      )
    );
  }, []);

  const addMarketingEntry = useCallback((entry: DocumentEntry) => {
    setMarketingEntries((prev) =>
      [entry, ...prev].sort(
        (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
      )
    );
  }, []);

  const addManagementEntry = useCallback((entry: DocumentEntry) => {
    setManagementEntries((prev) =>
      [entry, ...prev].sort(
        (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
      )
    );
  }, []);

  // Count entries by type for badges/summaries
  const productStats = useMemo(
    () => ({
      total: productEntries.length,
      milestones: productEntries.filter((e) => e.tag === "milestone").length,
      updates: productEntries.filter((e) => e.tag === "update").length,
      risks: productEntries.filter((e) => e.tag === "risk").length,
    }),
    [productEntries]
  );

  const marketingStats = useMemo(
    () => ({
      total: marketingEntries.length,
      milestones: marketingEntries.filter((e) => e.tag === "milestone").length,
      updates: marketingEntries.filter((e) => e.tag === "update").length,
      risks: marketingEntries.filter((e) => e.tag === "risk").length,
    }),
    [marketingEntries]
  );

  const managementStats = useMemo(
    () => ({
      total: managementEntries.length,
      milestones: managementEntries.filter((e) => e.tag === "milestone").length,
      updates: managementEntries.filter((e) => e.tag === "update").length,
      risks: managementEntries.filter((e) => e.tag === "risk").length,
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

  // Functions to create each specialized document
  const showProductDocument = useCallback((): DocumentType => {
    return {
      id: "product-document",
      type: "custom" as const,
      title: "Product Design & Development",
      content: (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-blue-900">
              Product Development Tracker
            </h3>
            <div className="flex gap-2">
              <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                {productStats.total} Total
              </span>
              {productStats.milestones > 0 && (
                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                  {productStats.milestones} Milestones
                </span>
              )}
              {productStats.risks > 0 && (
                <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-800">
                  {productStats.risks} Risks
                </span>
              )}
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
              productEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="p-4 bg-white rounded-md border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-blue-800">{entry.title}</h4>
                    <span
                      className={`text-xs px-2 py-0.5 rounded border ${getTagColor(
                        entry.tag
                      )}`}
                    >
                      {entry.tag}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{entry.content}</p>
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
      editable: false,
      createdAt: new Date(),
    };
  }, [productEntries, productStats, getTagColor]);

  const showMarketingDocument = useCallback((): DocumentType => {
    return {
      id: "marketing-document",
      type: "custom" as const,
      title: "Marketing & Customer Acquisition",
      content: (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-emerald-900">
              Marketing Strategy
            </h3>
            <div className="flex gap-2">
              <span className="px-2 py-1 text-xs rounded-full bg-emerald-100 text-emerald-800">
                {marketingStats.total} Total
              </span>
              {marketingStats.milestones > 0 && (
                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                  {marketingStats.milestones} Milestones
                </span>
              )}
              {marketingStats.risks > 0 && (
                <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-800">
                  {marketingStats.risks} Risks
                </span>
              )}
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
              marketingEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="p-4 bg-white rounded-md border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-emerald-800">
                      {entry.title}
                    </h4>
                    <span
                      className={`text-xs px-2 py-0.5 rounded border ${getTagColor(
                        entry.tag
                      )}`}
                    >
                      {entry.tag}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{entry.content}</p>
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
      editable: false,
      createdAt: new Date(),
    };
  }, [marketingEntries, marketingStats, getTagColor]);

  const showManagementDocument = useCallback((): DocumentType => {
    return {
      id: "management-document",
      type: "custom" as const,
      title: "Team & Operations",
      content: (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-purple-900">
              Management Dashboard
            </h3>
            <div className="flex gap-2">
              <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                {managementStats.total} Total
              </span>
              {managementStats.milestones > 0 && (
                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                  {managementStats.milestones} Milestones
                </span>
              )}
              {managementStats.risks > 0 && (
                <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-800">
                  {managementStats.risks} Risks
                </span>
              )}
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
              managementEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="p-4 bg-white rounded-md border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-purple-800">
                      {entry.title}
                    </h4>
                    <span
                      className={`text-xs px-2 py-0.5 rounded border ${getTagColor(
                        entry.tag
                      )}`}
                    >
                      {entry.tag}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{entry.content}</p>
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
      editable: false,
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
