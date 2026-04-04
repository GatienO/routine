import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppState {
  parentPin: string | null;
  isParentMode: boolean;
  selectedChildId: string | null;
  weatherCity: string;
  useGeolocation: boolean;
  setParentPin: (pin: string) => void;
  setParentMode: (active: boolean) => void;
  selectChild: (childId: string | null) => void;
  setWeatherCity: (city: string) => void;
  setUseGeolocation: (use: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      parentPin: null,
      isParentMode: false,
      selectedChildId: null,
      weatherCity: '',
      useGeolocation: false,
      setParentPin: (pin) => set({ parentPin: pin }),
      setParentMode: (active) => set({ isParentMode: active }),
      selectChild: (childId) => set({ selectedChildId: childId }),
      setWeatherCity: (city) => set({ weatherCity: city }),
      setUseGeolocation: (use) => set({ useGeolocation: use }),
    }),
    {
      name: 'app-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        parentPin: state.parentPin,
        selectedChildId: state.selectedChildId,
        weatherCity: state.weatherCity,
        useGeolocation: state.useGeolocation,
      }),
    }
  )
);
