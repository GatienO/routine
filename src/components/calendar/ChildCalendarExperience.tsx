import React, { memo, useEffect, useMemo, useState } from 'react';
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
import Animated, { BounceIn, FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { addDays, format, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Bell, Heart, Moon, Plus, Sparkle } from 'phosphor-react-native';
import { EventBubble } from './EventBubble';
import { SleepCountdown } from './SleepCountdown';
import { Timeline } from './Timeline';
import { WeekStrip } from './WeekStrip';
import { Avatar } from '../ui/Avatar';
import { AnimatedPressable } from '../ui/AnimatedPressable';
import { OpenMoji } from '../ui/OpenMoji';
import { ClothingIcon } from '../weather/ClothingIcon';
import { useCalendarView } from '../../hooks/useCalendarView';
import { useAppStore } from '../../stores/appStore';
import { useMoodStore } from '../../stores/moodStore';
import { useWeatherStore } from '../../stores/weatherStore';
import { CALENDAR_COLORS, CALENDAR_EVENT_KIND_CONFIG, CALENDAR_GRADIENTS } from '../../constants/calendarDesign';
import { COLORS, FONT_SIZE, RADIUS, SHADOWS, SPACING } from '../../constants/theme';
import { MOOD_CONFIG, MOOD_TYPES } from '../../constants/moods';
import { Child, ChildMoodType } from '../../types';
import { CalendarEvent } from '../../types/calendar';
import { WeatherData } from '../../services/weather';
import { getClothingRecommendation } from '../../services/weatherClothingRecommendation';
import { getEventsForDay } from '../../utils/calendar';
import { formatChildName } from '../../utils/children';

type CalendarMode = 'today' | 'week' | 'dodos' | 'tomorrow';

const WEATHER_LABELS: Record<WeatherData['condition'], string> = {
  clear: 'Soleil',
  partly_cloudy: 'Nuageux',
  cloudy: 'Couvert',
  fog: 'Brume',
  rain: 'Pluie',
  snow: 'Neige',
  thunderstorm: 'Orage',
};

const WEATHER_EMOJIS: Record<WeatherData['condition'], string> = {
  clear: '☀️',
  partly_cloudy: '⛅',
  cloudy: '☁️',
  fog: '🌫️',
  rain: '🌧️',
  snow: '❄️',
  thunderstorm: '⛈️',
};

export function ChildCalendarExperience() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const selectedChildId = useAppStore((state) => state.selectedChildId);
  const selectChild = useAppStore((state) => state.selectChild);
  const weatherCity = useAppStore((state) => state.weatherCity);
  const useGeolocation = useAppStore((state) => state.useGeolocation);
  const weather = useWeatherStore((state) => state.weather);
  const refreshWeather = useWeatherStore((state) => state.refresh);
  const setMood = useMoodStore((state) => state.setMood);
  const getMood = useMoodStore((state) => state.getMood);
  const isMoodFresh = useMoodStore((state) => state.isMoodFresh);
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
  const currentMood = activeChildId && isMoodFresh(activeChildId) ? getMood(activeChildId)?.mood : undefined;
  const moodConfig = currentMood ? MOOD_CONFIG[currentMood] : undefined;
  const today = useMemo(() => new Date(), []);
  const contentWidth = Math.min(width - SPACING.lg * 2, 1120);
  const isTablet = width >= 760;
  const isDesktop = width >= 1060;
  const displayedEvents = activeChildId
    ? getEventsForDay(calendar.dayEvents, activeDate, activeChildId)
    : calendar.dayEvents;
  const nextActivity = calendar.timeline.find((item) => item.type !== 'day-marker');
  const linkedRoutines = calendar.timeline.filter((item) => item.type === 'routine-suggestion');
  const outfit = useMemo(
    () => (weather ? getClothingRecommendation(weather, activeDate) : null),
    [activeDate, weather],
  );
  const outfitItems = useMemo(
    () => outfit
      ? [...outfit.outfitPlan.tiles.flatMap((tile) => tile.items), ...outfit.outfitPlan.extras].slice(0, 4)
      : [],
    [outfit],
  );
  const dayProgress = useMemo(() => {
    const now = new Date();
    const minutes = now.getHours() * 60 + now.getMinutes();
    return Math.max(0.06, Math.min(1, (minutes - 7 * 60) / (14 * 60)));
  }, []);
  const heroGradient = mode === 'today'
    ? CALENDAR_GRADIENTS.today
    : mode === 'week'
      ? CALENDAR_GRADIENTS.week
      : mode === 'dodos'
        ? CALENDAR_GRADIENTS.dodos
        : CALENDAR_GRADIENTS.tomorrow;

  useEffect(() => {
    if (!selectedChildId && calendar.children[0]) {
      selectChild(calendar.children[0].id);
    }
  }, [calendar.children, selectChild, selectedChildId]);

  useEffect(() => {
    void refreshWeather({ cityName: weatherCity, useGeolocation });
  }, [refreshWeather, useGeolocation, weatherCity]);

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
      <LinearGradient colors={CALENDAR_GRADIENTS.page} style={styles.gradient}>
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
    <LinearGradient colors={CALENDAR_GRADIENTS.page} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { alignItems: 'center' }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.content, { width: contentWidth, maxWidth: '100%' }]}>
            <CalendarTopBar activeChild={activeChild} />

            <HeroCard
              mode={mode}
              date={activeDate}
              activeChild={activeChild}
              eventCount={displayedEvents.length}
              nextActivity={nextActivity?.title}
              gradient={heroGradient}
            />

            <ChildPicker children={calendar.children} activeChildId={activeChildId} onSelect={selectChild} />

            <ModeTabs mode={mode} onChange={setMode} />

            {mode !== 'dodos' ? (
              <WeekStrip days={calendar.weekDays} selectedDate={activeDate} onSelectDate={handleSelectDate} />
            ) : null}

            {mode === 'today' ? (
              <TodayExperience
                weather={weather}
                mood={currentMood}
                onMoodChange={(nextMood) => activeChildId && setMood(activeChildId, nextMood)}
                dayProgress={dayProgress}
                nextActivity={nextActivity}
                linkedRoutines={linkedRoutines}
                timeline={calendar.timeline}
                events={displayedEvents}
                isDesktop={isDesktop}
                isTablet={isTablet}
                onRoutinePress={handleStartRoutine}
              />
            ) : null}

            {mode === 'week' ? (
              <WeekExperience
                days={calendar.weekDays}
                activeDate={activeDate}
                onSelectDate={handleSelectDate}
              />
            ) : null}

            {mode === 'dodos' ? (
              <DodosExperience countdowns={calendar.countdowns} />
            ) : null}

            {mode === 'tomorrow' ? (
              <TomorrowExperience
                tomorrow={activeDate}
                events={displayedEvents}
                weather={weather}
                outfitItems={outfitItems}
                outfitMessage={outfit?.childMessage}
                childName={activeChild ? formatChildName(activeChild.name) : 'toi'}
              />
            ) : null}

            {moodConfig ? (
              <View style={[styles.reassurancePill, { borderColor: `${moodConfig.color}55` }]}>
                <Text style={styles.reassuranceEmoji} selectable={false}>{moodConfig.emoji}</Text>
                <Text style={styles.reassuranceText} selectable={false}>
                  {moodConfig.encouragements[0]}
                </Text>
              </View>
            ) : null}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function CalendarTopBar({ activeChild }: { activeChild?: Child }) {
  return (
    <View style={styles.topBar}>
      <View style={styles.avatarButton}>
        {activeChild ? (
          <Avatar
            emoji={activeChild.avatar}
            color={activeChild.color}
            size={38}
            avatarConfig={activeChild.avatarConfig}
          />
        ) : (
          <Text style={styles.topBarEmoji} selectable={false}>🐣</Text>
        )}
      </View>
      <Text style={styles.topTitle} selectable={false}>Calendrier</Text>
      <View style={styles.avatarButton}>
        <Bell size={18} weight="bold" color={CALENDAR_COLORS.ink} />
      </View>
    </View>
  );
}

function HeroCard({
  mode,
  date,
  activeChild,
  eventCount,
  nextActivity,
  gradient,
}: {
  mode: CalendarMode;
  date: Date;
  activeChild?: Child;
  eventCount: number;
  nextActivity?: string;
  gradient: [string, string];
}) {
  const title =
    mode === 'today'
      ? `Bonjour ${activeChild ? formatChildName(activeChild.name) : ''} !`
      : mode === 'week'
        ? 'Ma semaine'
        : mode === 'dodos'
          ? 'Combien de dodos ?'
          : 'Demain arrive doucement';
  const subtitle =
    mode === 'dodos'
      ? '1 lune = 1 nuit de sommeil'
      : nextActivity
        ? `Prochaine activite : ${nextActivity}`
        : `${eventCount} repere${eventCount > 1 ? 's' : ''} dans la journee`;

  return (
    <LinearGradient colors={gradient} style={styles.hero}>
      <View style={styles.heroText}>
        <Text style={styles.heroDate} selectable={false}>
          {format(date, 'EEEE d MMMM', { locale: fr })}
        </Text>
        <Text style={styles.heroTitle} numberOfLines={2} selectable={false}>
          {title}
        </Text>
        <Text style={styles.heroSubtitle} numberOfLines={2} selectable={false}>
          {subtitle}
        </Text>
      </View>
      <View style={styles.heroIllustration}>
        {['⭐', '🌙', '☀️'].map((symbol, index) => (
          <Animated.Text
            key={symbol}
            entering={ZoomIn.delay(index * 80).duration(320)}
            style={[styles.heroSymbol, index === 1 && styles.heroSymbolLarge]}
            selectable={false}
          >
            {symbol}
          </Animated.Text>
        ))}
      </View>
    </LinearGradient>
  );
}

function ChildPicker({
  children,
  activeChildId,
  onSelect,
}: {
  children: Child[];
  activeChildId: string | null;
  onSelect: (childId: string) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.childPicker}>
      {children.map((child) => {
        const selected = child.id === activeChildId;
        return (
          <AnimatedPressable
            key={child.id}
            onPress={() => onSelect(child.id)}
            style={[
              styles.childChip,
              selected && { backgroundColor: child.color, borderColor: child.color },
            ]}
            scaleDown={0.94}
          >
            <Avatar
              emoji={child.avatar}
              color={selected ? '#FFFFFF' : child.color}
              size={36}
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
    </ScrollView>
  );
}

function ModeTabs({
  mode,
  onChange,
}: {
  mode: CalendarMode;
  onChange: (mode: CalendarMode) => void;
}) {
  const tabs: Array<{ id: CalendarMode; label: string; icon: string }> = [
    { id: 'today', label: 'Auj.', icon: '☀️' },
    { id: 'week', label: 'Semaine', icon: '📅' },
    { id: 'dodos', label: 'Dodos', icon: '🌙' },
    { id: 'tomorrow', label: 'Demain', icon: '⭐' },
  ];

  return (
    <View style={styles.modeBar}>
      {tabs.map((tab) => {
        const selected = tab.id === mode;
        return (
          <TouchableOpacity
            key={tab.id}
            onPress={() => onChange(tab.id)}
            activeOpacity={0.86}
            style={[styles.modeTab, selected && styles.modeTabActive]}
          >
            <Animated.Text
              entering={selected ? BounceIn.duration(260) : undefined}
              style={[styles.modeIcon, selected && styles.modeIconActive]}
              selectable={false}
            >
              {tab.icon}
            </Animated.Text>
            <Text style={[styles.modeLabel, selected && styles.modeLabelActive]} selectable={false}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function TodayExperience({
  weather,
  mood,
  onMoodChange,
  dayProgress,
  nextActivity,
  linkedRoutines,
  timeline,
  events,
  isDesktop,
  isTablet,
  onRoutinePress,
}: {
  weather: WeatherData | null;
  mood?: ChildMoodType;
  onMoodChange: (mood: ChildMoodType) => void;
  dayProgress: number;
  nextActivity?: { title: string; icon: string; color: string };
  linkedRoutines: Array<{ id: string; title: string; icon: string; color: string; routineId?: string }>;
  timeline: React.ComponentProps<typeof Timeline>['items'];
  events: CalendarEvent[];
  isDesktop: boolean;
  isTablet: boolean;
  onRoutinePress: (routineId: string) => void;
}) {
  return (
    <View style={[styles.todayGrid, isDesktop && styles.todayGridDesktop]}>
      <View style={[styles.todayMain, isDesktop && styles.todayMainDesktop]}>
        <View style={[styles.statsRow, isTablet && styles.statsRowTablet]}>
          <ProgressCard progress={dayProgress} />
          <WeatherMiniCard weather={weather} />
          <NextActivityCard activity={nextActivity} />
        </View>

        <MoodCard mood={mood} onChange={onMoodChange} />

        <Panel title="Matin vers soir" icon="🧭">
          <Timeline items={timeline} onRoutinePress={onRoutinePress} />
        </Panel>
      </View>

      <View style={[styles.todaySide, isDesktop && styles.todaySideDesktop]}>
        <Panel title="Routines du moment" icon="✨">
          {linkedRoutines.length > 0 ? (
            <View style={styles.routineSuggestionStack}>
              {linkedRoutines.slice(0, 4).map((routine) => (
                <TouchableOpacity
                  key={routine.id}
                  onPress={() => routine.routineId && onRoutinePress(routine.routineId)}
                  activeOpacity={0.86}
                  style={[styles.routineSuggestion, { backgroundColor: `${routine.color}18`, borderColor: `${routine.color}45` }]}
                >
                  <Text style={styles.routineSuggestionIcon} selectable={false}>{routine.icon}</Text>
                  <Text style={styles.routineSuggestionText} numberOfLines={1} selectable={false}>
                    {routine.title}
                  </Text>
                  <Plus size={16} weight="bold" color={routine.color} />
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <QuietState icon="🌈" text="Pas de routine speciale" />
          )}
        </Panel>

        <Panel title="Evenements" icon="🎈">
          <View style={styles.eventsStack}>
            {events.length > 0 ? (
              events.map((event) => <EventBubble key={event.id} event={event} compact />)
            ) : (
              <QuietState icon="☁️" text="Jour tranquille" />
            )}
          </View>
        </Panel>
      </View>
    </View>
  );
}

function ProgressCard({ progress }: { progress: number }) {
  return (
    <View style={styles.statCard}>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { height: `${Math.max(8, progress * 100)}%` }]} />
        <Text style={styles.progressEmoji} selectable={false}>☀️</Text>
      </View>
      <View style={styles.statCopy}>
        <Text style={styles.statTitle} selectable={false}>Journee</Text>
        <Text style={styles.statText} selectable={false}>{Math.round(progress * 100)}%</Text>
      </View>
    </View>
  );
}

function WeatherMiniCard({ weather }: { weather: WeatherData | null }) {
  return (
    <View style={[styles.statCard, styles.weatherStatCard]}>
      <Text style={styles.weatherEmoji} selectable={false}>
        {weather ? WEATHER_EMOJIS[weather.condition] : '⛅'}
      </Text>
      <View style={styles.statCopy}>
        <Text style={styles.statTitle} numberOfLines={1} selectable={false}>
          {weather?.city ?? 'Meteo'}
        </Text>
        <Text style={styles.statText} selectable={false}>
          {weather ? `${weather.temperature}°C` : '--'}
        </Text>
        <Text style={styles.statHint} numberOfLines={1} selectable={false}>
          {weather ? WEATHER_LABELS[weather.condition] : 'A venir'}
        </Text>
      </View>
    </View>
  );
}

function NextActivityCard({ activity }: { activity?: { title: string; icon: string; color: string } }) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.nextIconWrap, { backgroundColor: activity ? `${activity.color}24` : CALENDAR_COLORS.mintSoft }]}>
        <Text style={styles.nextIcon} selectable={false}>{activity?.icon ?? '⭐'}</Text>
      </View>
      <View style={styles.statCopy}>
        <Text style={styles.statTitle} selectable={false}>Ensuite</Text>
        <Text style={styles.nextTitle} numberOfLines={2} selectable={false}>
          {activity?.title ?? 'Pause douce'}
        </Text>
      </View>
    </View>
  );
}

function MoodCard({
  mood,
  onChange,
}: {
  mood?: ChildMoodType;
  onChange: (mood: ChildMoodType) => void;
}) {
  return (
    <View style={styles.moodCard}>
      <Text style={styles.panelTitle} selectable={false}>Comment tu te sens ?</Text>
      <View style={styles.moodRow}>
        {MOOD_TYPES.map((moodType) => {
          const config = MOOD_CONFIG[moodType];
          const selected = mood === moodType;
          return (
            <TouchableOpacity
              key={moodType}
              onPress={() => onChange(moodType)}
              activeOpacity={0.86}
              style={[styles.moodButton, selected && { backgroundColor: `${config.color}22` }]}
            >
              <Animated.Text
                entering={selected ? BounceIn.duration(260) : undefined}
                style={[styles.moodEmoji, selected && styles.moodEmojiSelected]}
                selectable={false}
              >
                {config.emoji}
              </Animated.Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function WeekExperience({
  days,
  activeDate,
  onSelectDate,
}: {
  days: ReturnType<typeof useCalendarView>['weekDays'];
  activeDate: Date;
  onSelectDate: (date: Date) => void;
}) {
  return (
    <View style={styles.weekSection}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={196}
        contentContainerStyle={styles.weekRail}
      >
        {days.map((day, index) => {
          const selected = isSameDay(day.date, activeDate);
          const accent = day.events[0]?.color ?? WEEK_COLORS[index % WEEK_COLORS.length];
          return (
            <AnimatedPressable
              key={day.date.toISOString()}
              onPress={() => onSelectDate(day.date)}
              style={[
                styles.weekVisualCard,
                selected && { borderColor: accent, backgroundColor: `${accent}18` },
              ]}
              scaleDown={0.96}
            >
              <View style={[styles.weekDateBubble, { backgroundColor: accent }]}>
                <Text style={styles.weekDayName} selectable={false}>
                  {format(day.date, 'EEE', { locale: fr }).slice(0, 3)}
                </Text>
                <Text style={styles.weekDayNumber} selectable={false}>
                  {format(day.date, 'd')}
                </Text>
              </View>
              <View style={styles.weekEventStack}>
                {day.events.length > 0 ? (
                  day.events.slice(0, 3).map((event) => (
                    <MiniEvent key={event.id} event={event} />
                  ))
                ) : (
                  <QuietState icon="🌈" text="Libre" compact />
                )}
              </View>
            </AnimatedPressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

function DodosExperience({
  countdowns,
}: {
  countdowns: ReturnType<typeof useCalendarView>['countdowns'];
}) {
  return (
    <View style={styles.dodosStack}>
      <SleepCountdown countdown={countdowns[0]} />
      {countdowns.length > 1 ? (
        <View style={styles.countdownGrid}>
          {countdowns.slice(1).map((countdown) => (
            <View key={countdown.id} style={[styles.smallCountdown, { borderColor: `${countdown.color}55` }]}>
              <OpenMoji emoji={countdown.icon} size={34} />
              <Text style={styles.smallCountdownNumber} selectable={false}>{countdown.sleepCount}</Text>
              <Text style={styles.smallCountdownLabel} numberOfLines={1} selectable={false}>
                {countdown.title}
              </Text>
              <View style={styles.moonRow}>
                {Array.from({ length: Math.min(6, countdown.sleepCount) }).map((_, index) => (
                  <Moon key={index} size={12} weight="fill" color={CALENDAR_COLORS.moon} />
                ))}
              </View>
            </View>
          ))}
        </View>
      ) : null}
      {countdowns.length === 0 ? <QuietState icon="🌙" text="Aucun dodo a compter" /> : null}
    </View>
  );
}

function TomorrowExperience({
  tomorrow,
  events,
  weather,
  outfitItems,
  outfitMessage,
  childName,
}: {
  tomorrow: Date;
  events: CalendarEvent[];
  weather: WeatherData | null;
  outfitItems: NonNullable<ReturnType<typeof getClothingRecommendation>['outfitPlan']['extras']>;
  outfitMessage?: string;
  childName: string;
}) {
  return (
    <View style={styles.tomorrowStack}>
      <View style={styles.tomorrowGrid}>
        <View style={[styles.tomorrowInfoCard, styles.weatherTomorrowCard]}>
          <Text style={styles.weatherEmoji} selectable={false}>
            {weather ? WEATHER_EMOJIS[weather.condition] : '☀️'}
          </Text>
          <Text style={styles.tomorrowInfoTitle} selectable={false}>
            {weather ? `${weather.temperature}°C` : 'Meteo'}
          </Text>
          <Text style={styles.tomorrowInfoText} selectable={false}>
            {weather ? WEATHER_LABELS[weather.condition] : format(tomorrow, 'EEEE', { locale: fr })}
          </Text>
        </View>
        <View style={styles.tomorrowInfoCard}>
          <Text style={styles.tomorrowInfoKicker} selectable={false}>Tenue</Text>
          <View style={styles.outfitGrid}>
            {outfitItems.length > 0 ? (
              outfitItems.map((item, index) => (
                <View key={`${item.id}-${index}`} style={styles.outfitTile}>
                  <ClothingIcon code={item.id} size={34} variant={index} />
                  <Text style={styles.outfitLabel} numberOfLines={1} selectable={false}>{item.label}</Text>
                </View>
              ))
            ) : (
              <QuietState icon="👕" text="Tenue a venir" compact />
            )}
          </View>
        </View>
      </View>

      <Panel title="Au programme" icon="📅">
        <View style={styles.eventsStack}>
          {events.length > 0 ? (
            events.map((event) => <EventBubble key={event.id} event={event} compact />)
          ) : (
            <QuietState icon="🌈" text="Demain est calme" />
          )}
        </View>
      </Panel>

      <LinearGradient colors={CALENDAR_GRADIENTS.tomorrow} style={styles.goodNightCard}>
        <Text style={styles.goodNightIcon} selectable={false}>💜</Text>
        <Text style={styles.goodNightTitle} selectable={false}>
          Demain est prepare.
        </Text>
        <Text style={styles.goodNightText} selectable={false}>
          {outfitMessage ?? `Tu peux dormir tranquille ${childName}.`}
        </Text>
      </LinearGradient>
    </View>
  );
}

function Panel({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <View style={styles.panel}>
      <View style={styles.panelHeader}>
        <Text style={styles.panelIcon} selectable={false}>{icon}</Text>
        <Text style={styles.panelTitle} selectable={false}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

const MiniEvent = memo(function MiniEvent({ event }: { event: CalendarEvent }) {
  const config = CALENDAR_EVENT_KIND_CONFIG[event.kind] ?? CALENDAR_EVENT_KIND_CONFIG.special;
  return (
    <View style={[styles.miniEvent, { backgroundColor: config.soft, borderColor: `${event.color}40` }]}>
      <Text style={styles.miniEventIcon} selectable={false}>{event.icon}</Text>
      <Text style={styles.miniEventText} numberOfLines={1} selectable={false}>{event.title}</Text>
    </View>
  );
});

function QuietState({ icon, text, compact }: { icon: string; text: string; compact?: boolean }) {
  return (
    <View style={[styles.quietState, compact && styles.quietStateCompact]}>
      <Text style={styles.quietIcon} selectable={false}>{icon}</Text>
      <Text style={styles.quietText} numberOfLines={1} selectable={false}>{text}</Text>
    </View>
  );
}

const WEEK_COLORS = [
  CALENDAR_COLORS.lavender,
  CALENDAR_COLORS.sky,
  CALENDAR_COLORS.mint,
  CALENDAR_COLORS.yellow,
  CALENDAR_COLORS.rose,
  CALENDAR_COLORS.peach,
  CALENDAR_COLORS.coral,
];

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
  topBar: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  avatarButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    ...SHADOWS.sm,
  },
  topBarEmoji: {
    fontSize: 24,
  },
  topTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: FONT_SIZE.xl,
    fontWeight: '900',
    color: '#253041',
  },
  hero: {
    minHeight: 164,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.md,
    borderRadius: 34,
    padding: SPACING.lg + 2,
    ...SHADOWS.lg,
  },
  heroText: {
    flex: 1,
    minWidth: 0,
  },
  heroDate: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.68)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroTitle: {
    marginTop: 4,
    fontSize: FONT_SIZE.xxl,
    lineHeight: 38,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  heroSubtitle: {
    marginTop: 8,
    fontSize: FONT_SIZE.sm,
    lineHeight: 20,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.72)',
  },
  heroIllustration: {
    width: 112,
    minHeight: 112,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroSymbol: {
    position: 'absolute',
    fontSize: 28,
  },
  heroSymbolLarge: {
    position: 'relative',
    fontSize: 62,
  },
  childPicker: {
    gap: SPACING.sm,
    paddingRight: SPACING.sm,
  },
  childChip: {
    minHeight: 54,
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
    maxWidth: 140,
    fontSize: FONT_SIZE.sm,
    fontWeight: '900',
    color: CALENDAR_COLORS.ink,
  },
  childChipTextSelected: {
    color: '#FFFFFF',
  },
  modeBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.xs,
    borderRadius: 30,
    padding: 6,
    backgroundColor: 'rgba(255,255,255,0.86)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.82)',
    ...SHADOWS.sm,
  },
  modeTab: {
    flex: 1,
    minHeight: 70,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    borderRadius: 24,
  },
  modeTabActive: {
    backgroundColor: '#F1EAFF',
  },
  modeIcon: {
    fontSize: 25,
  },
  modeIconActive: {
    transform: [{ scale: 1.08 }],
  },
  modeLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: CALENDAR_COLORS.softMuted,
  },
  modeLabelActive: {
    color: CALENDAR_COLORS.lavender,
  },
  todayGrid: {
    gap: SPACING.md,
  },
  todayGridDesktop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  todayMain: {
    gap: SPACING.md,
  },
  todayMainDesktop: {
    flex: 1.05,
  },
  todaySide: {
    gap: SPACING.md,
  },
  todaySideDesktop: {
    flex: 0.85,
  },
  statsRow: {
    gap: SPACING.sm,
  },
  statsRowTablet: {
    flexDirection: 'row',
  },
  statCard: {
    flex: 1,
    minHeight: 106,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  weatherStatCard: {
    backgroundColor: '#EAF7FF',
  },
  progressTrack: {
    width: 54,
    height: 72,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderRadius: 27,
    backgroundColor: '#EAF8E8',
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: CALENDAR_COLORS.lavender,
  },
  progressEmoji: {
    fontSize: 24,
    marginBottom: 22,
  },
  statCopy: {
    flex: 1,
    minWidth: 0,
  },
  statTitle: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '900',
    color: CALENDAR_COLORS.softMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statText: {
    marginTop: 3,
    fontSize: FONT_SIZE.xl,
    fontWeight: '900',
    color: CALENDAR_COLORS.ink,
  },
  statHint: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
    color: CALENDAR_COLORS.muted,
  },
  weatherEmoji: {
    fontSize: 44,
  },
  nextIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextIcon: {
    fontSize: 28,
  },
  nextTitle: {
    marginTop: 3,
    fontSize: FONT_SIZE.md,
    lineHeight: 20,
    fontWeight: '900',
    color: CALENDAR_COLORS.ink,
  },
  moodCard: {
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    padding: SPACING.lg,
    gap: SPACING.md,
    ...SHADOWS.sm,
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.xs,
  },
  moodButton: {
    flex: 1,
    minHeight: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
  moodEmoji: {
    fontSize: 30,
  },
  moodEmojiSelected: {
    transform: [{ scale: 1.16 }],
  },
  panel: {
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    padding: SPACING.lg,
    gap: SPACING.md,
    ...SHADOWS.sm,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  panelIcon: {
    fontSize: 20,
  },
  panelTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '900',
    color: CALENDAR_COLORS.ink,
  },
  routineSuggestionStack: {
    gap: SPACING.sm,
  },
  routineSuggestion: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    borderRadius: 22,
    borderWidth: 1.5,
    paddingHorizontal: SPACING.md,
  },
  routineSuggestionIcon: {
    fontSize: 26,
  },
  routineSuggestionText: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    fontWeight: '900',
    color: CALENDAR_COLORS.ink,
  },
  eventsStack: {
    gap: SPACING.sm,
  },
  weekSection: {
    gap: SPACING.md,
  },
  weekRail: {
    gap: SPACING.md,
    paddingRight: SPACING.md,
  },
  weekVisualCard: {
    width: 180,
    minHeight: 240,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.9)',
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: SPACING.md,
    gap: SPACING.md,
    ...SHADOWS.sm,
  },
  weekDateBubble: {
    minHeight: 92,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  weekDayName: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.74)',
    textTransform: 'uppercase',
  },
  weekDayNumber: {
    fontSize: 34,
    lineHeight: 38,
    fontWeight: '900',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  weekEventStack: {
    gap: SPACING.sm,
  },
  miniEvent: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: SPACING.sm,
  },
  miniEventIcon: {
    fontSize: 18,
  },
  miniEventText: {
    flex: 1,
    fontSize: FONT_SIZE.xs,
    fontWeight: '900',
    color: CALENDAR_COLORS.ink,
  },
  dodosStack: {
    gap: SPACING.md,
  },
  countdownGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  smallCountdown: {
    flexGrow: 1,
    flexBasis: 180,
    minHeight: 168,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    borderRadius: 28,
    borderWidth: 1.5,
    backgroundColor: 'rgba(255,255,255,0.92)',
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  smallCountdownNumber: {
    fontSize: 38,
    lineHeight: 42,
    fontWeight: '900',
    color: CALENDAR_COLORS.moon,
    fontVariant: ['tabular-nums'],
  },
  smallCountdownLabel: {
    maxWidth: '100%',
    fontSize: FONT_SIZE.sm,
    fontWeight: '900',
    color: CALENDAR_COLORS.ink,
  },
  moonRow: {
    minHeight: 16,
    flexDirection: 'row',
    gap: 2,
  },
  tomorrowStack: {
    gap: SPACING.md,
  },
  tomorrowGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  tomorrowInfoCard: {
    flexGrow: 1,
    flexBasis: 260,
    minHeight: 156,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    padding: SPACING.lg,
    gap: SPACING.sm,
    ...SHADOWS.sm,
  },
  weatherTomorrowCard: {
    backgroundColor: '#EAF7FF',
  },
  tomorrowInfoTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '900',
    color: CALENDAR_COLORS.ink,
  },
  tomorrowInfoText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '800',
    color: CALENDAR_COLORS.muted,
  },
  tomorrowInfoKicker: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '900',
    color: CALENDAR_COLORS.coral,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  outfitGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  outfitTile: {
    flexGrow: 1,
    flexBasis: 92,
    minHeight: 78,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: 20,
    backgroundColor: '#FFF8EF',
  },
  outfitLabel: {
    maxWidth: '100%',
    fontSize: 10,
    fontWeight: '900',
    color: CALENDAR_COLORS.muted,
  },
  goodNightCard: {
    minHeight: 178,
    borderRadius: 32,
    padding: SPACING.lg,
    justifyContent: 'center',
    gap: SPACING.sm,
    ...SHADOWS.md,
  },
  goodNightIcon: {
    fontSize: 34,
  },
  goodNightTitle: {
    fontSize: FONT_SIZE.xl,
    lineHeight: 30,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  goodNightText: {
    fontSize: FONT_SIZE.sm,
    lineHeight: 21,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.76)',
  },
  quietState: {
    minHeight: 96,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    borderRadius: 24,
    backgroundColor: '#F7FBF4',
    padding: SPACING.md,
  },
  quietStateCompact: {
    minHeight: 74,
  },
  quietIcon: {
    fontSize: 28,
  },
  quietText: {
    maxWidth: '100%',
    fontSize: FONT_SIZE.sm,
    fontWeight: '900',
    color: CALENDAR_COLORS.muted,
  },
  reassurancePill: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    backgroundColor: 'rgba(255,255,255,0.82)',
    paddingHorizontal: SPACING.md,
  },
  reassuranceEmoji: {
    fontSize: 24,
  },
  reassuranceText: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    fontWeight: '900',
    color: CALENDAR_COLORS.muted,
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
    color: CALENDAR_COLORS.ink,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: CALENDAR_COLORS.muted,
    textAlign: 'center',
  },
});
