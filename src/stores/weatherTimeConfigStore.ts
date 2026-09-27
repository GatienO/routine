import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
  DayOfWeek,
  DayTimeConfig,
  WeeklyTimeConfig,
  createDefaultWeeklyTimeConfig,
  normalizeWeeklyTimeConfig,
} from '../utils/weatherTimeConfig';

type WeatherTimeConfigState = {
  configs: WeeklyTimeConfig[];
  ensureConfig: (childId?: string) => void;
  updateDayConfig: (childId: string | undefined, dayOfWeek: DayOfWeek, patch: Partial<DayTimeConfig>) => void;
  copyMondayToWeek: (childId?: string) => void;
  applySchoolWeek: (childId?: string) => void;
  resetConfig: (childId?: string) => void;
};

function sameTarget(config: WeeklyTimeConfig, childId?: string) {
  return childId ? config.childId === childId : !config.childId;
}

function upsertConfig(
  configs: WeeklyTimeConfig[],
  childId: string | undefined,
  updater: (config: WeeklyTimeConfig) => WeeklyTimeConfig,
) {
  const existing = configs.find((config) => sameTarget(config, childId));
  const base = normalizeWeeklyTimeConfig(existing ?? createDefaultWeeklyTimeConfig(childId));
  const updated = updater(base);
  const others = configs.filter((config) => !sameTarget(config, childId));
  return [...others, normalizeWeeklyTimeConfig(updated)];
}

export const useWeatherTimeConfigStore = create<WeatherTimeConfigState>()(
  persist(
    (set) => ({
      configs: [createDefaultWeeklyTimeConfig()],
      ensureConfig: (childId) =>
        set((state) => {
          if (state.configs.some((config) => sameTarget(config, childId))) return state;
          return { configs: [...state.configs, createDefaultWeeklyTimeConfig(childId)] };
        }),
      updateDayConfig: (childId, dayOfWeek, patch) =>
        set((state) => ({
          configs: upsertConfig(state.configs, childId, (config) => ({
            ...config,
            days: config.days.map((day) => (day.dayOfWeek === dayOfWeek ? { ...day, ...patch } : day)),
          })),
        })),
      copyMondayToWeek: (childId) =>
        set((state) => ({
          configs: upsertConfig(state.configs, childId, (config) => {
            const monday = config.days.find((day) => day.dayOfWeek === 1) ?? config.days[0];
            return {
              ...config,
              days: config.days.map((day) => ({
                ...day,
                napEnabled: monday.napEnabled,
                napTime: monday.napTime,
                bedtime: monday.bedtime,
                nightStartTime: monday.nightStartTime,
              })),
            };
          }),
        })),
      applySchoolWeek: (childId) =>
        set((state) => ({
          configs: upsertConfig(state.configs, childId, () => createDefaultWeeklyTimeConfig(childId)),
        })),
      resetConfig: (childId) =>
        set((state) => ({
          configs: upsertConfig(state.configs, childId, () => createDefaultWeeklyTimeConfig(childId)),
        })),
    }),
    {
      name: 'weather-time-config-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        configs: state.configs.map(normalizeWeeklyTimeConfig),
      }),
    },
  ),
);
