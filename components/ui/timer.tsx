'use client';

import { useEffect } from 'react';
import { useTimer } from '@/hooks/useTimer';
import { cn } from '@/lib/utils';

interface TimerProps {
  initialTime: number;
  onComplete?: () => void;
  autoStart?: boolean;
  className?: string;
  showProgress?: boolean;
  onTimeChange?: (newTime: number) => void;
}

export function Timer({
  initialTime,
  onComplete,
  autoStart = false,
  className,
  showProgress = true,
  onTimeChange,
}: TimerProps) {
  const {
    formattedTime,
    progress,
    isRunning,
    time,
  } = useTimer({
    initialTime,
    onComplete,
    autoStart,
  });

  // Notify parent component when time changes
  useEffect(() => {
    onTimeChange?.(time);
  }, [time, onTimeChange]);

  // Determine progress color based on remaining time percentage
  const getProgressColor = () => {
    if (progress > 80) return 'bg-red-500';
    if (progress > 50) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  return (
    <div className={cn('flex flex-col space-y-2', className)}>
      <div className="text-2xl font-bold flex items-center gap-2">
        <span className={cn(
          'transition-colors',
          isRunning && time < 60 ? 'text-red-500' : ''
        )}>
          {formattedTime}
        </span>
        {isRunning && (
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        )}
      </div>
      
      {showProgress && (
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={cn('h-full transition-all', getProgressColor())}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}