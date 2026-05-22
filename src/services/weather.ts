import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

const CACHE_KEY_PREFIX = 'weather-cache';
const CACHE_TTL = 30 * 60 * 1000;
export const WEATHER_LIVE_REFRESH_MS = 10 * 60 * 1000;

function getCacheKey(options: WeatherOptions = {}): string {
  if (options.useGeolocation) return `${CACHE_KEY_PREFIX}:geo`;
  if (options.cityName) return `${CACHE_KEY_PREFIX}:city:${options.cityName.toLowerCase().trim()}`;
  return `${CACHE_KEY_PREFIX}:default`;
}

export type WeatherCondition =
  | 'clear'
  | 'partly_cloudy'
  | 'cloudy'
  | 'fog'
  | 'rain'
  | 'snow'
  | 'thunderstorm';

export interface DayForecastSummary {
  minTemperature: number;
  maxTemperature: number;
  minApparentTemperature?: number;
  maxApparentTemperature?: number;
  precipitationProbability?: number;
  maxWindSpeed?: number;
  hasRain: boolean;
  hasSnow: boolean;
  hasThunderstorm: boolean;
  dominantCondition: WeatherCondition;
}

export interface WeatherData {
  condition: WeatherCondition;
  temperature: number;
  apparentTemperature?: number;
  windSpeed?: number;
  isDay: boolean;
  city: string;
  timestamp: number;
  dayForecast: DayForecastSummary;
  nightForecast: DayForecastSummary;
}

interface OpenMeteoResponse {
  current: {
    temperature_2m: number;
    apparent_temperature?: number;
    weather_code: number;
    wind_speed_10m?: number;
    is_day: number;
  };
  hourly?: {
    time?: string[];
    temperature_2m?: number[];
    apparent_temperature?: number[];
    precipitation_probability?: number[];
    wind_speed_10m?: number[];
    weather_code?: number[];
  };
}

function wmoCodeToCondition(code: number): WeatherCondition {
  if (code === 0) return 'clear';
  if (code <= 3) return 'partly_cloudy';
  if (code <= 48) return 'fog';
  if (code <= 67) return 'rain';
  if (code <= 77) return 'snow';
  if (code <= 82) return 'rain';
  if (code <= 86) return 'snow';
  if (code <= 99) return 'thunderstorm';
  return 'cloudy';
}

const DEFAULT_LAT = 48.8566;
const DEFAULT_LON = 2.3522;

async function geocodeCity(city: string): Promise<{ lat: number; lon: number; name: string } | null> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=fr`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  if (!data.results?.length) return null;
  const r = data.results[0];
  return { lat: r.latitude, lon: r.longitude, name: r.name };
}

export interface WeatherOptions {
  cityName?: string;
  useGeolocation?: boolean;
}

export interface WeatherFetchConfig {
  force?: boolean;
  maxCacheAgeMs?: number;
}

function conditionPriority(condition: WeatherCondition): number {
  switch (condition) {
    case 'thunderstorm':
      return 6;
    case 'snow':
      return 5;
    case 'rain':
      return 4;
    case 'fog':
      return 3;
    case 'cloudy':
      return 2;
    case 'partly_cloudy':
      return 1;
    case 'clear':
    default:
      return 0;
  }
}

function buildDayForecast(data: OpenMeteoResponse, fallbackCondition: WeatherCondition, fallbackTemp: number): DayForecastSummary {
  const times = data.hourly?.time ?? [];
  const temps = data.hourly?.temperature_2m ?? [];
  const apparentTemps = data.hourly?.apparent_temperature ?? [];
  const precipitationProbabilities = data.hourly?.precipitation_probability ?? [];
  const windSpeeds = data.hourly?.wind_speed_10m ?? [];
  const codes = data.hourly?.weather_code ?? [];
  const today = new Date().toISOString().slice(0, 10);
  const currentHour = new Date().getHours();

  const entries = times
    .map((time, index) => ({
      time,
      hour: Number(time.slice(11, 13)),
      date: time.slice(0, 10),
      temp: temps[index],
      apparentTemp: apparentTemps[index],
      precipitationProbability: precipitationProbabilities[index],
      windSpeed: windSpeeds[index],
      code: codes[index],
    }))
    .filter((entry) =>
      entry.date === today &&
      typeof entry.temp === 'number' &&
      typeof entry.code === 'number',
    );

  const upcomingEntries = entries.filter((entry) => entry.hour >= currentHour);
  const activeEntries = upcomingEntries.length > 0 ? upcomingEntries : entries;

  if (activeEntries.length === 0) {
    return {
      minTemperature: fallbackTemp,
      maxTemperature: fallbackTemp,
      hasRain: fallbackCondition === 'rain',
      hasSnow: fallbackCondition === 'snow',
      hasThunderstorm: fallbackCondition === 'thunderstorm',
      dominantCondition: fallbackCondition,
    };
  }

  const temperatures = activeEntries.map((entry) => Math.round(entry.temp));
  const apparentTemperatures = activeEntries
    .map((entry) => entry.apparentTemp)
    .filter((temp): temp is number => typeof temp === 'number')
    .map((temp) => Math.round(temp));
  const precipitationProbability = Math.max(
    0,
    ...activeEntries
      .map((entry) => entry.precipitationProbability)
      .filter((value): value is number => typeof value === 'number'),
  );
  const maxWindSpeed = Math.max(
    0,
    ...activeEntries
      .map((entry) => entry.windSpeed)
      .filter((value): value is number => typeof value === 'number'),
  );
  const conditions = activeEntries.map((entry) => wmoCodeToCondition(entry.code));
  const dominantCondition = conditions.reduce(
    (current, next) => (conditionPriority(next) > conditionPriority(current) ? next : current),
    conditions[0],
  );

  return {
    minTemperature: Math.min(...temperatures),
    maxTemperature: Math.max(...temperatures),
    ...(apparentTemperatures.length > 0
      ? {
          minApparentTemperature: Math.min(...apparentTemperatures),
          maxApparentTemperature: Math.max(...apparentTemperatures),
        }
      : {}),
    ...(precipitationProbability > 0 ? { precipitationProbability } : {}),
    ...(maxWindSpeed > 0 ? { maxWindSpeed: Math.round(maxWindSpeed) } : {}),
    hasRain: conditions.includes('rain'),
    hasSnow: conditions.includes('snow'),
    hasThunderstorm: conditions.includes('thunderstorm'),
    dominantCondition,
  };
}

function buildNightForecast(
  data: OpenMeteoResponse,
  fallbackCondition: WeatherCondition,
  fallbackTemp: number,
): DayForecastSummary {
  const times = data.hourly?.time ?? [];
  const temps = data.hourly?.temperature_2m ?? [];
  const apparentTemps = data.hourly?.apparent_temperature ?? [];
  const precipitationProbabilities = data.hourly?.precipitation_probability ?? [];
  const windSpeeds = data.hourly?.wind_speed_10m ?? [];
  const codes = data.hourly?.weather_code ?? [];
  const now = Date.now();
  const tomorrowWindow = now + 24 * 60 * 60 * 1000;

  const entries = times
    .map((time, index) => ({
      time,
      dateMs: new Date(time).getTime(),
      hour: Number(time.slice(11, 13)),
      temp: temps[index],
      apparentTemp: apparentTemps[index],
      precipitationProbability: precipitationProbabilities[index],
      windSpeed: windSpeeds[index],
      code: codes[index],
    }))
    .filter(
      (entry) =>
        entry.dateMs >= now &&
        entry.dateMs <= tomorrowWindow &&
        typeof entry.temp === 'number' &&
        typeof entry.code === 'number' &&
        (entry.hour >= 18 || entry.hour < 7),
    );

  if (entries.length === 0) {
    return {
      minTemperature: fallbackTemp,
      maxTemperature: fallbackTemp,
      hasRain: fallbackCondition === 'rain',
      hasSnow: fallbackCondition === 'snow',
      hasThunderstorm: fallbackCondition === 'thunderstorm',
      dominantCondition: fallbackCondition,
    };
  }

  const temperatures = entries.map((entry) => Math.round(entry.temp));
  const apparentTemperatures = entries
    .map((entry) => entry.apparentTemp)
    .filter((temp): temp is number => typeof temp === 'number')
    .map((temp) => Math.round(temp));
  const precipitationProbability = Math.max(
    0,
    ...entries
      .map((entry) => entry.precipitationProbability)
      .filter((value): value is number => typeof value === 'number'),
  );
  const maxWindSpeed = Math.max(
    0,
    ...entries
      .map((entry) => entry.windSpeed)
      .filter((value): value is number => typeof value === 'number'),
  );
  const conditions = entries.map((entry) => wmoCodeToCondition(entry.code));
  const dominantCondition = conditions.reduce(
    (current, next) => (conditionPriority(next) > conditionPriority(current) ? next : current),
    conditions[0],
  );

  return {
    minTemperature: Math.min(...temperatures),
    maxTemperature: Math.max(...temperatures),
    ...(apparentTemperatures.length > 0
      ? {
          minApparentTemperature: Math.min(...apparentTemperatures),
          maxApparentTemperature: Math.max(...apparentTemperatures),
        }
      : {}),
    ...(precipitationProbability > 0 ? { precipitationProbability } : {}),
    ...(maxWindSpeed > 0 ? { maxWindSpeed: Math.round(maxWindSpeed) } : {}),
    hasRain: conditions.includes('rain'),
    hasSnow: conditions.includes('snow'),
    hasThunderstorm: conditions.includes('thunderstorm'),
    dominantCondition,
  };
}

export async function fetchWeather(
  options: WeatherOptions = {},
  config: WeatherFetchConfig = {},
): Promise<WeatherData> {
  const cacheKey = getCacheKey(options);

  const cached = config.force
    ? null
    : await getCachedWeather(cacheKey, config.maxCacheAgeMs ?? CACHE_TTL);
  if (cached) return cached;

  let lat = DEFAULT_LAT;
  let lon = DEFAULT_LON;
  let city = 'Paris';
  let resolved = false;

  if (options.useGeolocation) {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        lat = loc.coords.latitude;
        lon = loc.coords.longitude;
        resolved = true;

        const [place] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
        if (place?.city) {
          city = place.city;
        } else if (place?.subregion) {
          city = place.subregion;
        }
      }
    } catch {
      // Fall through to city or default.
    }
  }

  if (!resolved && options.cityName) {
    const geo = await geocodeCity(options.cityName);
    if (geo) {
      lat = geo.lat;
      lon = geo.lon;
      city = geo.name;
      resolved = true;
    }
  }

  const url =
    `https://api.open-meteo.com/v1/meteofrance?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,is_day` +
    `&hourly=temperature_2m,apparent_temperature,precipitation_probability,wind_speed_10m,weather_code` +
    `&timezone=auto`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Weather API error: ${res.status}`);

  const data: OpenMeteoResponse = await res.json();
  const currentCondition = wmoCodeToCondition(data.current.weather_code);
  const currentTemperature = Math.round(data.current.temperature_2m);
  const apparentTemperature =
    typeof data.current.apparent_temperature === 'number'
      ? Math.round(data.current.apparent_temperature)
      : undefined;
  const windSpeed =
    typeof data.current.wind_speed_10m === 'number'
      ? Math.round(data.current.wind_speed_10m)
      : undefined;

  const weather: WeatherData = {
    condition: currentCondition,
    temperature: currentTemperature,
    ...(typeof apparentTemperature === 'number' ? { apparentTemperature } : {}),
    ...(typeof windSpeed === 'number' ? { windSpeed } : {}),
    isDay: data.current.is_day === 1,
    city,
    timestamp: Date.now(),
    dayForecast: buildDayForecast(data, currentCondition, currentTemperature),
    nightForecast: buildNightForecast(data, currentCondition, currentTemperature),
  };

  await AsyncStorage.setItem(cacheKey, JSON.stringify(weather));
  return weather;
}

async function getCachedWeather(cacheKey: string, maxAgeMs: number): Promise<WeatherData | null> {
  const raw = await AsyncStorage.getItem(cacheKey);
  if (!raw) return null;

  const data = JSON.parse(raw) as Partial<WeatherData>;
  if (!data.timestamp || Date.now() - data.timestamp > maxAgeMs) return null;
  if (!data.dayForecast || !data.nightForecast) return null;

  return data as WeatherData;
}
