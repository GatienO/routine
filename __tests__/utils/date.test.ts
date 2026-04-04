import { isToday, isYesterday, isSameDay, formatDuration } from '../../src/utils/date';

describe('date utils', () => {
  test('isToday returns true for today', () => {
    expect(isToday(new Date().toISOString())).toBe(true);
  });

  test('isToday returns false for yesterday', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(isToday(yesterday.toISOString())).toBe(false);
  });

  test('isYesterday returns true for yesterday', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(isYesterday(yesterday.toISOString())).toBe(true);
  });

  test('isYesterday returns false for today', () => {
    expect(isYesterday(new Date().toISOString())).toBe(false);
  });

  test('isSameDay compares dates correctly', () => {
    expect(isSameDay('2026-01-15T08:00:00Z', '2026-01-15T20:00:00Z')).toBe(true);
    expect(isSameDay('2026-01-15T08:00:00Z', '2026-01-16T08:00:00Z')).toBe(false);
  });

  test('formatDuration formats correctly', () => {
    expect(formatDuration(0)).toBe('< 1 min');
    expect(formatDuration(1)).toBe('1 min');
    expect(formatDuration(5)).toBe('5 min');
    expect(formatDuration(15)).toBe('15 min');
  });
});
