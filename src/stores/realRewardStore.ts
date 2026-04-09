import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RealReward } from '../types';
import { generateId } from '../utils/id';

interface RealRewardState {
  realRewards: RealReward[];
  addRealReward: (description: string, requiredStars: number) => RealReward;
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

export const useRealRewardStore = create<RealRewardState>()(
  persist(
    (set, get) => ({
      realRewards: [],

      addRealReward: (description, requiredStars) => {
        const reward: RealReward = {
          id: generateId(),
          childId: 'all',
          description: description.trim(),
          requiredStars,
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

            const now = new Date().toISOString();
            const claimedChildIds = Array.from(new Set([...claimedIdsForReward(reward), childId]));

            return {
              ...reward,
              childId: 'all',
              isClaimed: false,
              claimedAt: undefined,
              claimedChildIds,
              claimedByChild: {
                ...(reward.claimedByChild ?? {}),
                [childId]: now,
              },
            };
          }),
        })),

      getRewards: () => get().realRewards,

      getRewardsForChild: (childId) =>
        get().realRewards.map((reward) => {
          const claimedChildIds = claimedIdsForReward(reward);
          const isClaimed = claimedChildIds.includes(childId);

          return {
            ...reward,
            childId: 'all',
            isClaimed,
            claimedAt: reward.claimedByChild?.[childId],
            claimedChildIds,
          };
        }),

      getClaimableRewards: (childId, currentStars) =>
        get()
          .getRewardsForChild(childId)
          .filter((reward) => !reward.isClaimed && currentStars >= reward.requiredStars),
    }),
    {
      name: 'real-reward-store',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
