'use client';

import { useState } from 'react';
import { Document as DocumentType } from '@/types';
import { Button } from '@/components/ui/button';
import { PlusIcon, FileTextIcon, BarChart3Icon, UserPlusIcon, BellIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DocumentPanelProps {
  documents: DocumentType[];
  onCreateDocument: (document: Omit<DocumentType, 'id' | 'position' | 'visible' | 'createdAt'>) => void;
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
  const [newDocumentTitle, setNewDocumentTitle] = useState('');
  const [newDocumentType, setNewDocumentType] = useState<DocumentType['type']>('custom');
  
  const handleCreateDocument = () => {
    if (!newDocumentTitle.trim()) return;
    
    onCreateDocument({
      type: newDocumentType,
      title: newDocumentTitle,
      content: `# ${newDocumentTitle}\n\nStart typing your content here...`,
      editable: true,
      visible: true,
    });
    
    setNewDocumentTitle('');
    setIsCreatingDocument(false);
  };
  
  // Group documents by type
  const documentsByType = {
    main: documents.filter(doc => doc.type === 'business-plan' || doc.type === 'timeline'),
    research: documents.filter(doc => doc.type === 'market-research'),
    events: documents.filter(doc => doc.type === 'event'),
    custom: documents.filter(doc => doc.type === 'custom'),
  };
  
  return (
    <div className="flex-grow overflow-y-auto">
      {/* Main Documents */}
      <div className="p-2">
        <h3 className="text-xs uppercase text-gray-500 font-medium px-2 mb-1">
          Main Documents
        </h3>
        <div className="space-y-1">
          {documentsByType.main.map(doc => (
            <button
              key={doc.id}
              className={cn(
                'w-full px-3 py-2 text-left rounded-md text-sm flex items-center space-x-2',
                activeDocument?.id === doc.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100'
              )}
              onClick={() => onSelectDocument(doc)}
            >
              <FileTextIcon className="h-4 w-4 text-gray-500" />
              <span>{doc.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Market Research */}
      <div className="p-2">
        <h3 className="text-xs uppercase text-gray-500 font-medium px-2 mb-1">
          Market Research
        </h3>
        <div className="space-y-1">
          {documentsByType.research.map(doc => (
            <button
              key={doc.id}
              className={cn(
                'w-full px-3 py-2 text-left rounded-md text-sm flex items-center space-x-2',
                activeDocument?.id === doc.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100'
              )}
              onClick={() => onSelectDocument(doc)}
            >
              <UserPlusIcon className="h-4 w-4 text-purple-500" />
              <span>{doc.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Events */}
      <div className="p-2">
        <h3 className="text-xs uppercase text-gray-500 font-medium px-2 mb-1">
          Events
        </h3>
        <div className="space-y-1">
          {documentsByType.events.map(doc => (
            <button
              key={doc.id}
              className={cn(
                'w-full px-3 py-2 text-left rounded-md text-sm flex items-center space-x-2',
                activeDocument?.id === doc.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100'
              )}
              onClick={() => onSelectDocument(doc)}
            >
              <BellIcon className="h-4 w-4 text-red-500" />
              <span>{doc.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Documents */}
      {documentsByType.custom.length > 0 && (
        <div className="p-2">
          <h3 className="text-xs uppercase text-gray-500 font-medium px-2 mb-1">
            Custom Documents
          </h3>
          <div className="space-y-1">
            {documentsByType.custom.map(doc => (
              <button
                key={doc.id}
                className={cn(
                  'w-full px-3 py-2 text-left rounded-md text-sm flex items-center space-x-2',
                  activeDocument?.id === doc.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100'
                )}
                onClick={() => onSelectDocument(doc)}
              >
                <FileTextIcon className="h-4 w-4 text-gray-500" />
                <span>{doc.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* New Document Button */}
      <div className="p-3 border-t border-gray-200 mt-auto">
        {isCreatingDocument ? (
          <div className="space-y-2">
            <select
              value={newDocumentType}
              onChange={(e) => setNewDocumentType(e.target.value as DocumentType['type'])}
              className="w-full p-2 text-sm border border-gray-300 rounded-md"
            >
              <option value="custom">Custom Document</option>
              <option value="market-research">Market Research</option>
            </select>
            
            <input
              type="text"
              value={newDocumentTitle}
              onChange={(e) => setNewDocumentTitle(e.target.value)}
              placeholder="Document title"
              className="w-full p-2 text-sm border border-gray-300 rounded-md"
              autoFocus
            />
            
            <div className="flex justify-between space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setIsCreatingDocument(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={handleCreateDocument}
                disabled={!newDocumentTitle.trim()}
              >
                Create
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full flex items-center justify-center"
            onClick={() => setIsCreatingDocument(true)}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            New Document
          </Button>
        )}
      </div>
    </div>
  );
}