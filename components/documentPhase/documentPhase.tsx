"use client";

import { useState, useEffect, useRef } from "react";
import { LogData } from "@/types";
import { OptimizedTimer } from "@/components/optimizedTimer";
import { SidebarLayout } from "@/components/documentPhase/sidebarLayout";
import { DocumentEditor } from "@/components/documentPhase/documentEditor";
import { useSpecializedDocuments } from "@/hooks/useSpecializedDocuments";
import { GanttChart } from "@/components/projectTimeline";
import { GanttTask } from "@/types/gantt";

interface DocumentPhaseProps {
  businessPlan: LogData | null;
  logs: LogData[];
  timer: number;
  companyValue: number;
  onUpdateDocument: (id: string, updates: Partial<LogData>) => void;
  onAddDocument: (
    document: Omit<LogData, "id" | "position" | "visible" | "createdAt">
  ) => void;
  onTimerChange: (time: number) => void;
  startEvaluationPhase: () => void;
  updateCompanyValue: (value: number) => void;
}

export function DocumentPhase({
  businessPlan,
  logs: documents,
  timer,
  companyValue,
  onUpdateDocument,
  onAddDocument,
  onTimerChange,
  startEvaluationPhase,
  updateCompanyValue,
}: DocumentPhaseProps) {
  const [activeDocument, setActiveDocument] = useState<LogData | null>(
    businessPlan
  );
  const [calledEval, setCalledEval] = useState(false);
  // Add timeline state here
  const [timelineTasks, setTimelineTasks] = useState<GanttTask[]>([]);

  useEffect(() => {
    handleTimelineClick();
  }, [timelineTasks]);

  const handleTimelineClick = () => {
    console.log("Timeline tasks to init with:", timelineTasks);
    // Initialize the ProjectTimeline component
    const timelineDoc = {
      id: `project-timeline-${Date.now()}`,
      type: "timeline" as const,
      title: "Project Timeline",
      content: (
        <GanttChart
          businessPlan={businessPlan}
          showControls={true}
          cardTitle="Project Timeline"
          cardDescription="Track your milestones"
          tasks={timelineTasks}
          onTasksUpdate={setTimelineTasks}
        />
      ),
      editable: false,
      visible: true,
      createdAt: new Date(),
      position: 0,
    };

    setActiveDocument(timelineDoc);
  };

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

  // Cleanup all intervals on unmount
  useEffect(() => {
    return () => {
      Object.values(intervalsRef.current).forEach(clearInterval);
      intervalsRef.current = {};
    };
  }, []);

  useEffect(() => {
    if (timer === 0 && !calledEval) {
      startEvaluationPhase();
      setCalledEval(true);
    }
  }, [timer]);

  useEffect(() => {
    console.log("Here is the companyvalue: ", companyValue);
  }, [companyValue]);

  // Setup countdown timers for research projects
  useEffect(() => {
    // Find documents that need countdown timers (research that is accepted but not editable)
    const inProgressDocs = documents.filter(
      (doc) =>
        doc.metadata?.accepted === true && !processedDocsRef.current.has(doc.id)
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
          clearInterval(intervalsRef.current[intervalKey]);
          delete intervalsRef.current[intervalKey];
          updateCompanyValue(doc.metadata?.return ?? 0);
        }
      }, 1000);

      intervalsRef.current[intervalKey] = countdownInterval;
    });
  }, [documents, onUpdateDocument]);

  const progressToTarget = (companyValue / 100000) * 100;

  const handleBuildSomethingClick = () => {
    // Import the BuildSomethingPanel component only when needed
    import("@/components/documentPhase/buildSomethingPanel").then(
      ({ BuildSomethingPanel }) => {
        // Create a temporary document to show the build panel
        const buildSomethingDoc = {
          id: "build-something",
          type: "custom" as const,
          title: "Build something!",
          content: (
            <BuildSomethingPanel
              companyValue={companyValue}
              businessPlan={businessPlan}
              updateCompanyValue={updateCompanyValue}
              onComplete={(result) => {
                // Add to build logs as before
                onAddDocument({
                  title: result.title,
                  content: result.content,
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
                    data: Array.isArray(result.product) ? (
                      <>{result.product}</>
                    ) : (
                      result.product
                    ),
                    timestamp: now,
                  });
                }

                // Update marketing entries if provided by AI
                if (result.marketing) {
                  addMarketingEntry({
                    data: Array.isArray(result.marketing) ? (
                      <>{result.marketing}</>
                    ) : (
                      result.marketing
                    ),
                    timestamp: now,
                  });
                }

                // Update management entries if provided by AI
                if (result.management) {
                  addManagementEntry({
                    data: Array.isArray(result.management) ? (
                      <>{result.management}</>
                    ) : (
                      result.management
                    ),
                    timestamp: now,
                  });
                }
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

  // Clear notification when clicking on a document
  const handleDocumentClick = (doc: LogData) => {
    setActiveDocument(doc);
  };

  return (
    <div className="h-full flex flex-row w-full">
      {/* Sidebar on the left */}
      <SidebarLayout
        companyValue={companyValue}
        progressToTarget={progressToTarget}
        logs={documents}
        businessPlan={businessPlan}
        activeDocument={activeDocument}
        onDocumentClick={handleDocumentClick}
        onBuildSomethingClick={handleBuildSomethingClick}
        onShowProductDocument={showProductDocument}
        onShowMarketingDocument={showMarketingDocument}
        onShowManagementDocument={showManagementDocument}
        handleTimelineClick={handleTimelineClick}
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
