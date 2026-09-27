export type CalendarEventKind =
  | 'special'
  | 'birthday'
  | 'holiday'
  | 'school'
  | 'home'
  | 'health'
  | 'routine'
  | 'activity';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  childIds: string[];
  color: string;
  icon: string;
  date: string;
  startTime?: string;
  endTime?: string;
  allDay?: boolean;
  kind: CalendarEventKind;
  suggestedRoutineIds: string[];
  suggestedActivityIds?: string[];
  recurrence?: 'none' | 'weekly';
  createdAt: string;
  updatedAt: string;
}

export interface CountdownEvent {
  id: string;
  eventId: string;
  title: string;
  date: string;
  icon: string;
  color: string;
  childIds: string[];
  sleepCount: number;
  isToday: boolean;
}

export interface DayTimelineItem {
  id: string;
  type: 'event' | 'routine-suggestion' | 'activity-suggestion' | 'day-marker';
  title: string;
  icon: string;
  color: string;
  startMinutes: number;
  endMinutes?: number;
  eventId?: string;
  routineId?: string;
  activityId?: string;
  childIds: string[];
  description?: string;
}
