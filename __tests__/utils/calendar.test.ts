import {
  buildDayTimeline,
  getCountdownEvents,
  getEventsForDay,
  normalizeCalendarDate,
  parseTimeToMinutes,
} from '../../src/utils/calendar';
import { CalendarEvent } from '../../src/types/calendar';
import { Routine } from '../../src/types';

const baseEvent: CalendarEvent = {
  id: 'event-1',
  title: 'Piscine',
  childIds: ['child-1'],
  color: '#74BBD5',
  icon: '🏊',
  date: '2026-06-10',
  startTime: '09:30',
  kind: 'special',
  suggestedRoutineIds: ['routine-1'],
  createdAt: '2026-05-22T10:00:00.000Z',
  updatedAt: '2026-05-22T10:00:00.000Z',
};

const routine: Routine = {
  id: 'routine-1',
  childId: 'child-1',
  name: 'Sac de piscine',
  icon: '🎒',
  color: '#86C8B1',
  category: 'school',
  steps: [],
  isActive: true,
  createdAt: '2026-05-22T10:00:00.000Z',
  updatedAt: '2026-05-22T10:00:00.000Z',
};

describe('calendar utilities', () => {
  it('normalizes dates and filters events by day and child', () => {
    expect(normalizeCalendarDate('2026-06-10')).toBe('2026-06-10');
    expect(getEventsForDay([baseEvent], new Date('2026-06-10T12:00:00'), 'child-1')).toHaveLength(1);
    expect(getEventsForDay([baseEvent], new Date('2026-06-10T12:00:00'), 'child-2')).toHaveLength(0);
  });

  it('computes sleep countdowns from calendar days', () => {
    const [countdown] = getCountdownEvents([baseEvent], new Date('2026-06-08T08:00:00'), 'child-1');

    expect(countdown.sleepCount).toBe(2);
    expect(countdown.title).toBe('Piscine');
  });

  it('builds timeline items with linked routine suggestions', () => {
    const timeline = buildDayTimeline({
      events: [baseEvent],
      routines: [routine],
      day: new Date('2026-06-10T12:00:00'),
      childId: 'child-1',
    });

    expect(timeline.some((item) => item.type === 'event' && item.eventId === 'event-1')).toBe(true);
    expect(timeline.some((item) => item.type === 'routine-suggestion' && item.routineId === 'routine-1')).toBe(true);
  });

  it('parses HH:mm times defensively', () => {
    expect(parseTimeToMinutes('09:30')).toBe(570);
    expect(parseTimeToMinutes('not-a-time')).toBe(420);
  });
});
