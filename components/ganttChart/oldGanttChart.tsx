"use client";

import React, { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { cn } from "@/lib/utils";
import { GanttChartProps, GanttTask } from "@/types/gantt";

// Define types for the Gantt chart tasks

export function GanttChart({
  tasks,
  className,
  onTaskClick,
  onDateChange,
  onProgressChange,
}: GanttChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const ganttInstanceRef = useRef<any>(null);
  const [isLibraryLoaded, setIsLibraryLoaded] = useState(false);

  // Initialize Gantt chart once library and DOM are loaded
  useEffect(() => {
    if (!isLibraryLoaded || !containerRef.current) return;

    // Check if Frappe Gantt is available
    if (typeof window !== "undefined" && window.Gantt) {
      if (ganttInstanceRef.current) {
        // Refresh the chart if we already have an instance
        ganttInstanceRef.current.refresh(tasks);
      } else {
        // Create new Gantt instance
        const gantt = new window.Gantt(containerRef.current, tasks, {
          on_click: onTaskClick,
          on_date_change: onDateChange,
          on_progress_change: onProgressChange,
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
  }, [tasks, isLibraryLoaded, onTaskClick, onDateChange, onProgressChange]);

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

  return (
    <>
      {/* Load Frappe Gantt script and styles */}
      <Script
        src="https://cdn.jsdelivr.net/npm/frappe-gantt@0.6.1/dist/frappe-gantt.min.js"
        onLoad={() => setIsLibraryLoaded(true)}
      />
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/frappe-gantt@0.6.1/dist/frappe-gantt.min.css"
      />

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

      {/* Gantt container */}
      <div
        ref={containerRef}
        className={cn("w-full h-full min-h-[300px] overflow-x-auto", className)}
        data-testid="gantt-chart"
      />
    </>
  );
}

// Add type definitions for the Frappe Gantt library
declare global {
  interface Window {
    Gantt: any;
  }
}
