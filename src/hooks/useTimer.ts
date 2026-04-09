import { useEffect, useRef, useState, useCallback } from 'react';

export function useTimer(durationSeconds: number) {
  const [remaining, setRemaining] = useState(durationSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    clearTimer();
    setRemaining(durationSeconds);
    setIsRunning(true);
    setIsPaused(false);
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearTimer();
          setIsRunning(false);
          setIsPaused(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [durationSeconds, clearTimer]);

  const stop = useCallback(() => {
    clearTimer();
    setIsRunning(false);
    setIsPaused(false);
  }, [clearTimer]);

  const pause = useCallback(() => {
    clearTimer();
    setIsRunning(false);
    setIsPaused(true);
  }, [clearTimer]);

  const resume = useCallback(() => {
    if (remaining <= 0) return;
    clearTimer();
    setIsRunning(true);
    setIsPaused(false);
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearTimer();
          setIsRunning(false);
          setIsPaused(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearTimer, remaining]);

  const reset = useCallback(() => {
    stop();
    setRemaining(durationSeconds);
  }, [durationSeconds, stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  const progress = durationSeconds > 0 ? 1 - remaining / durationSeconds : 1;

  return {
    remaining,
    isRunning,
    isPaused,
    isFinished: remaining === 0 && durationSeconds > 0,
    progress,
    start,
    stop,
    pause,
    resume,
    reset,
  };
}
