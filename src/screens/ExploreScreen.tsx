import React, { useMemo, useState } from 'react';
import {
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ROUTINE_PACKS } from '../constants/routineTemplates';
import { COLORS, CONTENT_MAX_WIDTH, FONT_SIZE, RADIUS, SHADOWS, SPACING } from '../constants/theme';
import { activities } from '../features/activities/activities';
import { findMatchingActivities, sortActivitiesByRelevance } from '../features/activities/activity-filter';
import { useActivityStore } from '../features/activities/activity-store';
import { AGE_RANGES, DURATION_OPTIONS, WEATHER_OPTIONS } from '../features/activities/options';
import { Activity, ActivityFilters } from '../features/activities/types';
import { activityTypeLabel, weatherLabel } from '../features/activities/labels';

type ActivitiesMode = 'activities' | 'routines';

const QUICK_FILTERS: Array<{ label: string; patch: Partial<ActivityFilters> }> = [
  { label: 'Calme', patch: { need: 'calme', noiseLevel: 'low' } },
  { label: 'Bouger', patch: { need: 'defoulement' } },
  { label: '10 min', patch: { duration: 10 } },
  { label: 'Pluie', patch: { weather: 'rainy' } },
  { label: 'Autonome', patch: { independenceLevel: 'high', requiresSupervision: false } },
];

export function ActivitiesScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [mode, setMode] = useState<ActivitiesMode>('activities');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const filters = useActivityStore((state) => state.filters);
  const favoriteIds = useActivityStore((state) => state.favoriteIds);
  const history = useActivityStore((state) => state.history);
  const setFilters = useActivityStore((state) => state.setFilters);
  const resetFilters = useActivityStore((state) => state.resetFilters);
  const toggleFavorite = useActivityStore((state) => state.toggleFavorite);
  const saveToHistory = useActivityStore((state) => state.saveToHistory);

  const contentWidth = Math.min(width - SPACING.lg * 2, CONTENT_MAX_WIDTH.lg);
  const matchingActivities = useMemo(
    () => sortActivitiesByRelevance(findMatchingActivities(filters, activities, favoriteIds), favoriteIds, history),
    [favoriteIds, filters, history],
  );
  const visibleActivities = matchingActivities.slice(0, 12);

  const openActivity = (activity: Activity) => {
    saveToHistory(activity);
    setSelectedActivity(activity);
  };

  return (
    <LinearGradient colors={['#EAF4F0', '#FFF8EF', '#F4E8D8']} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={[styles.scroll, { alignItems: 'center' }]} showsVerticalScrollIndicator={false}>
          <View style={[styles.content, { width: contentWidth, maxWidth: '100%' }]}>
            <View style={styles.header}>
              <Text style={styles.title}>Activites</Text>
              <Text style={styles.subtitle}>Choisis le besoin. L'app propose des idees simples.</Text>
            </View>

            <View style={styles.segmented}>
              <SegmentButton label="Activites" selected={mode === 'activities'} onPress={() => setMode('activities')} />
              <SegmentButton label="Routines" selected={mode === 'routines'} onPress={() => setMode('routines')} />
            </View>

            {mode === 'activities' ? (
              <>
                <View style={styles.quickPanel}>
                  <View style={styles.quickPanelHeader}>
                    <Text style={styles.panelTitle}>J'ai besoin de...</Text>
                    <TouchableOpacity onPress={resetFilters} activeOpacity={0.82}>
                      <Text style={styles.resetText}>Tout voir</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.quickChips}>
                    {QUICK_FILTERS.map((filter) => (
                      <FilterChip
                        key={filter.label}
                        label={filter.label}
                        selected={matchesPatch(filters, filter.patch)}
                        onPress={() => setFilters(matchesPatch(filters, filter.patch) ? clearPatch(filter.patch) : filter.patch)}
                      />
                    ))}
                    <FilterChip
                      label="Favoris"
                      selected={Boolean(filters.favoritesOnly)}
                      onPress={() => setFilters({ favoritesOnly: !filters.favoritesOnly })}
                    />
                  </View>
                  <TouchableOpacity
                    onPress={() => setShowAdvancedFilters((value) => !value)}
                    activeOpacity={0.84}
                    style={styles.advancedToggle}
                  >
                    <Text style={styles.advancedToggleText}>
                      {showAdvancedFilters ? 'Masquer les filtres' : 'Plus de filtres'}
                    </Text>
                    <Text style={styles.resultCount}>{matchingActivities.length} resultats</Text>
                  </TouchableOpacity>

                  {showAdvancedFilters ? (
                    <AdvancedFilters filters={filters} onChange={setFilters} />
                  ) : null}
                </View>

                <View style={styles.resultsHeader}>
                  <Text style={styles.panelTitle}>Idees simples</Text>
                  <Text style={styles.resultCount}>12 max</Text>
                </View>

                <View style={styles.cardList}>
                  {visibleActivities.map((activity) => (
                    <ActivityRow
                      key={activity.id}
                      activity={activity}
                      favorite={favoriteIds.includes(activity.id)}
                      onOpen={() => openActivity(activity)}
                      onToggleFavorite={() => toggleFavorite(activity.id)}
                    />
                  ))}
                </View>
              </>
            ) : (
              <View style={styles.cardList}>
                {ROUTINE_PACKS.map((pack) => (
                  <TouchableOpacity
                    key={pack.id}
                    onPress={() => router.push('/parent/catalog')}
                    activeOpacity={0.86}
                    style={styles.routinePack}
                  >
                    <Text style={styles.packIcon}>{pack.icon}</Text>
                    <View style={styles.packCopy}>
                      <Text style={styles.packTitle}>{pack.name}</Text>
                      <Text style={styles.packMeta}>{pack.templates.length} routines pretes</Text>
                    </View>
                    <Text style={styles.arrow}>›</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        <ActivityDetailModal activity={selectedActivity} onClose={() => setSelectedActivity(null)} />
      </SafeAreaView>
    </LinearGradient>
  );
}

export { ActivitiesScreen as ExploreScreen };

function matchesPatch(filters: ActivityFilters, patch: Partial<ActivityFilters>) {
  return Object.entries(patch).every(([key, value]) => filters[key as keyof ActivityFilters] === value);
}

function clearPatch(patch: Partial<ActivityFilters>): Partial<ActivityFilters> {
  return Object.keys(patch).reduce<Partial<ActivityFilters>>((next, key) => {
    (next as Record<string, undefined>)[key] = undefined;
    return next;
  }, {});
}

function AdvancedFilters({
  filters,
  onChange,
}: {
  filters: ActivityFilters;
  onChange: (filters: Partial<ActivityFilters>) => void;
}) {
  return (
    <View style={styles.advancedPanel}>
      <ChipGroup title="Age">
        {AGE_RANGES.map((range) => (
          <FilterChip
            key={range.id}
            label={range.label}
            selected={filters.ageRange === range.id}
            onPress={() => onChange({ ageRange: filters.ageRange === range.id ? undefined : range.id })}
          />
        ))}
      </ChipGroup>
      <ChipGroup title="Duree">
        {DURATION_OPTIONS.map((duration) => (
          <FilterChip
            key={duration}
            label={`${duration} min`}
            selected={filters.duration === duration}
            onPress={() => onChange({ duration: filters.duration === duration ? undefined : duration })}
          />
        ))}
      </ChipGroup>
      <ChipGroup title="Lieu / meteo">
        {WEATHER_OPTIONS.map((weather) => (
          <FilterChip
            key={weather.id}
            label={weather.label}
            selected={filters.weather === weather.id}
            onPress={() => onChange({ weather: filters.weather === weather.id ? 'any' : weather.id })}
          />
        ))}
      </ChipGroup>
    </View>
  );
}

function ActivityRow({
  activity,
  favorite,
  onOpen,
  onToggleFavorite,
}: {
  activity: Activity;
  favorite: boolean;
  onOpen: () => void;
  onToggleFavorite: () => void;
}) {
  return (
    <TouchableOpacity onPress={onOpen} activeOpacity={0.88} style={styles.activityRow}>
      <View style={styles.activityIconWrap}>
        <Text style={styles.activityIcon}>{activity.thumbnail}</Text>
      </View>
      <View style={styles.activityCopy}>
        <Text style={styles.activityTitle} numberOfLines={1}>{activity.title}</Text>
        <Text style={styles.activityMeta} numberOfLines={1}>
          {activity.duration} min · {activityTypeLabel(activity.activityType)} · {weatherLabel(activity.weather)}
        </Text>
      </View>
      <TouchableOpacity onPress={onToggleFavorite} activeOpacity={0.82} style={[styles.favoriteButton, favorite && styles.favoriteButtonActive]}>
        <Text style={[styles.favoriteText, favorite && styles.favoriteTextActive]}>{favorite ? '★' : '+'}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

function ActivityDetailModal({ activity, onClose }: { activity: Activity | null; onClose: () => void }) {
  if (!activity) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalIcon}>{activity.thumbnail}</Text>
              <View style={styles.modalTitleWrap}>
                <Text style={styles.modalTitle}>{activity.title}</Text>
                <Text style={styles.modalSubtitle}>{activity.duration} min · {activity.ageMin}-{activity.ageMax} ans</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeText}>×</Text>
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.modalScroll}>
              <Text style={styles.detailText}>{activity.description}</Text>
              <Text style={styles.detailSectionTitle}>A faire</Text>
              {activity.steps.slice(0, 5).map((step, index) => (
                <View key={`${activity.id}-${index}`} style={styles.stepRow}>
                  <Text style={styles.stepNumber}>{index + 1}</Text>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
              <Text style={styles.detailSectionTitle}>Version facile</Text>
              <Text style={styles.detailText}>{activity.koVariant}</Text>
            </ScrollView>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

function SegmentButton({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.segmentButton, selected && styles.segmentButtonActive]} activeOpacity={0.86}>
      <Text style={[styles.segmentText, selected && styles.segmentTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function ChipGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.chipGroup}>
      <Text style={styles.chipGroupTitle}>{title}</Text>
      <View style={styles.quickChips}>{children}</View>
    </View>
  );
}

function FilterChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.82} style={[styles.chip, selected && styles.chipActive]}>
      <Text style={[styles.chipText, selected && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  scroll: {
    padding: SPACING.lg,
    paddingBottom: 110,
  },
  content: {
    gap: SPACING.md,
  },
  header: {
    gap: 4,
  },
  title: {
    color: COLORS.text,
    fontSize: 30,
    fontWeight: '900',
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    fontWeight: '800',
  },
  segmented: {
    flexDirection: 'row',
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.88)',
    padding: 6,
    gap: 6,
    ...SHADOWS.sm,
  },
  segmentButton: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.full,
  },
  segmentButtonActive: {
    backgroundColor: COLORS.secondary,
  },
  segmentText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    fontWeight: '900',
  },
  segmentTextActive: {
    color: '#FFFFFF',
  },
  quickPanel: {
    borderRadius: RADIUS.xl,
    backgroundColor: 'rgba(255,255,255,0.92)',
    padding: SPACING.md,
    gap: SPACING.md,
    ...SHADOWS.sm,
  },
  quickPanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  panelTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: '900',
  },
  resetText: {
    color: COLORS.secondaryDark,
    fontSize: FONT_SIZE.sm,
    fontWeight: '900',
  },
  quickChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  chip: {
    minHeight: 40,
    justifyContent: 'center',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  chipText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    fontWeight: '900',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  advancedToggle: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.cardHighlight,
    paddingHorizontal: SPACING.md,
  },
  advancedToggleText: {
    color: COLORS.text,
    fontSize: FONT_SIZE.sm,
    fontWeight: '900',
  },
  resultCount: {
    color: COLORS.textLight,
    fontSize: FONT_SIZE.xs,
    fontWeight: '900',
  },
  advancedPanel: {
    gap: SPACING.md,
  },
  chipGroup: {
    gap: SPACING.xs,
  },
  chipGroupTitle: {
    color: COLORS.textLight,
    fontSize: FONT_SIZE.xs,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardList: {
    gap: SPACING.sm,
  },
  activityRow: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    borderRadius: RADIUS.xl,
    backgroundColor: 'rgba(255,255,255,0.94)',
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  activityIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accentSoft,
  },
  activityIcon: {
    fontSize: 26,
  },
  activityCopy: {
    flex: 1,
    minWidth: 0,
  },
  activityTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: '900',
  },
  activityMeta: {
    marginTop: 3,
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceSecondary,
  },
  favoriteButtonActive: {
    backgroundColor: COLORS.accent,
  },
  favoriteText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.lg,
    fontWeight: '900',
  },
  favoriteTextActive: {
    color: '#6E5620',
  },
  routinePack: {
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    borderRadius: RADIUS.xl,
    backgroundColor: 'rgba(255,255,255,0.94)',
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  packIcon: {
    fontSize: 30,
  },
  packCopy: {
    flex: 1,
    minWidth: 0,
  },
  packTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: '900',
  },
  packMeta: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
  },
  arrow: {
    color: COLORS.textLight,
    fontSize: 30,
    fontWeight: '900',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    padding: SPACING.lg,
  },
  modalSafe: {
    flex: 1,
    justifyContent: 'center',
  },
  modalCard: {
    maxHeight: '86%',
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
    gap: SPACING.md,
    ...SHADOWS.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  modalIcon: {
    fontSize: 36,
  },
  modalTitleWrap: {
    flex: 1,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: '900',
  },
  modalSubtitle: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
  },
  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
  },
  closeText: {
    color: COLORS.textSecondary,
    fontSize: 24,
    fontWeight: '900',
  },
  modalScroll: {
    gap: SPACING.md,
  },
  detailText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.md,
    lineHeight: 23,
    fontWeight: '700',
  },
  detailSectionTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: '900',
  },
  stepRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  stepNumber: {
    width: 26,
    color: COLORS.secondaryDark,
    fontSize: FONT_SIZE.sm,
    fontWeight: '900',
  },
  stepText: {
    flex: 1,
    color: COLORS.text,
    fontSize: FONT_SIZE.sm,
    lineHeight: 21,
    fontWeight: '700',
  },
});
