jest.mock('expo-location', () => ({
  Accuracy: { Balanced: 3 },
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  reverseGeocodeAsync: jest.fn(),
}));
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: { getItem: jest.fn().mockResolvedValue(null), setItem: jest.fn().mockResolvedValue(undefined) },
}));

import * as Location from 'expo-location';
import { fetchWeather, WeatherFetchError } from '../../src/services/weather';

const requestPermission = Location.requestForegroundPermissionsAsync as jest.Mock;
const getPosition = Location.getCurrentPositionAsync as jest.Mock;
const reverseGeocode = Location.reverseGeocodeAsync as jest.Mock;

describe('weather location fallback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('explains a refused permission without requesting Paris weather', async () => {
    requestPermission.mockResolvedValue({ status: 'denied' });
    const fetchSpy = jest.spyOn(global, 'fetch');

    await expect(fetchWeather({ useGeolocation: true }, { force: true })).rejects.toMatchObject({
      code: 'location-denied',
    } satisfies Partial<WeatherFetchError>);
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  test('explains an unavailable position without requesting Paris weather', async () => {
    requestPermission.mockResolvedValue({ status: 'granted' });
    getPosition.mockRejectedValue(new Error('GPS unavailable'));
    const fetchSpy = jest.spyOn(global, 'fetch');

    await expect(fetchWeather({ useGeolocation: true }, { force: true })).rejects.toMatchObject({
      code: 'location-unavailable',
    } satisfies Partial<WeatherFetchError>);
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  test('uses obtained coordinates even when the place name is unavailable', async () => {
    requestPermission.mockResolvedValue({ status: 'granted' });
    getPosition.mockResolvedValue({ coords: { latitude: 48.1, longitude: -1.7 } });
    reverseGeocode.mockResolvedValue([]);
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ current: { temperature_2m: 18, weather_code: 0, is_day: 1 } }),
    } as Response);

    const weather = await fetchWeather({ useGeolocation: true }, { force: true });
    expect(weather.city).toBe('Ma position');
    expect(fetchSpy.mock.calls[0][0]).toContain('latitude=48.1&longitude=-1.7');
    fetchSpy.mockRestore();
  });
});
