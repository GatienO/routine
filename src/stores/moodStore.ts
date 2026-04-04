import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChildMood, ChildMoodType } from '../types';

interface MoodState {
  moods: Record<string, ChildMood>;
  setMood: (childId: string, mood: ChildMoodType) => void;
  getMood: (childId: string) => ChildMood | undefined;
  isMoodFresh: (childId: string) => boolean;
}

export const useMoodStore = create<MoodState>()(
  persist(
    (set, get) => ({
      moods: {},

      setMood: (childId, mood) =>
        set((state) => ({
          moods: {
            ...state.moods,
            [childId]: { childId, mood, selectedAt: new Date().toISOString() },
          },
        })),

      getMood: (childId) => get().moods[childId],

      isMoodFresh: (childId) => {
        const mood = get().moods[childId];
        if (!mood) return false;
        const elapsed = Date.now() - new Date(mood.selectedAt).getTime();
        // Mood is valid for 2 hours
        return elapsed < 2 * 60 * 60 * 1000;
      },
    }),
    {
      name: 'mood-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
