'use client';

import { useState, useEffect } from 'react';
import { Document as DocumentType } from '@/types';
import { DocumentPanel } from '@/components/document-panel';
import { Timer } from '@/components/ui/timer';
import { Progress } from '@/components/ui/progress';
import notificationsData from '@/data/notifications.json';

interface DocumentPhaseProps {
  documents: DocumentType[];
  timer: number;
  onUpdateDocument: (id: string, updates: Partial<DocumentType>) => void;
  onAddDocument: (document: Omit<DocumentType, 'id' | 'position' | 'visible' | 'createdAt'>) => void;
  onRemoveDocument: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onTimerChange: (time: number) => void;
  onAddNotification: (notification: DocumentType) => void;
}

export function DocumentPhase({
  documents,
  timer,
  onUpdateDocument,
  onAddDocument,
  onRemoveDocument,
  onToggleVisibility,
  onTimerChange,
  onAddNotification,
}: DocumentPhaseProps) {
  const [companyValue, setCompanyValue] = useState(5000);
  const [activeDocument, setActiveDocument] = useState<DocumentType | null>(
    documents.find(doc => doc.type === 'business-plan') || null
  );
  const [notificationIndex, setNotificationIndex] = useState(0);
  
  useEffect(() => {
    if (notificationsData.notifications.length > 0) {
      const interval = setInterval(() => {
        if (notificationIndex < notificationsData.notifications.length - 1) {
          addNextNotification();
        } else {
          clearInterval(interval);
        }
      }, 15000);
      
      return () => clearInterval(interval);
    }
  }, [notificationIndex]);
  
  // Simulate research completion
  useEffect(() => {
    const inProgressDocs = documents.filter(doc => 
      doc.type === 'market-research' && !doc.editable
    );
    
    inProgressDocs.forEach(doc => {
      const duration = Math.floor(Math.random() * 10000) + 10000; // Random between 10-20 seconds
      let timeLeft = Math.floor(duration / 1000);
      
      const countdownInterval = setInterval(() => {
        timeLeft--;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        const countdown = `${minutes}m ${seconds}s`;
        
        onUpdateDocument(doc.id, { countdown });
        
        if (timeLeft <= 0) {
          clearInterval(countdownInterval);
          const valueChange = Math.floor(Math.random() * 5000) + 1000;
          setCompanyValue(prev => prev + valueChange);
          
          onUpdateDocument(doc.id, {
            content: `# Research Results\n\nProject: ${doc.title}\n\nFindings:\n- Successfully developed initial prototype\n- Market validation shows strong interest\n- Potential revenue increase projected\n\nImpact:\nCompany value increased by $${valueChange.toLocaleString()}`,
            editable: true,
            countdown: undefined,
          });
        }
      }, 1000);
      
      return () => clearInterval(countdownInterval);
    });
  }, [documents]);
  
  const addNextNotification = () => {
    const notif = notificationsData.notifications[notificationIndex];
    
    const notification: DocumentType = {
      id: `notification-${notificationIndex}`,
      type: 'event',
      title: notif.title,
      content: notif.content,
      editable: false,
      visible: true,
      createdAt: new Date(notif.createdAt),
    };
    
    onAddNotification(notification);
    setNotificationIndex(prev => prev + 1);
  };
  
  const progressToTarget = (companyValue / 100000) * 100;
  
  return (
    <div className="h-full flex">
      {/* Documents Panel */}
      <div className="w-64 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col h-full fixed">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Overview</h2>
          <div className="space-y-2">
            <div className="text-sm text-gray-600">Company Budget / Value</div>
            <div className="text-xl font-semibold">${companyValue.toLocaleString()}</div>
            <Progress value={progressToTarget} className="h-2" />
            <div className="text-xs text-gray-500 text-right">Target: $100,000</div>
          </div>
        </div>
        <DocumentPanel
          documents={documents}
          onCreateDocument={onAddDocument}
          onToggleVisibility={onToggleVisibility}
          onSelectDocument={setActiveDocument}
          activeDocument={activeDocument}
        />
      </div>
      
      {/* Document Content */}
      <div className="flex-grow flex flex-col h-full ml-64">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-3 flex justify-between items-center">
          <h2 className="font-semibold">
            {activeDocument?.title || 'Select a document'}
          </h2>
          <Timer
            initialTime={timer}
            autoStart={true}
            onTimeChange={onTimerChange}
            className="min-w-28"
          />
        </div>
        
        {/* Editor */}
        {activeDocument ? (
          <div className="flex-grow p-8 overflow-y-auto">
            <div className="max-w-3xl mx-auto">
              {activeDocument.editable ? (
                <textarea
                  value={activeDocument.content}
                  onChange={(e) => onUpdateDocument(activeDocument.id, { content: e.target.value })}
                  className="w-full h-full min-h-[500px] p-4 bg-white rounded-lg shadow-sm border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              ) : (
                <div className="prose prose-sm max-w-none bg-white p-6 rounded-lg shadow-sm">
                  {activeDocument.content.split('\n').map((line, i) => {
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