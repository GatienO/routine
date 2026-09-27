import { CalendarEvent } from '../types/calendar';
import { Routine } from '../types';
import { Activity } from '../features/activities/types';
import {
  OutfitPlan,
  OutfitVisualId,
  StructuredOutfit,
  TempLevel,
  WeatherLevel,
  buildStructuredOutfit,
  OutfitTile,
  buildOutfitExtras,
  buildOutfitTile,
  getTempLevel,
  structuredOutfitToPlan,
} from '../constants/weatherOutfits';
import { WeatherCondition, WeatherData } from './weather';
import { getClothingRecommendation } from './weatherClothingRecommendation';
import {
  getDayTimeConfig,
  getWeatherTimeMode,
  isTimeWithinNextMinutes,
} from '../utils/weatherTimeConfig';
import type { WeatherTimeMode, WeeklyTimeConfig } from '../utils/weatherTimeConfig';

export type WeatherCardTone =
  | 'sun'
  | 'cloud'
  | 'rain'
  | 'storm'
  | 'cold'
  | 'heat'
  | 'wind'
  | 'morning'
  | 'evening'
  | 'night'
  | 'nightRain'
  | 'nightStorm'
  | 'nightCold'
  | 'nightWind';

export interface WeatherCardPalette {
  tone: WeatherCardTone;
  gradient: [string, string];
  shadowColor: string;
  titleColor: string;
  subtitleColor: string;
  metaColor: string;
  tileGradient: [string, string];
  tileBorderColor: string;
}

export interface WeatherDayContextInput {
  events?: CalendarEvent[];
  routines?: Routine[];
  currentActivity?: Activity;
  recentActivities?: Activity[];
  childId?: string | null;
  date?: Date;
  timeConfig?: WeeklyTimeConfig;
}

export interface ContextualWeatherModel {
  message: string;
  headline: string;
  tempLevel: TempLevel;
  weatherLevel: WeatherLevel;
  structuredOutfit: StructuredOutfit;
  outfitPlan: OutfitPlan;
  palette: WeatherCardPalette;
  timeMode: WeatherTimeMode;
  contextLabel?: string;
}

const RAIN_THRESHOLD = 35;
const STRONG_WIND_KMH = 38;

const PALETTES: Record<WeatherCardTone, WeatherCardPalette> = {
  sun: {
    tone: 'sun',
    gradient: ['#FFD97A', '#FFAE62'],
    shadowColor: '#B77A32',
    titleColor: '#FFFFFF',
    subtitleColor: 'rgba(255,255,255,0.9)',
    metaColor: 'rgba(75, 54, 25, 0.72)',
    tileGradient: ['rgba(255,255,255,0.58)', 'rgba(255,255,255,0.36)'],
    tileBorderColor: 'rgba(255,255,255,0.38)',
  },
  heat: {
    tone: 'heat',
    gradient: ['#FFD06E', '#FFA54F'],
    shadowColor: '#B77A32',
    titleColor: '#FFFFFF',
    subtitleColor: 'rgba(255,255,255,0.9)',
    metaColor: 'rgba(75, 54, 25, 0.72)',
    tileGradient: ['rgba(255,255,255,0.6)', 'rgba(255,255,255,0.35)'],
    tileBorderColor: 'rgba(255,255,255,0.38)',
  },
  cloud: {
    tone: 'cloud',
    gradient: ['#E9EEF8', '#C8D6EF'],
    shadowColor: '#7A8FB8',
    titleColor: '#40506E',
    subtitleColor: 'rgba(64,80,110,0.78)',
    metaColor: 'rgba(64,80,110,0.7)',
    tileGradient: ['rgba(255,255,255,0.72)', 'rgba(255,255,255,0.42)'],
    tileBorderColor: 'rgba(255,255,255,0.58)',
  },
  rain: {
    tone: 'rain',
    gradient: ['#DCEAF4', '#AFC8DC'],
    shadowColor: '#6D8CA8',
    titleColor: '#FFFFFF',
    subtitleColor: 'rgba(255,255,255,0.86)',
    metaColor: 'rgba(45,67,85,0.72)',
    tileGradient: ['rgba(255,255,255,0.64)', 'rgba(255,255,255,0.36)'],
    tileBorderColor: 'rgba(255,255,255,0.45)',
  },
  storm: {
    tone: 'storm',
    gradient: ['#D7D2F0', '#A9A0D1'],
    shadowColor: '#756BA5',
    titleColor: '#FFFFFF',
    subtitleColor: 'rgba(255,255,255,0.86)',
    metaColor: 'rgba(52,45,82,0.72)',
    tileGradient: ['rgba(255,255,255,0.58)', 'rgba(255,255,255,0.34)'],
    tileBorderColor: 'rgba(255,255,255,0.42)',
  },
  cold: {
    tone: 'cold',
    gradient: ['#EAF3F8', '#C9DDEA'],
    shadowColor: '#7C9CAF',
    titleColor: '#405B6B',
    subtitleColor: 'rgba(64,91,107,0.78)',
    metaColor: 'rgba(64,91,107,0.7)',
    tileGradient: ['rgba(255,255,255,0.76)', 'rgba(255,255,255,0.46)'],
    tileBorderColor: 'rgba(255,255,255,0.56)',
  },
  wind: {
    tone: 'wind',
    gradient: ['#E8F1EC', '#BFD8C9'],
    shadowColor: '#6F9B82',
    titleColor: '#395A47',
    subtitleColor: 'rgba(57,90,71,0.78)',
    metaColor: 'rgba(57,90,71,0.7)',
    tileGradient: ['rgba(255,255,255,0.74)', 'rgba(255,255,255,0.42)'],
    tileBorderColor: 'rgba(255,255,255,0.54)',
  },
  morning: {
    tone: 'morning',
    gradient: ['#FAF6EE', '#F3E8D4'],
    shadowColor: '#B8A078',
    titleColor: '#4C4438',
    subtitleColor: 'rgba(76,68,56,0.76)',
    metaColor: 'rgba(76,68,56,0.66)',
    tileGradient: ['rgba(255,255,255,0.78)', 'rgba(255,255,255,0.5)'],
    tileBorderColor: 'rgba(232,221,203,0.85)',
  },
  evening: {
    tone: 'evening',
    gradient: ['#F4DFD7', '#D8D2F0'],
    shadowColor: '#AA8798',
    titleColor: '#51445C',
    subtitleColor: 'rgba(81,68,92,0.76)',
    metaColor: 'rgba(81,68,92,0.66)',
    tileGradient: ['rgba(255,255,255,0.72)', 'rgba(255,255,255,0.44)'],
    tileBorderColor: 'rgba(255,255,255,0.52)',
  },
  night: {
    tone: 'night',
    gradient: ['#6F6A93', '#B8AEDF'],
    shadowColor: '#5B527E',
    titleColor: '#FFFDF8',
    subtitleColor: 'rgba(255,253,248,0.84)',
    metaColor: 'rgba(255,253,248,0.72)',
    tileGradient: ['rgba(255,255,255,0.24)', 'rgba(255,255,255,0.14)'],
    tileBorderColor: 'rgba(255,255,255,0.22)',
  },
  nightRain: {
    tone: 'nightRain',
    gradient: ['#667D9B', '#A8B8CF'],
    shadowColor: '#52677F',
    titleColor: '#FFFDF8',
    subtitleColor: 'rgba(255,253,248,0.84)',
    metaColor: 'rgba(255,253,248,0.72)',
    tileGradient: ['rgba(255,255,255,0.26)', 'rgba(255,255,255,0.14)'],
    tileBorderColor: 'rgba(255,255,255,0.24)',
  },
  nightStorm: {
    tone: 'nightStorm',
    gradient: ['#5E587B', '#9A91C5'],
    shadowColor: '#4C466C',
    titleColor: '#FFFDF8',
    subtitleColor: 'rgba(255,253,248,0.84)',
    metaColor: 'rgba(255,253,248,0.72)',
    tileGradient: ['rgba(255,255,255,0.24)', 'rgba(255,255,255,0.13)'],
    tileBorderColor: 'rgba(255,255,255,0.22)',
  },
  nightCold: {
    tone: 'nightCold',
    gradient: ['#6D7F93', '#C7D7E5'],
    shadowColor: '#536879',
    titleColor: '#FFFDF8',
    subtitleColor: 'rgba(255,253,248,0.84)',
    metaColor: 'rgba(255,253,248,0.72)',
    tileGradient: ['rgba(255,255,255,0.28)', 'rgba(255,255,255,0.16)'],
    tileBorderColor: 'rgba(255,255,255,0.24)',
  },
  nightWind: {
    tone: 'nightWind',
    gradient: ['#667E74', '#A8C79D'],
    shadowColor: '#536C61',
    titleColor: '#FFFDF8',
    subtitleColor: 'rgba(255,253,248,0.84)',
    metaColor: 'rgba(255,253,248,0.72)',
    tileGradient: ['rgba(255,255,255,0.26)', 'rgba(255,255,255,0.15)'],
    tileBorderColor: 'rgba(255,255,255,0.24)',
  },
};

const TEXT_OUTDOOR = [
  'dehors',
  'extérieur',
  'exterieur',
  'jardin',
  'parc',
  'sortie',
  'balade',
  'promenade',
  'sport',
];

const TEXT_SCHOOL = ['école', 'ecole', 'crèche', 'creche', 'garderie', 'cantine'];
const TEXT_POOL = ['piscine', 'natation', 'maillot'];
const TEXT_SLEEP = ['dodo', 'coucher', 'pyjama', 'soir'];

function normalize(value: string): string {
  return value
    .toLocaleLowerCase('fr-FR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function eventText(event: CalendarEvent): string {
  return normalize(`${event.title} ${event.description ?? ''} ${event.kind}`);
}

function routineText(routine: Routine): string {
  return normalize(`${routine.name} ${routine.description ?? ''} ${routine.category}`);
}

function includesTerm(value: string, terms: string[]): boolean {
  return terms.some((term) => value.includes(normalize(term)));
}

function isRainy(weather: WeatherData): boolean {
  return (
    weather.condition === 'rain' ||
    weather.condition === 'thunderstorm' ||
    weather.dayForecast.hasRain ||
    weather.dayForecast.hasThunderstorm ||
    (weather.dayForecast.precipitationProbability ?? 0) >= RAIN_THRESHOLD
  );
}

function isHot(weather: WeatherData): boolean {
  return weather.dayForecast.maxTemperature >= 29 || weather.temperature >= 28;
}

function isCold(weather: WeatherData): boolean {
  return weather.temperature <= 8 || weather.dayForecast.minTemperature <= 6;
}

function isWindy(weather: WeatherData): boolean {
  return (weather.dayForecast.maxWindSpeed ?? weather.windSpeed ?? 0) >= STRONG_WIND_KMH;
}

function getWeatherLevel(weather: WeatherData): WeatherLevel {
  if (weather.condition === 'snow' || weather.dayForecast.hasSnow) {
    return {
      ...getTempLevel(Math.min(weather.temperature, 5)),
      level: 'very_cold',
      label: 'Neige dehors !',
      sublabel: 'Manteau, bonnet, gants',
      colorKey: 'blue',
    };
  }

  if (weather.condition === 'thunderstorm' || weather.dayForecast.hasThunderstorm) {
    return {
      ...getTempLevel(weather.temperature),
      level: 'cold',
      label: 'Orage possible !',
      sublabel: 'Imperméable obligatoire',
      colorKey: 'purple',
    };
  }

  if (isRainy(weather)) {
    return {
      ...getTempLevel(weather.temperature),
      level: 'cold',
      label: 'Pluie prévue !',
      sublabel: 'Imperméable et bottes',
      colorKey: 'blue',
    };
  }

  return getTempLevel(weather.temperature);
}

function getPalette(weather: WeatherData, date: Date, timeMode: WeatherTimeMode): WeatherCardPalette {
  if (timeMode === 'night') {
    if (weather.condition === 'thunderstorm' || weather.dayForecast.hasThunderstorm) return PALETTES.nightStorm;
    if (isRainy(weather)) return PALETTES.nightRain;
    if (isCold(weather) || weather.condition === 'snow') return PALETTES.nightCold;
    if (isWindy(weather)) return PALETTES.nightWind;
    return PALETTES.night;
  }
  if (weather.condition === 'thunderstorm') return PALETTES.storm;
  if (isRainy(weather)) return PALETTES.rain;
  if (isCold(weather) || weather.condition === 'snow') return PALETTES.cold;
  if (isHot(weather)) return PALETTES.heat;
  if (isWindy(weather)) return PALETTES.wind;
  if (date.getHours() >= 17) return PALETTES.evening;
  if (date.getHours() < 10) return PALETTES.morning;
  if (weather.condition === 'cloudy' || weather.condition === 'partly_cloudy' || weather.condition === 'fog') {
    return PALETTES.cloud;
  }
  return PALETTES.sun;
}

function matchesChild(event: CalendarEvent, childId?: string | null): boolean {
  return !childId || event.childIds.includes(childId);
}

function matchesRoutineChild(routine: Routine, childId?: string | null): boolean {
  return !childId || routine.childId === childId;
}

function buildContextTiles(ids: OutfitVisualId[]): OutfitTile[] {
  const uniqueIds = [...new Set(ids)];
  if (uniqueIds.includes('short') && uniqueIds.includes('robe')) {
    return [
      ...uniqueIds
        .filter((id) => id !== 'short' && id !== 'robe')
        .map((id) => buildOutfitTile([id])),
      buildOutfitTile(['short', 'robe']),
    ];
  }
  return uniqueIds.map((id) => buildOutfitTile([id]));
}

function mergeTiles(priority: OutfitTile[], base: OutfitTile[]): OutfitTile[] {
  const seen = new Set<string>();
  const merged: OutfitTile[] = [];

  [...priority, ...base].forEach((tile) => {
    const key = tile.items.map((item) => item.id).join('-');
    if (seen.has(key)) return;
    seen.add(key);
    merged.push(tile);
  });

  return merged;
}

export function getContextualWeatherModel(
  weather: WeatherData,
  input: WeatherDayContextInput = {},
): ContextualWeatherModel {
  const date = input.date ?? new Date();
  const timeMode = getWeatherTimeMode(date, input.timeConfig);
  const dayConfig = getDayTimeConfig(input.timeConfig ?? { days: [] }, date);
  const events = (input.events ?? []).filter((event) => matchesChild(event, input.childId));
  const routines = (input.routines ?? []).filter((routine) => matchesRoutineChild(routine, input.childId));
  const base = getClothingRecommendation(weather, date);
  const eventTexts = events.map(eventText);
  const routineTexts = routines.map(routineText);
  const hasOutdoorEvent = eventTexts.some((text) => includesTerm(text, TEXT_OUTDOOR));
  const hasSchoolEvent = eventTexts.some((text) => includesTerm(text, TEXT_SCHOOL));
  const hasPoolEvent = eventTexts.some((text) => includesTerm(text, TEXT_POOL));
  const hasSchoolRoutine = routines.some((routine) => routine.category === 'school' || includesTerm(routineText(routine), TEXT_SCHOOL));
  const hasEveningRoutine = routines.some((routine) => routine.category === 'evening' || includesTerm(routineText(routine), TEXT_SLEEP));
  const hasOutdoorActivity =
    input.currentActivity?.weather === 'outdoor' ||
    input.currentActivity?.weather === 'sunny' ||
    input.currentActivity?.activityType === 'outdoor';
  const hasIndoorActivity = input.currentActivity?.weather === 'indoor';
  const hasRecentOutdoorActivity = (input.recentActivities ?? []).some(
    (activity) => activity.weather === 'outdoor' || activity.weather === 'sunny' || activity.activityType === 'outdoor',
  );

  const weatherLevel = getWeatherLevel(weather);
  const outdoorPlanned = hasOutdoorEvent || hasOutdoorActivity || hasRecentOutdoorActivity;
  const schoolPlanned = hasSchoolEvent || hasSchoolRoutine;
  const eveningPlanned = hasEveningRoutine && timeMode === 'night';
  const napSoon = dayConfig.napEnabled && isTimeWithinNextMinutes(dayConfig.napTime, date, 45);
  const bedtimeSoon = isTimeWithinNextMinutes(dayConfig.bedtime, date, 75);
  const contextIds: OutfitVisualId[] = [];
  let message = base.childMessage;
  let headline = base.outfitPlan.headline;
  let contextLabel: string | undefined;
  let sleepMode = false;

  if (eveningPlanned || bedtimeSoon) {
    sleepMode = true;
    message = 'Soirée calme. Pyjama + doudou.';
    message = bedtimeSoon ? 'Dodo bient\u00F4t. Pyjama + doudou.' : 'Soir\u00E9e calme. Pyjama + doudou.';
    headline = 'Ambiance dodo';
    contextLabel = 'Routine du soir';
    contextIds.push(weather.nightForecast.minTemperature <= 16 ? 'pyjamaHiver' : 'pyjamaEte', 'doudou');
    if (bedtimeSoon && !eveningPlanned) {
      message = 'Dodo bient\u00F4t. Pyjama + doudou.';
      contextLabel = 'Coucher';
    }
  } else if (napSoon) {
    sleepMode = true;
    message = 'Sieste bient\u00F4t. On ralentit.';
    headline = 'Moment calme';
    contextLabel = 'Sieste';
    contextIds.push(weather.nightForecast.minTemperature <= 16 ? 'pyjamaHiver' : 'pyjamaEte', 'doudou');
  } else if (timeMode === 'night') {
    sleepMode = true;
    message = 'Soir\u00E9e douce. On ralentit.';
    headline = 'Mode soir';
    contextLabel = 'Soir\u00E9e';
    contextIds.push(weather.nightForecast.minTemperature <= 16 ? 'pyjamaHiver' : 'pyjamaEte', 'doudou');
  } else if (hasPoolEvent) {
    message = 'Piscine prévue. Sac prêt.';
    headline = 'Penser au sac';
    contextLabel = 'Calendrier';
    contextIds.push('maillot', 'sandales');
  } else if (outdoorPlanned && isRainy(weather)) {
    message = 'Sortie dehors. Bottes + imperméable.';
    headline = 'Pluie prévue';
    contextLabel = hasOutdoorActivity ? 'Activité dehors' : 'Calendrier';
    contextIds.push('bottes', 'impermeable');
  } else if (outdoorPlanned && isHot(weather)) {
    message = 'Sortie dehors. Casquette + eau.';
    headline = 'Soleil fort';
    contextLabel = hasOutdoorActivity ? 'Activité dehors' : 'Calendrier';
    contextIds.push('casquette', 'bouteille', 'lunettes');
  } else if (outdoorPlanned && isCold(weather)) {
    message = 'Sortie dehors. Manteau + bonnet.';
    headline = 'Bien couvert';
    contextLabel = hasOutdoorActivity ? 'Activité dehors' : 'Calendrier';
    contextIds.push('manteau', 'bonnet');
  } else if (schoolPlanned) {
    message = hasSchoolEvent ? 'École aujourd’hui. Chaussures + veste.' : 'Routine école. Chaussures + veste.';
    headline = 'Départ préparé';
    contextLabel = hasSchoolEvent ? 'Calendrier' : 'Routine';
    contextIds.push('chaussures', 'chaussettes', isCold(weather) || isWindy(weather) ? 'pull' : 'vesteLegere');
  } else if (hasIndoorActivity && isRainy(weather)) {
    message = 'Pluie dehors. Activité dedans.';
    headline = 'Bon choix';
    contextLabel = 'Activité';
  }

  if (!sleepMode && (weather.condition === 'snow' || weather.dayForecast.hasSnow)) {
    message = 'Neige dehors. Manteau + bonnet.';
    headline = 'Bien couvert';
  } else if (
    !sleepMode &&
    isRainy(weather) &&
    !message.toLocaleLowerCase('fr-FR').includes('pluie') &&
    !contextIds.includes('impermeable') &&
    !contextIds.includes('bottes')
  ) {
    message = 'Pluie prévue. Imperméable.';
    headline = 'Prévoir la pluie';
  }

  const baseIds = base.structuredOutfit.zones.flatMap((zone) => zone.items) as OutfitVisualId[];
  const structuredOutfit = buildStructuredOutfit(
    sleepMode ? contextIds : [...contextIds, ...baseIds],
    sleepMode,
  );
  const priorityTiles = buildContextTiles(contextIds);
  const outfitPlan: OutfitPlan = sleepMode
    ? structuredOutfitToPlan(structuredOutfit, headline)
    : {
        headline,
        tiles: mergeTiles(priorityTiles, base.outfitPlan.tiles),
        extras: buildOutfitExtras(base.outfitPlan.extras.map((item) => item.id)),
      };

  return {
    message,
    headline,
    tempLevel: weatherLevel.level,
    weatherLevel,
    structuredOutfit,
    outfitPlan,
    palette: getPalette(weather, date, timeMode),
    timeMode,
    contextLabel,
  };
}

export function isOutdoorContext(event: CalendarEvent | Activity | Routine): boolean {
  if ('weather' in event) {
    return event.weather === 'outdoor' || event.weather === 'sunny' || event.activityType === 'outdoor';
  }
  if ('kind' in event) {
    return includesTerm(eventText(event), TEXT_OUTDOOR);
  }
  return event.category === 'school' || includesTerm(routineText(event), TEXT_OUTDOOR);
}
