import { WeatherCondition } from '../services/weather';
import type { WeatherTimeMode } from '../utils/weatherTimeConfig';

export interface WeatherTheme {
  gradient: [string, string];
  emoji: string;
  label: string;
  particles: string[];
  overlayOpacity: number;
  kidMessage: string;
  tip: string;
}

const DAY_THEMES: Record<WeatherCondition, WeatherTheme> = {
  clear: {
    gradient: ['#FAF6EE', '#FFFDF8'],
    emoji: '\u2600\uFE0F',
    label: 'Ensoleillé',
    particles: ['\u2600\uFE0F', '\u{1F33F}', '\u2728'],
    overlayOpacity: 0,
    kidMessage: "Soleil aujourd'hui.",
    tip: 'Casquette + eau.',
  },
  partly_cloudy: {
    gradient: ['#FAF6EE', '#EAF3E8'],
    emoji: '\u26C5',
    label: 'Nuageux',
    particles: ['\u26C5', '\u2601\uFE0F', '\u{1F33F}'],
    overlayOpacity: 0.02,
    kidMessage: 'Quelques nuages.',
    tip: 'Petite veste utile.',
  },
  cloudy: {
    gradient: ['#FAF6EE', '#EFE7D7'],
    emoji: '\u2601\uFE0F',
    label: 'Couvert',
    particles: ['\u2601\uFE0F', '\u{1F33F}'],
    overlayOpacity: 0.03,
    kidMessage: 'Ciel couvert.',
    tip: 'Veste utile.',
  },
  fog: {
    gradient: ['#FAF6EE', '#EDE5D5'],
    emoji: '\u{1F32B}\uFE0F',
    label: 'Brouillard',
    particles: ['\u{1F32B}\uFE0F', '\u{1F4A8}'],
    overlayOpacity: 0.04,
    kidMessage: 'Brouillard dehors.',
    tip: 'On y va doucement.',
  },
  rain: {
    gradient: ['#FAF6EE', '#E6E1F7'],
    emoji: '\u{1F327}\uFE0F',
    label: 'Pluie',
    particles: ['\u{1F4A7}', '\u{1F327}\uFE0F', '\u2614'],
    overlayOpacity: 0.04,
    kidMessage: 'Pluie prévue.',
    tip: 'Imperméable utile.',
  },
  snow: {
    gradient: ['#FFFDF8', '#E6E1F7'],
    emoji: '\u2744\uFE0F',
    label: 'Neige',
    particles: ['\u2744\uFE0F', '\u26C4', '\u2728'],
    overlayOpacity: 0.03,
    kidMessage: 'Neige prévue.',
    tip: 'Bonnet + gants.',
  },
  thunderstorm: {
    gradient: ['#EDE5D5', '#E6E1F7'],
    emoji: '\u26C8\uFE0F',
    label: 'Orage',
    particles: ['\u26A1', '\u26C8\uFE0F', '\u{1F4A8}'],
    overlayOpacity: 0.06,
    kidMessage: 'Orage prévu.',
    tip: "À l'intérieur.",
  },
};

const NIGHT_THEMES: Record<WeatherCondition, WeatherTheme> = {
  clear: {
    gradient: ['#6F6A93', '#B8AEDF'],
    emoji: '\u{1F319}',
    label: 'Nuit claire',
    particles: ['\u{1F319}', '\u2B50', '\u2728'],
    overlayOpacity: 0,
    kidMessage: 'Nuit claire.',
    tip: 'On ralentit.',
  },
  partly_cloudy: {
    gradient: ['#746F93', '#C7DDBF'],
    emoji: '\u{1F319}',
    label: 'Nuit nuageuse',
    particles: ['\u{1F319}', '\u2601\uFE0F', '\u2728'],
    overlayOpacity: 0.03,
    kidMessage: 'Nuit nuageuse.',
    tip: 'Bientôt au lit.',
  },
  cloudy: {
    gradient: ['#766F68', '#B8AEDF'],
    emoji: '\u2601\uFE0F',
    label: 'Nuit couverte',
    particles: ['\u2601\uFE0F', '\u{1F319}'],
    overlayOpacity: 0.04,
    kidMessage: 'Nuit couverte.',
    tip: 'Au chaud.',
  },
  fog: {
    gradient: ['#7B746D', '#B8AEDF'],
    emoji: '\u{1F32B}\uFE0F',
    label: 'Nuit brumeuse',
    particles: ['\u{1F32B}\uFE0F', '\u{1F319}'],
    overlayOpacity: 0.05,
    kidMessage: 'Soir brumeux.',
    tip: 'On reste au calme.',
  },
  rain: {
    gradient: ['#6F6A93', '#A8C79D'],
    emoji: '\u{1F327}\uFE0F',
    label: 'Pluie nocturne',
    particles: ['\u{1F4A7}', '\u{1F327}\uFE0F', '\u{1F319}'],
    overlayOpacity: 0.04,
    kidMessage: 'Pluie ce soir.',
    tip: 'Bonne nuit.',
  },
  snow: {
    gradient: ['#756FB0', '#E6E1F7'],
    emoji: '\u2744\uFE0F',
    label: 'Neige nocturne',
    particles: ['\u2744\uFE0F', '\u{1F319}', '\u2728'],
    overlayOpacity: 0.03,
    kidMessage: 'Neige ce soir.',
    tip: 'Prévoir chaud.',
  },
  thunderstorm: {
    gradient: ['#625C7B', '#A79AD6'],
    emoji: '\u26C8\uFE0F',
    label: 'Orage nocturne',
    particles: ['\u26A1', '\u26C8\uFE0F', '\u{1F319}'],
    overlayOpacity: 0.06,
    kidMessage: 'Orage dehors.',
    tip: "À l'abri.",
  },
};

export function getWeatherTheme(
  condition: WeatherCondition,
  isDayOrMode: boolean | WeatherTimeMode,
): WeatherTheme {
  const isDay = typeof isDayOrMode === 'boolean' ? isDayOrMode : isDayOrMode === 'day';
  return isDay ? DAY_THEMES[condition] : NIGHT_THEMES[condition];
}

export function getWeatherAsset(condition: WeatherCondition, mode: WeatherTimeMode): string {
  return getWeatherTheme(condition, mode).emoji;
}

export const DEFAULT_WEATHER_THEME = DAY_THEMES.clear;

export function getWeatherTextColor(isDay: boolean) {
  return isDay ? '#3F3A36' : '#FFFDF8';
}

export function getWeatherSecondaryTextColor(isDay: boolean) {
  return isDay ? '#857B72' : '#F5EDE2';
}
