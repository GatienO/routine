import React, { useEffect, useMemo, useRef, useState, useDeferredValue } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  AppState,
  ScrollView,
  useWindowDimensions,
  Platform,
  Modal,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { BounceIn, FadeInUp } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { CaretDown, CaretUp, Check, ClipboardText, Gift, Rocket, Heart } from 'phosphor-react-native';
import { useChildrenStore } from '../../src/stores/childrenStore';
import { useAppStore } from '../../src/stores/appStore';
import { useRoutineStore } from '../../src/stores/routineStore';
import { useWeatherStore } from '../../src/stores/weatherStore';
import { Avatar } from '../../src/components/ui/Avatar';
import { AnimatedPressable } from '../../src/components/ui/AnimatedPressable';
import { AppPageHeader } from '../../src/components/ui/AppPageHeader';
import { BackButton } from '../../src/components/ui/BackButton';
import { WeatherCard } from '../../src/components/weather/WeatherCard';
import { ChildDashboardHeader, CategoryFilterValue } from '../../src/components/child/ChildDashboardHeader';
import { OpenMoji } from '../../src/components/ui/OpenMoji';
import { COLORS, SPACING, FONT_SIZE, SHADOWS, RADIUS, CATEGORY_CONFIG } from '../../src/constants/theme';
import {
  DEFAULT_WEATHER_THEME,
  getWeatherSecondaryTextColor,
  getWeatherTextColor,
  getWeatherTheme,
} from '../../src/constants/weatherThemes';
import { WEATHER_LIVE_REFRESH_MS } from '../../src/services/weather';
import { formatChildName } from '../../src/utils/children';
import { formatDuration } from '../../src/utils/date';

const ROUTINES_PER_PAGE = 10;
const STEP_PREVIEW_LIMIT = 5;

export type StatusFilterValue = 'active' | 'inactive';
export type FavoriteFilterValue = 'all' | 'favorites' | 'others';
type RoutineSortValue = 'recent' | 'alphabetical';

const ROUTINE_SORT_OPTIONS: Array<{ key: RoutineSortValue; label: string }> = [
  { key: 'recent', label: 'Plus recent' },
  { key: 'alphabetical', label: 'Alphabetique' },
];

const softTint = (color: string, alpha = '20') => `${color}${alpha}`;

export default function ChildLauncherScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { children, getChild } = useChildrenStore();
  const { selectChild, weatherCity, useGeolocation } = useAppStore();
  const { routines, toggleFavorite } = useRoutineStore();
  const { weather, refresh: refreshWeather } = useWeatherStore();
  const [selectedRoutineIds, setSelectedRoutineIds] = useState<string[]>([]);
  const [selectedChildIds, setSelectedChildIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<CategoryFilterValue[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<StatusFilterValue[]>([]);
  const [selectedFavorite, setSelectedFavorite] = useState<FavoriteFilterValue>('all');
  const [selectedSort, setSelectedSort] = useState<RoutineSortValue>('recent');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [sortAnchor, setSortAnchor] = useState<{ x: number; y: number; width: number } | null>(null);
  const sortButtonRef = useRef<any>(null);

  const weatherTheme = weather
    ? getWeatherTheme(weather.condition, weather.isDay)
    : DEFAULT_WEATHER_THEME;
  const textColor = weather ? getWeatherTextColor(weather.isDay) : COLORS.text;
  const secondaryColor = weather ? getWeatherSecondaryTextColor(weather.isDay) : COLORS.textSecondary;
  const isNight = weather ? !weather.isDay : false;
  const contentWidth = Math.min(width - SPACING.lg * 2, 1100);

  const deferredSearch = useDeferredValue(searchQuery.trim().toLowerCase());

  const matchesCategoryFilter = (category: CategoryFilterValue) => {
    if (selectedCategories.length === 0) return true;
    return selectedCategories.includes(category);
  };

  const matchesChildFilter = (childId: string) => {
    if (selectedChildIds.length === 0) return true;
    return selectedChildIds.includes(childId);
  };

  const matchesStatusFilter = (isActive: boolean) => {
    if (selectedStatuses.length === 0) return true;
    if (selectedStatuses.includes('active') && isActive) return true;
    if (selectedStatuses.includes('inactive') && !isActive) return true;
    return false;
  };

  const matchesFavoriteFilter = (isFavorite: boolean | undefined) => {
    const fav = isFavorite ?? false;
    if (selectedFavorite === 'all') return true;
    if (selectedFavorite === 'favorites') return fav;
    if (selectedFavorite === 'others') return !fav;
    return true;
  };

  // Créer une liste plate de toutes les routines filtrées
  const filteredRoutines = useMemo(
    () =>
      routines
        .filter((routine) => matchesStatusFilter(routine.isActive))
        .filter((routine) => matchesChildFilter(routine.childId))
        .filter((routine) => matchesCategoryFilter(routine.category))
        .filter((routine) => matchesFavoriteFilter(routine.isFavorite))
        .filter((routine) => {
          if (!deferredSearch) return true;
          const haystack = [
            routine.name,
            routine.description ?? '',
            routine.steps.map((step) => step.title).join(' '),
          ].join(' ').toLowerCase();
          return haystack.includes(deferredSearch);
        })
        .sort((left, right) => {
          if (selectedSort === 'alphabetical') {
            return left.name.localeCompare(right.name, 'fr', { sensitivity: 'base' });
          }

          const leftTime = new Date(left.updatedAt).getTime();
          const rightTime = new Date(right.updatedAt).getTime();
          return rightTime - leftTime;
        }),
    [routines, selectedChildIds, selectedCategories, selectedStatuses, selectedFavorite, deferredSearch, selectedSort],
  );

  // Pagination
  const totalPages = Math.ceil(filteredRoutines.length / ROUTINES_PER_PAGE);
  const validPage = Math.max(1, Math.min(currentPage, totalPages || 1));
  const paginatedRoutines = filteredRoutines.slice(
    (validPage - 1) * ROUTINES_PER_PAGE,
    validPage * ROUTINES_PER_PAGE,
  );

  const selectedRoutines = selectedRoutineIds
    .map((routineId) => routines.find((routine) => routine.id === routineId))
    .filter((routine): routine is NonNullable<typeof routine> => Boolean(routine));
  const selectedDuration = selectedRoutines.reduce(
    (sum, routine) => sum + routine.steps.reduce((stepSum, step) => stepSum + step.durationMinutes, 0),
    0,
  );

  useEffect(() => {
    refreshWeather(
      { cityName: weatherCity, useGeolocation },
      { maxCacheAgeMs: WEATHER_LIVE_REFRESH_MS },
    );
  }, [weatherCity, useGeolocation, refreshWeather]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        refreshWeather(
          { cityName: weatherCity, useGeolocation },
          { maxCacheAgeMs: WEATHER_LIVE_REFRESH_MS },
        );
      }
    });

    return () => subscription.remove();
  }, [weatherCity, useGeolocation, refreshWeather]);

  const handleGoBack = () => {
    selectChild(null);
    router.replace('/');
  };

  const handleOpenRewards = () => {
    router.push('/child/rewards');
  };

  const toggleRoutine = (routineId: string) => {
    setSelectedRoutineIds((prev) =>
      prev.includes(routineId)
        ? prev.filter((id) => id !== routineId)
        : [...prev, routineId],
    );
  };

  const handleToggleChild = (childId: string) => {
    setSelectedChildIds((previous) => {
      const next = previous.includes(childId)
        ? previous.filter((id) => id !== childId)
        : [...previous, childId];
      return next;
    });
  };

  const handleClearChildSelection = () => {
    setSelectedChildIds([]);
  };

  const handleToggleCategory = (value: CategoryFilterValue) => {
    setSelectedCategories((previous) => {
      const next = previous.includes(value)
        ? previous.filter((currentValue) => currentValue !== value)
        : [...previous, value];

      const CATEGORY_FILTER_OPTIONS: CategoryFilterValue[] = [
        'morning',
        'evening',
        'school',
        'home',
        'weekend',
        'emotion',
        'custom',
      ];

      return next.length === CATEGORY_FILTER_OPTIONS.length ? [] : next;
    });
  };

  const handleClearCategories = () => {
    setSelectedCategories([]);
  };

  const handleToggleStatus = (value: StatusFilterValue) => {
    setSelectedStatuses((previous) => {
      const next = previous.includes(value)
        ? previous.filter((currentValue) => currentValue !== value)
        : [...previous, value];
      return next.length === 2 ? [] : next;
    });
    setCurrentPage(1);
  };

  const handleClearStatuses = () => {
    setSelectedStatuses([]);
    setCurrentPage(1);
  };

  const handleToggleFavorite = (value: FavoriteFilterValue) => {
    setSelectedFavorite(value);
    setCurrentPage(1);
  };

  const openSortMenu = () => {
    const targetNode = sortButtonRef.current as unknown as {
      measureInWindow?: (callback: (x: number, y: number, width: number, height: number) => void) => void;
    } | null;

    if (targetNode?.measureInWindow) {
      targetNode.measureInWindow((x, y, measuredWidth, measuredHeight) => {
        setSortAnchor({ x, y: y + measuredHeight + 8, width: measuredWidth });
        setShowSortMenu(true);
      });
      return;
    }

    setSortAnchor(null);
    setShowSortMenu(true);
  };

  const closeSortMenu = () => {
    setShowSortMenu(false);
    setSortAnchor(null);
  };

  // Réinitialiser la page quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedChildIds, selectedCategories, selectedStatuses, selectedFavorite, deferredSearch, selectedSort]);

  const handleContinue = () => {
    if (selectedRoutineIds.length === 0) return;

    selectChild(null);
    router.push({
      pathname: '/child/summary',
      params: { routineIds: selectedRoutineIds.join(',') },
    });
  };

  if (children.length === 0) {
    return (
      <LinearGradient colors={weatherTheme.gradient} style={styles.gradient}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.empty}>
            <Animated.Text entering={BounceIn.duration(600)} style={styles.emptyIcon}>🙂</Animated.Text>
            <Animated.Text entering={FadeInUp.delay(300)} style={[styles.emptyTitle, { color: textColor }]}>
              Pas encore de profil
            </Animated.Text>
            <Animated.Text entering={FadeInUp.delay(450)} style={[styles.emptyText, { color: secondaryColor }]}>
              Demande a tes parents de creer ton profil.
            </Animated.Text>
            <BackButton onPress={handleGoBack} style={styles.emptyBackButton} />
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (filteredRoutines.length === 0) {
    return (
      <LinearGradient colors={weatherTheme.gradient} style={styles.gradient}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.empty}>
            <ClipboardText size={72} weight="duotone" color={secondaryColor} />
            <Text style={[styles.emptyTitle, { color: textColor }]}>Aucune routine active</Text>
            <Text style={[styles.emptyText, { color: secondaryColor }]}>
              Demande a tes parents de preparer une routine pour commencer.
            </Text>
            <BackButton onPress={handleGoBack} style={styles.emptyBackButton} />
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={weatherTheme.gradient} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentContainerStyle={[styles.scroll, styles.scrollCentered]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.content, { width: contentWidth, maxWidth: '100%' }]}>
            <Animated.View entering={FadeInUp.duration(300)} style={styles.topBar}>
                <AppPageHeader
                  title="Espace Enfant"
                  onBack={handleGoBack}
                  onHome={() => router.replace('/')}
                />
              </Animated.View>

              <Animated.View entering={FadeInUp.duration(300)} style={styles.topBarActions}>
              <AnimatedPressable
                onPress={handleOpenRewards}
                style={[styles.topRewardsButton, isNight && styles.topRewardsButtonNight]}
                scaleDown={0.97}
              >
                <Gift size={16} weight="fill" color={COLORS.secondary} />
                <Text style={[styles.topRewardsText, { color: textColor }]}>Badges & Récompenses</Text>
              </AnimatedPressable>
            </Animated.View>

            {weather ? <WeatherCard weather={weather} /> : null}

            <ChildDashboardHeader
              children={children}
              selectedChildIds={selectedChildIds}
              onToggleChild={handleToggleChild}
              onClearChildSelection={handleClearChildSelection}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategories={selectedCategories}
              onToggleCategory={handleToggleCategory}
              onClearCategories={handleClearCategories}
              selectedStatuses={selectedStatuses}
              onToggleStatus={handleToggleStatus}
              onClearStatuses={handleClearStatuses}
            />

            {/* Liste des routines paginée */}
            <View style={styles.routinesTable}>
              {paginatedRoutines.map((routine, index) => {
                const duration = routine.steps.reduce((sum, step) => sum + step.durationMinutes, 0);
                const isSelected = selectedRoutineIds.includes(routine.id);
                const owner = getChild(routine.childId);
                const category = CATEGORY_CONFIG[routine.category];
                const previewSteps = routine.steps.slice(0, STEP_PREVIEW_LIMIT);

                return (
                  <Animated.View
                    key={routine.id}
                    entering={FadeInUp.delay(50 + index * 30).duration(250)}
                  >
                    <AnimatedPressable
                      style={[
                        styles.routineCard,
                        isSelected && styles.routineCardSelected,
                      ]}
                      onPress={() => toggleRoutine(routine.id)}
                      scaleDown={0.98}
                      hitSlop={8}
                    >
                      <View style={styles.routineCardHeader}>
                        <View style={[styles.routineIcon, { backgroundColor: softTint(routine.color) }]}>
                          <OpenMoji emoji={routine.icon} size={30} />
                        </View>

                        <View style={styles.routineCardContent}>
                          <View style={styles.routineCardHeading}>
                            <View style={styles.routineCardInfo}>
                              <Text style={styles.routineCardName} numberOfLines={1}>
                                {routine.name}
                              </Text>
                              <View style={styles.metaRow}>
                                <View style={styles.metaPill}>
                                  <Text style={styles.metaPillText}>
                                    {category?.label ?? routine.category}
                                  </Text>
                                </View>
                                <View style={styles.metaPill}>
                                  <Text style={styles.metaPillText}>
                                    {routine.steps.length} etapes
                                  </Text>
                                </View>
                                <View style={styles.metaPill}>
                                  <Text style={styles.metaPillText}>
                                    ~{formatDuration(duration)}
                                  </Text>
                                </View>
                              </View>
                            </View>

                            <TouchableOpacity
                              onPress={() => toggleFavorite(routine.id)}
                              hitSlop={12}
                              style={[
                                styles.favoriteButton,
                                routine.isFavorite && styles.favoriteButtonActive,
                              ]}
                            >
                              <Heart
                                size={18}
                                weight={routine.isFavorite ? 'fill' : 'regular'}
                                color={routine.isFavorite ? COLORS.error : COLORS.textSecondary}
                              />
                            </TouchableOpacity>
                          </View>

                          {owner ? (
                            <View style={[styles.childPill, { backgroundColor: softTint(owner.color) }]}>
                              <Avatar
                                emoji={owner.avatar}
                                color={owner.color}
                                size={28}
                                avatarConfig={owner.avatarConfig}
                              />
                              <Text style={styles.childPillText}>
                                Pour {formatChildName(owner.name)}
                              </Text>
                            </View>
                          ) : null}

                          {previewSteps.length > 0 ? (
                            <View style={styles.stepsRow}>
                              {previewSteps.map((step) => (
                                <View key={step.id} style={styles.stepPill}>
                                  <OpenMoji emoji={step.icon} size={14} />
                                  <Text style={styles.stepPillText} numberOfLines={1}>
                                    {step.title}
                                  </Text>
                                </View>
                              ))}
                            </View>
                          ) : null}
                        </View>
                      </View>

                      <View style={[styles.routineFooter, isSelected && styles.routineFooterSelected]}>
                        <Text style={[styles.routineFooterLabel, isSelected && styles.routineFooterLabelSelected]}>
                          {isSelected ? 'Selectionnee pour ma session' : 'Ajouter a ma session'}
                        </Text>
                        <View style={[styles.orderBadge, isSelected && styles.orderBadgeActive]}>
                          <Text style={[styles.orderBadgeText, isSelected && styles.orderBadgeTextActive]}>
                            {isSelected ? selectedRoutineIds.indexOf(routine.id) + 1 : '+'}
                          </Text>
                        </View>
                      </View>
                    </AnimatedPressable>
                  </Animated.View>
                );
              })}
            </View>

            {/* Pagination */}
            {totalPages > 1 ? (
              <View style={styles.paginationContainer}>
                <TouchableOpacity
                  onPress={() => setCurrentPage(Math.max(1, validPage - 1))}
                  disabled={validPage === 1}
                  style={[styles.paginationButton, validPage === 1 && styles.paginationButtonDisabled]}
                >
                  <CaretDown size={14} weight="bold" color={validPage === 1 ? COLORS.textLight : COLORS.textSecondary} style={{ transform: [{ rotate: '90deg' }] }} />
                </TouchableOpacity>
                <Text style={[styles.paginationText, { color: secondaryColor }]}>
                  Page {validPage} sur {totalPages}
                </Text>
                <TouchableOpacity
                  onPress={() => setCurrentPage(Math.min(totalPages, validPage + 1))}
                  disabled={validPage === totalPages}
                  style={[styles.paginationButton, validPage === totalPages && styles.paginationButtonDisabled]}
                >
                  <CaretDown size={14} weight="bold" color={validPage === totalPages ? COLORS.textLight : COLORS.textSecondary} />
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        </ScrollView>

        <Modal transparent visible={showSortMenu} animationType="none" onRequestClose={closeSortMenu}>
          <Pressable style={styles.sortMenuBackdrop} onPress={closeSortMenu}>
            <Pressable
              style={[
                styles.sortDropdownMenu,
                {
                  width: Math.max(180, sortAnchor?.width ?? 180),
                  left: sortAnchor?.x ?? 0,
                  top: sortAnchor?.y ?? 0,
                },
              ]}
              onPress={(event) => event.stopPropagation()}
            >
              <Text style={styles.sortMenuTitle}>Tri des routines</Text>
              {ROUTINE_SORT_OPTIONS.map((option) => {
                const selected = option.key === selectedSort;

                return (
                  <TouchableOpacity
                    key={option.key}
                    style={[styles.sortOption, selected && styles.sortOptionSelected]}
                    onPress={() => {
                      setSelectedSort(option.key);
                      closeSortMenu();
                    }}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.sortOptionText, selected && styles.sortOptionTextSelected]}>
                      {option.label}
                    </Text>
                    {selected ? <Check size={14} weight="bold" color="#FFF" /> : null}
                  </TouchableOpacity>
                );
              })}
            </Pressable>
          </Pressable>
        </Modal>

        <View
          style={[
            styles.footer,
            Platform.OS === 'web' ? ({ pointerEvents: 'box-none' } as any) : null,
          ]}
          {...(Platform.OS === 'web' ? {} : { pointerEvents: 'box-none' })}
        >
          <AnimatedPressable
            onPress={handleContinue}
            disabled={selectedRoutineIds.length === 0}
            style={[
              styles.footerButton,
              { maxWidth: contentWidth, alignSelf: 'center' },
              selectedRoutineIds.length > 0 ? styles.footerButtonActive : styles.footerButtonInactive,
            ]}
            scaleDown={0.96}
          >
            <View style={styles.footerButtonRow}>
              <Rocket size={18} weight="fill" color="#FFF" />
              <Text style={styles.footerButtonText}>
                {selectedRoutineIds.length > 0
                  ? `${selectedRoutineIds.length} routine${selectedRoutineIds.length > 1 ? 's' : ''} · ${formatDuration(selectedDuration)}`
                  : 'Choisis au moins une routine'}
              </Text>
            </View>
          </AnimatedPressable>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  scroll: {
    padding: SPACING.lg,
    paddingBottom: 140,
  },
  scrollCentered: {
    alignItems: 'center',
  },
  content: {
    width: '100%',
    gap: SPACING.xs,
  },
  topBar: {
    width: '100%',
    marginBottom: SPACING.xs,
  },
  topBarActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: SPACING.xs,
  },
  headerBackButton: {},
  topRewardsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    ...SHADOWS.sm,
  },
  topRewardsButtonNight: {
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  topRewardsText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '800',
  },
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  sectionHeader: {
    marginBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  childIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  childMeta: {
    flex: 1,
    gap: 2,
  },
  sectionToggle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  childName: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    color: COLORS.text,
  },
  childHint: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  routineList: {
    gap: SPACING.sm,
  },
  routineCard: {
    borderRadius: 30,
    backgroundColor: '#EFF7FB',
    padding: SPACING.lg,
    gap: SPACING.md,
    borderWidth: 1,
    borderColor: '#D9E9F0',
    ...Platform.select({
      ios: {
        shadowColor: '#8CB386',
        shadowOffset: { width: 0, height: 14 },
        shadowOpacity: 0.14,
        shadowRadius: 26,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 18px 34px rgba(140, 179, 134, 0.18)',
      },
    }),
  },
  routineCardSelected: {
    backgroundColor: '#DDF4D7',
    borderColor: '#79C6A6',
    borderWidth: 2,
    ...Platform.select({
      ios: {
        shadowColor: '#79C6A6',
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.18,
        shadowRadius: 28,
      },
      android: {
        elevation: 10,
      },
      web: {
        boxShadow: '0 18px 36px rgba(121, 198, 166, 0.2)',
      },
    }),
  },
  routineCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    flex: 1,
  },
  routineIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routineCardContent: {
    flex: 1,
    gap: SPACING.sm,
  },
  routineCardHeading: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  routineCardInfo: {
    flex: 1,
    gap: 6,
  },
  routineCardName: {
    fontSize: 28,
    fontWeight: '800',
    fontStyle: 'italic',
    color: '#4F707B',
    letterSpacing: -0.6,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  metaPill: {
    borderRadius: RADIUS.full,
    paddingVertical: 6,
    paddingHorizontal: SPACING.sm + 2,
    backgroundColor: '#F3F9F6',
  },
  metaPillText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  favoriteButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderWidth: 1,
    borderColor: '#DCEAE3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteButtonActive: {
    backgroundColor: '#FFF1F1',
    borderColor: '#F7D3D3',
  },
  childPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    borderRadius: RADIUS.full,
    paddingVertical: 8,
    paddingHorizontal: SPACING.sm + 4,
  },
  childPillText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.text,
  },
  stepsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  stepPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    maxWidth: '48%',
    backgroundColor: '#F8FCFA',
    borderRadius: 18,
    paddingVertical: 9,
    paddingHorizontal: SPACING.sm + 2,
  },
  stepPillText: {
    flexShrink: 1,
    fontSize: FONT_SIZE.sm,
    color: '#668089',
    fontWeight: '600',
  },
  routineFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.md,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 22,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.sm + 2,
    borderWidth: 1,
    borderColor: 'rgba(220,234,227,0.72)',
  },
  routineFooterSelected: {
    backgroundColor: '#F3FBEF',
    borderColor: '#A8D8BC',
  },
  routineFooterLabel: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: '#68808A',
  },
  routineFooterLabelSelected: {
    color: '#4C7C62',
  },
  orderBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderWidth: 1,
    borderColor: '#DCEAE3',
  },
  orderBadgeActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  orderBadgeText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    fontWeight: '900',
  },
  orderBadgeTextActive: {
    color: '#FFF',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
    backgroundColor: 'transparent',
  },
  footerButton: {
    width: '100%',
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    ...SHADOWS.md,
  },
  footerButtonActive: {
    backgroundColor: COLORS.secondary,
  },
  footerButtonInactive: {
    backgroundColor: 'rgba(160,176,186,0.88)',
  },
  footerButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  footerButtonText: {
    color: '#FFF',
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
    textAlign: 'center',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    gap: SPACING.md,
  },
  emptyIcon: { fontSize: 70 },
  emptyTitle: { fontSize: FONT_SIZE.xl, fontWeight: '800', color: COLORS.text, textAlign: 'center' },
  emptyText: { fontSize: FONT_SIZE.md, color: COLORS.textSecondary, textAlign: 'center' },
  emptyBackButton: { marginTop: SPACING.xl },
  // Routines header
  routinesHeader: {
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: SPACING.md,
    flexWrap: 'wrap',
  },
  routinesHeaderText: {
    gap: 4,
  },
  routinesTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    color: '#4F707B',
  },
  routinesCount: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    marginTop: 4,
    color: '#7F949C',
  },
  sortButton: {
    minWidth: 180,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderWidth: 1,
    borderColor: '#DFEAE5',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: 3,
    alignSelf: 'flex-start',
  },
  sortControlWrap: {
    minWidth: 180,
  },
  sortButtonLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#A3B4BB',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sortButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  sortButtonValue: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.text,
  },
  sortMenuBackdrop: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  sortDropdownMenu: {
    position: 'absolute',
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCEAE3',
    paddingVertical: SPACING.xs,
    ...SHADOWS.md,
    overflow: 'hidden',
  },
  sortMenuTitle: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.xs,
    fontSize: 11,
    fontWeight: '900',
    color: '#A3B4BB',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sortOption: {
    minHeight: 44,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  sortOptionSelected: {
    backgroundColor: COLORS.secondary,
  },
  sortOptionText: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  sortOptionTextSelected: {
    color: '#FFF',
  },
  // Routines table
  routinesTable: {
    gap: SPACING.md,
  },
  // Pagination
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
    marginVertical: SPACING.lg,
  },
  paginationButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderWidth: 1,
    borderColor: '#DCEAE3',
  },
  paginationButtonDisabled: {
    opacity: 0.5,
  },
  paginationText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: '#7F949C',
  },
});
