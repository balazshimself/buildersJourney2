"use client";

import { useState, useCallback } from "react";

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
    setProductEntries((prev) => [...prev, entry]);
  }, []);

  const addMarketingEntry = useCallback((entry: DocumentEntry) => {
    setMarketingEntries((prev) => [...prev, entry]);
  }, []);

  const addManagementEntry = useCallback((entry: DocumentEntry) => {
    setManagementEntries((prev) => [...prev, entry]);
  }, []);

  // Functions to create each specialized document
  const showProductDocument = useCallback(() => {
    return {
      id: "product-document",
      type: "custom" as const,
      title: "Product Design & Development",
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Development Timeline</h3>
          <div className="space-y-3">
            {productEntries.length === 0 ? (
              <div className="p-4 border border-dashed border-gray-300 rounded-md text-gray-500 text-center">
                No product development activities yet. Use the "Build Something"
                button to start development.
              </div>
            ) : (
              productEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="p-3 bg-white rounded-md border border-gray-200 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-medium text-blue-700">{entry.title}</h4>
                    <div>{entry.tag}</div>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{entry.content}</p>
                  <p className="text-xs text-gray-500">
                    {entry.timestamp.toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      ),
      editable: false,
      visible: true,
      createdAt: new Date(),
      position: 0,
    };
  }, [productEntries]);

  const showMarketingDocument = useCallback(() => {
    return {
      id: "marketing-document",
      type: "custom" as const,
      title: "Marketing",
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Marketing Activities</h3>
          <div className="space-y-3">
            {marketingEntries.length === 0 ? (
              <div className="p-4 border border-dashed border-gray-300 rounded-md text-gray-500 text-center">
                No marketing activities yet. Use the "Build Something" button to
                start marketing efforts.
              </div>
            ) : (
              marketingEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="p-3 bg-white rounded-md border border-gray-200 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-medium text-emerald-700">
                      {entry.title}
                    </h4>
                    <div>{entry.tag}</div>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{entry.content}</p>
                  <p className="text-xs text-gray-500">
                    {entry.timestamp.toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      ),
      editable: false,
      visible: true,
      createdAt: new Date(),
      position: 0,
    };
  }, [marketingEntries]);

  const showManagementDocument = useCallback(() => {
    return {
      id: "management-document",
      type: "custom" as const,
      title: "Management",
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Team & Operations</h3>
          <div className="space-y-3">
            {managementEntries.length === 0 ? (
              <div className="p-4 border border-dashed border-gray-300 rounded-md text-gray-500 text-center">
                No management activities yet. Use the "Build Something" button
                to start team building.
              </div>
            ) : (
              managementEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="p-3 bg-white rounded-md border border-gray-200 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-medium text-purple-700">
                      {entry.title}
                    </h4>
                    <div>{entry.tag}</div>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{entry.content}</p>
                  <p className="text-xs text-gray-500">
                    {entry.timestamp.toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      ),
      editable: false,
      visible: true,
      createdAt: new Date(),
      position: 0,
    };
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
