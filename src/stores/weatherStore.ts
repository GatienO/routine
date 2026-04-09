import { create } from 'zustand';
import { fetchWeather, WeatherData, WeatherFetchConfig, WeatherOptions } from '../services/weather';

interface WeatherState {
  weather: WeatherData | null;
  loading: boolean;
  error: string | null;
  refresh: (options?: WeatherOptions, config?: WeatherFetchConfig) => Promise<void>;
}

export const useWeatherStore = create<WeatherState>()((set, get) => ({
  weather: null,
  loading: false,
  error: null,

  refresh: async (options?: WeatherOptions, config?: WeatherFetchConfig) => {
    if (get().loading) return;
    set({ loading: true, error: null });
    try {
      const weather = await fetchWeather(options, config);
      set({ weather, loading: false });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },
}));
