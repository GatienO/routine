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
import { COLORS, SPACING, FONT_SIZE, SHADOWS, RADIUS } from '../../src/constants/theme';
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

export type StatusFilterValue = 'active' | 'inactive';
export type FavoriteFilterValue = 'all' | 'favorites' | 'others';
type RoutineSortValue = 'recent' | 'alphabetical';

const ROUTINE_SORT_OPTIONS: Array<{ key: RoutineSortValue; label: string }> = [
  { key: 'recent', label: 'Plus recent' },
  { key: 'alphabetical', label: 'Alphabetique' },
];

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
  }, [selectedChildIds, selectedCategories, deferredSearch, selectedSort]);

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

            {/* Chips de sélection d'enfants */}
            <View style={styles.childrenChipsContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.childrenChips}>
                <TouchableOpacity
                  style={[
                    styles.childChip,
                    selectedChildIds.length === 0 && {
                      backgroundColor: '#A5D6A7',
                      borderColor: '#66BB6A',
                    },
                  ]}
                  onPress={handleClearChildSelection}
                  activeOpacity={0.75}
                >
                  <Text style={[
                    styles.childChipText,
                    selectedChildIds.length === 0 && { color: COLORS.text, fontWeight: '800' },
                  ]}>
                    Tous
                  </Text>
                </TouchableOpacity>
                {children.map((child) => (
                  <TouchableOpacity
                    key={child.id}
                    style={[
                      styles.childChip,
                      selectedChildIds.includes(child.id) && {
                        backgroundColor: '#A5D6A7',
                        borderColor: '#66BB6A',
                      },
                    ]}
                    onPress={() => handleToggleChild(child.id)}
                    activeOpacity={0.75}
                  >
                    <Avatar emoji={child.avatar} color={child.color} size={20} avatarConfig={child.avatarConfig} />
                    <Text style={[
                      styles.childChipText,
                      selectedChildIds.includes(child.id) && { color: COLORS.text, fontWeight: '800' },
                    ]}>
                      {formatChildName(child.name)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <ChildDashboardHeader
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategories={selectedCategories}
              onToggleCategory={handleToggleCategory}
              onClearCategories={handleClearCategories}
              selectedStatuses={selectedStatuses}
              onToggleStatus={handleToggleStatus}
              onClearStatuses={handleClearStatuses}
              selectedFavorite={selectedFavorite}
              onToggleFavorite={handleToggleFavorite}
            />

            {/* Titre et routines */}
            <View style={styles.routinesHeader}>
              <View style={styles.routinesHeaderText}>
                <Text style={[styles.routinesTitle, { color: textColor }]}>Routines</Text>
                <Text style={[styles.routinesCount, { color: secondaryColor }]}>
                  {filteredRoutines.length} routine{filteredRoutines.length !== 1 ? 's' : ''}
                </Text>
              </View>
              <View style={styles.sortControlWrap}>
                <TouchableOpacity
                  ref={sortButtonRef}
                  style={styles.sortButton}
                  onPress={() => {
                    if (showSortMenu) {
                      closeSortMenu();
                    } else {
                      openSortMenu();
                    }
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={styles.sortButtonLabel}>Tri</Text>
                  <View style={styles.sortButtonRow}>
                    <Text style={styles.sortButtonValue}>
                      {ROUTINE_SORT_OPTIONS.find((option) => option.key === selectedSort)?.label ?? 'Plus recent'}
                    </Text>
                    <CaretDown size={16} weight="bold" color={COLORS.textSecondary} />
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Liste des routines paginée */}
            <View style={styles.routinesTable}>
              {paginatedRoutines.map((routine, index) => {
                const duration = routine.steps.reduce((sum, step) => sum + step.durationMinutes, 0);
                const isSelected = selectedRoutineIds.includes(routine.id);
                const owner = getChild(routine.childId);

                return (
                  <Animated.View
                    key={routine.id}
                    entering={FadeInUp.delay(50 + index * 30).duration(250)}
                  >
                    <AnimatedPressable
                      style={[
                        styles.routineTableRow,
                        {
                          borderColor: `${routine.color}45`,
                          backgroundColor: `${routine.color}16`,
                        },
                        isSelected && styles.routineRowSelected,
                      ]}
                      onPress={() => toggleRoutine(routine.id)}
                      scaleDown={0.98}
                      hitSlop={8}
                    >
                      <View style={styles.routineRowMain}>
                        <View style={[styles.routineIcon, { backgroundColor: `${routine.color}24` }]}>
                          <OpenMoji emoji={routine.icon} size={24} />
                        </View>
                        <View style={styles.routineRowContent}>
                          <Text style={[styles.routineRowName, { color: textColor }]} numberOfLines={1}>
                            {routine.name}
                          </Text>
                          <Text style={[styles.routineRowMeta, { color: secondaryColor }]}>
                            {routine.steps.length} étapes · {formatDuration(duration)}
                            {owner ? ` · ${formatChildName(owner.name)}` : ''}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.routineRowActions}>
                        <TouchableOpacity
                          onPress={() => toggleFavorite(routine.id)}
                          hitSlop={12}
                        >
                          <Heart
                            size={18}
                            weight={routine.isFavorite ? 'fill' : 'regular'}
                            color={routine.isFavorite ? COLORS.error : secondaryColor}
                          />
                        </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  routineCardSelected: {
    borderColor: COLORS.secondary,
    backgroundColor: `${COLORS.secondary}22`,
  },
  routineMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  routineIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routineText: {
    flex: 1,
    gap: 2,
  },
  routineName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
  },
  routineMeta: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
  },
  routineOwner: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
  },
  routineActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  orderBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderWidth: 1.5,
    borderColor: COLORS.border,
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
  // Children chips
  childrenChipsContainer: {
    marginVertical: SPACING.xs,
  },
  childrenChips: {
    gap: SPACING.sm,
    paddingHorizontal: 0,
  },
  childChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  childChipText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  // Routines header
  routinesHeader: {
    marginVertical: SPACING.md,
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
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
  },
  routinesCount: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    marginTop: 4,
  },
  sortButton: {
    minWidth: 180,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
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
    fontWeight: '800',
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
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
    borderRadius: RADIUS.lg,
    backgroundColor: '#FFFDF9',
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.xs,
    ...SHADOWS.md,
  },
  sortMenuTitle: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.sm,
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  sortOption: {
    minHeight: 42,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
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
    gap: SPACING.sm,
  },
  routineTableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    minHeight: 80,
  },
  routineRowSelected: {
    borderColor: COLORS.secondary,
    backgroundColor: `${COLORS.secondary}08`,
  },
  routineRowMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  routineRowContent: {
    flex: 1,
    gap: 2,
  },
  routineRowName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
  },
  routineRowMeta: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
  },
  routineRowActions: {
    flexDirection: 'row',
    alignItems: 'center',
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
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  paginationButtonDisabled: {
    opacity: 0.5,
  },
  paginationText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
  },
});
