import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeIn,
  BounceIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../src/stores/appStore';
import { useChildrenStore } from '../../src/stores/childrenStore';
import { useRoutineStore } from '../../src/stores/routineStore';
import { useRewardStore } from '../../src/stores/rewardStore';
import { Avatar } from '../../src/components/ui/Avatar';
import { StarCounter } from '../../src/components/rewards/Counters';
import { AnimatedPressable } from '../../src/components/ui/AnimatedPressable';
import { useMoodStore } from '../../src/stores/moodStore';
import { useRealRewardStore } from '../../src/stores/realRewardStore';
import { useWeatherStore } from '../../src/stores/weatherStore';
import { ArrowLeft, Target, Rocket, Moon, ArrowRight, Fire, Gift, Star, ClipboardText } from 'phosphor-react-native';
import { MOOD_CONFIG } from '../../src/constants/moods';
import { COLORS, SPACING, FONT_SIZE, SHADOWS, RADIUS, CATEGORY_CONFIG } from '../../src/constants/theme';
import { getWeatherTheme, DEFAULT_WEATHER_THEME, getWeatherTextColor, getWeatherSecondaryTextColor } from '../../src/constants/weatherThemes';
import { WeatherParticles } from '../../src/components/weather/WeatherParticles';
import { WeatherCard } from '../../src/components/weather/WeatherCard';

function PulsingEmoji({ emoji, size = 48 }: { emoji: string; size?: number }) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return <Animated.Text style={[{ fontSize: size }, style]}>{emoji}</Animated.Text>;
}

export default function ChildHomeScreen() {
  const router = useRouter();
  const { selectedChildId, selectChild, weatherCity, useGeolocation } = useAppStore();
  const { getChild } = useChildrenStore();
  const { getRoutinesForChild } = useRoutineStore();
  const { getRewards } = useRewardStore();
  const { getMood, isMoodFresh } = useMoodStore();
  const { getRewardsForChild: getRealRewards } = useRealRewardStore();
  const { weather, refresh: refreshWeather } = useWeatherStore();

  const weatherTheme = weather
    ? getWeatherTheme(weather.condition, weather.isDay)
    : DEFAULT_WEATHER_THEME;
  const textColor = weather ? getWeatherTextColor(weather.isDay) : COLORS.text;
  const secondaryColor = weather ? getWeatherSecondaryTextColor(weather.isDay) : COLORS.textSecondary;

  const child = selectedChildId ? getChild(selectedChildId) : undefined;

  useEffect(() => {
    if (!child) {
      router.replace('/child');
    }
  }, [child]);

  useEffect(() => {
    refreshWeather({ cityName: weatherCity, useGeolocation });
  }, []);

  if (!child) return null;

  const routines = getRoutinesForChild(child.id).filter((r) => r.isActive);
  const rewards = getRewards(child.id);
  const currentMood = getMood(child.id);
  const moodFresh = isMoodFresh(child.id);
  const realRewards = getRealRewards(child.id).filter((r) => !r.isClaimed);
  const nextReward = realRewards.find((r) => !r.isClaimed && rewards.totalStars < r.requiredStars);

  const handleStartRoutine = (routineId: string) => {
    // Always go through mood selection which then starts the execution
    router.push({ pathname: '/child/mood', params: { routineId } });
  };

  const handleGoBack = () => {
    selectChild(null);
    router.replace('/child');
  };

  return (
    <LinearGradient colors={weatherTheme.gradient} style={styles.gradient}>
      <WeatherParticles theme={weatherTheme} />
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Header */}
          <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
            <TouchableOpacity onPress={handleGoBack} style={[styles.backBtn, !weather?.isDay && { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
              <ArrowLeft size={22} weight="bold" color={secondaryColor} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Avatar emoji={child.avatar} color={child.color} size={48} />
              <View style={styles.headerInfo}>
                <Text style={[styles.name, { color: textColor }]}>{child.name}</Text>
                <View style={styles.headerBadges}>
                  {rewards.currentStreak > 0 && (
                    <View style={[styles.headerBadge, !weather?.isDay && { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                      <Fire size={14} weight="fill" color="#FF6B6B" />
                      <Text style={[styles.headerBadgeText, { color: secondaryColor }]}> {rewards.currentStreak}j</Text>
                    </View>
                  )}
                  {moodFresh && currentMood && (
                    <View style={[styles.headerBadge, !weather?.isDay && { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                      <Text style={[styles.headerBadgeText, { color: secondaryColor }]}>{MOOD_CONFIG[currentMood.mood].emoji} {MOOD_CONFIG[currentMood.mood].label}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity onPress={() => router.push('/child/rewards')}>
                <StarCounter count={rewards.totalStars} size="sm" />
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Weather card */}
          {weather && <WeatherCard weather={weather} />}

          {/* Next real reward */}
          {nextReward && (
            <Animated.View entering={FadeInUp.delay(300).duration(400)}>
              <AnimatedPressable
                onPress={() => router.push('/child/rewards')}
                style={[styles.rewardBanner, !weather?.isDay && { backgroundColor: 'rgba(255,255,255,0.15)', borderColor: COLORS.accent + '40' }]}
                scaleDown={0.97}
              >
                <Gift size={32} weight="fill" color={COLORS.accent} />
                <View style={styles.rewardInfo}>
                  <Text style={[styles.rewardDesc, { color: textColor }]} numberOfLines={1}>{nextReward.description}</Text>
                  <View style={styles.rewardProgress}>
                    <View style={styles.rewardTrack}>
                      <View
                        style={[
                          styles.rewardFill,
                          { width: `${Math.min(100, (rewards.totalStars / nextReward.requiredStars) * 100)}%` },
                        ]}
                      />
                    </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                        <Star size={14} weight="fill" color={COLORS.star} />
                        <Text style={[styles.rewardStars, { color: secondaryColor }]}>
                          {rewards.totalStars}/{nextReward.requiredStars}
                        </Text>
                      </View>
                  </View>
                </View>
              </AnimatedPressable>
            </Animated.View>
          )}

          {/* Wellness / Calm routine */}
          <Animated.View entering={FadeInUp.delay(350).duration(400)}>
            <AnimatedPressable
              onPress={() => router.push('/child/wellness')}
              style={[styles.wellnessBanner, !weather?.isDay && { backgroundColor: 'rgba(162,155,254,0.25)', borderColor: 'rgba(162,155,254,0.4)' }]}
              scaleDown={0.97}
            >
              <Moon size={28} weight="fill" color="#A29BFE" />
              <View style={styles.wellnessInfo}>
                <Text style={[styles.wellnessTitle, { color: textColor }]}>Routine calme</Text>
                <Text style={[styles.wellnessDesc, { color: secondaryColor }]}>Respiration & étirements avant dodo 💤</Text>
              </View>
              <ArrowRight size={22} weight="bold" color={!weather?.isDay ? '#C4BFFF' : '#A29BFE'} />
            </AnimatedPressable>
          </Animated.View>

          {/* Routines */}
          {routines.length > 0 && (
            <Animated.View entering={FadeInDown.delay(300).duration(300)} style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.lg }}>
              <Target size={22} weight="fill" color={textColor} />
              <Text style={[styles.sectionTitle, { color: textColor, marginBottom: 0 }]}>Mes routines</Text>
            </Animated.View>
          )}

          {routines.length === 0 ? (
            <Animated.View entering={BounceIn.delay(300)} style={styles.empty}>
              <ClipboardText size={70} weight="duotone" color={secondaryColor} />
              <Text style={[styles.emptyText, { color: secondaryColor }]}>
                Pas encore de routine !{'\n'}Demande à tes parents d'en créer une.
              </Text>
            </Animated.View>
          ) : (
            <View style={styles.routineGrid}>
              {routines.map((routine, index) => {
                const totalDuration = routine.steps.reduce(
                  (sum, s) => sum + s.durationMinutes,
                  0
                );
                return (
                  <Animated.View
                    key={routine.id}
                    entering={FadeInUp.delay(400 + index * 100).duration(400).springify()}
                    style={styles.routineGridItem}
                  >
                    <AnimatedPressable
                      style={[styles.routineCard, { backgroundColor: routine.color + '20', borderColor: routine.color + '40' }]}
                      onPress={() => handleStartRoutine(routine.id)}
                      scaleDown={0.95}
                    >
                      <PulsingEmoji emoji={routine.icon} size={36} />
                      <Text style={[styles.routineName, { color: textColor }]} numberOfLines={2}>{routine.name}</Text>
                      <Text style={[styles.routineMeta, { color: secondaryColor }]}>
                        {routine.steps.length} ét. · {totalDuration} min
                      </Text>
                      <View style={[styles.routineStart, { backgroundColor: routine.color || COLORS.primary }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Text style={styles.routineStartText}>Go !</Text>
                          <Rocket size={16} weight="fill" color="#FFF" />
                        </View>
                      </View>
                    </AnimatedPressable>
                  </Animated.View>
                );
              })}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  scroll: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, flex: 1 },
  headerInfo: { flex: 1, gap: 2 },
  headerBadges: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs },
  headerBadge: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    paddingVertical: 2,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  headerBadgeText: { fontSize: FONT_SIZE.xs, fontWeight: '700', color: COLORS.textSecondary },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  name: { fontSize: FONT_SIZE.lg, fontWeight: '800', color: COLORS.text },
  sectionTitle: {
    fontSize: FONT_SIZE.xl + 2,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  routineGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  routineGridItem: {
    width: '48%',
  },
  routineCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    alignItems: 'center',
    gap: SPACING.xs,
    borderWidth: 2,
    ...SHADOWS.sm,
  },
  routineName: { fontSize: FONT_SIZE.md, fontWeight: '800', color: COLORS.text, textAlign: 'center' },
  routineMeta: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary },
  routineStart: {
    paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
    marginTop: SPACING.xs,
    ...SHADOWS.sm,
  },
  routineStartText: { color: '#FFF', fontWeight: '700', fontSize: FONT_SIZE.sm },
  empty: { alignItems: 'center', gap: SPACING.md, paddingTop: SPACING.xxl },
  emptyText: { fontSize: FONT_SIZE.lg, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 28 },
  rewardBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: 'rgba(255,255,255,0.7)',
    padding: SPACING.md,
    borderRadius: RADIUS.xl,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.accent + '60',
  },
  rewardInfo: { flex: 1, gap: SPACING.xs },
  rewardDesc: { fontSize: FONT_SIZE.sm, fontWeight: '700', color: COLORS.text },
  rewardProgress: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  rewardTrack: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  rewardFill: {
    height: 8,
    backgroundColor: COLORS.star,
    borderRadius: RADIUS.full,
  },
  rewardStars: { fontSize: FONT_SIZE.xs, fontWeight: '700', color: COLORS.textSecondary },
  wellnessBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: '#A29BFE20',
    padding: SPACING.md,
    borderRadius: RADIUS.xl,
    marginBottom: SPACING.lg,
    borderWidth: 2,
    borderColor: '#A29BFE40',
  },
  wellnessInfo: { flex: 1, gap: 2 },
  wellnessTitle: { fontSize: FONT_SIZE.md, fontWeight: '800', color: COLORS.text },
  wellnessDesc: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary },
});
