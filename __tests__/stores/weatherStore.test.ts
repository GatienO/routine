jest.mock('../../src/services/weather', () => ({
  fetchWeather: jest.fn(),
  WeatherFetchError: class WeatherFetchError extends Error {
    constructor(public code: string, message: string) { super(message); }
  },
}));

import { fetchWeather, WeatherFetchError, type WeatherData } from '../../src/services/weather';
import { useWeatherStore } from '../../src/stores/weatherStore';

const fetchWeatherMock = fetchWeather as jest.Mock;

describe('weather refresh result', () => {
  beforeEach(() => {
    fetchWeatherMock.mockReset();
    useWeatherStore.setState({ weather: null, loading: false, loadingStartedAt: null, error: null, errorCode: null });
  });

  test('reports success only when new weather was loaded', async () => {
    const weather = { city: 'Rennes', timestamp: Date.now() } as WeatherData;
    fetchWeatherMock.mockResolvedValue(weather);

    await expect(useWeatherStore.getState().refresh({ cityName: 'Rennes' })).resolves.toBe(true);
    expect(useWeatherStore.getState().weather).toBe(weather);
  });

  test('does not report a skipped or failed refresh as success', async () => {
    useWeatherStore.setState({ loading: true, loadingStartedAt: Date.now() });
    await expect(useWeatherStore.getState().refresh({ cityName: 'Rennes' })).resolves.toBe(false);
    expect(fetchWeatherMock).not.toHaveBeenCalled();

    useWeatherStore.setState({ loading: false, loadingStartedAt: null });
    fetchWeatherMock.mockRejectedValue(new WeatherFetchError('city-not-found', 'Ville introuvable'));
    await expect(useWeatherStore.getState().refresh({ cityName: 'Inconnue' })).resolves.toBe(false);
    expect(useWeatherStore.getState().errorCode).toBe('city-not-found');
  });

  test('an old request cannot replace a newer city after a timeout retry', async () => {
    let resolveOld!: (weather: WeatherData) => void;
    const oldWeather = { city: 'Paris', timestamp: Date.now() } as WeatherData;
    const newWeather = { city: 'Rennes', timestamp: Date.now() } as WeatherData;
    fetchWeatherMock
      .mockImplementationOnce(() => new Promise<WeatherData>((resolve) => { resolveOld = resolve; }))
      .mockResolvedValueOnce(newWeather);

    const oldRefresh = useWeatherStore.getState().refresh({ cityName: 'Paris' });
    useWeatherStore.setState({ loadingStartedAt: Date.now() - 12001 });
    await expect(useWeatherStore.getState().refresh({ cityName: 'Rennes' })).resolves.toBe(true);
    resolveOld(oldWeather);
    await expect(oldRefresh).resolves.toBe(false);
    expect(useWeatherStore.getState().weather).toBe(newWeather);
  });
});
