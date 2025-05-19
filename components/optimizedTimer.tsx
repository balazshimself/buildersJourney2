"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface OptimizedTimerProps {
  initialTime: number;
  onComplete?: () => void;
  autoStart?: boolean;
  className?: string;
  showProgress?: boolean;
  onTimeChange?: (newTime: number) => void;
}

export function OptimizedTimer({
  initialTime,
  onComplete,
  autoStart = false,
  className,
  showProgress = true,
  onTimeChange,
}: OptimizedTimerProps) {
  const [time, setTime] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isComplete, setIsComplete] = useState(false);

  // Use refs for values needed in the interval to avoid dependency issues
  const timeRef = useRef(initialTime);
  const isRunningRef = useRef(autoStart);
  const onCompleteRef = useRef(onComplete);
  const onTimeChangeRef = useRef(onTimeChange);

  // Update refs when props change
  useEffect(() => {
    timeRef.current = time;
    isRunningRef.current = isRunning;
    onCompleteRef.current = onComplete;
    onTimeChangeRef.current = onTimeChange;
  }, [time, isRunning, onComplete, onTimeChange]);

  // Format time as MM:SS
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Calculate progress percentage
  const progress = () => {
    return ((initialTime - time) / initialTime) * 100;
  };

  // Timer controls
  const start = () => {
    setIsRunning(true);
    setIsComplete(false);
  };

  const pause = () => {
    setIsRunning(false);
  };

  const reset = () => {
    setTime(initialTime);
    setIsRunning(false);
    setIsComplete(false);
  };

  // Use a worker interval approach to avoid performance issues
  useEffect(() => {
    let lastUpdateTime = Date.now();
    let animationFrameId: number;

    const updateTimer = () => {
      const now = Date.now();
      const deltaTime = now - lastUpdateTime;

      // Only update if at least 1 second has passed (1000ms)
      if (isRunningRef.current && deltaTime >= 1000) {
        // Calculate how many seconds to subtract (handles pauses more than 1s)
        const secondsToSubtract = Math.floor(deltaTime / 1000);
        const newTime = Math.max(0, timeRef.current - secondsToSubtract);

        // Only update state if the time has changed
        if (newTime !== timeRef.current) {
          timeRef.current = newTime;
          setTime(newTime);

          // Notify parent of time change
          if (onTimeChangeRef.current) {
            onTimeChangeRef.current(newTime);
          }

          // Check if timer completed
          if (newTime === 0 && isRunningRef.current) {
            isRunningRef.current = false;
            setIsRunning(false);
            setIsComplete(true);

            if (onCompleteRef.current) {
              onCompleteRef.current();
            }
          }

          lastUpdateTime = now - (deltaTime % 1000); // Adjust for remainder
        }
      }

      // Continue the timer loop
      animationFrameId = requestAnimationFrame(updateTimer);
    };

    // Start the timer loop
    animationFrameId = requestAnimationFrame(updateTimer);

    // Clean up
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Determine progress color based on remaining time percentage
  const getProgressColor = () => {
    if (progress() > 80) return "bg-red-500";
    if (progress() > 50) return "bg-yellow-500";
    return "bg-blue-500";
  };

  return (
    <div
      className={cn("flex flex-col space-y-2", className)}
      data-testid="optimized-timer"
    >
      <div className="text-2xl font-bold flex items-center gap-2">
        <span
          className={cn(
            "transition-colors",
            isRunning && time < 60 ? "text-red-500" : ""
          )}
        >
          {formatTime(time)}
        </span>
        {isRunning && (
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        )}
      </div>

      {showProgress && (
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={cn("h-full transition-all", getProgressColor())}
            style={{ width: `${progress()}%` }}
          />
        </div>
      )}
    </div>
  );
}
