import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RealReward } from '../types';
import { generateId } from '../utils/id';

interface RealRewardState {
  realRewards: RealReward[];
  addRealReward: (childId: string, description: string, requiredStars: number) => RealReward;
  removeRealReward: (id: string) => void;
  claimReward: (id: string) => void;
  getRewardsForChild: (childId: string) => RealReward[];
  getClaimableRewards: (childId: string, currentStars: number) => RealReward[];
}

export const useRealRewardStore = create<RealRewardState>()(
  persist(
    (set, get) => ({
      realRewards: [],

      addRealReward: (childId, description, requiredStars) => {
        const reward: RealReward = {
          id: generateId(),
          childId,
          description: description.trim(),
          requiredStars,
          isClaimed: false,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          realRewards: [...state.realRewards, reward],
        }));
        return reward;
      },

      removeRealReward: (id) =>
        set((state) => ({
          realRewards: state.realRewards.filter((r) => r.id !== id),
        })),

      claimReward: (id) =>
        set((state) => ({
          realRewards: state.realRewards.map((r) =>
            r.id === id
              ? { ...r, isClaimed: true, claimedAt: new Date().toISOString() }
              : r
          ),
        })),

      getRewardsForChild: (childId) =>
        get().realRewards.filter((r) => r.childId === childId),

      getClaimableRewards: (childId, currentStars) =>
        get().realRewards.filter(
          (r) => r.childId === childId && !r.isClaimed && currentStars >= r.requiredStars
        ),
    }),
    {
      name: 'real-reward-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
