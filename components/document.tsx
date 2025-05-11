"use client";

import { useState, useRef } from "react";
import { Document as DocumentType } from "@/types";
import { cn } from "@/lib/utils";

interface DocumentProps {
  document: DocumentType;
  onPositionChange: (id: string, position: { x: number; y: number }) => void;
  onContentChange: (id: string, content: string) => void;
  onVisibilityToggle: (id: string) => void;
  onDelete?: (id: string) => void;
  isActive: boolean;
  onActivate: (id: string) => void;
}

export function Document({
  document,
  onPositionChange,
  onContentChange,
  onVisibilityToggle,
  onDelete,
  isActive,
  onActivate,
}: DocumentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState(document.content);
  const documentRef = useRef<HTMLDivElement>(null);

  // Handle editing
  const toggleEdit = () => {
    if (!document.editable) return;

    // if (isEditing) {
    //   // Save changes
    //   onContentChange(document.id, editableContent);
    // }
    setIsEditing(!isEditing);
  };

  return (
    <div
      ref={documentRef}
      className={cn(
        "absolute bg-red rounded-lg shadow-lg border border-gray-200 w-80 md:w-96 transition-all duration-150",
        isActive && "shadow-xl",
        isEditing && "ring-2 ring-blue-500"
      )}
      onMouseDown={(e) => {
        onActivate(document.id);
      }}
    >
      {/* Document Header */}
      <div
        className={cn(
          "px-4 py-3 rounded-t-lg flex justify-between items-center",
          document.type === "business-plan"
            ? "bg-blue-50 text-blue-800"
            : document.type === "timeline"
            ? "bg-green-50 text-green-800"
            : document.type === "market-research"
            ? "bg-purple-50 text-purple-800"
            : document.type === "competitor-analysis"
            ? "bg-amber-50 text-amber-800"
            : document.type === "notification"
            ? "bg-red-50 text-red-800"
            : "bg-gray-50 text-gray-800"
        )}
      >
        <h3 className="font-medium truncate">{document.title}</h3>
        <div className="flex items-center space-x-1">
          {document.editable && (
            <button
              onClick={toggleEdit}
              className="p-1 rounded-full hover:bg-white/20 transition-colors"
              title={isEditing ? "Save" : "Edit"}
            ></button>
          )}

          <button
            onClick={() => onVisibilityToggle(document.id)}
            className="p-1 rounded-full hover:bg-white/20 transition-colors"
            title="Hide"
          ></button>

          {onDelete &&
            document.type !== "business-plan" &&
            document.type !== "timeline" && (
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
        {/* {isEditing ? (
          <textarea
            value={editableContent}
            onChange={(e) => setEditableContent(e.target.value)}
            className="w-full h-64 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <div className="prose prose-sm max-w-none">
            <div dangerouslySetInnerHTML={{ __html: document.content }} />
          </div>
        )} */}
        {document.content}
      </div>

      {/* Document Footer */}
      <div className="px-4 py-2 text-xs text-gray-500 border-t">
        {new Date(document.createdAt).toLocaleString()}
      </div>
    </div>
  );
}
