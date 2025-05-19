// document-editor.tsx (updated)
"use client";

import React from "react";
import { Document as DocumentType } from "@/types";

interface DocumentEditorProps {
  activeDocument: DocumentType | null;
  timer: number;
  onTimerChange: (time: number) => void;
}

export function DocumentEditor({ activeDocument }: DocumentEditorProps) {
  // Function to render content based on its type
  const renderContent = (content: any) => {
    // If content is a React element, return it directly
    if (React.isValidElement(content)) {
      return content;
    }

    // If content is a string that might contain HTML
    if (
      typeof content === "string" &&
      (content.includes("<p>") ||
        content.includes("<h") ||
        content.includes("<ul>"))
    ) {
      return <div dangerouslySetInnerHTML={{ __html: content }} />;
    }

    // Otherwise just render as text
    return content;
  };

  return (
    <div className="flex-grow flex flex-col h-full">
      <div className="flex-grow flex overflow-hidden">
        {activeDocument ? (
          <div className="w-full h-full overflow-y-auto p-8">
            <div
              className="max-w-4xl mx-auto prose prose-sm prose-blue"
              data-type={activeDocument.type}
            >
              {renderContent(activeDocument.content)}
            </div>
          </div>
        ) : (
          <div className="flex-grow flex items-center justify-center text-gray-500">
            Select a document from the sidebar to view or edit
          </div>
        )}
      </div>
    </div>
  );
}
