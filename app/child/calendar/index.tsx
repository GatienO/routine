import React, { useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { addDays, isSameDay } from 'date-fns';
import { CalendarDayCard, EventBubble, SleepCountdown, Timeline, WeekStrip } from '../../../src/components/calendar';
import { AppPageHeader } from '../../../src/components/ui/AppPageHeader';
import { Avatar } from '../../../src/components/ui/Avatar';
import { AnimatedPressable } from '../../../src/components/ui/AnimatedPressable';
import { useCalendarView } from '../../../src/hooks/useCalendarView';
import { useAppStore } from '../../../src/stores/appStore';
import { COLORS, FONT_SIZE, RADIUS, SHADOWS, SPACING } from '../../../src/constants/theme';
import { formatDayLabel, getEventsForDay, normalizeCalendarDate } from '../../../src/utils/calendar';
import { formatChildName } from '../../../src/utils/children';

type CalendarMode = 'today' | 'tomorrow' | 'week';

export default function ChildCalendarScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const selectedChildId = useAppStore((state) => state.selectedChildId);
  const selectChild = useAppStore((state) => state.selectChild);
  const [mode, setMode] = useState<CalendarMode>('today');
  const [selectedDate, setSelectedDate] = useState(new Date());

  const activeDate = useMemo(() => {
    if (mode === 'today') return new Date();
    if (mode === 'tomorrow') return addDays(new Date(), 1);
    return selectedDate;
  }, [mode, selectedDate]);

  const calendar = useCalendarView({
    date: activeDate,
    childId: selectedChildId,
  });

  const activeChildId = selectedChildId ?? calendar.children[0]?.id ?? null;
  const activeChild = calendar.children.find((child) => child.id === activeChildId);
  const contentWidth = Math.min(width - SPACING.lg * 2, 1180);
  const isWide = width >= 920;
  const today = useMemo(() => new Date(), []);
  const tomorrow = useMemo(() => addDays(new Date(), 1), []);
  const displayedEvents = activeChildId
    ? getEventsForDay(calendar.dayEvents, activeDate, activeChildId)
    : calendar.dayEvents;
  const hasCelebration = displayedEvents.some((event) =>
    event.kind === 'special' || event.kind === 'birthday' || event.kind === 'holiday',
  );

  useEffect(() => {
    if (!selectedChildId && calendar.children[0]) {
      selectChild(calendar.children[0].id);
    }
  }, [calendar.children, selectChild, selectedChildId]);

  const handleSelectDate = (date: Date) => {
    setMode(isSameDay(date, today) ? 'today' : 'week');
    setSelectedDate(date);
  };

  const handleStartRoutine = (routineId: string) => {
    router.push({
      pathname: '/child/summary',
      params: {
        routineId,
        childIds: activeChildId ?? undefined,
      },
    });
  };

  if (calendar.children.length === 0) {
    return (
      <LinearGradient colors={calendar.seasonTheme.gradient} style={styles.gradient}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.emptyScreen}>
            <Text style={styles.emptyBigIcon} selectable={false}>📅</Text>
            <Text style={styles.emptyTitle} selectable={false}>Pas encore de calendrier</Text>
            <Text style={styles.emptyText} selectable={false}>Demande a tes parents de creer ton profil.</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={calendar.seasonTheme.gradient} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        {hasCelebration ? <Confetti colors={displayedEvents.map((event) => event.color)} /> : null}
        <ScrollView
          contentContainerStyle={[styles.scroll, { alignItems: 'center' }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.content, { width: contentWidth, maxWidth: '100%' }]}>
            <AppPageHeader title="Calendrier enfant" />

            <Animated.View entering={FadeInDown.duration(280)} style={styles.hero}>
              <View style={styles.heroText}>
                <Text style={styles.heroEyebrow} selectable={false}>
                  {formatDayLabel(activeDate)}
                </Text>
                <Text
                  style={[
                    styles.heroTitle,
                    calendar.profile.ageGroup === 'toddler' && styles.heroTitleToddler,
                  ]}
                  numberOfLines={2}
                  selectable={false}
                >
                  On se repere dans le temps
                </Text>
              </View>
              <View style={styles.heroParticles}>
                {calendar.seasonTheme.particles.map((particle) => (
                  <Animated.Text
                    key={particle}
                    entering={ZoomIn.duration(320)}
                    style={styles.heroParticle}
                    selectable={false}
                  >
                    {particle}
                  </Animated.Text>
                ))}
              </View>
            </Animated.View>

            <View style={styles.childStrip}>
              {calendar.children.map((child) => {
                const selected = child.id === activeChildId;

                return (
                  <AnimatedPressable
                    key={child.id}
                    onPress={() => selectChild(child.id)}
                    style={[
                      styles.childChip,
                      selected && { backgroundColor: child.color, borderColor: child.color },
                    ]}
                    scaleDown={0.95}
                  >
                    <Avatar
                      emoji={child.avatar}
                      color={selected ? '#FFFFFF' : child.color}
                      size={38}
                      avatarConfig={child.avatarConfig}
                    />
                    <Text
                      style={[styles.childChipText, selected && styles.childChipTextSelected]}
                      numberOfLines={1}
                      selectable={false}
                    >
                      {formatChildName(child.name)}
                    </Text>
                  </AnimatedPressable>
                );
              })}
            </View>

            <View style={styles.modeRow}>
              <ModeButton label="Aujourd'hui" selected={mode === 'today'} onPress={() => setMode('today')} />
              <ModeButton label="Demain" selected={mode === 'tomorrow'} onPress={() => setMode('tomorrow')} />
              <ModeButton label="Semaine" selected={mode === 'week'} onPress={() => setMode('week')} />
            </View>

            <WeekStrip
              days={calendar.weekDays}
              selectedDate={activeDate}
              onSelectDate={handleSelectDate}
            />

            <View style={[styles.dashboardGrid, isWide && styles.dashboardGridWide]}>
              <View style={[styles.leftColumn, isWide && styles.leftColumnWide]}>
                <SleepCountdown
                  countdown={calendar.countdowns[0]}
                  compactText={calendar.profile.compactText}
                />

                {mode === 'week' ? (
                  <WeekOverview
                    days={calendar.weekDays}
                    activeDate={activeDate}
                    minHeight={calendar.profile.cardMinHeight}
                    compactText={calendar.profile.compactText}
                  />
                ) : (
                  <CalendarDayCard
                    date={activeDate}
                    events={displayedEvents}
                    minHeight={calendar.profile.cardMinHeight}
                    compactText={calendar.profile.compactText}
                  />
                )}
              </View>

              <View style={[styles.rightColumn, isWide && styles.rightColumnWide]}>
                <Panel title="Timeline">
                  <Timeline
                    items={calendar.timeline}
                    compactText={calendar.profile.compactText}
                    onRoutinePress={handleStartRoutine}
                  />
                </Panel>

                <Panel title="Evenements">
                  <View style={styles.eventsStack}>
                    {displayedEvents.length > 0 ? (
                      displayedEvents.map((event) => (
                        <EventBubble key={event.id} event={event} compact={calendar.profile.compactText} />
                      ))
                    ) : (
                      <View style={styles.quietCard}>
                        <Text style={styles.quietIcon} selectable={false}>☁️</Text>
                        <Text style={styles.quietText} selectable={false}>Rien de special</Text>
                      </View>
                    )}
                  </View>
                </Panel>

                {activeChild ? (
                  <View style={[styles.ageHint, { borderColor: `${activeChild.color}55` }]}>
                    <Text style={styles.ageHintIcon} selectable={false}>✨</Text>
                    <Text style={styles.ageHintText} selectable={false}>
                      Interface adaptee a {activeChild.age} ans
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function ModeButton({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.86}
      style={[styles.modeButton, selected && styles.modeButtonSelected]}
    >
      <Text style={[styles.modeButtonText, selected && styles.modeButtonTextSelected]} selectable={false}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.panel}>
      <Text style={styles.panelTitle} selectable={false}>{title}</Text>
      {children}
    </View>
  );
}

function WeekOverview({
  days,
  activeDate,
  minHeight,
  compactText,
}: {
  days: ReturnType<typeof useCalendarView>['weekDays'];
  activeDate: Date;
  minHeight: number;
  compactText: boolean;
}) {
  return (
    <View style={styles.weekOverview}>
      {days.map((day) => (
        <View
          key={day.date.toISOString()}
          style={[
            styles.weekCard,
            isSameDay(day.date, activeDate) && styles.weekCardActive,
          ]}
        >
          <CalendarDayCard
            date={day.date}
            events={day.events}
            minHeight={minHeight}
            compactText={compactText}
          />
        </View>
      ))}
    </View>
  );
}

function Confetti({ colors }: { colors: string[] }) {
  const particles = ['✦', '●', '★', '✹', '●', '✦', '★'];

  return (
    <View pointerEvents="none" style={styles.confettiLayer}>
      {particles.map((particle, index) => (
        <Animated.Text
          key={`${particle}-${index}`}
          entering={FadeInUp.delay(index * 90).duration(760)}
          style={[
            styles.confetti,
            {
              left: `${8 + index * 13}%`,
              color: colors[index % Math.max(1, colors.length)] ?? COLORS.primary,
              transform: [{ rotate: `${index * 18}deg` }],
            },
          ]}
          selectable={false}
        >
          {particle}
        </Animated.Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  scroll: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  content: {
    gap: SPACING.md,
  },
  hero: {
    minHeight: 142,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.md,
    borderRadius: RADIUS.xl + 8,
    padding: SPACING.lg,
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.md,
  },
  heroText: {
    flex: 1,
    minWidth: 0,
  },
  heroEyebrow: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '900',
    color: COLORS.secondaryDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroTitle: {
    marginTop: 4,
    fontSize: FONT_SIZE.xxl,
    lineHeight: 38,
    fontWeight: '900',
    color: COLORS.text,
  },
  heroTitleToddler: {
    fontSize: FONT_SIZE.xxl + 4,
    lineHeight: 42,
  },
  heroParticles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    width: 128,
    gap: SPACING.xs,
  },
  heroParticle: {
    fontSize: 34,
  },
  childStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  childChip: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  childChipText: {
    maxWidth: 150,
    fontSize: FONT_SIZE.sm,
    fontWeight: '900',
    color: COLORS.text,
  },
  childChipTextSelected: {
    color: '#FFFFFF',
  },
  modeRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    flexWrap: 'wrap',
  },
  modeButton: {
    flexGrow: 1,
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  modeButtonSelected: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  modeButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '900',
    color: COLORS.textSecondary,
  },
  modeButtonTextSelected: {
    color: '#FFFFFF',
  },
  dashboardGrid: {
    gap: SPACING.md,
  },
  dashboardGridWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  leftColumn: {
    gap: SPACING.md,
  },
  leftColumnWide: {
    flex: 1.05,
  },
  rightColumn: {
    gap: SPACING.md,
  },
  rightColumnWide: {
    flex: 0.95,
  },
  panel: {
    borderRadius: RADIUS.xl + 6,
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    gap: SPACING.md,
    ...SHADOWS.md,
  },
  panelTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '900',
    color: COLORS.text,
  },
  eventsStack: {
    gap: SPACING.sm,
  },
  quietCard: {
    minHeight: 112,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.surfaceSecondary,
  },
  quietIcon: {
    fontSize: 34,
  },
  quietText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '900',
    color: COLORS.textSecondary,
  },
  ageHint: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    borderRadius: RADIUS.xl,
    borderWidth: 1.5,
    backgroundColor: 'rgba(255,255,255,0.74)',
    paddingHorizontal: SPACING.md,
  },
  ageHintIcon: {
    fontSize: 22,
  },
  ageHintText: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    fontWeight: '900',
    color: COLORS.textSecondary,
  },
  weekOverview: {
    gap: SPACING.md,
  },
  weekCard: {
    borderRadius: RADIUS.xl + 6,
  },
  weekCardActive: {
    borderWidth: 3,
    borderColor: COLORS.secondary,
    borderRadius: RADIUS.xl + 9,
  },
  confettiLayer: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    height: 160,
    zIndex: 4,
  },
  confetti: {
    position: 'absolute',
    top: 0,
    fontSize: 24,
    fontWeight: '900',
  },
  emptyScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    gap: SPACING.md,
  },
  emptyBigIcon: {
    fontSize: 72,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '900',
    color: COLORS.text,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
