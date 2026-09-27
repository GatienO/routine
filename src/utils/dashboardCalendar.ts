import { differenceInCalendarDays, format, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Activity } from '../features/activities/types';
import { WeatherData } from '../services/weather';
import { CalendarEvent } from '../types/calendar';
import { Routine } from '../types';
import { getEventsForDay, getEventsForWeek, parseTimeToMinutes } from './calendar';

export interface DayDashboardSummary {
  routine?: Routine;
  routineDuration: number;
  nextEvent?: CalendarEvent;
  nextItem?: DashboardAgendaItem;
  stateLabel: 'Maintenant' | 'Ensuite' | 'Ce soir';
  timeline: string[];
}

export type DashboardAgendaItem =
  | {
      type: 'routine';
      id: string;
      title: string;
      icon: string;
      color: string;
      meta: string;
      routine: Routine;
      duration: number;
    }
  | {
      type: 'activity';
      id: string;
      title: string;
      icon: string;
      color: string;
      meta: string;
      activity: Activity;
    }
  | {
      type: 'event';
      id: string;
      title: string;
      icon: string;
      color: string;
      meta: string;
      event: CalendarEvent;
    };

export interface WeekDashboardDay {
  date: Date;
  dayLabel: string;
  dayNumber: string;
  weatherEmoji: string;
  mainIcon: string;
  mainLabel: string;
  event?: CalendarEvent;
  activity?: Activity;
  isToday: boolean;
  sleepCount?: number;
  color: string;
}

const WEATHER_EMOJI: Record<WeatherData['condition'], string> = {
  clear: '\u2600\uFE0F',
  partly_cloudy: '\u26C5',
  cloudy: '\u2601\uFE0F',
  fog: '\u{1F32B}\uFE0F',
  rain: '\u{1F327}\uFE0F',
  snow: '\u2744\uFE0F',
  thunderstorm: '\u26C8\uFE0F',
};

function routineDuration(routine?: Routine): number {
  return routine?.steps.reduce((sum, step) => sum + step.durationMinutes, 0) ?? 0;
}

function getStateLabel(now = new Date()): DayDashboardSummary['stateLabel'] {
  const hour = now.getHours();
  if (hour >= 18) return 'Ce soir';
  if (hour >= 11) return 'Ensuite';
  return 'Maintenant';
}

function getCurrentMinutes(now = new Date()) {
  return now.getHours() * 60 + now.getMinutes();
}

function getRoutineWindow(routine: Routine) {
  switch (routine.category) {
    case 'morning':
      return { start: 6 * 60, end: 11 * 60 };
    case 'school':
      return { start: 7 * 60, end: 9 * 60 + 30 };
    case 'home':
      return { start: 15 * 60 + 30, end: 18 * 60 + 30 };
    case 'evening':
      return { start: 18 * 60, end: 22 * 60 };
    case 'weekend':
      return { start: 8 * 60, end: 20 * 60 };
    case 'emotion':
    case 'custom':
    default:
      return { start: 0, end: 24 * 60 - 1 };
  }
}

function pickUpcomingRoutine(routines: Routine[], now = new Date()): Routine | undefined {
  const currentMinutes = getCurrentMinutes(now);

  return routines
    .filter((routine) => getRoutineWindow(routine).end >= currentMinutes)
    .sort((left, right) => {
      const leftWindow = getRoutineWindow(left);
      const rightWindow = getRoutineWindow(right);
      const leftDistance = Math.max(0, leftWindow.start - currentMinutes);
      const rightDistance = Math.max(0, rightWindow.start - currentMinutes);
      if (leftDistance !== rightDistance) return leftDistance - rightDistance;
      if (Boolean(left.isFavorite) !== Boolean(right.isFavorite)) return left.isFavorite ? -1 : 1;
      return left.name.localeCompare(right.name, 'fr', { sensitivity: 'base' });
    })[0];
}

function hasEventTimePassed(event: CalendarEvent, now = new Date()) {
  if (event.allDay || !event.startTime) return false;
  const currentMinutes = getCurrentMinutes(now);
  const lastRelevantTime = event.endTime ?? event.startTime;
  return parseTimeToMinutes(lastRelevantTime) < currentMinutes;
}

function getNextEvent(events: CalendarEvent[], now = new Date()): CalendarEvent | undefined {
  return events.find((event) => !hasEventTimePassed(event, now));
}

function formatEventMeta(event: CalendarEvent) {
  if (event.allDay) return 'Toute la journ\u00E9e';
  if (event.startTime) return `\u00E0 ${event.startTime}`;
  return 'Aujourd\u2019hui';
}

function buildRoutineAgendaItem(routine: Routine): DashboardAgendaItem {
  const duration = routineDuration(routine);
  return {
    type: 'routine',
    id: routine.id,
    title: routine.name,
    icon: routine.icon,
    color: routine.color,
    meta: `${routine.steps.length} \u00E9tapes \u00B7 ${duration} min`,
    routine,
    duration,
  };
}

function buildEventAgendaItem(event: CalendarEvent): DashboardAgendaItem {
  return {
    type: 'event',
    id: event.id,
    title: event.title,
    icon: event.icon,
    color: event.color,
    meta: formatEventMeta(event),
    event,
  };
}

function buildActivityAgendaItem(activity: Activity): DashboardAgendaItem {
  return {
    type: 'activity',
    id: activity.id,
    title: activity.title,
    icon: activity.thumbnail,
    color: activity.weather === 'outdoor' || activity.weather === 'sunny' ? '#CFE7C5' : '#D8D2F2',
    meta: `${activity.duration} min`,
    activity,
  };
}

function pickNextAgendaItem({
  routine,
  event,
  activity,
  now,
}: {
  routine?: Routine;
  event?: CalendarEvent;
  activity?: Activity;
  now: Date;
}): DashboardAgendaItem | undefined {
  const currentMinutes = getCurrentMinutes(now);
  const candidates: Array<{ item: DashboardAgendaItem; startMinutes: number; priority: number }> = [];

  if (routine) {
    const window = getRoutineWindow(routine);
    candidates.push({
      item: buildRoutineAgendaItem(routine),
      startMinutes: Math.max(currentMinutes, window.start),
      priority: 0,
    });
  }

  if (event) {
    candidates.push({
      item: buildEventAgendaItem(event),
      startMinutes: event.startTime ? parseTimeToMinutes(event.startTime) : currentMinutes + 5,
      priority: event.startTime ? 1 : 3,
    });
  }

  if (activity) {
    candidates.push({
      item: buildActivityAgendaItem(activity),
      startMinutes: currentMinutes + 15,
      priority: 2,
    });
  }

  return candidates.sort((left, right) => {
    if (left.startMinutes !== right.startMinutes) return left.startMinutes - right.startMinutes;
    return left.priority - right.priority;
  })[0]?.item;
}

export function getDayDashboardSummary({
  routines,
  events,
  activity,
  date = new Date(),
}: {
  routines: Routine[];
  events: CalendarEvent[];
  activity?: Activity;
  date?: Date;
}): DayDashboardSummary {
  const routine = pickUpcomingRoutine(routines, date);
  const nextEvent = getNextEvent(events, date);
  const nextItem = pickNextAgendaItem({ routine, event: nextEvent, activity, now: date });
  const stateLabel = getStateLabel(date);
  const timeline = [
    routine?.category === 'evening' ? '\u{1F319}' : '\u2600\uFE0F',
    nextEvent?.icon ?? '\u{1F37D}\uFE0F',
    stateLabel === 'Ce soir' ? '\u{1F319}' : '\u2728',
  ];

  return {
    routine,
    routineDuration: routineDuration(routine),
    nextEvent,
    nextItem,
    stateLabel,
    timeline,
  };
}

export function getWeekDashboardDays({
  events,
  routines,
  weather,
  activity,
  childId,
  date = new Date(),
}: {
  events: CalendarEvent[];
  routines: Routine[];
  weather?: WeatherData | null;
  activity?: Activity;
  childId?: string | null;
  date?: Date;
}): WeekDashboardDay[] {
  return getEventsForWeek(events, date, childId).map(({ date: day, events: dayEvents }) => {
    const dayRoutine = routines.find((routine) => routine.category === (day.getDay() === 0 || day.getDay() === 6 ? 'weekend' : 'school'))
      ?? routines.find((routine) => routine.category === 'morning')
      ?? routines[0];
    const event = dayEvents[0];
    const isTodayValue = isSameDay(day, date);
    const sleepCount = event && ['special', 'birthday', 'holiday'].includes(event.kind)
      ? Math.max(0, differenceInCalendarDays(day, date))
      : undefined;
    const weatherEmoji = weather ? WEATHER_EMOJI[weather.condition] : '\u2728';
    const mainIcon = event?.icon ?? activity?.thumbnail ?? dayRoutine?.icon ?? weatherEmoji;

    return {
      date: day,
      dayLabel: format(day, 'EEE', { locale: fr }).slice(0, 3).toUpperCase(),
      dayNumber: format(day, 'd'),
      weatherEmoji,
      mainIcon,
      mainLabel: event?.title ?? activity?.title ?? dayRoutine?.name ?? 'Calme',
      event,
      activity,
      isToday: isTodayValue,
      sleepCount,
      color: event?.color ?? dayRoutine?.color ?? (isTodayValue ? '#A8C79D' : '#E8DDCB'),
    };
  });
}
