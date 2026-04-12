import React, { useEffect, useMemo, useState } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { BounceIn, FadeInUp } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { CaretDown, CaretUp, ClipboardText, Gift, Rocket, Heart } from 'phosphor-react-native';
import { useChildrenStore } from '../../src/stores/childrenStore';
import { useAppStore } from '../../src/stores/appStore';
import { useRoutineStore } from '../../src/stores/routineStore';
import { useWeatherStore } from '../../src/stores/weatherStore';
import { Avatar } from '../../src/components/ui/Avatar';
import { AnimatedPressable } from '../../src/components/ui/AnimatedPressable';
import { BackButton } from '../../src/components/ui/BackButton';
import { WeatherCard } from '../../src/components/weather/WeatherCard';
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

export default function ChildLauncherScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { children, getChild } = useChildrenStore();
  const { selectChild, weatherCity, useGeolocation } = useAppStore();
  const { routines, toggleFavorite } = useRoutineStore();
  const { weather, refresh: refreshWeather } = useWeatherStore();
  const [selectedRoutineIds, setSelectedRoutineIds] = useState<string[]>([]);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const weatherTheme = weather
    ? getWeatherTheme(weather.condition, weather.isDay)
    : DEFAULT_WEATHER_THEME;
  const textColor = weather ? getWeatherTextColor(weather.isDay) : COLORS.text;
  const secondaryColor = weather ? getWeatherSecondaryTextColor(weather.isDay) : COLORS.textSecondary;
  const isNight = weather ? !weather.isDay : false;
  const contentWidth = Math.min(width - SPACING.lg * 2, 1100);

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

  const sections = useMemo(
    () =>
      children
        .map((child) => ({
          child,
          routines: routines
            .filter((routine) => routine.childId === child.id && routine.isActive)
            .sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0)),
        }))
        .filter((section) => section.routines.length > 0),
    [children, routines],
  );

  const totalRoutines = sections.reduce((sum, section) => sum + section.routines.length, 0);
  const selectedRoutines = selectedRoutineIds
    .map((routineId) => routines.find((routine) => routine.id === routineId))
    .filter((routine): routine is NonNullable<typeof routine> => Boolean(routine));
  const selectedDuration = selectedRoutines.reduce(
    (sum, routine) => sum + routine.steps.reduce((stepSum, step) => stepSum + step.durationMinutes, 0),
    0,
  );

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

  const toggleSection = (childId: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [childId]: !prev[childId],
    }));
  };

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

  if (sections.length === 0) {
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
              <BackButton
                onPress={handleGoBack}
                iconColor={secondaryColor}
                style={[styles.headerBackButton, isNight && { backgroundColor: 'rgba(255,255,255,0.18)' }]}
              />
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

            {sections.map((section, sectionIndex) => {
              const isCollapsed = Boolean(collapsedSections[section.child.id]);

              return (
                <Animated.View
                  key={section.child.id}
                  entering={FadeInUp.delay(80 + sectionIndex * 70).duration(300)}
                  style={[styles.sectionCard, isNight && { backgroundColor: 'rgba(15,23,42,0.2)' }]}
                >
                  <View style={styles.sectionHeader}>
                    <View style={styles.childIdentity}>
                      <Avatar
                        emoji={section.child.avatar}
                        color={section.child.color}
                        size={54}
                        avatarConfig={section.child.avatarConfig}
                      />
                      <View style={styles.childMeta}>
                        <Text style={[styles.childName, { color: textColor }]}>
                          {formatChildName(section.child.name)}
                        </Text>
                        <Text style={[styles.childHint, { color: secondaryColor }]}>
                          {section.routines.length} routine{section.routines.length > 1 ? 's' : ''} pour {formatChildName(section.child.name)}
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      onPress={() => toggleSection(section.child.id)}
                      style={[styles.sectionToggle, isNight && { backgroundColor: 'rgba(255,255,255,0.12)' }]}
                    >
                      {isCollapsed ? (
                        <CaretDown size={18} weight="bold" color={secondaryColor} />
                      ) : (
                        <CaretUp size={18} weight="bold" color={secondaryColor} />
                      )}
                    </TouchableOpacity>
                  </View>

                  {!isCollapsed ? (
                    <View style={styles.routineList}>
                      {section.routines.map((routine) => {
                        const duration = routine.steps.reduce((sum, step) => sum + step.durationMinutes, 0);
                        const isSelected = selectedRoutineIds.includes(routine.id);
                        const owner = getChild(routine.childId);

                        return (
                          <AnimatedPressable
                            key={routine.id}
                            style={[
                              styles.routineCard,
                              {
                                borderColor: `${routine.color}45`,
                                backgroundColor: `${routine.color}16`,
                              },
                              isSelected && styles.routineCardSelected,
                            ]}
                            onPress={() => toggleRoutine(routine.id)}
                            scaleDown={0.97}
                            hitSlop={10}
                          >
                            <View style={styles.routineMain}>
                              <View style={[styles.routineIcon, { backgroundColor: `${routine.color}24` }]}>
                                <OpenMoji emoji={routine.icon} size={30} />
                              </View>
                              <View style={styles.routineText}>
                                <Text style={[styles.routineName, { color: textColor }]} numberOfLines={1}>
                                  {routine.name}
                                </Text>
                                <Text style={[styles.routineMeta, { color: secondaryColor }]}>
                                  {routine.steps.length} etapes · {duration} min
                                </Text>
                                {owner ? (
                                  <Text style={[styles.routineOwner, { color: secondaryColor }]}>
                                    Routine de {formatChildName(owner.name)}
                                  </Text>
                                ) : null}
                              </View>
                            </View>

                            <View style={styles.routineActions}>
                              <TouchableOpacity
                                onPress={() => toggleFavorite(routine.id)}
                                hitSlop={12}
                              >
                                <Heart
                                  size={20}
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
                        );
                      })}
                    </View>
                  ) : null}
                </Animated.View>
              );
            })}
          </View>
        </ScrollView>

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
                  ? `${selectedRoutineIds.length} routine${selectedRoutineIds.length > 1 ? 's' : ''} · ${selectedDuration} min`
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
    gap: SPACING.md,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  headerBackButton: {},
  topRewardsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: 'rgba(255,255,255,0.78)',
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
    backgroundColor: 'rgba(255,255,255,0.72)',
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
    borderColor: COLORS.surfaceSecondary,
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
    borderColor: COLORS.surfaceSecondary,
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
});
