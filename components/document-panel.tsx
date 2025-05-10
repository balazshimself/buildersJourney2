"use client";

import { useState } from "react";
import { Document as DocumentType } from "@/types";
import { Button } from "@/components/ui/button";
import {
  FileTextIcon,
  BarChart3Icon,
  UserPlusIcon,
  BellIcon,
  RocketIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentPanelProps {
  documents: DocumentType[];
  onCreateDocument: (
    document: Omit<DocumentType, "id" | "position" | "visible" | "createdAt">
  ) => void;
  onToggleVisibility: (id: string) => void;
  onSelectDocument: (document: DocumentType) => void;
  activeDocument: DocumentType | null;
}

export function DocumentPanel({
  documents,
  onCreateDocument,
  onToggleVisibility,
  onSelectDocument,
  activeDocument,
}: DocumentPanelProps) {
  const [isCreatingDocument, setIsCreatingDocument] = useState(false);
  const [newDocumentTitle, setNewDocumentTitle] = useState("");
  const buildSomethingDoc = {
    id: "build-something",
    type: "custom" as const,
    title: "Build something! 🚀",
    content: "",
    editable: false,
    visible: true,
    createdAt: new Date(),
  };

  const handleCreateDocument = () => {
    if (!newDocumentTitle.trim()) return;

    onCreateDocument({
      type: "market-research",
      title: newDocumentTitle,
      content: `# Research in Progress...\n\nYour team is working on: ${newDocumentTitle}\n\nResults will be available shortly.`,
      editable: false,
      visible: true,
    });

    setIsCreatingDocument(false);
  };

  // Group documents by type
  const documentsByType = {
    main: documents.filter(
      (doc) => doc.type === "business-plan" || doc.type === "timeline"
    ),
    research: documents.filter((doc) => doc.type === "market-research"),
    events: documents.filter((doc) => doc.type === "event"),
  };

  const handleBuildSomethingClick = () => {
    onSelectDocument(buildSomethingDoc);
    setIsCreatingDocument(true);
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
                activeDocument?.id === "build-something"
                  ? "bg-blue-50 text-blue-700"
                  : "hover:bg-gray-100"
              )}
              onClick={handleBuildSomethingClick}
            >
              <RocketIcon className="h-4 w-4 text-blue-500" />
              <span>Build something! 🚀</span>
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

      {/* Research Form */}
      {isCreatingDocument && (
        <div className="absolute inset-y-0 left-64 right-0 bg-white">
          <div className="max-w-2xl mx-auto p-6">
            <h3 className="text-lg font-semibold mb-4">Start a New Project</h3>
            <p className="text-gray-600 mb-4">
              Since you have a plan, why don't you start acting on it? Most
              people start by creating a prototype or doing some research!😉
            </p>
            <p className="text-gray-600 mb-4">
              Write what you want to do, as if you were explaining it to an
              associate!
            </p>
            <p className="text-gray-600 mb-6">
              Your actions have consequences. Remember, as a business owner the
              more well-thought-out your plan is, the more likely you are to
              succeed.
            </p>

            <textarea
              value={newDocumentTitle}
              onChange={(e) => setNewDocumentTitle(e.target.value)}
              placeholder="Describe your research or prototype plan..."
              className="w-full p-3 text-sm border border-gray-300 rounded-md mb-4 h-32 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              autoFocus
            />

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreatingDocument(false);
                  onSelectDocument(documents[0]);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateDocument}
                disabled={!newDocumentTitle.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Start Project
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
