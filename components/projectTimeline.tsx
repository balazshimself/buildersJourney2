// components/project-timeline.tsx
"use client";

import { useState } from "react";
import { GanttChart } from "./ganttChart/ganttChart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { GanttTask, Document } from "@/types";

interface ProjectTimelineProps {
  businessPlan: Document | null;
  timeline: GanttTask[];
  setTimeline: (timeline: GanttTask[]) => void;
}

export function ProjectTimeline({
  businessPlan,
  timeline,
  setTimeline,
}: ProjectTimelineProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  // // Load default tasks only when necessary
  useEffect(() => {
    // Only set default tasks on first render if none exist yet
    if (!isInitialized && tasks.length === 0) {
      setIsInitialized(true);
    }
  }, [timeline]);

  // Generate AI tasks based on business plan
  const generateAITasks = async () => {
    setIsGenerating(true);

    try {
      // Get business plan if not provided
      const plan = businessPlan ?? "";

      // Call API to generate tasks
      const response = await fetch("/api/generate-timeline", {
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

      // Update tasks with AI-generated ones
      if (data.tasks && Array.isArray(data.tasks)) {
        const formattedTasks = data.tasks.map((task: any) => ({
          ...task,
          start: new Date(task.start),
          end: new Date(task.end),
        }));

        setTimeline(formattedTasks);
      }
    } catch (error) {
      console.error("Error generating timeline:", error);
      // Fallback to default tasks if generation fails
      setTimeline(generateDefaultTasks());
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle task click
  const handleTaskClick = (task: GanttTask) => {
    console.log("Task clicked:", task);
  };

  return (
    <Card className={cn("w-full")}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Project Timeline</CardTitle>
            <CardDescription>
              Track your project milestones and progress
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={generateAITasks}
              className="ml-4"
              disabled={isGenerating}
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
      <CardContent>
        {timeline.length > 0 ? (
          <GanttChart
            tasks={timeline}
            onTaskClick={handleTaskClick}
            className="h-[400px]"
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
      </CardContent>
    </Card>
  );
}

// Generate default tasks for the timeline
function generateDefaultTasks(): GanttTask[] {
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
}
