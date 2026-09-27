import { completionDurationMinutes } from '../../src/utils/routineExecution';

describe('routine completion duration', () => {
  it('keeps a normal continuous duration', () => {
    expect(completionDurationMinutes('2026-09-21T08:00:00Z', '2026-09-21T08:12:31Z')).toBe(13);
  });

  it('hides wall-clock time after a long interruption', () => {
    expect(completionDurationMinutes('2026-09-20T20:00:00Z', '2026-09-21T08:05:00Z')).toBe(0);
  });

  it('rejects invalid or reversed timestamps', () => {
    expect(completionDurationMinutes('invalid', '2026-09-21T08:00:00Z')).toBe(0);
    expect(completionDurationMinutes('2026-09-21T09:00:00Z', '2026-09-21T08:00:00Z')).toBe(0);
  });
});
