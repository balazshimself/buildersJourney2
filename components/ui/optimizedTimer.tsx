"use client";

import {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import { cn } from "@/lib/utils";

interface OptimizedTimerProps {
  initialTime: number;
  className?: string;
  onComplete?: () => void;
}

export interface OptimizedTimerRef {
  adjustTime: (timeToAdd: number) => void;
  getTime: () => number;
}

export const OptimizedTimer = forwardRef<
  OptimizedTimerRef,
  OptimizedTimerProps
>(({ initialTime, className, onComplete }, ref) => {
  const [time, setTime] = useState(initialTime);
  const [isComplete, setIsComplete] = useState(false);

  const timeRef = useRef(initialTime);
  const onCompleteRef = useRef(onComplete);

  // Update refs when props change
  useEffect(() => {
    timeRef.current = time;
    onCompleteRef.current = onComplete;
  }, [time, onComplete]);

  // Expose the adjustTime method via ref
  useImperativeHandle(
    ref,
    () => ({
      adjustTime: (timeToAdd: number) => {
        const newTime = Math.max(0, Math.max(0, timeRef.current) + timeToAdd);
        console.log("Adjusting time by:", timeToAdd, "New time:", newTime);
        setTime(newTime);

        // If we were complete but now have time, reset completion state
        if (newTime > 0) {
          setIsComplete(false);
        } else {
          setIsComplete(true);
          if (onCompleteRef.current) {
            onCompleteRef.current();
          }
        }
      },
      getTime: () => timeRef.current,
    }),
    []
  );

  // Format time as MM:SS
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  useEffect(() => {
    let lastUpdateTime = Date.now();
    let animationFrameId: number;
    let isActive = true;

    const updateTimer = () => {
      if (!isActive) return; // Check if component is still mounted

      const now = Date.now();
      const deltaTime = now - lastUpdateTime;

      if (deltaTime >= 1000) {
        const secondsToSubtract = Math.floor(deltaTime / 1000);
        const newTime = Math.max(0, timeRef.current - secondsToSubtract);

        if (newTime !== timeRef.current) {
          timeRef.current = newTime;
          setTime(newTime);

          if (newTime === 0) {
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
  }, [isComplete]);

  return (
    <div
      className={cn("flex flex-col space-y-2", className)}
      data-testid="optimized-timer"
    >
      <div className="text-2xl font-bold flex items-center gap-2">
        <span
          className={cn("transition-colors", time < 60 ? "text-red-500" : "")}
        >
          {formatTime(time)}
        </span>
        {!isComplete && (
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        )}
      </div>
    </div>
  );
});
