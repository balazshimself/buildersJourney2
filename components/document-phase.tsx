"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Document as DocumentType } from "@/types";
import { Timer } from "@/components/ui/timer";
import { Progress } from "@/components/ui/progress";
import notificationsData from "@/data/notifications.json";
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
  UserPlusIcon,
  BellIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BuildSomethingPanel } from "./build-something-panel";

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
  const [notificationIndex, setNotificationIndex] = useState(0);
  const intervalsRef = useRef<Record<string, NodeJS.Timeout>>({});
  const processedDocsRef = useRef<Set<string>>(new Set());

  // Group documents by type
  const documentsByType = {
    main: documents.filter(
      (doc) => doc.type === "business-plan" || doc.type === "timeline"
    ),
    research: documents.filter((doc) => doc.type === "market-research"),
    events: documents.filter((doc) => doc.type === "event"),
  };

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
            // Create a permanent document with the result
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
          }}
        />
      ),
      editable: false,
      visible: true,
      createdAt: new Date(),
      position: 0,
      countdown: 10,
    };

    setActiveDocument(buildSomethingDoc);
  };

  const handleTimelineClick = () => {
    // For now, do nothing
    console.log("Timeline button clicked - not implemented yet");
  };

  return (
    <div className="h-full flex">
      {/* Sidebar using the shadcn components */}
      <Sidebar className="w-64 border-r border-border">
        <SidebarHeader className="p-4 border-b">
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
        </SidebarHeader>

        <SidebarContent>
          <ScrollArea className="flex-1 h-[400px]">
            <Accordion
              type="multiple"
              defaultValue={["main", "research", "events"]}
              className="p-2 space-y-2"
            >
              <SidebarGroup>
                <AccordionItem value="main">
                  <SidebarGroupLabel>
                    <AccordionTrigger className="text-sm font-medium text-gray-700">
                      Business Documents
                    </AccordionTrigger>
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <AccordionContent>
                      <div>
                        {documentsByType.main.map((doc) => (
                          <button
                            key={doc.id}
                            className={cn(
                              "w-full px-3 py-2 text-left rounded-md text-sm flex items-center space-x-2",
                              activeDocument?.id === doc.id
                                ? "bg-blue-50 text-blue-700"
                                : "hover:bg-gray-100"
                            )}
                            onClick={() => setActiveDocument(doc)}
                          >
                            <FileTextIcon className="h-4 w-4 text-gray-500" />
                            <span>{doc.title}</span>
                          </button>
                        ))}
                      </div>
                    </AccordionContent>
                  </SidebarGroupContent>
                </AccordionItem>
              </SidebarGroup>

              <SidebarGroup>
                <AccordionItem value="research">
                  <SidebarGroupLabel>
                    <AccordionTrigger className="text-sm font-medium text-gray-700">
                      Research and Development
                    </AccordionTrigger>
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <AccordionContent>
                      <div>
                        {documentsByType.research.map((doc) => (
                          <button
                            key={doc.id}
                            className={cn(
                              "w-full px-3 py-2 text-left rounded-md text-sm flex items-center space-x-2",
                              !doc.editable && "opacity-75",
                              activeDocument?.id === doc.id
                                ? "bg-blue-50 text-blue-700"
                                : "hover:bg-gray-100"
                            )}
                            onClick={() => setActiveDocument(doc)}
                          >
                            <UserPlusIcon className="h-4 w-4 text-purple-500" />
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
              </SidebarGroup>

              <SidebarGroup>
                <AccordionItem value="events">
                  <SidebarGroupLabel>
                    <AccordionTrigger className="text-sm font-medium text-gray-700">
                      Events
                    </AccordionTrigger>
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <AccordionContent>
                      <div>
                        {documentsByType.events.map((doc) => (
                          <button
                            key={doc.id}
                            className={cn(
                              "w-full px-3 py-2 text-left rounded-md text-sm flex items-center space-x-2",
                              activeDocument?.id === doc.id
                                ? "bg-blue-50 text-blue-700"
                                : "hover:bg-gray-100"
                            )}
                            onClick={() => setActiveDocument(doc)}
                          >
                            <BellIcon className="h-4 w-4 text-red-500" />
                            <span>{doc.title}</span>
                          </button>
                        ))}
                      </div>
                    </AccordionContent>
                  </SidebarGroupContent>
                </AccordionItem>
              </SidebarGroup>
            </Accordion>
          </ScrollArea>
        </SidebarContent>

        <SidebarFooter className="py-2 px-1 border-t">
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

          <button
            className={cn(
              "w-full py-2 px-3 rounded-md text-sm font-medium",
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
