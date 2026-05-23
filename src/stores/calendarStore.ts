import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { CalendarEvent } from '../types/calendar';
import { generateId } from '../utils/id';

type CalendarEventInput = Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>;

interface CalendarState {
  events: CalendarEvent[];
  addEvent: (event: CalendarEventInput) => CalendarEvent;
  updateEvent: (id: string, updates: Partial<CalendarEventInput>) => void;
  removeEvent: (id: string) => void;
  getEvent: (id: string) => CalendarEvent | undefined;
  getEventsForChild: (childId: string) => CalendarEvent[];
}

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set, get) => ({
      events: [],

      addEvent: (data) => {
        const now = new Date().toISOString();
        const event: CalendarEvent = {
          ...data,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          events: [...state.events, event],
        }));

        return event;
      },

      updateEvent: (id, updates) =>
        set((state) => ({
          events: state.events.map((event) =>
            event.id === id
              ? {
                  ...event,
                  ...updates,
                  updatedAt: new Date().toISOString(),
                }
              : event,
          ),
        })),

      removeEvent: (id) =>
        set((state) => ({
          events: state.events.filter((event) => event.id !== id),
        })),

      getEvent: (id) => get().events.find((event) => event.id === id),

      getEventsForChild: (childId) =>
        get().events.filter((event) => event.childIds.includes(childId)),
    }),
    {
      name: 'calendar-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        events: state.events,
      }),
    },
  ),
);
