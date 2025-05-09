'use client';

import { useEffect, useState, useRef } from 'react';
import { Document as DocumentType } from '@/types';
import { useDocumentDrag } from '@/hooks/useDocumentDrag';
import { cn } from '@/lib/utils';
import { EyeIcon, EyeOffIcon, Trash2Icon, EditIcon, SaveIcon } from 'lucide-react';

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
  
  const {
    isDragging,
    handleMouseDown,
    startDragging,
    stopDragging,
  } = useDocumentDrag({
    document,
    onPositionChange,
  });
  
  // Set up drag event listeners
  useEffect(() => {
    if (isDragging) {
      startDragging();
    } else {
      stopDragging();
    }
    
    return () => {
      stopDragging();
    };
  }, [isDragging, startDragging, stopDragging]);
  
  // Z-index management for active document
  useEffect(() => {
    if (isActive && documentRef.current) {
      documentRef.current.style.zIndex = '50';
    } else if (documentRef.current) {
      documentRef.current.style.zIndex = '10';
    }
  }, [isActive]);

  // Handle editing
  const toggleEdit = () => {
    if (!document.editable) return;
    
    if (isEditing) {
      // Save changes
      onContentChange(document.id, editableContent);
    }
    setIsEditing(!isEditing);
  };
  
  if (!document.visible) return null;
  
  return (
    <div
      ref={documentRef}
      className={cn(
        'absolute bg-white rounded-lg shadow-lg border border-gray-200 w-80 md:w-96 transition-all duration-150',
        isActive && 'shadow-xl',
        isDragging && 'opacity-75 cursor-grabbing',
        isEditing && 'ring-2 ring-blue-500'
      )}
      style={{
        top: document.position?.y,
        left: document.position?.x,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onMouseDown={(e) => {
        handleMouseDown(e);
        onActivate(document.id);
      }}
    >
      {/* Document Header */}
      <div className={cn(
        'px-4 py-3 rounded-t-lg flex justify-between items-center',
        document.type === 'business-plan' ? 'bg-blue-50 text-blue-800' : 
        document.type === 'timeline' ? 'bg-green-50 text-green-800' : 
        document.type === 'market-research' ? 'bg-purple-50 text-purple-800' :
        document.type === 'competitor-analysis' ? 'bg-amber-50 text-amber-800' :
        document.type === 'notification' ? 'bg-red-50 text-red-800' :
        'bg-gray-50 text-gray-800'
      )}>
        <h3 className="font-medium truncate">{document.title}</h3>
        <div className="flex items-center space-x-1">
          {document.editable && (
            <button
              onClick={toggleEdit}
              className="p-1 rounded-full hover:bg-white/20 transition-colors"
              title={isEditing ? "Save" : "Edit"}
            >
              {isEditing ? (
                <SaveIcon className="h-4 w-4" />
              ) : (
                <EditIcon className="h-4 w-4" />
              )}
            </button>
          )}
          
          <button
            onClick={() => onVisibilityToggle(document.id)}
            className="p-1 rounded-full hover:bg-white/20 transition-colors"
            title="Hide"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
          
          {onDelete && document.type !== 'business-plan' && document.type !== 'timeline' && (
            <button
              onClick={() => onDelete(document.id)}
              className="p-1 rounded-full hover:bg-white/20 transition-colors"
              title="Delete"
            >
              <Trash2Icon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      
      {/* Document Content */}
      <div className="p-4 document-content overflow-y-auto max-h-96">
        {isEditing ? (
          <textarea
            value={editableContent}
            onChange={(e) => setEditableContent(e.target.value)}
            className="w-full h-64 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <div className="prose prose-sm max-w-none">
            {document.content.split('\n').map((line, i) => {
              // Render headings
              if (line.startsWith('# ')) {
                return <h1 key={i} className="text-xl font-bold mt-2 mb-3">{line.substring(2)}</h1>;
              } else if (line.startsWith('## ')) {
                return <h2 key={i} className="text-lg font-semibold mt-2 mb-2">{line.substring(3)}</h2>;
              } else if (line.startsWith('### ')) {
                return <h3 key={i} className="text-md font-medium mt-2 mb-1">{line.substring(4)}</h3>;
              } else if (line.startsWith('- ')) {
                return <li key={i} className="ml-4">{line.substring(2)}</li>;
              } else if (line === '') {
                return <br key={i} />;
              } else {
                return <p key={i} className="mb-2">{line}</p>;
              }
            })}
          </div>
        )}
      </div>
      
      {/* Document Footer */}
      <div className="px-4 py-2 text-xs text-gray-500 border-t">
        {new Date(document.createdAt).toLocaleString()}
      </div>
    </div>
  );
}