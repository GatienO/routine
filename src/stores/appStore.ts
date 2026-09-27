import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ThemeMode } from '../constants/theme';
import { normalizeOutfitSelection, type OutfitVisualId } from '../constants/weatherOutfits';

interface AppState {
  parentPin: string | null;
  isParentMode: boolean;
  weatherCity: string;
  useGeolocation: boolean;
  themeMode: ThemeMode;
  selectedOutfitIds: OutfitVisualId[] | null;
  setSelectedOutfitIds: (ids: OutfitVisualId[]) => void;
  setParentPin: (pin: string) => void;
  setParentMode: (active: boolean) => void;
  setWeatherCity: (city: string) => void;
  setUseGeolocation: (use: boolean) => void;
  setThemeMode: (mode: ThemeMode) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      parentPin: null,
      isParentMode: false,
      weatherCity: '',
      useGeolocation: false,
      themeMode: 'light',
      selectedOutfitIds: null,
      setSelectedOutfitIds: (ids) => set({ selectedOutfitIds: normalizeOutfitSelection(ids) }),
      setParentPin: (pin) =>
        set((state) => (state.parentPin === pin ? state : { parentPin: pin })),
      setParentMode: (active) =>
        set((state) => (state.isParentMode === active ? state : { isParentMode: active })),
      setWeatherCity: (city) =>
        set((state) => (state.weatherCity === city ? state : { weatherCity: city })),
      setUseGeolocation: (use) =>
        set((state) => (state.useGeolocation === use ? state : { useGeolocation: use })),
      setThemeMode: (mode) =>
        set((state) => (state.themeMode === mode ? state : { themeMode: mode })),
    }),
    {
      name: 'app-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        parentPin: state.parentPin,
        weatherCity: state.weatherCity,
        useGeolocation: state.useGeolocation,
        themeMode: state.themeMode,
        selectedOutfitIds: state.selectedOutfitIds,
      }),
      version: 2,
      migrate: (persistedState) => {
        const { selectedChildId: _legacySelectedChildId, ...state } = persistedState as Partial<AppState> & {
          selectedChildId?: string | null;
        };
        return {
          ...state,
          themeMode: !state.themeMode || state.themeMode === 'system' ? 'light' : state.themeMode,
        } as AppState;
      },
    }
  )
);
