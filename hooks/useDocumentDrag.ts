import { useState, useCallback } from 'react';
import { Document } from '@/types';

interface UseDocumentDragProps {
  document: Document;
  onPositionChange: (id: string, position: { x: number; y: number }) => void;
}

export const useDocumentDrag = ({ 
  document, 
  onPositionChange 
}: UseDocumentDragProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!document.position) return;
    
    // Only start dragging if the click is on the header, not the content
    if ((e.target as HTMLElement).closest('.document-content')) {
      return;
    }

    setIsDragging(true);
    
    // Calculate the offset of the mouse from the document's top-left corner
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    
    // Prevent text selection during drag
    e.preventDefault();
  }, [document.position]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !document.position) return;
    
    // Calculate new position based on mouse position and original offset
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    
    // Update document position
    onPositionChange(document.id, { x: newX, y: newY });
  }, [isDragging, document.id, document.position, dragOffset, onPositionChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add and remove event listeners
  const startDragging = useCallback(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove, handleMouseUp]);

  const stopDragging = useCallback(() => {
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove, handleMouseUp]);

  return {
    isDragging,
    handleMouseDown,
    startDragging,
    stopDragging,
  };
};