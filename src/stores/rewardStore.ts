import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChildRewards, RoutineExecution } from '../types';
import { BADGES } from '../constants/badges';
import { isToday, isYesterday } from '../utils/date';

interface RewardState {
  rewards: Record<string, ChildRewards>;
  getRewards: (childId: string) => ChildRewards;
  recordCompletion: (execution: RoutineExecution) => string[];
  addStars: (childId: string, stars: number) => void;
  getUnlockedBadges: (childId: string) => typeof BADGES;
  getLockedBadges: (childId: string) => typeof BADGES;
}

function defaultRewards(childId: string): ChildRewards {
  return {
    childId,
    totalStars: 0,
    currentStreak: 0,
    longestStreak: 0,
    completedRoutines: 0,
    unlockedBadges: [],
  };
}

export const useRewardStore = create<RewardState>()(
  persist(
    (set, get) => ({
      rewards: {},

      getRewards: (childId) =>
        get().rewards[childId] ?? defaultRewards(childId),

      recordCompletion: (execution) => {
        const childId = execution.childId;
        const current = get().rewards[childId] ?? defaultRewards(childId);
        const now = new Date().toISOString();

        let newStreak = current.currentStreak;
        if (current.lastCompletionDate) {
          if (isYesterday(current.lastCompletionDate)) {
            newStreak += 1;
          } else if (!isToday(current.lastCompletionDate)) {
            newStreak = 1;
          }
        } else {
          newStreak = 1;
        }

        const updated: ChildRewards = {
          childId,
          totalStars: current.totalStars + execution.earnedStars,
          currentStreak: newStreak,
          longestStreak: Math.max(current.longestStreak, newStreak),
          completedRoutines: current.completedRoutines + 1,
          unlockedBadges: [...current.unlockedBadges],
          lastCompletionDate: now,
        };

        const newlyUnlocked: string[] = [];
        for (const badge of BADGES) {
          if (updated.unlockedBadges.includes(badge.id)) continue;
          let value = 0;
          if (badge.requirementType === 'routines') value = updated.completedRoutines;
          else if (badge.requirementType === 'streak') value = updated.currentStreak;
          else if (badge.requirementType === 'stars') value = updated.totalStars;
          if (value >= badge.requirement) {
            updated.unlockedBadges.push(badge.id);
            newlyUnlocked.push(badge.id);
          }
        }

        set((state) => ({
          rewards: { ...state.rewards, [childId]: updated },
        }));

        return newlyUnlocked;
      },

      addStars: (childId, stars) => {
        const current = get().rewards[childId] ?? defaultRewards(childId);
        set((state) => ({
          rewards: {
            ...state.rewards,
            [childId]: { ...current, totalStars: current.totalStars + stars },
          },
        }));
      },

      getUnlockedBadges: (childId) => {
        const r = get().rewards[childId];
        if (!r) return [];
        return BADGES.filter((b) => r.unlockedBadges.includes(b.id));
      },

      getLockedBadges: (childId) => {
        const r = get().rewards[childId];
        if (!r) return BADGES;
        return BADGES.filter((b) => !r.unlockedBadges.includes(b.id));
      },
    }),
    {
      name: 'reward-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ rewards: state.rewards }),
    }
  )
);
