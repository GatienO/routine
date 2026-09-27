import { RoutineCategory } from './index';
import {
  ActivityWeather,
  AgeRangeId,
  DurationOption,
  IndependenceLevel,
  ParentEnergy,
} from '../features/activities/types';

export type DayMomentFilter = 'morning' | 'midday' | 'afternoon' | 'evening';
export type PlaceFilter = 'indoor' | 'outdoor' | 'any';

export interface SharedContextFilters {
  ageRange?: AgeRangeId;
  duration?: DurationOption;
  energy?: ParentEnergy;
  place?: PlaceFilter;
  moment?: DayMomentFilter;
  weather?: ActivityWeather;
  autonomy?: IndependenceLevel;
  category?: RoutineCategory | string;
  childId?: string;
}

export const ROUTINE_CATEGORY_TO_MOMENT: Partial<Record<RoutineCategory, DayMomentFilter>> = {
  morning: 'morning',
  school: 'morning',
  evening: 'evening',
  weekend: 'midday',
};
