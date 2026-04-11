import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RealReward, RealRewardCooldownUnit } from '../types';
import { generateId } from '../utils/id';
import { getRewardAvailabilityForChild } from '../utils/realRewardAvailability';

interface RealRewardState {
  realRewards: RealReward[];
  addRealReward: (
    description: string,
    requiredStars: number,
    cooldownValue: number,
    cooldownUnit: RealRewardCooldownUnit,
  ) => RealReward;
  removeRealReward: (id: string) => void;
  claimReward: (id: string, childId: string) => void;
  getRewards: () => RealReward[];
  getRewardsForChild: (childId: string) => RealReward[];
  getClaimableRewards: (childId: string, currentStars: number) => RealReward[];
}

function claimedIdsForReward(reward: RealReward): string[] {
  if (reward.claimedChildIds?.length) {
    return reward.claimedChildIds;
  }

  if (reward.isClaimed && reward.childId && reward.childId !== 'all') {
    return [reward.childId];
  }

  return [];
}

function normalizeReward(reward: RealReward): RealReward {
  return {
    ...reward,
    childId: reward.childId || 'all',
    cooldownValue: Math.max(1, reward.cooldownValue || 1),
    cooldownUnit: reward.cooldownUnit || 'week',
    claimedChildIds: reward.claimedChildIds ?? [],
    claimedByChild: reward.claimedByChild ?? {},
  };
}

export const useRealRewardStore = create<RealRewardState>()(
  persist(
    (set, get) => ({
      realRewards: [],

      addRealReward: (description, requiredStars, cooldownValue, cooldownUnit) => {
        const reward: RealReward = {
          id: generateId(),
          childId: 'all',
          description: description.trim(),
          requiredStars,
          cooldownValue: Math.max(1, cooldownValue),
          cooldownUnit,
          isClaimed: false,
          createdAt: new Date().toISOString(),
          claimedChildIds: [],
          claimedByChild: {},
        };

        set((state) => ({
          realRewards: [...state.realRewards, reward],
        }));

        return reward;
      },

      removeRealReward: (id) =>
        set((state) => ({
          realRewards: state.realRewards.filter((reward) => reward.id !== id),
        })),

      claimReward: (id, childId) =>
        set((state) => ({
          realRewards: state.realRewards.map((reward) => {
            if (reward.id !== id) return reward;

            const normalizedReward = normalizeReward(reward);
            const now = new Date().toISOString();
            const claimedChildIds = Array.from(
              new Set([...claimedIdsForReward(normalizedReward), childId]),
            );

            return {
              ...normalizedReward,
              childId: 'all',
              isClaimed: true,
              claimedAt: now,
              claimedChildIds,
              claimedByChild: {
                ...(normalizedReward.claimedByChild ?? {}),
                [childId]: now,
              },
            };
          }),
        })),

      getRewards: () => get().realRewards.map(normalizeReward),

      getRewardsForChild: (childId) =>
        get().getRewards().map((reward) => {
          const claimedChildIds = claimedIdsForReward(reward);
          const availability = getRewardAvailabilityForChild(reward, childId);

          return {
            ...reward,
            childId: 'all',
            isClaimed: availability.isCoolingDown,
            isCoolingDown: availability.isCoolingDown,
            claimedAt: reward.claimedByChild?.[childId],
            lastClaimedAt: availability.lastClaimedAt,
            availableAt: availability.availableAt,
            remainingCooldownMs: availability.remainingCooldownMs,
            claimedChildIds,
          };
        }),

      getClaimableRewards: (childId, currentStars) =>
        get()
          .getRewardsForChild(childId)
          .filter((reward) => !reward.isCoolingDown && currentStars >= reward.requiredStars),
    }),
    {
      name: 'real-reward-store',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
