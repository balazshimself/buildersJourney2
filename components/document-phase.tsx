"use client";

import { useState, useEffect } from "react";
import { Document as DocumentType } from "@/types";
import { DocumentPanel } from "@/components/document-panel";
import { Timer } from "@/components/ui/timer";
import { Progress } from "@/components/ui/progress";
import notificationsData from "@/data/notifications.json";

interface DocumentPhaseProps {
  documents: DocumentType[];
  timer: number;
  onUpdateDocument: (id: string, updates: Partial<DocumentType>) => void;
  onAddDocument: (
    document: Omit<DocumentType, "id" | "position" | "visible" | "createdAt">
  ) => void;
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
  onToggleVisibility,
  onTimerChange,
  onAddNotification,
}: DocumentPhaseProps) {
  const [companyValue, setCompanyValue] = useState(5000);
  const [activeDocument, setActiveDocument] = useState<DocumentType | null>(
    documents.find((doc) => doc.type === "business-plan") || null
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
    const inProgressDocs = documents.filter(
      (doc) => doc.type === "market-research" && !doc.editable
    );

    inProgressDocs.forEach((doc) => {
      const duration = Math.floor(Math.random() * 10000) + 10000; // Random between 10-20 seconds
      let timeLeft = Math.floor(duration / 1000);

      const countdownInterval = setInterval(() => {
        timeLeft--;

        const countdown = timeLeft;

        onUpdateDocument(doc.id, { countdown });

        if (timeLeft <= 0) {
          clearInterval(countdownInterval);
          const valueChange = Math.floor(Math.random() * 5000) + 1000;
          setCompanyValue((prev) => prev + valueChange);

          onUpdateDocument(doc.id, {
            content: `# Research Results\n\nProject: ${
              doc.title
            }\n\nFindings:\n- Successfully developed initial prototype\n- Market validation shows strong interest\n- Potential revenue increase projected\n\nImpact:\nCompany value increased by $${valueChange.toLocaleString()}`,
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
      type: "event",
      title: notif.title,
      content: notif.content,
      editable: false,
      createdAt: new Date(notif.createdAt),
    };

    onAddNotification(notification);
    setNotificationIndex((prev) => prev + 1);
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
            <div className="text-xl font-semibold">
              ${companyValue.toLocaleString()}
            </div>
            <Progress value={progressToTarget} className="h-2" />
            <div className="text-xs text-gray-500 text-right">
              Target: $100,000
            </div>
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
            {activeDocument?.title || "Select a document"}
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
            {activeDocument.content}
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
