import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

const CACHE_KEY_PREFIX = 'weather-cache';
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

function getCacheKey(options: WeatherOptions = {}): string {
  if (options.useGeolocation) return `${CACHE_KEY_PREFIX}:geo`;
  if (options.cityName) return `${CACHE_KEY_PREFIX}:city:${options.cityName.toLowerCase().trim()}`;
  return `${CACHE_KEY_PREFIX}:default`;
}

// Open-Meteo WMO Weather interpretation codes
// https://open-meteo.com/en/docs
export type WeatherCondition =
  | 'clear'
  | 'partly_cloudy'
  | 'cloudy'
  | 'fog'
  | 'rain'
  | 'snow'
  | 'thunderstorm';

export interface WeatherData {
  condition: WeatherCondition;
  temperature: number;
  isDay: boolean;
  city: string;
  timestamp: number;
}

interface OpenMeteoResponse {
  current: {
    temperature_2m: number;
    weather_code: number;
    is_day: number;
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

// Default: Paris, France
const DEFAULT_LAT = 48.8566;
const DEFAULT_LON = 2.3522;

/** Geocode a city name via Open-Meteo */
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

export async function fetchWeather(options: WeatherOptions = {}): Promise<WeatherData> {
  const cacheKey = getCacheKey(options);

  // Check cache first (scoped to current settings)
  const cached = await getCachedWeather(cacheKey);
  if (cached) return cached;

  let lat = DEFAULT_LAT;
  let lon = DEFAULT_LON;
  let city = 'Paris';
  let resolved = false;

  // Priority 1: Geolocation if enabled
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
      // Fall through to city or default
    }
  }

  // Priority 2: City name if provided (and geo wasn't used or failed)
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
    `&current=temperature_2m,weather_code,is_day&timezone=auto`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Weather API error: ${res.status}`);

  const data: OpenMeteoResponse = await res.json();

  const weather: WeatherData = {
    condition: wmoCodeToCondition(data.current.weather_code),
    temperature: Math.round(data.current.temperature_2m),
    isDay: data.current.is_day === 1,
    city,
    timestamp: Date.now(),
  };

  await AsyncStorage.setItem(cacheKey, JSON.stringify(weather));
  return weather;
}

async function getCachedWeather(cacheKey: string): Promise<WeatherData | null> {
  const raw = await AsyncStorage.getItem(cacheKey);
  if (!raw) return null;
  const data: WeatherData = JSON.parse(raw);
  if (Date.now() - data.timestamp > CACHE_TTL) return null;
  return data;
}
