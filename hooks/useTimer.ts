import { useState, useEffect, useCallback } from 'react';

interface UseTimerProps {
  initialTime: number;
  onComplete?: () => void;
  autoStart?: boolean;
}

export const useTimer = ({
  initialTime,
  onComplete,
  autoStart = false,
}: UseTimerProps) => {
  const [time, setTime] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isComplete, setIsComplete] = useState(false);

  // Format time as MM:SS
  const formatTime = useCallback((timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  // Calculate progress percentage
  const progress = useCallback(() => {
    return (initialTime - time) / initialTime * 100;
  }, [initialTime, time]);

  const start = useCallback(() => {
    setIsRunning(true);
    setIsComplete(false);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setTime(initialTime);
    setIsRunning(false);
    setIsComplete(false);
  }, [initialTime]);

  const setNewTime = useCallback((newTime: number) => {
    setTime(newTime);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && time > 0) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
    } else if (time === 0 && isRunning) {
      setIsRunning(false);
      setIsComplete(true);
      onComplete?.();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, time, onComplete]);

  return {
    time,
    formattedTime: formatTime(time),
    progress: progress(),
    isRunning,
    isComplete,
    start,
    pause,
    reset,
    setTime: setNewTime,
  };
};