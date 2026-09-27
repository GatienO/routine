import {
  buildDayTimeline,
  getCountdownEvents,
  getEventsForDay,
  normalizeCalendarDate,
  parseTimeToMinutes,
} from '../../src/utils/calendar';
import { CalendarEvent } from '../../src/types/calendar';
import { Routine } from '../../src/types';
import { Activity } from '../../src/features/activities/types';

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
  suggestedActivityIds: ['activity-1'],
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

const activity: Activity = {
  id: 'activity-1',
  title: 'Peinture calme',
  thumbnail: '🎨',
  ageMin: 2,
  ageMax: 6,
  duration: 15,
  setupTime: 0,
  cleanupTime: 5,
  parentEnergy: 'ko',
  parentMood: ['besoin-calme'],
  weather: 'indoor',
  messLevel: 'low',
  noiseLevel: 'low',
  independenceLevel: 'medium',
  requiresSupervision: false,
  screenFree: true,
  groupActivity: false,
  playerCountMin: 1,
  playerCountMax: 2,
  activityType: 'creative',
  season: ['all-season'],
  materials: [],
  skills: [],
  developmentGoals: ['creativite'],
  description: 'Peindre doucement.',
  steps: [],
  koVariant: 'Avec peu de materiel.',
  harderVariant: 'Ajouter des formes.',
};

describe('calendar utilities', () => {
  it('normalizes dates and filters events by day and child', () => {
    expect(normalizeCalendarDate('2026-06-10')).toBe('2026-06-10');
    expect(getEventsForDay([baseEvent], new Date('2026-06-10T12:00:00'), 'child-1')).toHaveLength(1);
    expect(getEventsForDay([baseEvent], new Date('2026-06-10T12:00:00'), 'child-2')).toHaveLength(0);
  });

  it('repeats weekly repères only from their first occurrence', () => {
    const weeklyEvent: CalendarEvent = { ...baseEvent, recurrence: 'weekly' };

    expect(getEventsForDay([weeklyEvent], new Date('2026-06-17T12:00:00'), 'child-1')).toHaveLength(1);
    expect(getEventsForDay([weeklyEvent], new Date('2026-06-11T12:00:00'), 'child-1')).toHaveLength(0);
    expect(getEventsForDay([weeklyEvent], new Date('2026-06-03T12:00:00'), 'child-1')).toHaveLength(0);
  });

  it('computes sleep countdowns from calendar days', () => {
    const [countdown] = getCountdownEvents([baseEvent], new Date('2026-06-08T08:00:00'), 'child-1');

    expect(countdown.sleepCount).toBe(2);
    expect(countdown.title).toBe('Piscine');
  });

  it('builds timeline items with linked routine and activity suggestions', () => {
    const timeline = buildDayTimeline({
      events: [baseEvent],
      routines: [routine],
      activities: [activity],
      day: new Date('2026-06-10T12:00:00'),
      childId: 'child-1',
    });

    expect(timeline.some((item) => item.type === 'event' && item.eventId === 'event-1')).toBe(true);
    expect(timeline.some((item) => item.type === 'routine-suggestion' && item.routineId === 'routine-1')).toBe(true);
    expect(timeline.some((item) => item.type === 'activity-suggestion' && item.activityId === 'activity-1')).toBe(true);
  });

  it('parses HH:mm times defensively', () => {
    expect(parseTimeToMinutes('09:30')).toBe(570);
    expect(parseTimeToMinutes('not-a-time')).toBe(420);
  });

  it('keeps calendar-only dates stable across daylight-saving transitions', () => {
    expect(normalizeCalendarDate('2026-03-29')).toBe('2026-03-29');
    expect(normalizeCalendarDate('2026-10-25')).toBe('2026-10-25');
  });

  it('keeps overlapping events visible and returns calm markers for an empty day', () => {
    const overlapping = { ...baseEvent, id: 'event-2', title: 'Dentiste', startTime: '09:30' };
    const populated = buildDayTimeline({
      events: [baseEvent, overlapping],
      routines: [],
      day: new Date('2026-06-10T12:00:00'),
      childId: 'child-1',
    });
    const empty = buildDayTimeline({
      events: [],
      routines: [],
      day: new Date('2026-06-10T12:00:00'),
      childId: 'child-1',
    });

    expect(populated.filter((item) => item.type === 'event')).toHaveLength(2);
    expect(empty.map((item) => item.title)).toEqual(['Matin', 'Soir']);
  });
});
