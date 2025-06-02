"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { LogData } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Loader2 } from "lucide-react";
import { GanttTask } from "@/types/gantt";

interface GanttChartProps {
  className?: string;
  businessPlan?: LogData | null;
  showControls?: boolean;
  cardTitle?: string;
  cardDescription?: string;
  tasks: GanttTask[];
  onTasksUpdate: (tasks: GanttTask[]) => void;
  onTaskClick?: (task: GanttTask) => void;
  onDateChange?: (task: GanttTask, start: Date, end: Date) => void;
  onProgressChange?: (task: GanttTask, progress: number) => void;
}

export function GanttChart({
  className,
  businessPlan,
  tasks = [],
  onTasksUpdate,
  showControls = false,
  cardTitle = "Project Timeline",
  cardDescription = "Track your project milestones and progress",
  onTaskClick,
  onDateChange,
  onProgressChange,
}: GanttChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const ganttInstanceRef = useRef<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    console.log("Initializing Gantt chart with tasks:", tasks, containerRef);

    if (!containerRef.current) return;

    // Check if Frappe Gantt is available
    if (typeof window !== "undefined" && window.Gantt) {
      // Clear any existing instance first
      if (ganttInstanceRef.current) {
        ganttInstanceRef.current = null;
      }

      // Always create a new instance (especially important when tasks exist)
      if (tasks.length > 0 || !ganttInstanceRef.current) {
        // Clear the container
        if (containerRef.current) {
          containerRef.current.innerHTML = "";
        }

        console.log("Creating new Gantt chart instance with tasks:", tasks);

        const gantt = new window.Gantt(containerRef.current, tasks, {
          on_click: onTaskClick,
          on_date_change: onDateChange,
          on_progress_change: onProgressChange,
          viewMode: "Week",
          custom_popup_html: (task: GanttTask) => {
            return `
              <div class="p-2 bg-white shadow rounded border border-gray-200 text-sm">
                <h4 class="font-bold text-gray-800">${task.name}</h4>
                <p class="text-xs text-gray-600">
                  ${task.start.toLocaleDateString()} - ${task.end.toLocaleDateString()}
                </p>
                <div class="mt-1 h-1.5 w-full bg-gray-200 rounded-full">
                  <div class="h-full bg-blue-500 rounded-full" style="width: ${
                    task.progress
                  }%"></div>
                </div>
                <p class="text-xs mt-1 text-gray-500">Progress: ${
                  task.progress
                }%</p>
              </div>
            `;
          },
        });

        ganttInstanceRef.current = gantt;
      }
    }
  }, [tasks, onTaskClick, onDateChange, onProgressChange]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      console.log("Cleaning up Gantt chart instance");
      if (ganttInstanceRef.current) {
        ganttInstanceRef.current = null;
      }
    };
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (ganttInstanceRef.current) {
        ganttInstanceRef.current.refresh(tasks);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [tasks]);

  // Generate AI tasks based on business plan
  const generateAITasks = async () => {
    if (!onTasksUpdate) return;

    setIsGenerating(true);

    try {
      // Get business plan if not provided
      const plan: string = businessPlan?.content
        ? businessPlan.content.toString()
        : "No business plan provided.";

      // Call API to generate tasks
      const response = await fetch("/api/generateTimeline/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ businessPlan: plan }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate timeline");
      }

      const data = await response.json();

      console.log("Generated timeline data:", data);

      // Update tasks with AI-generated ones
      if (data.tasks && Array.isArray(data.tasks)) {
        const formattedTasks = data.tasks.map((task: any) => ({
          ...task,
          start: new Date(task.start),
          end: new Date(task.end),
        }));

        onTasksUpdate(formattedTasks);
      }
    } catch (error) {
      console.error("Error generating timeline:", error);
      // Fallback to default tasks if generation fails
      onTasksUpdate(generateDefaultTasks());
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate default tasks for the timeline
  const generateDefaultTasks = (): GanttTask[] => {
    const today = new Date();
    const startDate = new Date(today);

    // Create a 6-month project timeline
    return [
      {
        id: "task-1",
        name: "Product Design",
        start: new Date(startDate.setDate(today.getDate() - 30)),
        end: new Date(startDate.setDate(startDate.getDate() + 20)),
        progress: 100,
        customClass: "task-completed",
      },
      {
        id: "task-2",
        name: "Prototype Development",
        start: new Date(startDate.setDate(startDate.getDate() + 5)),
        end: new Date(startDate.setDate(startDate.getDate() + 25)),
        progress: 85,
        dependencies: "task-1",
      },
      {
        id: "task-3",
        name: "Market Research",
        start: new Date(startDate.setDate(startDate.getDate() - 15)),
        end: new Date(startDate.setDate(startDate.getDate() + 40)),
        progress: 50,
      },
      {
        id: "task-4",
        name: "Beta Testing",
        start: new Date(startDate.setDate(startDate.getDate() + 5)),
        end: new Date(startDate.setDate(startDate.getDate() + 30)),
        progress: 20,
        dependencies: "task-2",
      },
      {
        id: "task-5",
        name: "Marketing Campaign",
        start: new Date(startDate.setDate(startDate.getDate() + 10)),
        end: new Date(startDate.setDate(startDate.getDate() + 35)),
        progress: 0,
        dependencies: "task-3",
      },
      {
        id: "task-6",
        name: "Launch",
        start: new Date(startDate.setDate(startDate.getDate() + 20)),
        end: new Date(startDate.setDate(startDate.getDate() + 1)),
        progress: 0,
        dependencies: "task-4,task-5",
        customClass: "task-milestone",
      },
    ];
  };

  const chartContent = (
    <>
      {/* Custom styles for better integration */}
      <style jsx global>{`
        .gantt .bar-wrapper {
          cursor: pointer;
        }
        .gantt .bar {
          fill: #4f46e5;
        }
        .gantt .bar-progress {
          fill: #3730a3;
        }
        .gantt .bar-milestone .bar {
          fill: #ef4444;
        }
        .gantt .bar-critical .bar {
          fill: #f59e0b;
        }
        .gantt .lower-text,
        .gantt .upper-text {
          font-size: 12px;
        }
        .gantt .grid-header {
          fill: #f9fafb;
          stroke: #e5e7eb;
        }
        .gantt .grid-row {
          fill: #ffffff;
        }
        .gantt .grid-row:nth-child(even) {
          fill: #f3f4f6;
        }
        .gantt .row-line {
          stroke: #e5e7eb;
        }
        .gantt .tick {
          stroke: #e5e7eb;
        }
        .gantt .today-highlight {
          fill: rgba(79, 70, 229, 0.1);
        }
      `}</style>
      {tasks.length > 0 ? (
        <div
          ref={containerRef}
          className={cn(
            "w-full h-full min-h-[300px] overflow-x-auto",
            className
          )}
          data-testid="gantt-chart"
        />
      ) : (
        <div className="h-[400px] flex flex-col items-center justify-center border border-dashed rounded-md">
          <Calendar className="h-12 w-12 text-gray-300 mb-4" />
          <p className="text-gray-500 text-center max-w-md">
            No timeline generated yet. Click the "Generate Timeline" button to
            create a project timeline based on your business plan.
          </p>
        </div>
      )}
    </>
  );

  // If showControls is true, wrap in Card component with controls
  if (showControls) {
    return (
      <Card className={cn("w-full")}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{cardTitle}</CardTitle>
              <CardDescription>{cardDescription}</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={generateAITasks}
                className="ml-4"
                disabled={isGenerating || !onTasksUpdate}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4 mr-1" />
                    Generate Timeline
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>{chartContent}</CardContent>
      </Card>
    );
  }

  // Otherwise, return just the chart
  return chartContent;
}
