export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type DayTimeConfig = {
  dayOfWeek: DayOfWeek;
  napEnabled: boolean;
  napTime: string;
  bedtime: string;
  nightStartTime: string;
};

export type WeeklyTimeConfig = {
  childId?: string;
  days: DayTimeConfig[];
};

export type WeatherTimeMode = 'day' | 'night';

const WEEK_DAYS: DayOfWeek[] = [0, 1, 2, 3, 4, 5, 6];
const SLOT_STEP_MINUTES = 15;

export const DEFAULT_NIGHT_START_TIME = '17:00';

export const DAY_LABELS: Record<DayOfWeek, string> = {
  0: 'Dimanche',
  1: 'Lundi',
  2: 'Mardi',
  3: 'Mercredi',
  4: 'Jeudi',
  5: 'Vendredi',
  6: 'Samedi',
};

export function parseTimeToMinutes(value: string): number {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return 0;

  const hours = Math.min(23, Math.max(0, Number(match[1])));
  const minutes = Math.min(59, Math.max(0, Number(match[2])));
  return hours * 60 + minutes;
}

export function formatMinutesAsTime(minutes: number): string {
  const dayMinutes = 24 * 60;
  const normalized = ((minutes % dayMinutes) + dayMinutes) % dayMinutes;
  const hours = Math.floor(normalized / 60).toString().padStart(2, '0');
  const mins = (normalized % 60).toString().padStart(2, '0');
  return `${hours}:${mins}`;
}

export function adjustTimeByStep(value: string, direction: -1 | 1): string {
  return formatMinutesAsTime(parseTimeToMinutes(value) + direction * SLOT_STEP_MINUTES);
}

export function generateTimeSlots(
  start = '05:00',
  end = '23:45',
  stepMinutes = SLOT_STEP_MINUTES,
): string[] {
  const slots: string[] = [];
  const startMinutes = parseTimeToMinutes(start);
  const endMinutes = parseTimeToMinutes(end);

  for (let minutes = startMinutes; minutes <= endMinutes; minutes += stepMinutes) {
    slots.push(formatMinutesAsTime(minutes));
  }

  return slots;
}

export function createDefaultWeeklyTimeConfig(childId?: string): WeeklyTimeConfig {
  return {
    ...(childId ? { childId } : {}),
    days: WEEK_DAYS.map((dayOfWeek) => {
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      return {
        dayOfWeek,
        napEnabled: true,
        napTime: isWeekend ? '13:30' : '13:00',
        bedtime: isWeekend ? '20:30' : '20:00',
        nightStartTime: DEFAULT_NIGHT_START_TIME,
      };
    }),
  };
}

export function normalizeWeeklyTimeConfig(config?: Partial<WeeklyTimeConfig> | null): WeeklyTimeConfig {
  const fallback = createDefaultWeeklyTimeConfig(config?.childId);
  const incomingDays = Array.isArray(config?.days) ? config.days : [];

  return {
    ...(config?.childId ? { childId: config.childId } : {}),
    days: fallback.days.map((fallbackDay) => {
      const incoming = incomingDays.find((day) => day?.dayOfWeek === fallbackDay.dayOfWeek);
      return {
        ...fallbackDay,
        ...(incoming ?? {}),
        dayOfWeek: fallbackDay.dayOfWeek,
        napEnabled: incoming?.napEnabled ?? fallbackDay.napEnabled,
        napTime: incoming?.napTime ?? fallbackDay.napTime,
        bedtime: incoming?.bedtime ?? fallbackDay.bedtime,
        nightStartTime: incoming?.nightStartTime ?? fallbackDay.nightStartTime,
      };
    }),
  };
}

export function resolveWeeklyTimeConfig(
  configs: WeeklyTimeConfig[],
  childId?: string | null,
): WeeklyTimeConfig {
  const childConfig = childId ? configs.find((config) => config.childId === childId) : undefined;
  const globalConfig = configs.find((config) => !config.childId);
  return normalizeWeeklyTimeConfig(childConfig ?? globalConfig ?? createDefaultWeeklyTimeConfig(childId ?? undefined));
}

export function getDayTimeConfig(config: WeeklyTimeConfig, date = new Date()): DayTimeConfig {
  const normalized = normalizeWeeklyTimeConfig(config);
  const dayOfWeek = date.getDay() as DayOfWeek;
  return normalized.days.find((day) => day.dayOfWeek === dayOfWeek) ?? normalized.days[0];
}

export function isNightTime(date = new Date(), config?: WeeklyTimeConfig | null): boolean {
  const dayConfig = getDayTimeConfig(normalizeWeeklyTimeConfig(config), date);
  return parseTimeToMinutes(formatMinutesAsTime(date.getHours() * 60 + date.getMinutes()))
    >= parseTimeToMinutes(dayConfig.nightStartTime);
}

export function getWeatherTimeMode(date = new Date(), config?: WeeklyTimeConfig | null): WeatherTimeMode {
  return isNightTime(date, config) ? 'night' : 'day';
}

export function isTimeWithinNextMinutes(targetTime: string, date = new Date(), minutesAhead = 45): boolean {
  const nowMinutes = date.getHours() * 60 + date.getMinutes();
  const targetMinutes = parseTimeToMinutes(targetTime);
  return targetMinutes >= nowMinutes && targetMinutes - nowMinutes <= minutesAhead;
}
