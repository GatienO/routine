import {
  createStepTimer,
  getStepTimerRemaining,
  pauseStepTimer,
  resumeStepTimer,
} from '../../src/utils/stepTimer';

describe('step timer recovery', () => {
  test('uses the deadline after a reload or a delayed tick', () => {
    const timer = createStepTimer('step-1', 60, 100_000);
    expect(getStepTimerRemaining(timer, 100_000)).toBe(60);
    expect(getStepTimerRemaining(timer, 99_500)).toBe(60);
    expect(getStepTimerRemaining(timer, 115_000)).toBe(45);
    expect(getStepTimerRemaining(timer, 165_000)).toBe(0);
  });

  test('preserves the remaining time while paused and resumes from it', () => {
    const timer = createStepTimer('step-1', 60, 100_000);
    const paused = pauseStepTimer(timer, 115_000);
    expect(getStepTimerRemaining(paused, 155_000)).toBe(45);
    expect(paused.isPaused).toBe(true);

    const resumed = resumeStepTimer(paused, 155_000);
    expect(getStepTimerRemaining(resumed, 170_000)).toBe(30);
    expect(resumed.isPaused).toBe(false);
  });
});
