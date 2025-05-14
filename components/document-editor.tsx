"use client";

import React from "react";
import { Document as DocumentType } from "@/types";

interface DocumentEditorProps {
  activeDocument: DocumentType | null;
  timer: number;
  onTimerChange: (time: number) => void;
}

export function DocumentEditor({ activeDocument }: DocumentEditorProps) {
  return (
    <div className="flex-grow flex flex-col h-full">
      <div className="flex-grow flex overflow-hidden">
        {activeDocument ? (
          <div className="w-full h-full overflow-y-auto p-8">
            <div className="max-w-4xl mx-auto" data-type={activeDocument.type}>
              {activeDocument.content}
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
