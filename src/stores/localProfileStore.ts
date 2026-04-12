import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { generateId } from '../utils/id';

const LOCAL_PROFILE_ID_LENGTH = 12;
const LOCAL_PROFILE_NAME_LIMIT = 40;

function createLocalProfileId(): string {
  return `local-${generateId().replace(/-/g, '').slice(0, LOCAL_PROFILE_ID_LENGTH).toUpperCase()}`;
}

function sanitizeProfileName(value: string): string {
  return value.trim().slice(0, LOCAL_PROFILE_NAME_LIMIT);
}

interface LocalProfileState {
  profileId: string | null;
  profileName: string;
  createdAt: string | null;
  hasHydrated: boolean;
  initializeProfile: (name: string) => void;
  renameProfile: (name: string) => void;
  ensureProfileRecord: () => void;
  setHasHydrated: (hydrated: boolean) => void;
}

export const useLocalProfileStore = create<LocalProfileState>()(
  persist(
    (set) => ({
      profileId: null,
      profileName: '',
      createdAt: null,
      hasHydrated: false,

      initializeProfile: (name) =>
        set((state) => {
          const profileName = sanitizeProfileName(name);
          if (!profileName) return state;

          return {
            profileId: state.profileId ?? createLocalProfileId(),
            createdAt: state.createdAt ?? new Date().toISOString(),
            profileName,
          };
        }),

      renameProfile: (name) =>
        set((state) => {
          const profileName = sanitizeProfileName(name);
          if (!profileName) return state;
          return { profileName };
        }),

      ensureProfileRecord: () =>
        set((state) => {
          if (state.profileId && state.createdAt) {
            return state;
          }

          return {
            profileId: state.profileId ?? createLocalProfileId(),
            createdAt: state.createdAt ?? new Date().toISOString(),
          };
        }),

      setHasHydrated: (hydrated) => set({ hasHydrated: hydrated }),
    }),
    {
      name: 'local-profile-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        profileId: state.profileId,
        profileName: state.profileName,
        createdAt: state.createdAt,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
        state?.ensureProfileRecord();
      },
    },
  ),
);
