"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Document as DocumentType } from "@/types";
import { DocumentPanel } from "@/components/document-panel";
import { Timer } from "@/components/ui/timer";
// import { Progress } from "@/components/ui/progress";
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

  // Store refs to intervals to clear them properly
  const intervalsRef = useRef<Record<string, NodeJS.Timeout>>({});

  // Define addNextNotification using useCallback to avoid recreating it on every render
  const addNextNotification = useCallback(() => {
    if (notificationIndex >= notificationsData.notifications.length) return;

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
  }, [notificationIndex, onAddNotification]);

  // Monitor for new documents with metadata and apply cost/return effects
  useEffect(() => {
    // Find newly added documents with metadata (from Build Something button)
    const newResearchDocs = documents.filter(
      (doc) =>
        doc.type === "market-research" &&
        doc.metadata &&
        doc.metadata.cost !== undefined &&
        // Only apply effect once per document
        !doc.metadata._processed
    );

    newResearchDocs.forEach((doc) => {
      if (doc.metadata?.cost) {
        // Deduct the cost
        setCompanyValue((prev) => Math.max(0, prev - doc.metadata!.cost!));

        // Mark as processed so we don't apply the cost multiple times
        onUpdateDocument(doc.id, {
          metadata: {
            ...doc.metadata,
            _processed: true,
          },
        });

        // If there's a return value, set up a delayed increase
        if (doc.metadata.return && doc.metadata.return > 0) {
          const returnTimeout = setTimeout(() => {
            setCompanyValue((prev) => prev + doc.metadata!.return!);
          }, 5000); // 5 second delay for the return

          // Store the timeout to clean it up if needed
          const timeoutId = `return-${doc.id}`;
          intervalsRef.current[timeoutId] = returnTimeout;
        }
      }
    });

    return () => {
      // Clean up any pending return timeouts
      Object.keys(intervalsRef.current)
        .filter((key) => key.startsWith("return-"))
        .forEach((key) => {
          clearTimeout(intervalsRef.current[key]);
          delete intervalsRef.current[key];
        });
    };
  }, [documents, onUpdateDocument]);

  // Notification system
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
  }, [notificationIndex, addNextNotification]);

  // Research project countdowns
  useEffect(() => {
    // Clean all intervals when unmounting
    return () => {
      Object.entries(intervalsRef.current).forEach(([key, interval]) => {
        if (key.startsWith("research-")) {
          clearInterval(interval);
        }
      });
    };
  }, []);

  // Setup countdown timers for research projects (only for newly added ones)
  useEffect(() => {
    const inProgressDocs = documents.filter(
      (doc) =>
        doc.type === "market-research" &&
        !doc.editable &&
        doc.countdown === undefined
    );

    inProgressDocs.forEach((doc) => {
      // Skip if already tracking this document
      const intervalKey = `research-${doc.id}`;
      if (intervalsRef.current[intervalKey]) {
        return;
      }

      const duration = Math.floor(Math.random() * 10000) + 10000; // Random between 10-20 seconds
      let timeLeft = Math.floor(duration / 1000);

      // Set initial countdown
      onUpdateDocument(doc.id, { countdown: timeLeft });

      const countdownInterval = setInterval(() => {
        timeLeft--;

        onUpdateDocument(doc.id, { countdown: timeLeft });

        if (timeLeft <= 0) {
          // Clear the interval
          clearInterval(intervalsRef.current[intervalKey]);
          delete intervalsRef.current[intervalKey];

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

      // Store the interval so we can clean it up
      intervalsRef.current[intervalKey] = countdownInterval;
    });
  }, [documents, onUpdateDocument]);

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
            {/* <Progress value={progressToTarget} className="h-2" /> */}
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
          availableFunds={companyValue}
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
