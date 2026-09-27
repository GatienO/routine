import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CaretRight } from 'phosphor-react-native';
import { COLORS, FONT_SIZE, RADIUS, SHADOWS, SPACING } from '../../constants/theme';
import { Activity } from '../../features/activities/types';
import { WeatherData } from '../../services/weather';
import { useRoutineStore } from '../../stores/routineStore';
import { CalendarEvent } from '../../types/calendar';
import { Routine } from '../../types';
import { getWeekDashboardDays } from '../../utils/dashboardCalendar';
import { AnimatedPressable } from '../ui/AnimatedPressable';

const STORAGE_KEY = 'routine_weekly_progress';

type StoredWeeklyProgress = {
  weekStart: string;
  completedDays: string[];
};

type WeeklyProgressProps = {
  events?: CalendarEvent[];
  routines?: Routine[];
  weather?: WeatherData | null;
  activity?: Activity;
  childId?: string | null;
  onOpen?: () => void;
};

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getMonday(date: Date) {
  const monday = new Date(date);
  monday.setHours(0, 0, 0, 0);
  const day = monday.getDay();
  const daysSinceMonday = day === 0 ? 6 : day - 1;
  monday.setDate(monday.getDate() - daysSinceMonday);
  return monday;
}

function getWeekDates(today: Date) {
  const monday = getMonday(today);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return date;
  });
}

function normalizeStoredProgress(value: string | null, weekStart: string): StoredWeeklyProgress {
  if (!value) return { weekStart, completedDays: [] };

  try {
    const parsed = JSON.parse(value) as Partial<StoredWeeklyProgress>;
    if (parsed.weekStart !== weekStart || !Array.isArray(parsed.completedDays)) {
      return { weekStart, completedDays: [] };
    }

    return {
      weekStart,
      completedDays: parsed.completedDays.filter((day): day is string => typeof day === 'string'),
    };
  } catch {
    return { weekStart, completedDays: [] };
  }
}

export function WeeklyProgress({
  events = [],
  routines = [],
  weather,
  activity,
  childId,
  onOpen,
}: WeeklyProgressProps) {
  const executions = useRoutineStore((state) => state.executions);
  const [completedDays, setCompletedDays] = React.useState<string[]>([]);
  const [selectedDayKey, setSelectedDayKey] = React.useState<string | null>(null);
  const today = React.useMemo(() => new Date(), []);
  const todayKey = toDateKey(today);
  const weekDates = React.useMemo(() => getWeekDates(today), [today]);
  const weekStart = toDateKey(weekDates[0]);
  const weekKeys = React.useMemo(() => new Set(weekDates.map(toDateKey)), [weekDates]);
  const weekDays = React.useMemo(
    () => getWeekDashboardDays({ events, routines, weather, activity, childId, date: today }),
    [activity, childId, events, routines, today, weather],
  );

  const completedFromExecutions = React.useMemo(
    () =>
      Array.from(
        new Set(
          executions
            .map((execution) => execution.completedAt)
            .filter((completedAt): completedAt is string => Boolean(completedAt))
            .map((completedAt) => toDateKey(new Date(completedAt)))
            .filter((dateKey) => weekKeys.has(dateKey)),
        ),
      ),
    [executions, weekKeys],
  );

  const completionCountsByDay = React.useMemo(() => {
    const counts = new Map<string, number>();

    executions.forEach((execution) => {
      if (!execution.completedAt) return;
      const dateKey = toDateKey(new Date(execution.completedAt));
      if (!weekKeys.has(dateKey)) return;
      counts.set(dateKey, (counts.get(dateKey) ?? 0) + 1);
    });

    return counts;
  }, [executions, weekKeys]);

  React.useEffect(() => {
    let cancelled = false;

    async function syncProgress() {
      const stored = normalizeStoredProgress(await AsyncStorage.getItem(STORAGE_KEY), weekStart);
      const merged = Array.from(new Set([...stored.completedDays, ...completedFromExecutions])).sort();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ weekStart, completedDays: merged }));

      if (!cancelled) {
        setCompletedDays((current) => (current.join('|') === merged.join('|') ? current : merged));
      }
    }

    void syncProgress();

    return () => {
      cancelled = true;
    };
  }, [completedFromExecutions, weekStart]);

  const selectedDay = weekDays.find((day) => toDateKey(day.date) === selectedDayKey)
    ?? weekDays.find((day) => day.isToday)
    ?? weekDays[0];
  const hasStrongWeek = completedDays.length >= 5;
  const progressText = `${completedDays.length}/7 jours`;

  return (
    <AnimatedPressable onPress={() => onOpen?.()} style={styles.card} scaleDown={0.99}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Cette semaine</Text>
          <Text style={styles.subtitle}>{progressText}{hasStrongWeek ? ' · belle série 🔥' : ' · on avance'}</Text>
        </View>
        <View style={styles.weekPill}>
          <Text style={styles.weekPillText}>Voir</Text>
          <CaretRight size={14} weight="bold" color={COLORS.primaryDark} />
        </View>
      </View>

      <View style={styles.daysStrip}>
        {weekDays.map((day) => {
          const dateKey = toDateKey(day.date);
          const completed = completedDays.includes(dateKey);
          const selected = selectedDay && dateKey === toDateKey(selectedDay.date);
          const count = completionCountsByDay.get(dateKey) ?? 0;
          const isActiveDay = Boolean(selected || day.isToday);

          return (
            <View key={dateKey} style={styles.daySlot}>
              <AnimatedPressable
                onPress={() => setSelectedDayKey(dateKey)}
                scaleDown={0.94}
                containerStyle={styles.dayButton}
                style={[styles.dayCard, isActiveDay && styles.dayCardActive]}
              >
              <Text style={[styles.dayLabel, isActiveDay && styles.activeText]}>{day.dayLabel}</Text>
              <Text style={[styles.dayNumber, isActiveDay && styles.activeText]}>{day.dayNumber}</Text>
              <Text style={styles.weather}>{completed ? '⭐' : day.weatherEmoji}</Text>
              <Text style={styles.mainIcon}>{day.mainIcon}</Text>
              <View style={styles.dotRow}>
                {count > 0 ? (
                  Array.from({ length: Math.min(count, 3) }, (_, dotIndex) => (
                    <View key={`${dateKey}-${dotIndex}`} style={[styles.routineDot, { backgroundColor: day.color }]} />
                  ))
                ) : (
                  <View style={styles.emptyDot} />
                )}
              </View>
              </AnimatedPressable>
            </View>
          );
        })}
      </View>

      {selectedDay ? (
        <View style={styles.previewCard}>
          <View style={[styles.previewIcon, { backgroundColor: `${selectedDay.color}28` }]}>
            <Text style={styles.previewEmoji}>{selectedDay.mainIcon}</Text>
          </View>
          <View style={styles.previewText}>
            <Text style={styles.previewTitle} numberOfLines={1}>{selectedDay.mainLabel}</Text>
            <Text style={styles.previewMeta}>
              {selectedDay.sleepCount !== undefined && selectedDay.sleepCount > 0
                ? `${selectedDay.sleepCount} dodos`
                : selectedDay.isToday
                  ? "Aujourd'hui"
                  : selectedDay.weatherEmoji}
            </Text>
          </View>
        </View>
      ) : null}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: SPACING.md,
    borderRadius: 24,
    backgroundColor: '#FFFDF8',
    borderWidth: 1,
    borderColor: 'rgba(232, 221, 203, 0.9)',
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  title: {
    color: COLORS.primaryDark,
    fontSize: FONT_SIZE.xs,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    fontWeight: '800',
    marginTop: 2,
  },
  weekPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    borderRadius: RADIUS.full,
    backgroundColor: '#F4EAD2',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
  },
  weekPillText: {
    color: COLORS.primaryDark,
    fontSize: FONT_SIZE.xs,
    fontWeight: '900',
  },
  daysStrip: {
    width: '100%',
    flexDirection: 'row',
    gap: SPACING.sm,
    alignItems: 'stretch',
  },
  daySlot: {
    flex: 1,
    minWidth: 0,
  },
  dayButton: {
    width: '100%',
  },
  dayCard: {
    width: '100%',
    minHeight: 112,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dayCardActive: {
    backgroundColor: '#EAF3E8',
    borderColor: COLORS.primaryDark,
  },
  dayLabel: {
    color: COLORS.textLight,
    fontSize: 10,
    fontWeight: '900',
  },
  dayNumber: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  activeText: {
    color: COLORS.primaryDark,
  },
  weather: {
    fontSize: 17,
  },
  mainIcon: {
    fontSize: 19,
  },
  dotRow: {
    height: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  routineDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  emptyDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    borderRadius: 18,
    backgroundColor: '#FAF6EE',
    padding: SPACING.sm,
  },
  previewIcon: {
    width: 42,
    height: 42,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewEmoji: {
    fontSize: 22,
  },
  previewText: {
    flex: 1,
    minWidth: 0,
  },
  previewTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: '900',
  },
  previewMeta: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    fontWeight: '800',
  },
});
