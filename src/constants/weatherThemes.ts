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
    gradient: ['#FFF8F0', '#FFE8D6'],
    emoji: '☀️',
    label: 'Ensoleillé',
    particles: ['☀️', '🌻', '🦋'],
    overlayOpacity: 0,
    kidMessage: 'Le soleil brille fort aujourd\'hui !',
    tip: 'Pense à mettre de la crème solaire ☀️',
  },
  partly_cloudy: {
    gradient: ['#F0F4FF', '#E8EDF5'],
    emoji: '⛅',
    label: 'Nuageux',
    particles: ['⛅', '☁️', '🌤️'],
    overlayOpacity: 0.03,
    kidMessage: 'Les nuages jouent à cache-cache avec le soleil !',
    tip: 'Prends une petite veste au cas où 🧥',
  },
  cloudy: {
    gradient: ['#E8ECF0', '#D5DAE0'],
    emoji: '☁️',
    label: 'Couvert',
    particles: ['☁️', '🌥️'],
    overlayOpacity: 0.05,
    kidMessage: 'Les nuages font un gros câlin au ciel !',
    tip: 'Une veste, c\'est plus prudent 🧥',
  },
  fog: {
    gradient: ['#EAECEE', '#D5D8DC'],
    emoji: '🌫️',
    label: 'Brouillard',
    particles: ['🌫️', '💨'],
    overlayOpacity: 0.06,
    kidMessage: 'On dirait que les nuages sont tombés par terre !',
    tip: 'Fais attention en marchant dehors 👀',
  },
  rain: {
    gradient: ['#D6E4F0', '#B8CDE0'],
    emoji: '🌧️',
    label: 'Pluie',
    particles: ['💧', '🌧️', '☔'],
    overlayOpacity: 0.05,
    kidMessage: 'Plic ploc ! Il pleut des gouttes !',
    tip: 'N\'oublie pas ton parapluie et tes bottes ☔',
  },
  snow: {
    gradient: ['#F0F5FF', '#E0E8F5'],
    emoji: '❄️',
    label: 'Neige',
    particles: ['❄️', '⛄', '🌨️'],
    overlayOpacity: 0.03,
    kidMessage: 'Il neige ! Dehors c\'est tout blanc !',
    tip: 'Habille-toi bien chaud : bonnet et gants ! 🧤',
  },
  thunderstorm: {
    gradient: ['#C8D0DC', '#A0AAB8'],
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
    gradient: ['#1A1A2E', '#16213E'],
    emoji: '🌙',
    label: 'Nuit claire',
    particles: ['🌙', '⭐', '✨'],
    overlayOpacity: 0,
    kidMessage: 'Les étoiles brillent dans le ciel !',
    tip: 'C\'est l\'heure de se préparer pour le dodo 🛏️',
  },
  partly_cloudy: {
    gradient: ['#1E2030', '#252840'],
    emoji: '🌙',
    label: 'Nuit nuageuse',
    particles: ['🌙', '☁️', '✨'],
    overlayOpacity: 0.03,
    kidMessage: 'La lune joue à cache-cache avec les nuages !',
    tip: 'Bientôt au lit, demain sera super 🌟',
  },
  cloudy: {
    gradient: ['#1C1C2E', '#2A2A3E'],
    emoji: '☁️',
    label: 'Nuit couverte',
    particles: ['☁️', '🌙'],
    overlayOpacity: 0.05,
    kidMessage: 'Les nuages font une couverture au ciel !',
    tip: 'Bien au chaud sous ta couette 🛌',
  },
  fog: {
    gradient: ['#1E1E30', '#2C2C40'],
    emoji: '🌫️',
    label: 'Nuit brumeuse',
    particles: ['🌫️', '🌙'],
    overlayOpacity: 0.06,
    kidMessage: 'La brume fait un voile magique dehors !',
    tip: 'Reste au chaud ce soir 🏡',
  },
  rain: {
    gradient: ['#1A1A30', '#252540'],
    emoji: '🌧️',
    label: 'Pluie nocturne',
    particles: ['💧', '🌧️', '🌙'],
    overlayOpacity: 0.05,
    kidMessage: 'La pluie chante une berceuse !',
    tip: 'Écoute la pluie tomber… bonne nuit 💤',
  },
  snow: {
    gradient: ['#202035', '#2A2A45'],
    emoji: '❄️',
    label: 'Neige nocturne',
    particles: ['❄️', '🌙', '✨'],
    overlayOpacity: 0.03,
    kidMessage: 'La neige tombe tout doucement dans la nuit !',
    tip: 'Demain matin, tout sera blanc dehors ⛄',
  },
  thunderstorm: {
    gradient: ['#151525', '#1E1E35'],
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
  return isDay ? '#2D3436' : '#F0F0F0';
}

export function getWeatherSecondaryTextColor(isDay: boolean) {
  return isDay ? '#636E72' : '#C8C8D8';
}
