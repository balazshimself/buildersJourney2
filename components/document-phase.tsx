"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Document as DocumentType } from "@/types";
import { Timer } from "@/components/ui/timer";
import { Progress } from "@/components/ui/progress";
import { ProjectTimeline } from "./project-timeline";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  RocketIcon,
  ClockIcon,
  FileTextIcon,
  CodesandboxIcon,
  PenToolIcon,
  MegaphoneIcon,
  UsersIcon,
  BellIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BuildSomethingPanel } from "./build-something-panel";
import { Badge } from "@/components/ui/badge";

// Import the sidebar components
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarFooter,
} from "@/components/ui/sidebar";

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

// Define the structure for entries in the specialized documents
interface DocumentEntry {
  id: string;
  title: string;
  content: string;
  timestamp: Date;
  tag: string;
}

export function DocumentPhase({
  documents,
  timer,
  onUpdateDocument,
  onAddDocument,
  onTimerChange,
}: DocumentPhaseProps) {
  const [companyValue, setCompanyValue] = useState(5000);
  const [activeDocument, setActiveDocument] = useState<DocumentType | null>(
    documents.find((doc) => doc.type === "business-plan") || null
  );
  const [hasNewNotification, setHasNewNotification] = useState(false);

  // New state for specialized documents
  const [productEntries, setProductEntries] = useState<DocumentEntry[]>([]);
  const [marketingEntries, setMarketingEntries] = useState<DocumentEntry[]>([]);
  const [managementEntries, setManagementEntries] = useState<DocumentEntry[]>(
    []
  );

  const intervalsRef = useRef<Record<string, NodeJS.Timeout>>({});
  const processedDocsRef = useRef<Set<string>>(new Set());

  const [productDoc, setProductDoc] = useState({
    id: "product-document",
    type: "custom" as const,
    title: "Product Design & Development",
    content: (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Development Timeline</h3>
        <div className="space-y-3">
          {productEntries.length === 0 ? (
            <div className="p-4 border border-dashed border-gray-300 rounded-md text-gray-500 text-center">
              No product development activities yet. Use the "Build Something"
              button to start development.
            </div>
          ) : (
            productEntries.map((entry) => (
              <div
                key={entry.id}
                className="p-3 bg-white rounded-md border border-gray-200 shadow-sm"
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-medium text-blue-700">{entry.title}</h4>
                  <Badge> {entry.tag}</Badge>
                </div>
                <p className="text-sm text-gray-700 mb-2">{entry.content}</p>
                <p className="text-xs text-gray-500">
                  {entry.timestamp.toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
      // <div className="w-full">HELLO WORLD!</div>
    ),
    editable: false,
    createdAt: new Date(),
  });

  const [marketingDoc, setmarketingDoc] = useState({
    id: "marketing-document",
    type: "custom" as const,
    title: "Marketing",
    content: (
      <div>
        <h3 className="text-lg font-medium">Marketing Activities</h3>
        <div className="space-y-3">
          {marketingEntries.length === 0 ? (
            <div className="p-4 border border-dashed border-gray-300 rounded-md text-gray-500 text-center">
              No marketing activities yet. Use the "Build Something" button to
              start marketing efforts.
            </div>
          ) : (
            marketingEntries.map((entry) => (
              <div
                key={entry.id}
                className="p-3 bg-white rounded-md border border-gray-200 shadow-sm"
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-medium text-emerald-700">
                    {entry.title}
                  </h4>
                  <Badge>{entry.tag}</Badge>
                </div>
                <p className="text-sm text-gray-700 mb-2">{entry.content}</p>
                <p className="text-xs text-gray-500">
                  {entry.timestamp.toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    ),
    editable: false,
    createdAt: new Date(),
  });

  const [managementDoc, setmanagementDoc] = useState({
    id: "management-document",
    type: "custom" as const,
    title: "Management",
    content: (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Team & Operations</h3>
        <div className="space-y-3">
          {managementEntries.length === 0 ? (
            <div className="p-4 border border-dashed border-gray-300 rounded-md text-gray-500 text-center">
              No management activities yet. Use the "Build Something" button to
              start team building.
            </div>
          ) : (
            managementEntries.map((entry) => (
              <div
                key={entry.id}
                className="p-3 bg-white rounded-md border border-gray-200 shadow-sm"
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-medium text-purple-700">{entry.title}</h4>
                  <Badge> {entry.tag} </Badge>
                </div>
                <p className="text-sm text-gray-700 mb-2">{entry.content}</p>
                <p className="text-xs text-gray-500">
                  {entry.timestamp.toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    ),
    editable: false,
    createdAt: new Date(),
  });

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
              setProductEntries((prev) => [
                ...prev,
                {
                  id: `product-${entryId}`,
                  title: result.product!.title,
                  content: result.product!.content,
                  timestamp: now,
                  tag: result.product!.tag,
                },
              ]);
            }

            // Update marketing entries if provided by AI
            if (result.marketing) {
              setMarketingEntries((prev) => [
                ...prev,
                {
                  id: `marketing-${entryId}`,
                  title: result.marketing!.title,
                  content: result.marketing!.content,
                  timestamp: now,
                  tag: result.marketing!.tag,
                },
              ]);
            }

            // Update management entries if provided by AI
            if (result.management) {
              setManagementEntries((prev) => [
                ...prev,
                {
                  id: `management-${entryId}`,
                  title: result.management!.title,
                  content: result.management!.content,
                  timestamp: now,
                  tag: result.management!.tag,
                },
              ]);
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
  };

  const handleTimelineClick = () => {
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
  };

  // Clear notification when clicking on a document
  const handleDocumentClick = (doc: DocumentType) => {
    setActiveDocument(doc);
    setHasNewNotification(false);
  };

  return (
    <div className="h-full flex">
      {/* Sidebar using the shadcn components */}
      <Sidebar className="w-64 border-r border-border">
        <SidebarHeader className="p-4 border-b">
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
        </SidebarHeader>

        <SidebarContent>
          <ScrollArea className="flex-1">
            <div className="p-1 ">
              {/* New standalone cards for specialized documents */}
              <SidebarGroup className="m-0">
                <button
                  className={cn(
                    "w-full px-3 py-2.5 text-left rounded-md text-sm flex items-center space-x-2 border",
                    activeDocument?.id === "product-document"
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "hover:bg-gray-100 border-gray-200"
                  )}
                  onClick={() => handleDocumentClick(productDoc)}
                >
                  <PenToolIcon className="h-4 w-4 text-blue-500" />
                  <span>Product Development</span>
                </button>
              </SidebarGroup>

              <SidebarGroup>
                <button
                  className={cn(
                    "w-full px-3 py-2.5 text-left rounded-md text-sm flex items-center space-x-2 border",
                    activeDocument?.id === "marketing-document"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "hover:bg-gray-100 border-gray-200"
                  )}
                  onClick={() => handleDocumentClick(marketingDoc)}
                >
                  <MegaphoneIcon className="h-4 w-4 text-emerald-500" />
                  <span>Marketing</span>
                </button>
              </SidebarGroup>

              <SidebarGroup>
                <button
                  className={cn(
                    "w-full px-3 py-2.5 text-left rounded-md text-sm flex items-center space-x-2 border",
                    activeDocument?.id === "management-document"
                      ? "bg-purple-50 text-purple-700 border-purple-200"
                      : "hover:bg-gray-100 border-gray-200"
                  )}
                  onClick={() => handleDocumentClick(managementDoc)}
                >
                  <UsersIcon className="h-4 w-4 text-purple-500" />
                  <span>Management</span>
                </button>
              </SidebarGroup>

              {/* Business Documents - unchanged */}
              <SidebarGroup>
                <Accordion type="single" collapsible defaultValue="buildLogs">
                  <AccordionItem value="buildLogs" className="border-0">
                    <SidebarGroupLabel>
                      <AccordionTrigger className="text-sm font-medium text-gray-700 py-1">
                        Business Documents
                      </AccordionTrigger>
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                      <AccordionContent>
                        <div className="mt-1 space-y-1">
                          {documentsByType.main.map((doc) => (
                            <button
                              key={doc.id}
                              className={cn(
                                "w-full px-3 py-2 text-left rounded-md text-sm flex items-center space-x-2",
                                activeDocument?.id === doc.id
                                  ? "bg-blue-50 text-blue-700"
                                  : "hover:bg-gray-100"
                              )}
                              onClick={() => handleDocumentClick(doc)}
                            >
                              <FileTextIcon className="h-4 w-4 text-gray-500" />
                              <span>{doc.title}</span>
                            </button>
                          ))}
                        </div>
                      </AccordionContent>
                    </SidebarGroupContent>
                  </AccordionItem>
                </Accordion>
              </SidebarGroup>

              {/* Build logs (renamed from Research and Development) */}
              <SidebarGroup>
                <Accordion type="single" collapsible defaultValue="buildLogs">
                  <AccordionItem value="buildLogs" className="border-0">
                    <SidebarGroupLabel>
                      <AccordionTrigger className="text-sm font-medium text-gray-700 py-1">
                        Build Logs
                      </AccordionTrigger>
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                      <AccordionContent>
                        <div className="mt-1 space-y-1">
                          {documentsByType.buildLogs.map((doc) => (
                            <button
                              key={doc.id}
                              className={cn(
                                "w-full px-3 py-2 text-left rounded-md text-sm flex items-center space-x-2",
                                !doc.editable && "opacity-75",
                                activeDocument?.id === doc.id
                                  ? "bg-blue-50 text-blue-700"
                                  : "hover:bg-gray-100"
                              )}
                              onClick={() => handleDocumentClick(doc)}
                            >
                              <CodesandboxIcon className="h-4 w-4 text-purple-500" />
                              <span className="flex-grow truncate">
                                {doc.title}
                              </span>
                              {!doc.editable && doc.countdown && (
                                <span className="ml-auto text-xs text-gray-500 flex items-center">
                                  <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse mr-1"></span>
                                  {doc.countdown}s
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      </AccordionContent>
                    </SidebarGroupContent>
                  </AccordionItem>
                </Accordion>
              </SidebarGroup>
            </div>
          </ScrollArea>
        </SidebarContent>

        <SidebarFooter className="py-2 px-1 border-t">
          <div className="relative">
            <button
              className={cn(
                "w-full py-2 px-1 rounded-md text-sm font-medium",
                "flex items-center justify-center space-x-2 relative overflow-hidden",
                "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500",
                "hover:from-blue-600 hover:via-indigo-600 hover:to-purple-600",
                "text-white shadow-md transition-all"
              )}
              onClick={handleBuildSomethingClick}
              style={{
                animation: "pulse 2s infinite",
                backgroundSize: "200% 200%",
              }}
            >
              <style jsx global>{`
                @keyframes pulse {
                  0% {
                    background-position: 0% 50%;
                  }
                  50% {
                    background-position: 100% 50%;
                  }
                  100% {
                    background-position: 0% 50%;
                  }
                }
              `}</style>
              <RocketIcon className="h-4 w-4 text-white" />
              <span>Build something!</span>
            </button>

            {/* Notification indicator */}
            {hasNewNotification && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse" />
            )}
          </div>

          <button
            className={cn(
              "w-full py-2 px-3 rounded-md text-sm font-medium mt-2",
              "flex items-center justify-center space-x-2",
              "bg-white border border-gray-300",
              "hover:bg-gray-50 text-gray-700 transition-colors"
            )}
            onClick={handleTimelineClick}
          >
            <ClockIcon className="h-4 w-4 text-gray-500" />
            <span>Project Timeline</span>
          </button>
        </SidebarFooter>
      </Sidebar>

      {/* Document Content */}
      <div className="flex-grow flex flex-col h-full">
        {/* Header */}
        <div className="w-full fix bg-white border-b border-gray-200 p-3 flex justify-between items-center">
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
            <div data-type={activeDocument.type}>{activeDocument.content}</div>
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
