"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Document as DocumentType } from "@/types";
import { OptimizedTimer } from "@/components/optimizedTimer";
import { SidebarLayout } from "@/components/documentPhase/sidebarLayout";
import { DocumentEditor } from "@/components/documentPhase/documentEditor";
import { useSpecializedDocuments } from "@/hooks/useSpecializedDocuments";

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
  onRemoveDocument,
  onToggleVisibility,
  onTimerChange,
  onAddNotification,
}: DocumentPhaseProps) {
  const [companyValue, setCompanyValue] = useState(5000);
  const [activeDocument, setActiveDocument] = useState<DocumentType | null>(
    documents.find((doc) => doc.type === "business-plan") || null
  );
  const [hasNewNotification, setHasNewNotification] = useState(false);

  const {
    addProductEntry,
    addMarketingEntry,
    addManagementEntry,
    showProductDocument,
    showMarketingDocument,
    showManagementDocument,
  } = useSpecializedDocuments();

  const intervalsRef = useRef<Record<string, NodeJS.Timeout>>({});
  const processedDocsRef = useRef<Set<string>>(new Set());

  // Group documents by type
  const documentsByType = {
    main: documents.filter(
      (doc) => doc.type === "business-plan" || doc.type === "timeline"
    ),
    buildLogs: documents.filter((doc) => doc.type === "market-research"),
  };

  // Cleanup all intervals on unmount
  useEffect(() => {
    return () => {
      Object.values(intervalsRef.current).forEach(clearInterval);
      intervalsRef.current = {};
    };
  }, []);

  // Setup countdown timers for research projects
  useEffect(() => {
    // Find documents that need countdown timers (research that is accepted but not editable)
    const inProgressDocs = documents.filter(
      (doc) =>
        doc.type === "market-research" &&
        !doc.editable &&
        doc.metadata?.accepted === true &&
        !processedDocsRef.current.has(doc.id)
    );

    inProgressDocs.forEach((doc) => {
      // Mark as processed so we don't set up multiple timers
      processedDocsRef.current.add(doc.id);

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

          // Apply costs and returns ONLY when project is complete
          if (doc.metadata?.cost) {
            setCompanyValue((prev) => Math.max(0, prev - doc.metadata!.cost!));

            // Apply return if there is one
            if (doc.metadata?.return && doc.metadata.return > 0) {
              setTimeout(() => {
                setCompanyValue((prev) => prev + doc.metadata!.return!);
              }, 5000);
            }
          } else {
            // For regular research without cost metadata
            const valueChange = Math.floor(Math.random() * 5000) + 1000;
            setCompanyValue((prev) => prev + valueChange);
          }

          // Determine which value to show based on metadata
          const valueChangeDisplay = doc.metadata?.return
            ? doc.metadata.return.toLocaleString()
            : Math.floor(Math.random() * 5000 + 1000).toLocaleString();

          onUpdateDocument(doc.id, {
            content: `# Research Results\n\nProject: ${doc.title}\n\nFindings:\n- Successfully developed initial prototype\n- Market validation shows strong interest\n- Potential revenue increase projected\n\nImpact:\nCompany value increased by $${valueChangeDisplay}`,
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

  const handleBuildSomethingClick = () => {
    // Import the BuildSomethingPanel component only when needed
    import("@/components/documentPhase/buildSomethingPanel").then(
      ({ BuildSomethingPanel }) => {
        // Get the business plan document content
        const businessPlan =
          documents.find((doc) => doc.type === "business-plan")?.content || "";

        // Create a temporary document to show the build panel
        const buildSomethingDoc = {
          id: "build-something",
          type: "custom" as const,
          title: "Build something!",
          content: (
            <BuildSomethingPanel
              availableFunds={companyValue}
              onComplete={(result) => {
                // Add to build logs as before
                onAddDocument({
                  type: "market-research",
                  title: result.title,
                  content: result.content,
                  editable: false,
                  metadata: {
                    effect: result.effect,
                    accepted: result.accepted,
                    cost: result.cost,
                    return: result.return,
                  },
                });

                // Update the specialized documents based on AI response
                const now = new Date();
                const entryId = `entry-${Date.now()}`;

                // Update product entries if provided by AI
                if (result.product) {
                  addProductEntry({
                    id: `product-${entryId}`,
                    title: result.product.title,
                    content: result.product.content,
                    timestamp: now,
                    tag: result.product.tag,
                  });
                }

                // Update marketing entries if provided by AI
                if (result.marketing) {
                  addMarketingEntry({
                    id: `marketing-${entryId}`,
                    title: result.marketing.title,
                    content: result.marketing.content,
                    timestamp: now,
                    tag: result.marketing.tag,
                  });
                }

                // Update management entries if provided by AI
                if (result.management) {
                  addManagementEntry({
                    id: `management-${entryId}`,
                    title: result.management.title,
                    content: result.management.content,
                    timestamp: now,
                    tag: result.management.tag,
                  });
                }

                // Show notification
                setHasNewNotification(true);
              }}
            />
          ),
          editable: false,
          visible: true,
          createdAt: new Date(),
          position: 0,
        };

        setActiveDocument(buildSomethingDoc);
      }
    );
  };

  const handleTimelineClick = () => {
    // Import the ProjectTimeline component only when needed
    import("@/components/projectTimeline").then(({ ProjectTimeline }) => {
      // Initialize the ProjectTimeline component
      const timelineDoc = {
        id: "project-timeline",
        type: "timeline" as const,
        title: "Project Timeline",
        content: <ProjectTimeline />,
        editable: false,
        visible: true,
        createdAt: new Date(),
        position: 0,
      };

      setActiveDocument(timelineDoc);
    });
  };

  // Clear notification when clicking on a document
  const handleDocumentClick = (doc: DocumentType) => {
    setActiveDocument(doc);
    setHasNewNotification(false);
  };

  return (
    <div className="h-full flex flex-row w-full">
      {/* Sidebar on the left */}
      <SidebarLayout
        companyValue={companyValue}
        progressToTarget={progressToTarget}
        documentsByType={documentsByType}
        activeDocument={activeDocument}
        hasNewNotification={hasNewNotification}
        onDocumentClick={handleDocumentClick}
        onBuildSomethingClick={handleBuildSomethingClick}
        onTimelineClick={handleTimelineClick}
        onShowProductDocument={showProductDocument}
        onShowMarketingDocument={showMarketingDocument}
        onShowManagementDocument={showManagementDocument}
      />
      {/* Main content on the right */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        {/* Header, aligned with sidebar width */}
        <div className="flex">
          {/* Remove fixed width, let sidebar handle its own width */}
          <div className="flex-1">
            <div className="bg-white border-b border-gray-200 p-3 flex justify-between items-center h-14 min-h-[56px]">
              <h2 className="font-semibold">
                {activeDocument?.title || "Select a document"}
              </h2>
              <OptimizedTimer
                initialTime={timer}
                autoStart={true}
                onTimeChange={onTimerChange}
                className="min-w-28"
              />
            </div>
          </div>
        </div>
        {/* Editor below header */}
        <div className="flex-1 min-w-0">
          <DocumentEditor
            activeDocument={activeDocument}
            timer={timer}
            onTimerChange={onTimerChange}
          />
        </div>
      </div>
    </div>
  );
}
