import { Routine } from '../types';
import {
  Activity,
  ActivityWeather,
  AgeRangeId,
  DurationOption,
  ParentEnergy,
} from '../features/activities/types';
import {
  DayMomentFilter,
  ROUTINE_CATEGORY_TO_MOMENT,
  SharedContextFilters,
} from '../types/contextFilters';
import { WeatherData } from '../services/weather';

export function getDayMomentFilter(date = new Date()): DayMomentFilter {
  const hour = date.getHours();
  if (hour < 11) return 'morning';
  if (hour < 14) return 'midday';
  if (hour < 18) return 'afternoon';
  return 'evening';
}

export function getWeatherActivityFilter(weather: WeatherData): ActivityWeather {
  if (weather.condition === 'rain' || weather.condition === 'thunderstorm') return 'rainy';
  if (weather.condition === 'clear' && weather.isDay && weather.dayForecast.maxTemperature >= 18) return 'sunny';
  return 'any';
}

export function getRoutineContextFilters(routine: Routine): SharedContextFilters {
  const duration = routine.steps.reduce((sum, step) => sum + step.durationMinutes, 0);

  return {
    category: routine.category,
    childId: routine.childId,
    duration: toDurationOption(duration),
    moment: ROUTINE_CATEGORY_TO_MOMENT[routine.category],
    place: routine.category === 'school' ? 'outdoor' : 'any',
  };
}

export function getActivityContextFilters(activity: Activity): SharedContextFilters {
  return {
    ageRange: toAgeRangeId(activity.ageMin, activity.ageMax),
    duration: toDurationOption(activity.duration),
    energy: activity.parentEnergy,
    place: activity.weather === 'indoor' ? 'indoor' : activity.weather === 'outdoor' || activity.weather === 'sunny' ? 'outdoor' : 'any',
    weather: activity.weather,
    autonomy: activity.independenceLevel,
    category: activity.activityType,
  };
}

function toAgeRangeId(ageMin: number, ageMax: number): AgeRangeId | undefined {
  const ranges: Array<{ id: AgeRangeId; min: number; max: number }> = [
    { id: '1-2', min: 1, max: 2 },
    { id: '2-3', min: 2, max: 3 },
    { id: '3-4', min: 3, max: 4 },
    { id: '4-6', min: 4, max: 6 },
    { id: '6-8', min: 6, max: 8 },
    { id: '8-10', min: 8, max: 10 },
    { id: '10-12', min: 10, max: 12 },
  ];

  return ranges.find((range) => ageMin <= range.max && ageMax >= range.min)?.id;
}

export function toDurationOption(durationMinutes: number): DurationOption {
  if (durationMinutes <= 5) return 5;
  if (durationMinutes <= 10) return 10;
  if (durationMinutes <= 15) return 15;
  if (durationMinutes <= 30) return 30;
  return 45;
}

export function toParentEnergyFilter(isLowAttention: boolean): ParentEnergy {
  return isLowAttention ? 'ko' : 'medium';
}
