"use client";

import { useState, useEffect, useRef } from "react";
import { LogData } from "@/types";
import { OptimizedTimer } from "@/components/ui/optimizedTimer";
import { SidebarLayout } from "@/components/documentPhase/sidebarLayout";
import { DocumentEditor } from "@/components/documentPhase/documentEditor";
import { useSpecializedDocuments } from "@/hooks/useSpecializedDocuments";
import { GanttChart } from "@/components/documentPhase/projectTimeline";
import { GanttTask } from "@/types/gantt";
import { Button } from "../ui/button";
import {
  CardChoiceTemplate,
  ProgressBarTemplate,
  StaticTextTemplate,
  TemplateRenderer,
} from "./templates/templateCompontents";
import { CardComponent, TemplateType } from "@/types/templates";
interface DocumentPhaseProps {
  businessPlan: LogData | null;
  marketingCards?: CardComponent;
  productCards?: CardComponent;
  managementCards?: CardComponent;
  logs: LogData[];
  companyValue: number;
  onUpdateDocument: (id: string, updates: Partial<LogData>) => void;
  onAddDocument: (
    document: Omit<LogData, "id" | "position" | "visible" | "createdAt">
  ) => void;
  startEvaluationPhase: () => void;
  updateCompanyValue: (value: number) => void;
}

export function DocumentPhase({
  businessPlan,
  marketingCards,
  productCards,
  managementCards,
  logs: documents,
  companyValue,
  onUpdateDocument,
  onAddDocument,
  startEvaluationPhase,
  updateCompanyValue,
}: DocumentPhaseProps) {
  const [activeDocument, setActiveDocument] = useState<LogData | null>(
    businessPlan
  );
  const [timelineTasks, setTimelineTasks] = useState<GanttTask[]>([]);

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

  const {
    addProductEntry,
    addMarketingEntry,
    addManagementEntry,
    showProductDocument,
    showMarketingDocument,
    showManagementDocument,
  } = useSpecializedDocuments(
    marketingCards ? <TemplateRenderer template={marketingCards} /> : undefined,
    productCards ? <TemplateRenderer template={productCards} /> : undefined,
    managementCards ? (
      <TemplateRenderer template={managementCards} />
    ) : undefined
  );

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

  // In documentPhase.tsx
  const handleDemoAddComponent = () => {
    const now = new Date();

    // Create some predefined components
    const demoComponents = [
      <StaticTextTemplate
        data={{
          type: TemplateType.StaticText,
          title: "Demo Update",
          text: "This is a demo static text component added randomly!",
        }}
      />,

      <ProgressBarTemplate
        data={{
          type: TemplateType.ProgressBar,
          title: "Demo Progress",
          checkpointData: ["Step 1", "Step 2", "Step 3", "Complete"],
          currentCheckpointIndex: Math.floor(Math.random() * 4),
          reward: "$500 demo reward",
        }}
      />,

      <CardChoiceTemplate
        data={{
          type: TemplateType.CardChoice,
          title: "Demo Choice",
          description: "Choose your demo option:",
          cards: [
            {
              title: "Option A",
              description: "Demo option A",
              buttonString: "Choose A",
            },
            {
              title: "Option B",
              description: "Demo option B",
              buttonString: "Choose B",
            },
          ],
        }}
      />,
    ];

    // Pick random component and random document
    const randomComponent =
      demoComponents[Math.floor(Math.random() * demoComponents.length)];
    const documents = ["product", "marketing", "management"];
    const randomDoc = documents[Math.floor(Math.random() * documents.length)];

    // Add to the appropriate document
    const entry = { data: randomComponent, timestamp: now };

    switch (randomDoc) {
      case "product":
        addProductEntry(entry);
        break;
      case "marketing":
        addMarketingEntry(entry);
        break;
      case "management":
        addManagementEntry(entry);
        break;
    }

    console.log(`Added demo component to ${randomDoc} document`);
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
        onDemoAddComponent={handleDemoAddComponent}
        handleTimelineClick={() => setActiveDocument(timelineDoc)}
      />
      <div className="flex-1 flex flex-col h-full min-w-0">
        {/* Header, aligned with sidebar width */}
        <div className="flex">
          {/* Remove fixed width, let sidebar handle its own width */}
          <div className="flex-1">
            <div className="bg-white border-b border-gray-200 p-3 flex justify-between items-center h-14 min-h-[56px]">
              <h2 className="font-semibold">
                {activeDocument?.title || "Select a document"}
              </h2>
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    console.log("Dev Skip clicked");
                    startEvaluationPhase();
                  }}
                  className="text-sm bg-red-300"
                >
                  Skip to Evaluation
                </Button>
                <OptimizedTimer
                  initialTime={20 * 60} // 20 minutes in seconds
                  className="min-w-28"
                  onComplete={() => startEvaluationPhase()}
                />
              </div>
            </div>
          </div>
        </div>
        {/* Editor below header */}
        <div className="flex-1 min-w-0">
          <DocumentEditor activeDocument={activeDocument} />
        </div>
      </div>
    </div>
  );
}
