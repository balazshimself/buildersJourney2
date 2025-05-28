"use client";

import { Document as DocumentType } from "@/types";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

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

interface SidebarLayoutProps {
  companyValue: number;
  progressToTarget: number;
  businessPlan: DocumentType | null;
  logs: DocumentType[];
  activeDocument: DocumentType | null;
  onDocumentClick: (doc: DocumentType) => void;
  onBuildSomethingClick: () => void;
  onTimelineClick: () => void;
  onShowProductDocument: () => DocumentType;
  onShowMarketingDocument: () => DocumentType;
  onShowManagementDocument: () => DocumentType;
}

export function SidebarLayout({
  logs,
  companyValue,
  businessPlan,
  activeDocument,
  onDocumentClick,
  onBuildSomethingClick,
  onTimelineClick,
  onShowProductDocument,
  onShowMarketingDocument,
  onShowManagementDocument,
}: SidebarLayoutProps) {
  return (
    <Sidebar className="w-64 border-r border-border">
      <SidebarHeader className="p-4 border-b">
        <div className="space-y-2">
          <div className="text-sm text-gray-600">Company Balance</div>
          <div className="text-xl font-semibold">${companyValue}</div>
          <div className="text-xs text-gray-500 text-right">
            Target: $100,000
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <ScrollArea className="flex-1 h-[400px]">
          <div>
            {/* Business Documents - unchanged */}
            <SidebarGroup>
              <SidebarGroupLabel className="text-sm font-medium text-gray-700">
                Business Documents
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="mt-1 space-y-1">
                  {businessPlan && (
                    <button
                      key={businessPlan.id}
                      className={cn(
                        "w-full px-3 py-2 text-left rounded-md text-sm flex items-center space-x-2",
                        activeDocument?.id === businessPlan.id
                          ? "bg-blue-50 text-blue-700"
                          : "hover:bg-gray-100"
                      )}
                      onClick={() => onDocumentClick(businessPlan)}
                    >
                      <FileTextIcon className="h-4 w-4 text-gray-500" />
                      <span>{businessPlan.title}</span>
                    </button>
                  )}
                </div>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* New standalone cards for specialized documents */}
            <SidebarGroup>
              <SidebarGroupContent className="flex flex-col gap-2">
                <button
                  className={cn(
                    "w-full px-3 py-2.5 text-left rounded-md text-sm flex items-center space-x-2 border",
                    activeDocument?.id === "product-document"
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "hover:bg-gray-100 border-gray-200"
                  )}
                  onClick={() => onDocumentClick(onShowProductDocument())}
                >
                  <PenToolIcon className="h-4 w-4 text-blue-500" />
                  <span>Product Development</span>
                </button>

                <button
                  className={cn(
                    "w-full px-3 py-2.5 text-left rounded-md text-sm flex items-center space-x-2 border",
                    activeDocument?.id === "marketing-document"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "hover:bg-gray-100 border-gray-200"
                  )}
                  onClick={() => onDocumentClick(onShowMarketingDocument())}
                >
                  <MegaphoneIcon className="h-4 w-4 text-emerald-500" />
                  <span>Marketing</span>
                </button>

                <button
                  className={cn(
                    "w-full px-3 py-2.5 text-left rounded-md text-sm flex items-center space-x-2 border",
                    activeDocument?.id === "management-document"
                      ? "bg-purple-50 text-purple-700 border-purple-200"
                      : "hover:bg-gray-100 border-gray-200"
                  )}
                  onClick={() => onDocumentClick(onShowManagementDocument())}
                >
                  <UsersIcon className="h-4 w-4 text-purple-500" />
                  <span>Management</span>
                </button>
              </SidebarGroupContent>
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
                        {logs.map((doc) => (
                          <button
                            key={doc.id}
                            className={cn(
                              "w-full px-3 py-2 text-left rounded-md text-sm flex items-center space-x-2",
                              activeDocument?.id === doc.id
                                ? "bg-blue-50 text-blue-700"
                                : "hover:bg-gray-100"
                            )}
                            onClick={() => onDocumentClick(doc)}
                          >
                            <CodesandboxIcon className="h-4 w-4 text-purple-500" />
                            <span className="flex-grow truncate">
                              {doc.title}
                            </span>
                            {doc.countdown !== undefined &&
                              doc.countdown > 0 && (
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

      <SidebarFooter>
        <div>
          <button
            className={cn(
              "w-full py-2 px-1 rounded-md text-sm font-medium",
              "flex items-center justify-center space-x-2 relative overflow-hidden",
              "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500",
              "hover:from-blue-600 hover:via-indigo-600 hover:to-purple-600",
              "text-white shadow-md transition-all"
            )}
            onClick={onBuildSomethingClick}
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
        </div>

        <button
          className={cn(
            "w-full py-2 px-3 rounded-md text-sm font-medium mt-2",
            "flex items-center justify-center space-x-2",
            "bg-white border border-gray-300",
            "hover:bg-gray-50 text-gray-700 transition-colors"
          )}
          onClick={onTimelineClick}
        >
          <ClockIcon className="h-4 w-4 text-gray-500" />
          <span>Project Timeline</span>
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
