import { RoutineExecution } from '../types';

type StepTimer = NonNullable<RoutineExecution['stepTimer']>;

export function createStepTimer(stepId: string, durationSeconds: number, now: number): StepTimer {
  const duration = Math.max(0, Math.ceil(durationSeconds));
  return {
    stepId,
    durationSeconds: duration,
    remainingSeconds: duration,
    deadlineAt: duration > 0 ? now + duration * 1000 : null,
    isPaused: false,
  };
}

export function getStepTimerRemaining(timer: StepTimer, now: number): number {
  if (timer.deadlineAt === null) return timer.remainingSeconds;
  return Math.min(timer.durationSeconds, Math.max(0, Math.ceil((timer.deadlineAt - now) / 1000)));
}

export function pauseStepTimer(timer: StepTimer, now: number): StepTimer {
  return {
    ...timer,
    remainingSeconds: getStepTimerRemaining(timer, now),
    deadlineAt: null,
    isPaused: true,
  };
}

export function resumeStepTimer(timer: StepTimer, now: number): StepTimer {
  if (!timer.isPaused || timer.remainingSeconds <= 0) return timer;
  return {
    ...timer,
    deadlineAt: now + timer.remainingSeconds * 1000,
    isPaused: false,
  };
}
