import {
  addDays,
  differenceInCalendarDays,
  format,
  isSameDay,
  isToday as dateFnsIsToday,
  isTomorrow as dateFnsIsTomorrow,
  parse,
  parseISO,
  startOfDay,
  startOfWeek,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarEvent, CountdownEvent, DayTimelineItem } from '../types/calendar';
import { Routine } from '../types';

const DEFAULT_DAY_START_MINUTES = 7 * 60;
const DEFAULT_DAY_END_MINUTES = 20 * 60;

export type ChildCalendarProfile = {
  ageGroup: 'toddler' | 'young' | 'older';
  iconSize: number;
  cardMinHeight: number;
  showDetails: boolean;
  compactText: boolean;
};

export function getChildCalendarProfile(age?: number): ChildCalendarProfile {
  if (age !== undefined && age <= 4) {
    return {
      ageGroup: 'toddler',
      iconSize: 54,
      cardMinHeight: 116,
      showDetails: false,
      compactText: true,
    };
  }

  if (age !== undefined && age <= 6) {
    return {
      ageGroup: 'young',
      iconSize: 46,
      cardMinHeight: 104,
      showDetails: true,
      compactText: true,
    };
  }

  return {
    ageGroup: 'older',
    iconSize: 40,
    cardMinHeight: 94,
    showDetails: true,
    compactText: false,
  };
}

export function normalizeCalendarDate(date: string | Date): string {
  const parsed = typeof date === 'string' ? parseCalendarDate(date) : date;
  return format(parsed, 'yyyy-MM-dd');
}

export function parseCalendarDate(date: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return parse(date, 'yyyy-MM-dd', new Date());
  }

  return parseISO(date);
}

export function formatDayLabel(date: Date) {
  if (dateFnsIsToday(date)) return "Aujourd'hui";
  if (dateFnsIsTomorrow(date)) return 'Demain';
  return format(date, 'EEEE d MMM', { locale: fr });
}

export function getWeekDays(anchorDate: Date) {
  const weekStart = startOfWeek(anchorDate, { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
}

export function getEventsForDay(events: CalendarEvent[], day: Date, childId?: string | null) {
  return events
    .filter((event) => {
      if (childId && !event.childIds.includes(childId)) return false;
      return isSameDay(parseCalendarDate(event.date), day);
    })
    .sort(compareEventsByTime);
}

export function getEventsForWeek(events: CalendarEvent[], anchorDate: Date, childId?: string | null) {
  const days = getWeekDays(anchorDate);
  return days.map((day) => ({
    date: day,
    events: getEventsForDay(events, day, childId),
  }));
}

export function getCountdownEvents(
  events: CalendarEvent[],
  fromDate: Date,
  childId?: string | null,
): CountdownEvent[] {
  const today = startOfDay(fromDate);

  return events
    .filter((event) => {
      if (childId && !event.childIds.includes(childId)) return false;
      const distance = differenceInCalendarDays(parseCalendarDate(event.date), today);
      return distance >= 0 && (event.kind === 'special' || event.kind === 'birthday' || event.kind === 'holiday');
    })
    .map((event) => {
      const sleepCount = Math.max(0, differenceInCalendarDays(parseCalendarDate(event.date), today));

      return {
        id: `countdown-${event.id}`,
        eventId: event.id,
        title: event.title,
        date: event.date,
        icon: event.icon,
        color: event.color,
        childIds: event.childIds,
        sleepCount,
        isToday: sleepCount === 0,
      };
    })
    .sort((left, right) => left.sleepCount - right.sleepCount)
    .slice(0, 4);
}

export function buildDayTimeline({
  events,
  routines,
  day,
  childId,
}: {
  events: CalendarEvent[];
  routines: Routine[];
  day: Date;
  childId?: string | null;
}): DayTimelineItem[] {
  const dayEvents = getEventsForDay(events, day, childId);
  const items: DayTimelineItem[] = [
    {
      id: `marker-morning-${normalizeCalendarDate(day)}`,
      type: 'day-marker',
      title: 'Matin',
      icon: '☀️',
      color: '#F2D7A6',
      startMinutes: DEFAULT_DAY_START_MINUTES,
      childIds: childId ? [childId] : [],
    },
    {
      id: `marker-evening-${normalizeCalendarDate(day)}`,
      type: 'day-marker',
      title: 'Soir',
      icon: '🌙',
      color: '#9EC6D5',
      startMinutes: DEFAULT_DAY_END_MINUTES,
      childIds: childId ? [childId] : [],
    },
  ];

  dayEvents.forEach((event, eventIndex) => {
    const startMinutes = event.allDay || !event.startTime
      ? DEFAULT_DAY_START_MINUTES + eventIndex * 45
      : parseTimeToMinutes(event.startTime);
    const endMinutes = event.endTime ? parseTimeToMinutes(event.endTime) : undefined;

    items.push({
      id: `event-${event.id}`,
      type: 'event',
      title: event.title,
      icon: event.icon,
      color: event.color,
      startMinutes,
      endMinutes,
      eventId: event.id,
      childIds: event.childIds,
      description: event.description,
    });

    event.suggestedRoutineIds.forEach((routineId, routineIndex) => {
      const routine = routines.find((item) => item.id === routineId);
      if (!routine) return;
      if (childId && routine.childId !== childId) return;

      items.push({
        id: `suggested-${event.id}-${routine.id}`,
        type: 'routine-suggestion',
        title: routine.name,
        icon: routine.icon,
        color: routine.color,
        startMinutes: Math.min(DEFAULT_DAY_END_MINUTES, startMinutes + 20 + routineIndex * 18),
        routineId: routine.id,
        eventId: event.id,
        childIds: [routine.childId],
        description: `${routine.steps.length} etapes suggerees`,
      });
    });
  });

  return items.sort((left, right) => left.startMinutes - right.startMinutes);
}

export function parseTimeToMinutes(value: string): number {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return DEFAULT_DAY_START_MINUTES;

  const hours = Math.min(23, Math.max(0, Number(match[1])));
  const minutes = Math.min(59, Math.max(0, Number(match[2])));
  return hours * 60 + minutes;
}

export function formatTimelineTime(minutes: number) {
  const hours = Math.floor(minutes / 60).toString().padStart(2, '0');
  const mins = (minutes % 60).toString().padStart(2, '0');
  return `${hours}:${mins}`;
}

export function getSeasonTheme(date: Date): {
  gradient: [string, string, string];
  particles: string[];
} {
  const month = date.getMonth();

  if (month >= 2 && month <= 4) {
    return { gradient: ['#DDF2D7', '#F7EBD6', '#FFF8EF'], particles: ['🌷', '☀️', '🌿'] };
  }

  if (month >= 5 && month <= 7) {
    return { gradient: ['#BDE8EA', '#F6E8B8', '#FFF8EF'], particles: ['☀️', '🌈', '🍦'] };
  }

  if (month >= 8 && month <= 10) {
    return { gradient: ['#F3D6B8', '#DCEAC8', '#FFF8EF'], particles: ['🍂', '🌤️', '⭐'] };
  }

  return { gradient: ['#DDECF4', '#EAF4F0', '#FFF8EF'], particles: ['❄️', '🌙', '⭐'] };
}

function compareEventsByTime(left: CalendarEvent, right: CalendarEvent) {
  const leftMinutes = left.startTime ? parseTimeToMinutes(left.startTime) : 0;
  const rightMinutes = right.startTime ? parseTimeToMinutes(right.startTime) : 0;
  if (leftMinutes !== rightMinutes) return leftMinutes - rightMinutes;
  return left.title.localeCompare(right.title, 'fr', { sensitivity: 'base' });
}
