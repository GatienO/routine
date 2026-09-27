import { useMemo } from 'react';
import { useCalendarStore } from '../stores/calendarStore';
import { useChildrenStore } from '../stores/childrenStore';
import { useRoutineStore } from '../stores/routineStore';
import { activities } from '../features/activities/activities';
import {
  buildDayTimeline,
  getChildCalendarProfile,
  getCountdownEvents,
  getEventsForDay,
  getEventsForWeek,
  getSeasonTheme,
} from '../utils/calendar';

export function useCalendarView({
  date,
  childId,
}: {
  date: Date;
  childId?: string | null;
}) {
  const events = useCalendarStore((state) => state.events);
  const children = useChildrenStore((state) => state.children);
  const routines = useRoutineStore((state) => state.routines);

  const selectedChild = useMemo(
    () => (childId ? children.find((child) => child.id === childId) : undefined),
    [childId, children],
  );

  const visibleRoutines = useMemo(
    () =>
      childId
        ? routines.filter((routine) => routine.childId === childId && routine.isActive)
        : routines.filter((routine) => routine.isActive),
    [childId, routines],
  );

  const dayEvents = useMemo(
    () => getEventsForDay(events, date, childId),
    [childId, date, events],
  );

  const weekDays = useMemo(
    () => getEventsForWeek(events, date, childId),
    [childId, date, events],
  );

  const countdowns = useMemo(
    () => getCountdownEvents(events, date, childId),
    [childId, date, events],
  );

  const timeline = useMemo(
    () =>
      buildDayTimeline({
        events,
        routines: visibleRoutines,
        activities,
        day: date,
        childId,
      }),
    [childId, date, events, visibleRoutines],
  );

  const profile = useMemo(
    () => getChildCalendarProfile(selectedChild?.age),
    [selectedChild?.age],
  );

  const seasonTheme = useMemo(() => getSeasonTheme(date), [date]);

  return {
    children,
    selectedChild,
    visibleRoutines,
    dayEvents,
    weekDays,
    countdowns,
    timeline,
    profile,
    seasonTheme,
  };
}
