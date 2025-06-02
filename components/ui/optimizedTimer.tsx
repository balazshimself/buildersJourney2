"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface OptimizedTimerProps {
  initialTime: number;
  onComplete?: () => void;
  autoStart?: boolean;
  className?: string;
  onTimeChange?: (newTime: number) => void;
}

export function OptimizedTimer({
  initialTime,
  onComplete,
  autoStart = false,
  className,
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

  useEffect(() => {
    let lastUpdateTime = Date.now();
    let animationFrameId: number;
    let isActive = true; // Add cleanup flag

    const updateTimer = () => {
      if (!isActive) return; // Check if component is still mounted

      const now = Date.now();
      const deltaTime = now - lastUpdateTime;

      if (isRunningRef.current && deltaTime >= 1000) {
        const secondsToSubtract = Math.floor(deltaTime / 1000);
        const newTime = Math.max(0, timeRef.current - secondsToSubtract);

        if (newTime !== timeRef.current) {
          timeRef.current = newTime;
          setTime(newTime);

          if (onTimeChangeRef.current) {
            onTimeChangeRef.current(newTime);
          }

          if (newTime === 0 && isRunningRef.current) {
            isRunningRef.current = false;
            setIsRunning(false);
            setIsComplete(true);

            if (onCompleteRef.current) {
              onCompleteRef.current();
            }
          }

          lastUpdateTime = now - (deltaTime % 1000);
        }
      }

      if (isActive) {
        // Only continue if still active
        animationFrameId = requestAnimationFrame(updateTimer);
      }
    };

    animationFrameId = requestAnimationFrame(updateTimer);

    return () => {
      isActive = false; // Set cleanup flag
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

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
    </div>
  );
}
