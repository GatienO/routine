import { WeatherCondition } from '../services/weather';

export interface WeatherTheme {
  gradient: [string, string];
  emoji: string;
  label: string;
  particles: string[];      // floating emojis
  overlayOpacity: number;   // subtle overlay intensity
  kidMessage: string;       // fun message for children
  tip: string;              // practical tip for the day
}

const DAY_THEMES: Record<WeatherCondition, WeatherTheme> = {
  clear: {
    gradient: ['#C5EBC0', '#EEF9E8'],
    emoji: '☀️',
    label: 'Ensoleillé',
    particles: ['☀️', '🌻', '🦋'],
    overlayOpacity: 0,
    kidMessage: 'Le soleil brille fort aujourd\'hui !',
    tip: 'Pense à mettre de la crème solaire ☀️',
  },
  partly_cloudy: {
    gradient: ['#D4EED0', '#F1FAEA'],
    emoji: '⛅',
    label: 'Nuageux',
    particles: ['⛅', '☁️', '🌤️'],
    overlayOpacity: 0.03,
    kidMessage: 'Les nuages jouent à cache-cache avec le soleil !',
    tip: 'Prends une petite veste au cas où 🧥',
  },
  cloudy: {
    gradient: ['#CDE5C7', '#E7F4E0'],
    emoji: '☁️',
    label: 'Couvert',
    particles: ['☁️', '🌥️'],
    overlayOpacity: 0.05,
    kidMessage: 'Les nuages font un gros câlin au ciel !',
    tip: 'Une veste, c\'est plus prudent 🧥',
  },
  fog: {
    gradient: ['#D9ECD4', '#F0F8EA'],
    emoji: '🌫️',
    label: 'Brouillard',
    particles: ['🌫️', '💨'],
    overlayOpacity: 0.06,
    kidMessage: 'On dirait que les nuages sont tombés par terre !',
    tip: 'Fais attention en marchant dehors 👀',
  },
  rain: {
    gradient: ['#BFE3C4', '#DDF1DA'],
    emoji: '🌧️',
    label: 'Pluie',
    particles: ['💧', '🌧️', '☔'],
    overlayOpacity: 0.05,
    kidMessage: 'Plic ploc ! Il pleut des gouttes !',
    tip: 'N\'oublie pas ton parapluie et tes bottes ☔',
  },
  snow: {
    gradient: ['#E4F5DE', '#F6FCF0'],
    emoji: '❄️',
    label: 'Neige',
    particles: ['❄️', '⛄', '🌨️'],
    overlayOpacity: 0.03,
    kidMessage: 'Il neige ! Dehors c\'est tout blanc !',
    tip: 'Habille-toi bien chaud : bonnet et gants ! 🧤',
  },
  thunderstorm: {
    gradient: ['#B5D7B2', '#D3E9CD'],
    emoji: '⛈️',
    label: 'Orage',
    particles: ['⚡', '🌩️', '💨'],
    overlayOpacity: 0.08,
    kidMessage: 'Boum ! Les nuages font du bruit !',
    tip: 'On reste bien au chaud à l\'intérieur 🏠',
  },
};

const NIGHT_THEMES: Record<WeatherCondition, WeatherTheme> = {
  clear: {
    gradient: ['#2F5F45', '#6E956E'],
    emoji: '🌙',
    label: 'Nuit claire',
    particles: ['🌙', '⭐', '✨'],
    overlayOpacity: 0,
    kidMessage: 'Les étoiles brillent dans le ciel !',
    tip: 'C\'est l\'heure de se préparer pour le dodo 🛏️',
  },
  partly_cloudy: {
    gradient: ['#365F47', '#789B72'],
    emoji: '🌙',
    label: 'Nuit nuageuse',
    particles: ['🌙', '☁️', '✨'],
    overlayOpacity: 0.03,
    kidMessage: 'La lune joue à cache-cache avec les nuages !',
    tip: 'Bientôt au lit, demain sera super 🌟',
  },
  cloudy: {
    gradient: ['#3E664D', '#7F9F78'],
    emoji: '☁️',
    label: 'Nuit couverte',
    particles: ['☁️', '🌙'],
    overlayOpacity: 0.05,
    kidMessage: 'Les nuages font une couverture au ciel !',
    tip: 'Bien au chaud sous ta couette 🛌',
  },
  fog: {
    gradient: ['#486C54', '#8AA783'],
    emoji: '🌫️',
    label: 'Nuit brumeuse',
    particles: ['🌫️', '🌙'],
    overlayOpacity: 0.06,
    kidMessage: 'La brume fait un voile magique dehors !',
    tip: 'Reste au chaud ce soir 🏡',
  },
  rain: {
    gradient: ['#2F5945', '#6F8F6C'],
    emoji: '🌧️',
    label: 'Pluie nocturne',
    particles: ['💧', '🌧️', '🌙'],
    overlayOpacity: 0.05,
    kidMessage: 'La pluie chante une berceuse !',
    tip: 'Écoute la pluie tomber… bonne nuit 💤',
  },
  snow: {
    gradient: ['#57775F', '#95AD8A'],
    emoji: '❄️',
    label: 'Neige nocturne',
    particles: ['❄️', '🌙', '✨'],
    overlayOpacity: 0.03,
    kidMessage: 'La neige tombe tout doucement dans la nuit !',
    tip: 'Demain matin, tout sera blanc dehors ⛄',
  },
  thunderstorm: {
    gradient: ['#284836', '#627E5C'],
    emoji: '⛈️',
    label: 'Orage nocturne',
    particles: ['⚡', '🌩️', '🌙'],
    overlayOpacity: 0.08,
    kidMessage: 'L\'orage gronde mais tu es en sécurité !',
    tip: 'Pas de peur, tu es bien à l\'abri 🏠💪',
  },
};

export function getWeatherTheme(
  condition: WeatherCondition,
  isDay: boolean,
): WeatherTheme {
  return isDay ? DAY_THEMES[condition] : NIGHT_THEMES[condition];
}

/** Default fallback (sunny day) */
export const DEFAULT_WEATHER_THEME = DAY_THEMES.clear;

/** Text color for night mode */
export function getWeatherTextColor(isDay: boolean) {
  return isDay ? '#486A50' : '#F5FBF0';
}

export function getWeatherSecondaryTextColor(isDay: boolean) {
  return isDay ? '#668766' : '#DDEED8';
}
