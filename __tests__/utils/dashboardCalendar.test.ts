import { getDayDashboardSummary } from '../../src/utils/dashboardCalendar';
import { Activity } from '../../src/features/activities/types';
import { CalendarEvent } from '../../src/types/calendar';
import { Routine } from '../../src/types';

const baseRoutine: Routine = {
  id: 'routine-1',
  childId: 'child-1',
  name: 'Routine matin',
  icon: '🎒',
  color: '#A8C79D',
  category: 'morning',
  isActive: true,
  isFavorite: true,
  createdAt: '2026-05-25T07:00:00.000Z',
  updatedAt: '2026-05-25T07:00:00.000Z',
  steps: [
    {
      id: 'step-1',
      title: 'Chaussures',
      icon: '👟',
      color: '#A8C79D',
      durationMinutes: 5,
      instruction: '',
      isRequired: true,
      order: 0,
    },
  ],
};

const baseEvent: CalendarEvent = {
  id: 'event-1',
  title: 'Piscine',
  childIds: ['child-1'],
  color: '#D8D2F2',
  icon: '🏊',
  date: '2026-05-25',
  startTime: '16:15',
  kind: 'home',
  suggestedRoutineIds: [],
  createdAt: '2026-05-25T07:00:00.000Z',
  updatedAt: '2026-05-25T07:00:00.000Z',
};

const baseActivity: Activity = {
  id: 'activity-1',
  title: 'Peinture calme',
  thumbnail: '🎨',
  ageMin: 3,
  ageMax: 6,
  duration: 15,
  setupTime: 2,
  cleanupTime: 5,
  parentEnergy: 'ko',
  parentMood: ['besoin-calme'],
  weather: 'indoor',
  messLevel: 'medium',
  noiseLevel: 'low',
  independenceLevel: 'medium',
  requiresSupervision: true,
  screenFree: true,
  groupActivity: false,
  playerCountMin: 1,
  playerCountMax: 2,
  activityType: 'creative',
  season: ['all-season'],
  materials: [],
  skills: [],
  developmentGoals: ['creativite'],
  description: '',
  steps: [],
  koVariant: '',
  harderVariant: '',
};

describe('getDayDashboardSummary', () => {
  it('retire les evenements horaires deja passes', () => {
    const summary = getDayDashboardSummary({
      routines: [],
      events: [{ ...baseEvent, startTime: '08:00' }],
      date: new Date('2026-05-25T09:00:00'),
    });

    expect(summary.nextItem).toBeUndefined();
  });

  it('retire les routines dont le moment est passe', () => {
    const summary = getDayDashboardSummary({
      routines: [baseRoutine, { ...baseRoutine, id: 'routine-2', name: 'Dodo', category: 'evening' }],
      events: [],
      date: new Date('2026-05-25T12:30:00'),
    });

    expect(summary.nextItem?.type).toBe('routine');
    expect(summary.nextItem?.title).toBe('Dodo');
  });

  it('ouvre une activite quand aucune routine ni evenement ne suit', () => {
    const summary = getDayDashboardSummary({
      routines: [],
      events: [],
      activity: baseActivity,
      date: new Date('2026-05-25T14:00:00'),
    });

    expect(summary.nextItem?.type).toBe('activity');
    expect(summary.nextItem?.title).toBe('Peinture calme');
  });
});
