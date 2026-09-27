import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AppState,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  CalendarDots,
  CaretRight,
  Play,
  Plus,
} from 'phosphor-react-native';
import { OutfitImage } from '../../../components/weather/OutfitImage';
import { OpenMoji } from '../../../components/ui/OpenMoji';
import { ResponsiveOverlay } from '../../../components/ui/ResponsiveOverlay';
import { CONTENT_MAX_WIDTH, FONT_SIZE, SHADOWS, SPACING } from '../../../constants/theme';
import { getOutfitVisualItem, normalizeOutfitSelection, type OutfitVisualItem } from '../../../constants/weatherOutfits';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { useCalendarView } from '../../../hooks/useCalendarView';
import { WEATHER_LIVE_REFRESH_MS, type WeatherData } from '../../../services/weather';
import { getClothingRecommendation } from '../../../services/weatherClothingRecommendation';
import { useAppStore } from '../../../stores/appStore';
import { useChildrenStore } from '../../../stores/childrenStore';
import { useRoutineStore } from '../../../stores/routineStore';
import { useWeatherStore } from '../../../stores/weatherStore';
import { formatChildName } from '../../../utils/children';
import { formatDuration } from '../../../utils/date';
import { OutfitPreparationOverlay } from '../../../components/weather/OutfitPreparationOverlay';
import { groupActiveRoutines, orderGroupChildIds, type RoutineGroup } from '../group-routines';

function weatherIcon(condition?: string) {
  if (condition === 'rain') return '🌧️';
  if (condition === 'snow') return '❄️';
  if (condition === 'thunderstorm') return '⛈️';
  if (condition === 'cloudy' || condition === 'fog') return '☁️';
  if (condition === 'partly_cloudy') return '🌤️';
  return '☀️';
}

function weatherAdvice(temperature?: number, condition?: string) {
  if (condition === 'rain' || condition === 'thunderstorm') return 'Prévoir une tenue pour rester au sec';
  if (condition === 'snow' || (temperature !== undefined && temperature <= 8)) return 'Prévoir une couche chaude';
  if (temperature !== undefined && temperature >= 27) return 'Prévoir une tenue légère et de l’eau';
  return 'Une tenue confortable suffit';
}

function weatherLabel(condition?: string) {
  if (condition === 'rain') return 'Pluie';
  if (condition === 'snow') return 'Neige';
  if (condition === 'thunderstorm') return 'Orage';
  if (condition === 'cloudy') return 'Nuageux';
  if (condition === 'fog') return 'Brume';
  if (condition === 'partly_cloudy') return 'Éclaircies';
  return 'Grand soleil';
}

function momentLabel(minutes: number) {
  if (minutes < 12 * 60) return 'Matin';
  if (minutes < 18 * 60) return 'Après-midi';
  return 'Soir';
}

export function RoutinesHomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { colors } = useAppTheme();
  const [showAll, setShowAll] = useState(false);
  const [outfitVisible, setOutfitVisible] = useState(false);
  const [chainVisible, setChainVisible] = useState(false);
  const [chainRoutineIds, setChainRoutineIds] = useState<string[]>([]);
  const children = useChildrenStore((state) => state.children);
  const routines = useRoutineStore((state) => state.routines);
  const currentExecution = useRoutineStore((state) => state.currentExecution);
  const weather = useWeatherStore((state) => state.weather);
  const weatherLoading = useWeatherStore((state) => state.loading);
  const weatherError = useWeatherStore((state) => state.error);
  const refreshWeather = useWeatherStore((state) => state.refresh);
  const weatherCity = useAppStore((state) => state.weatherCity);
  const selectedOutfitIds = useAppStore((state) => state.selectedOutfitIds);
  const setSelectedOutfitIds = useAppStore((state) => state.setSelectedOutfitIds);
  const useGeolocation = useAppStore((state) => state.useGeolocation);
  const contentWidth = Math.min(width - SPACING.lg * 2, CONTENT_MAX_WIDTH.lg);
  const compact = width < 768;
  const calendarDate = useMemo(() => new Date(), []);
  const calendar = useCalendarView({ date: calendarDate });
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    void refreshWeather(
      { cityName: weatherCity, useGeolocation },
      { maxCacheAgeMs: WEATHER_LIVE_REFRESH_MS },
    );
  }, [refreshWeather, useGeolocation, weatherCity]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      const returningToForeground = /inactive|background/.test(appState.current) && nextState === 'active';
      appState.current = nextState;
      if (!returningToForeground) return;

      void refreshWeather(
        { cityName: weatherCity, useGeolocation },
        { maxCacheAgeMs: WEATHER_LIVE_REFRESH_MS },
      );
    });

    return () => subscription.remove();
  }, [refreshWeather, useGeolocation, weatherCity]);

  const childrenById = useMemo(
    () => new Map(children.map((child) => [child.id, child])),
    [children],
  );
  const familyChildIds = useMemo(() => children.map((child) => child.id), [children]);

  const routineGroups = useMemo(() => groupActiveRoutines(routines), [routines]);

  const featuredGroup = routineGroups[0];
  const displayedGroups = showAll ? routineGroups.slice(1) : routineGroups.slice(1, 4);
  const runningRoutine = currentExecution
    ? routines.find((routine) => routine.id === currentExecution.routineId)
    : undefined;
  const featuredTotalMinutes = featuredGroup?.sample.steps.reduce((sum, step) => sum + step.durationMinutes, 0) ?? 0;
  const featuredParticipantNames = featuredGroup ? orderGroupChildIds(featuredGroup.childIds, familyChildIds)
    .map((childId) => childrenById.get(childId)?.name)
    .filter(Boolean)
    .map((name) => formatChildName(name as string)) : [];
  const recommendation = useMemo(
    () => (weather ? getClothingRecommendation(weather) : null),
    [weather],
  );
  const outfitItems = useMemo(() => {
    const ids = selectedOutfitIds ?? normalizeOutfitSelection(recommendation
      ? recommendation.outfitPlan.tiles.flatMap((tile) => tile.items.map((item) => item.id))
        .concat(recommendation.outfitPlan.extras.map((item) => item.id))
      : []);
    return ids.map(getOutfitVisualItem).filter((item): item is OutfitVisualItem => !!item);
  }, [recommendation, selectedOutfitIds]);
  const calendarRows = useMemo(
    () => calendar.timeline
      .filter((item) => item.type !== 'day-marker')
      .sort((left, right) => left.startMinutes - right.startMinutes)
      .slice(0, 3),
    [calendar.timeline],
  );
  const nextCountdown = calendar.countdowns.find((item) => !item.isToday) ?? calendar.countdowns[0];

  const launchGroup = (group: RoutineGroup) => {
    router.push({
      pathname: '/child/summary',
      params: {
        routineIds: group.sample.id,
        childIds: orderGroupChildIds(group.childIds, familyChildIds).join(','),
      },
    });
  };

  const openChain = () => {
    setChainRoutineIds(featuredGroup ? [featuredGroup.sample.id] : []);
    setChainVisible(true);
  };

  const toggleChainRoutine = (routineId: string) => {
    setChainRoutineIds((current) => current.includes(routineId)
      ? current.filter((id) => id !== routineId)
      : [...current, routineId]);
  };

  const launchChain = () => {
    if (chainRoutineIds.length < 2) return;
    const selectedGroups = chainRoutineIds
      .map((id) => routineGroups.find((group) => group.sample.id === id))
      .filter((group): group is RoutineGroup => Boolean(group));
    const childIds = orderGroupChildIds(
      Array.from(new Set(selectedGroups.flatMap((group) => group.childIds))),
      familyChildIds,
    );
    setChainVisible(false);
    router.push({
      pathname: '/child/summary',
      params: {
        routineIds: chainRoutineIds.join(','),
        childIds: childIds.join(','),
      },
    });
  };

  return (
    <View style={[styles.gradient, { backgroundColor: 'transparent' }]}>

      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={[styles.scroll, { alignItems: 'center' }]} showsVerticalScrollIndicator={false}>
          <View style={[styles.content, { width: contentWidth, maxWidth: '100%' }]}>
            <WeatherBanner
              weather={weather}
              loading={weatherLoading}
              error={weatherError}
              outfitItems={outfitItems}
              showFacts={width >= 980}
              onOpen={() => setOutfitVisible(true)}
            />

            {runningRoutine ? (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={`Continuer ${runningRoutine.name}`}
                activeOpacity={0.85}
                onPress={() => router.push('/child/run')}
                style={[styles.resumeCard, { backgroundColor: colors.actionSoft }]}
              >
                <View style={styles.resumeCopy}>
                  <Text style={[styles.resumeLabel, { color: colors.action }]}>EN COURS</Text>
                  <Text style={[styles.resumeTitle, { color: colors.text }]}>{runningRoutine.name}</Text>
                  <Text style={[styles.resumeMeta, { color: colors.textSecondary }]}>Reprendre là où vous vous êtes arrêtés</Text>
                </View>
                <Play size={25} weight="fill" color={colors.action} />
              </TouchableOpacity>
            ) : null}

            <View style={[styles.heroGrid, compact && styles.heroGridCompact]}>
              {featuredGroup ? (
                <View style={[styles.featuredCard, compact && styles.featuredCardCompact, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={[styles.featuredLabel, { color: colors.action }]}>PROCHAINE ROUTINE{featuredGroup.isFavorite ? ' · FAVORI' : ''}</Text>
                  <View style={styles.featuredHeading}>
                    <View style={[styles.featuredIcon, compact && styles.featuredIconCompact, { backgroundColor: colors.transitionSoft }]}><OpenMoji emoji={featuredGroup.sample.icon} size={compact ? 36 : 42} /></View>
                    <View style={styles.featuredCopy}>
                      <Text accessibilityRole="header" style={[styles.featuredTitle, compact && styles.featuredTitleCompact, { color: colors.text }]}>{featuredGroup.sample.name}</Text>
                      <Text style={[styles.featuredMeta, { color: colors.textSecondary }]}>{featuredParticipantNames.join(', ') || 'Participants à choisir'} · {featuredGroup.sample.steps.length} étapes · {formatDuration(featuredTotalMinutes)}</Text>
                    </View>
                  </View>
                  <View style={styles.stepPreviewRow}>
                    {featuredGroup.sample.steps.slice(0, 3).map((step, index) => (
                      <View key={step.id} style={styles.stepPreview}>
                        <Text style={[styles.stepNumber, { color: colors.action, backgroundColor: colors.surfaceSecondary }]}>{index + 1}</Text>
                        <Text style={[styles.stepTitle, { color: colors.text }]} numberOfLines={2}>{step.title}</Text>
                      </View>
                    ))}
                  </View>
                  <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Lancer ${featuredGroup.sample.name}`} activeOpacity={0.84} onPress={() => launchGroup(featuredGroup)} style={[styles.featuredAction, { backgroundColor: colors.action }]}>
                    <Play size={19} weight="fill" color={colors.surface} />
                    <Text style={[styles.featuredActionText, { color: colors.surface }]}>Lancer{featuredParticipantNames.length === 1 ? ` avec ${featuredParticipantNames[0]}` : ' ensemble'}</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={[styles.emptyCard, styles.featuredEmpty, compact && styles.featuredCardCompact, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={styles.emptyEmoji}>🌱</Text><Text accessibilityRole="header" style={[styles.emptyTitle, { color: colors.text }]}>Aucune routine prête</Text><Text style={[styles.emptyText, { color: colors.textSecondary }]}>Créez un premier déroulé à accompagner.</Text>
                  <TouchableOpacity accessibilityRole="button" onPress={() => router.push('/parent/add-routine')} style={[styles.addButton, { backgroundColor: colors.actionSoft }]}><Plus size={18} weight="bold" color={colors.action} /><Text style={[styles.addText, { color: colors.action }]}>Créer une routine</Text></TouchableOpacity>
                </View>
              )}

              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Ouvrir le calendrier enfant"
                activeOpacity={0.84}
                onPress={() => router.push('/child/calendar')}
                style={[styles.calendarPanel, compact && styles.calendarPanelCompact, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <Text style={[styles.calendarEyebrow, { color: colors.textSecondary }]}>Aujourd’hui</Text>
                <View style={[styles.calendarSurface, { backgroundColor: colors.timeSoft }]}>
                  <View style={styles.calendarHeading}>
                    <View style={[styles.calendarIcon, { backgroundColor: colors.surface }]}><CalendarDots size={25} weight="bold" color={colors.time} /></View>
                    <View style={styles.calendarCopy}><Text style={[styles.calendarTitle, { color: colors.text }]}>Le petit calendrier</Text><Text style={[styles.calendarIntro, { color: colors.textSecondary }]}>Maintenant et après, simplement.</Text></View>
                  </View>
                  {!compact ? <View style={styles.calendarRows}>{calendarRows.length ? calendarRows.map((item) => <View key={item.id} style={[styles.calendarRow, { backgroundColor: colors.surface }]}><Text style={[styles.calendarMoment, { color: colors.text }]}>{momentLabel(item.startMinutes)}</Text><Text style={[styles.calendarEvent, { color: colors.textSecondary }]} numberOfLines={1}>{item.title}</Text></View>) : <View style={[styles.calendarRow, { backgroundColor: colors.surface }]}><Text style={[styles.calendarMoment, { color: colors.text }]}>Aujourd’hui</Text><Text style={[styles.calendarEvent, { color: colors.textSecondary }]}>Temps calme</Text></View>}</View> : null}
                  {!compact && nextCountdown ? <View style={[styles.countdown, { backgroundColor: colors.surface }]}><Text style={[styles.countdownText, { color: colors.text }]}>🌙 Dans {nextCountdown.sleepCount} dodo{nextCountdown.sleepCount > 1 ? 's' : ''} : {nextCountdown.title}</Text></View> : null}
                  <View style={styles.calendarLink}><Text style={[styles.calendarLinkText, { color: colors.time }]}>Voir toute la journée</Text><CaretRight size={16} weight="bold" color={colors.time} /></View>
                </View>
              </TouchableOpacity>
            </View>

            <View style={[styles.listHeading, compact && styles.listHeadingCompact]}><View><Text style={[styles.sectionTitle, { color: colors.text }]}>Autres routines</Text>{routineGroups.length > 1 ? <Text style={[styles.sectionMeta, { color: colors.textSecondary }]}>{routineGroups.length - 1} disponible{routineGroups.length > 2 ? 's' : ''}</Text> : null}</View><View style={[styles.listActions, compact && styles.listActionsCompact]}>{routineGroups.length > 1 ? <TouchableOpacity accessibilityRole="button" accessibilityLabel="Préparer plusieurs routines à la suite" onPress={openChain} style={styles.manageButton}><Text style={[styles.manageText, { color: colors.time }]}>Enchaîner</Text></TouchableOpacity> : null}<TouchableOpacity accessibilityRole="button" accessibilityLabel="Gérer les routines" onPress={() => router.push('/parent/routines')} style={styles.manageButton}><Text style={[styles.manageText, { color: colors.textSecondary }]}>Gérer</Text></TouchableOpacity><TouchableOpacity accessibilityRole="button" accessibilityLabel="Créer une routine" onPress={() => router.push('/parent/add-routine')} activeOpacity={0.82} style={[styles.addButton, { backgroundColor: colors.actionSoft }]}><Plus size={18} weight="bold" color={colors.action} /><Text style={[styles.addText, { color: colors.action }]}>Créer</Text></TouchableOpacity></View></View>

            {displayedGroups.length > 0 ? (
              <View style={styles.routineList}>
                {displayedGroups.map((group) => {
                  const totalMinutes = group.sample.steps.reduce((sum, step) => sum + step.durationMinutes, 0);
                  const participantNames = orderGroupChildIds(group.childIds, familyChildIds)
                    .map((childId) => childrenById.get(childId)?.name)
                    .filter(Boolean)
                    .map((name) => formatChildName(name as string));

                  return (
                    <TouchableOpacity
                      key={group.sample.id}
                      accessibilityRole="button"
                      accessibilityLabel={`Préparer la routine ${group.sample.name}${group.isFavorite ? ', favori' : ''}`}
                      activeOpacity={0.84}
                      onPress={() => launchGroup(group)}
                      style={[styles.routineCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    >
                      <View style={[styles.routineIcon, { backgroundColor: colors.transitionSoft }]}>
                        <OpenMoji emoji={group.sample.icon} size={34} />
                      </View>
                      <View style={styles.routineCopy}>
                        <Text style={[styles.routineName, { color: colors.text }]} numberOfLines={1}>{group.sample.name}</Text>
                        <Text style={[styles.routineMeta, { color: colors.textSecondary }]} numberOfLines={1}>
                          {group.sample.steps.length} étapes · {formatDuration(totalMinutes)}
                        </Text>
                        <Text style={[styles.participants, { color: colors.action }]} numberOfLines={1}>
                          {participantNames.length > 0 ? participantNames.join(', ') : 'Participants à choisir'}
                        </Text>
                      </View>
                      <View style={[styles.playButton, { backgroundColor: colors.actionSoft }]}>
                        <Play size={18} weight="fill" color={colors.action} />
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : null}

            {routineGroups.length > 4 ? (
              <TouchableOpacity
                accessibilityRole="button"
                onPress={() => setShowAll((visible) => !visible)}
                activeOpacity={0.8}
                style={[styles.showAllButton, { borderColor: colors.border }]}
              >
                <Text style={[styles.showAllText, { color: colors.text }]}>{showAll ? 'Réduire la liste' : 'Voir toutes les routines'}</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </ScrollView>
        <ResponsiveOverlay
          visible={chainVisible}
          title="Routines à la suite"
          subtitle="Choisissez au moins deux routines. L’ordre suit votre sélection."
          onClose={() => setChainVisible(false)}
          footer={<TouchableOpacity aria-disabled={chainRoutineIds.length < 2} accessibilityRole="button" accessibilityState={{ disabled: chainRoutineIds.length < 2 }} disabled={chainRoutineIds.length < 2} onPress={launchChain} style={[styles.chainAction, { backgroundColor: chainRoutineIds.length < 2 ? colors.surfaceSecondary : colors.action }]}><Play size={18} weight="fill" color={chainRoutineIds.length < 2 ? colors.textLight : colors.surface} /><Text style={[styles.chainActionText, { color: chainRoutineIds.length < 2 ? colors.textLight : colors.surface }]}>Préparer {chainRoutineIds.length || 0} routine{chainRoutineIds.length > 1 ? 's' : ''}</Text></TouchableOpacity>}
        >
          {routineGroups.map((group) => {
            const selectionIndex = chainRoutineIds.indexOf(group.sample.id);
            const selected = selectionIndex >= 0;
            return (
              <Pressable
                key={group.sample.id}
                aria-checked={selected}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selected }}
                accessibilityLabel={`${selected ? 'Retirer' : 'Ajouter'} ${group.sample.name}`}
                {...(Platform.OS === 'web' ? {
                  onKeyDown: (event: { key: string; preventDefault: () => void }) => {
                    if (event.key === ' ' || event.key === 'Spacebar') {
                      event.preventDefault();
                      toggleChainRoutine(group.sample.id);
                    }
                  },
                } : {})}
                onPress={() => toggleChainRoutine(group.sample.id)}
                style={({ pressed }) => [
                  styles.chainRow,
                  { backgroundColor: selected ? colors.timeSoft : colors.surface, borderColor: selected ? colors.time : colors.border, opacity: pressed ? 0.82 : 1 },
                ]}
              >
                <View style={[styles.chainOrder, { backgroundColor: selected ? colors.time : colors.surfaceSecondary }]}>
                  <Text style={[styles.chainOrderText, { color: selected ? colors.surface : colors.textSecondary }]}>{selected ? selectionIndex + 1 : '·'}</Text>
                </View>
                <OpenMoji emoji={group.sample.icon} size={32} />
                <View style={styles.chainCopy}>
                  <Text style={[styles.chainTitle, { color: colors.text }]}>{group.sample.name}</Text>
                  <Text style={[styles.chainMeta, { color: colors.textSecondary }]}>
                    {group.sample.steps.length} étapes · {formatDuration(group.sample.steps.reduce((sum, step) => sum + step.durationMinutes, 0))}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </ResponsiveOverlay>
        <OutfitPreparationOverlay
          initialSelection={selectedOutfitIds}
          onApply={setSelectedOutfitIds}
          visible={outfitVisible}
          weather={weather}
          loading={weatherLoading}
          onClose={() => setOutfitVisible(false)}
          onOpenSettings={() => {
            setOutfitVisible(false);
            router.push('/parent/weather');
          }}
        />
      </SafeAreaView>
    </View>
  );
}

function WeatherBanner({
  weather,
  loading,
  error,
  outfitItems,
  showFacts,
  onOpen,
}: {
  weather: WeatherData | null;
  loading: boolean;
  error: string | null;
  outfitItems: OutfitVisualItem[];
  showFacts: boolean;
  onOpen: () => void;
}) {
  const { colors } = useAppTheme();
  const temperature = weather ? Math.round(weather.temperature) : null;
  const title = loading && !weather
    ? 'Météo en cours…'
    : error && !weather
      ? 'Météo à régler'
      : weather
        ? `${temperature}° · ${weatherLabel(weather.condition)}`
        : 'Observons le ciel';
  return (
    <View style={[styles.weatherBanner, { backgroundColor: colors.informationSoft }]}>
      <View style={[styles.bannerOrb, { backgroundColor: colors.surface }]}>
        <Text style={styles.bannerEmoji}>{weatherIcon(weather?.condition)}</Text>
      </View>
      <View style={styles.bannerCopy}>
        <Text style={[styles.bannerTitle, { color: colors.text }]} numberOfLines={2}>{title}</Text>
      </View>
      <View style={styles.outfitPreview}>
        <View style={styles.outfitIcons}>{outfitItems.map((item) => <View key={item.id} accessible accessibilityLabel={item.label} testID={`weather-outfit-${item.id}`} style={[styles.outfitIcon, { backgroundColor: colors.surface }]}><OutfitImage id={item.id} size={25} /></View>)}</View>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Modifier la météo et les vêtements" activeOpacity={0.8} onPress={onOpen} style={[styles.outfitButton, { backgroundColor: colors.surface, borderColor: colors.information }]}><Text style={[styles.outfitButtonText, { color: colors.information }]}>Modifier</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  scroll: { padding: SPACING.lg, paddingBottom: SPACING.xl },
  content: { gap: SPACING.lg },
  weatherBanner: { minHeight: 100, borderRadius: 26, padding: SPACING.md, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: SPACING.md, overflow: 'hidden' },
  bannerOrb: { width: 70, height: 70, borderRadius: 35, alignItems: 'center', justifyContent: 'center' },
  bannerEmoji: { fontSize: 37 },
  bannerCopy: { flex: 1, minWidth: 150 },
  bannerEyebrow: { fontSize: FONT_SIZE.xs, lineHeight: 17, fontWeight: '800', letterSpacing: 0.8 },
  bannerTitle: { fontSize: 21, lineHeight: 27, fontWeight: '700', letterSpacing: -0.4 },
  bannerAdvice: { maxWidth: 460, marginTop: 3, fontSize: FONT_SIZE.sm, lineHeight: 20 },
  weatherFacts: { flexDirection: 'row', gap: SPACING.xs },
  weatherFact: { minWidth: 68, minHeight: 54, borderRadius: 15, paddingHorizontal: SPACING.sm, alignItems: 'center', justifyContent: 'center' },
  weatherFactValue: { fontSize: FONT_SIZE.sm, fontWeight: '800' },
  weatherFactLabel: { marginTop: 2, fontSize: 10 },
  outfitPreview: { maxWidth: '100%', flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  outfitIcons: { flexShrink: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  outfitIcon: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  outfitButton: { minHeight: 44, borderRadius: 15, borderWidth: 1, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center' },
  outfitButtonText: { fontSize: FONT_SIZE.sm, fontWeight: '800' },
  resumeCard: { minHeight: 96, borderRadius: 22, padding: SPACING.md, flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  resumeCopy: { flex: 1, minWidth: 0 },
  resumeLabel: { fontSize: FONT_SIZE.xs, fontWeight: '800', letterSpacing: 0.8 },
  resumeTitle: { fontSize: FONT_SIZE.lg, fontWeight: '700', marginTop: 3 },
  resumeMeta: { fontSize: FONT_SIZE.xs, marginTop: 3 },
  heroGrid: { flexDirection: 'row', alignItems: 'stretch', gap: SPACING.md },
  heroGridCompact: { flexDirection: 'column' },
  featuredCard: { flex: 1, minWidth: 0, minHeight: 410, borderRadius: 28, borderWidth: 1, padding: SPACING.lg, gap: SPACING.lg, ...SHADOWS.sm },
  featuredCardCompact: { width: '100%', minHeight: 340, padding: SPACING.md, gap: SPACING.md },
  featuredLabel: { fontSize: FONT_SIZE.sm, fontWeight: '700', letterSpacing: 0.4 },
  featuredHeading: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  featuredIcon: { width: 74, height: 74, borderRadius: 37, alignItems: 'center', justifyContent: 'center' },
  featuredIconCompact: { width: 62, height: 62, borderRadius: 31 },
  featuredCopy: { flex: 1, minWidth: 0, gap: 5 },
  featuredTitle: { fontSize: 27, lineHeight: 33, fontWeight: '700', letterSpacing: -0.4 },
  featuredTitleCompact: { fontSize: 23, lineHeight: 28 },
  featuredMeta: { fontSize: FONT_SIZE.md, lineHeight: 22 },
  stepPreviewRow: { flexDirection: 'row', gap: SPACING.sm },
  stepPreview: { flex: 1, minWidth: 0, alignItems: 'center', gap: SPACING.sm },
  stepNumber: { width: 44, height: 44, borderRadius: 22, lineHeight: 44, textAlign: 'center', textAlignVertical: 'center', fontSize: FONT_SIZE.md, fontWeight: '800' },
  stepTitle: { fontSize: FONT_SIZE.sm, lineHeight: 19, fontWeight: '700', textAlign: 'center' },
  featuredAction: { minHeight: 58, marginTop: 'auto', borderRadius: 18, paddingHorizontal: SPACING.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm },
  featuredActionText: { fontSize: FONT_SIZE.md, fontWeight: '700' },
  featuredEmpty: { flex: 1 },
  calendarPanel: { width: 286, minHeight: 410, borderRadius: 28, borderWidth: 1, padding: SPACING.md, gap: SPACING.sm, ...SHADOWS.sm },
  calendarPanelCompact: { width: '100%', minHeight: 178 },
  calendarEyebrow: { fontSize: FONT_SIZE.sm, fontWeight: '700' },
  calendarSurface: { flex: 1, borderRadius: 22, padding: SPACING.md },
  calendarHeading: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm },
  calendarIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  calendarCopy: { flex: 1, minWidth: 0 },
  calendarTitle: { fontSize: FONT_SIZE.lg, lineHeight: 25, fontWeight: '700' },
  calendarIntro: { marginTop: 3, fontSize: FONT_SIZE.xs, lineHeight: 17 },
  calendarRows: { marginTop: SPACING.md, gap: SPACING.sm },
  calendarRow: { minHeight: 42, borderRadius: 14, paddingHorizontal: SPACING.sm, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: SPACING.sm },
  calendarMoment: { fontSize: FONT_SIZE.xs, fontWeight: '800' },
  calendarEvent: { flex: 1, fontSize: FONT_SIZE.xs, textAlign: 'right' },
  countdown: { marginTop: SPACING.sm, minHeight: 46, borderRadius: 14, padding: SPACING.sm, justifyContent: 'center' },
  countdownText: { fontSize: FONT_SIZE.xs, lineHeight: 17 },
  calendarLink: { marginTop: 'auto', paddingTop: SPACING.md, flexDirection: 'row', alignItems: 'center', gap: 2 },
  calendarLinkText: { fontSize: FONT_SIZE.xs, fontWeight: '800' },
  listHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: SPACING.md },
  listHeadingCompact: { flexDirection: 'column', alignItems: 'stretch', gap: SPACING.xs },
  listActions: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  listActionsCompact: { justifyContent: 'flex-end' },
  manageButton: { minHeight: 44, paddingHorizontal: SPACING.sm, alignItems: 'center', justifyContent: 'center' },
  manageText: { fontSize: FONT_SIZE.sm, fontWeight: '700' },
  sectionTitle: { fontSize: FONT_SIZE.xl, fontWeight: '700' },
  sectionMeta: { fontSize: FONT_SIZE.xs, marginTop: 3 },
  addButton: { minHeight: 44, borderRadius: 14, paddingHorizontal: SPACING.md, flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  addText: { fontSize: FONT_SIZE.sm, fontWeight: '700' },
  routineList: { gap: SPACING.sm },
  routineCard: { minHeight: 96, borderRadius: 19, borderWidth: 1, padding: SPACING.sm, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, ...SHADOWS.sm },
  routineIcon: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  routineCopy: { flex: 1, minWidth: 0 },
  routineName: { fontSize: FONT_SIZE.md, fontWeight: '700' },
  routineMeta: { fontSize: FONT_SIZE.xs, marginTop: 3 },
  participants: { fontSize: FONT_SIZE.xs, fontWeight: '700', marginTop: 6 },
  playButton: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  emptyCard: { minHeight: 210, borderRadius: 22, borderWidth: 1, padding: SPACING.xl, alignItems: 'center', justifyContent: 'center', gap: SPACING.sm },
  emptyEmoji: { fontSize: 42 },
  emptyTitle: { fontSize: FONT_SIZE.lg, fontWeight: '700', textAlign: 'center' },
  emptyText: { maxWidth: 380, fontSize: FONT_SIZE.sm, lineHeight: 20, textAlign: 'center' },
  showAllButton: { minHeight: 48, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  showAllText: { fontSize: FONT_SIZE.sm, fontWeight: '700' },
  chainRow: { minHeight: 72, borderRadius: 18, borderWidth: 1, padding: SPACING.sm, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  chainOrder: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  chainOrderText: { fontSize: FONT_SIZE.sm, fontWeight: '800' },
  chainCopy: { flex: 1, minWidth: 0 },
  chainTitle: { fontSize: FONT_SIZE.md, fontWeight: '800' },
  chainMeta: { marginTop: 3, fontSize: FONT_SIZE.xs },
  chainAction: { minHeight: 52, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm },
  chainActionText: { fontSize: FONT_SIZE.sm, fontWeight: '800' },
});
