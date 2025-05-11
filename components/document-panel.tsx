"use client";

import { useState } from "react";
import { Document as DocumentType } from "@/types";
import { FileTextIcon, UserPlusIcon, BellIcon, RocketIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { BuildSomethingPanel } from "./build-something-panel";

interface DocumentPanelProps {
  documents: DocumentType[];
  onCreateDocument: (
    document: Omit<DocumentType, "id" | "position" | "visible" | "createdAt">
  ) => void;
  onToggleVisibility: (id: string) => void;
  onSelectDocument: (document: DocumentType) => void;
  activeDocument: DocumentType | null;
  availableFunds?: number; // Add funds property
}

export function DocumentPanel({
  documents,
  onCreateDocument,
  onSelectDocument,
  activeDocument,
  availableFunds = 5000, // Default to 5000 if not provided
}: DocumentPanelProps) {
  const [showBuildPanel, setShowBuildPanel] = useState(false);

  // Group documents by type
  const documentsByType = {
    main: documents.filter(
      (doc) => doc.type === "business-plan" || doc.type === "timeline"
    ),
    research: documents.filter((doc) => doc.type === "market-research"),
    events: documents.filter((doc) => doc.type === "event"),
  };

  const handleBuildSomethingClick = () => {
    setShowBuildPanel(true);

    // Create a temporary document to show the build panel
    const buildSomethingDoc = {
      id: "build-something",
      type: "custom" as const,
      title: "Build something!",
      content: (
        <BuildSomethingPanel
          availableFunds={availableFunds}
          onComplete={(result) => {
            // Create a permanent document with the result
            onCreateDocument({
              type: "market-research",
              title: result.title,
              content: result.content,
              editable: false,
              metadata: {
                effect: result.effect,
                cost: result.cost,
                return: result.return,
              },
            });

            // Hide the build panel
            setShowBuildPanel(false);
          }}
        />
      ),
      editable: false,
      visible: true,
      createdAt: new Date(),
      position: 0,
      countdown: 10,
    };

    onSelectDocument(buildSomethingDoc);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-grow overflow-y-auto">
        {/* Main Documents */}
        <div className="p-2">
          <h3 className="text-xs uppercase text-gray-500 font-medium px-2 mb-1">
            Main Documents
          </h3>
          <div className="space-y-1">
            {documentsByType.main.map((doc) => (
              <button
                key={doc.id}
                className={cn(
                  "w-full px-3 py-2 text-left rounded-md text-sm flex items-center space-x-2",
                  activeDocument?.id === doc.id
                    ? "bg-blue-50 text-blue-700"
                    : "hover:bg-gray-100"
                )}
                onClick={() => onSelectDocument(doc)}
              >
                <FileTextIcon className="h-4 w-4 text-gray-500" />
                <span>{doc.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Research and Development */}
        <div className="p-2">
          <h3 className="text-xs uppercase text-gray-500 font-medium px-2 mb-1">
            Research and Development
          </h3>
          <div className="space-y-1">
            {documentsByType.research.map((doc) => (
              <button
                key={doc.id}
                className={cn(
                  "w-full px-3 py-2 text-left rounded-md text-sm flex items-center space-x-2",
                  !doc.editable && "opacity-50",
                  activeDocument?.id === doc.id
                    ? "bg-blue-50 text-blue-700"
                    : "hover:bg-gray-100"
                )}
                onClick={() => onSelectDocument(doc)}
              >
                <UserPlusIcon className="h-4 w-4 text-purple-500" />
                <span>{doc.title}</span>
                {!doc.editable && doc.countdown && (
                  <span className="ml-auto text-xs text-gray-500">
                    {doc.countdown}
                  </span>
                )}
              </button>
            ))}

            {/* Build Something Button */}
            <button
              className={cn(
                "w-full px-3 py-2 text-left rounded-md text-sm flex items-center space-x-2",
                "hover:bg-gray-100"
              )}
              onClick={handleBuildSomethingClick}
            >
              <RocketIcon className="h-4 w-4 text-blue-500" />
              <span>Build something!</span>
            </button>
          </div>
        </div>

        {/* Events */}
        <div className="p-2">
          <h3 className="text-xs uppercase text-gray-500 font-medium px-2 mb-1">
            Events
          </h3>
          <div className="space-y-1">
            {documentsByType.events.map((doc) => (
              <button
                key={doc.id}
                className={cn(
                  "w-full px-3 py-2 text-left rounded-md text-sm flex items-center space-x-2",
                  activeDocument?.id === doc.id
                    ? "bg-blue-50 text-blue-700"
                    : "hover:bg-gray-100"
                )}
                onClick={() => onSelectDocument(doc)}
              >
                <BellIcon className="h-4 w-4 text-red-500" />
                <span>{doc.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
