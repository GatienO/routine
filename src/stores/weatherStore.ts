import { create } from 'zustand';
import { fetchWeather, WeatherData, WeatherFetchConfig, WeatherFetchError, WeatherErrorCode, WeatherOptions } from '../services/weather';

interface WeatherState {
  weather: WeatherData | null;
  loading: boolean;
  loadingStartedAt: number | null;
  error: string | null;
  errorCode: WeatherErrorCode | null;
  refresh: (options?: WeatherOptions, config?: WeatherFetchConfig) => Promise<boolean>;
}

export const useWeatherStore = create<WeatherState>()((set, get) => {
  let latestRequest = 0;
  return {
    weather: null,
    loading: false,
    loadingStartedAt: null,
    error: null,
    errorCode: null,

    refresh: async (options?: WeatherOptions, config?: WeatherFetchConfig) => {
      const state = get();
      const loadingIsFresh =
        state.loading &&
        typeof state.loadingStartedAt === 'number' &&
        Date.now() - state.loadingStartedAt < 12000;

      if (loadingIsFresh) return false;
      const requestId = ++latestRequest;
      set({ loading: true, loadingStartedAt: Date.now(), error: null, errorCode: null });
      try {
        const weather = await fetchWeather(options, config);
        if (requestId !== latestRequest) return false;
        set({ weather, loading: false, loadingStartedAt: null, errorCode: null });
        return true;
      } catch (error: unknown) {
        if (requestId !== latestRequest) return false;
        set({
          error: error instanceof Error ? error.message : 'Impossible de mettre la météo à jour.',
          errorCode: error instanceof WeatherFetchError ? error.code : 'network',
          loading: false,
          loadingStartedAt: null,
        });
        return false;
      }
    },
  };
});
