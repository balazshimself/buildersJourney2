"use client";

import { useRef } from "react";
import { LogData as DocumentType } from "@/types";
import { cn } from "@/lib/utils";

interface DocumentProps {
  document: DocumentType;
  onPositionChange: (id: string, position: { x: number; y: number }) => void;
  onContentChange: (id: string, content: string) => void;
  onVisibilityToggle: (id: string) => void;
  onDelete?: (id: string) => void;
  onActivate: (id: string) => void;
}

export function Document({
  document,
  onVisibilityToggle,
  onDelete,
  onActivate,
}: DocumentProps) {
  const documentRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={documentRef}
      className={cn(
        "absolute bg-red rounded-lg shadow-lg border border-gray-200 w-80 md:w-96 transition-all duration-150"
      )}
      onMouseDown={(e) => {
        onActivate(document.id);
      }}
    >
      {/* Document Header */}
      <div>
        <h3 className="font-medium truncate">{document.title}</h3>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onVisibilityToggle(document.id)}
            className="p-1 rounded-full hover:bg-white/20 transition-colors"
            title="Hide"
          ></button>

          {onDelete && (
            <button
              onClick={() => onDelete(document.id)}
              className="p-1 rounded-full hover:bg-white/20 transition-colors"
              title="Delete"
            ></button>
          )}
        </div>
      </div>

      {/* Document Content */}
      <div className="p-4 document-content overflow-y-auto max-h-96">
        {document.content}
      </div>

      {/* Document Footer */}
      <div className="px-4 py-2 text-xs text-gray-500 border-t">
        {new Date(document.createdAt).toLocaleString()}
      </div>
    </div>
  );
}
