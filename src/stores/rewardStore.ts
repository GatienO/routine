import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChildRewards, CompletionRewardSummary, RoutineExecution } from '../types';
import { BADGES } from '../constants/badges';
import { isToday, isYesterday } from '../utils/date';

interface RewardState {
  rewards: Record<string, ChildRewards>;
  getRewards: (childId: string) => ChildRewards;
  recordCompletion: (execution: RoutineExecution) => CompletionRewardSummary[];
  addStars: (childId: string, stars: number) => void;
  getUnlockedBadges: (childId: string) => typeof BADGES;
  getLockedBadges: (childId: string) => typeof BADGES;
}

const LEGACY_BADGE_ID_MAP: Record<string, string> = {
  first_star: 'stars_1',
  first_routine: 'first_step',
  routines_10: 'routine_10',
  routines_50: 'routine_50',
};

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

function normalizeUnlockedBadgeIds(unlockedBadges: string[]): string[] {
  return Array.from(
    new Set(
      unlockedBadges
        .map((badgeId) => LEGACY_BADGE_ID_MAP[badgeId] ?? badgeId)
        .filter((badgeId) => BADGES.some((badge) => badge.id === badgeId)),
    ),
  );
}

function normalizeRewards(rewards: ChildRewards): ChildRewards {
  return {
    ...rewards,
    unlockedBadges: normalizeUnlockedBadgeIds(rewards.unlockedBadges),
  };
}

export const useRewardStore = create<RewardState>()(
  persist(
    (set, get) => ({
      rewards: {},

      getRewards: (childId) => normalizeRewards(get().rewards[childId] ?? defaultRewards(childId)),

      recordCompletion: (execution) => {
        const childId = execution.childId;
        const participantChildIds = Array.from(
          new Set(execution.participantChildIds?.length ? execution.participantChildIds : [childId]),
        );
        const current = normalizeRewards(get().rewards[childId] ?? defaultRewards(childId));
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

        const rewardSummary: CompletionRewardSummary[] = participantChildIds.map((participantChildId) => ({
          childId: participantChildId,
          starsEarned: execution.earnedStars,
          unlockedBadgeIds: participantChildId === childId ? newlyUnlocked : [],
        }));

        set((state) => {
          const rewards = { ...state.rewards, [childId]: normalizeRewards(updated) };

          for (const participantChildId of participantChildIds) {
            if (participantChildId === childId) continue;

            const participantCurrent = normalizeRewards(
              rewards[participantChildId] ?? defaultRewards(participantChildId),
            );

            rewards[participantChildId] = {
              ...participantCurrent,
              totalStars: participantCurrent.totalStars + execution.earnedStars,
            };
          }

          return { rewards };
        });

        return rewardSummary;
      },

      addStars: (childId, stars) => {
        const current = normalizeRewards(get().rewards[childId] ?? defaultRewards(childId));

        set((state) => ({
          rewards: {
            ...state.rewards,
            [childId]: {
              ...current,
              totalStars: current.totalStars + stars,
            },
          },
        }));
      },

      getUnlockedBadges: (childId) => {
        const rewards = get().getRewards(childId);
        return BADGES.filter((badge) => rewards.unlockedBadges.includes(badge.id));
      },

      getLockedBadges: (childId) => {
        const rewards = get().getRewards(childId);
        return BADGES.filter((badge) => !rewards.unlockedBadges.includes(badge.id));
      },
    }),
    {
      name: 'reward-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ rewards: state.rewards }),
    },
  ),
);
