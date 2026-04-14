import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
  BounceIn,
  ZoomIn,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { AnimatedPressable } from '../../src/components/ui/AnimatedPressable';
import { Star, House } from 'phosphor-react-native';
import { BADGES } from '../../src/constants/badges';
import { COLORS, SPACING, FONT_SIZE, SHADOWS, RADIUS, GRADIENTS } from '../../src/constants/theme';
import { OpenMoji } from '../../src/components/ui/OpenMoji';
import { Avatar } from '../../src/components/ui/Avatar';
import { useChildrenStore } from '../../src/stores/childrenStore';
import { CompletionRewardSummary } from '../../src/types';
import * as Haptics from 'expo-haptics';
import { formatChildName } from '../../src/utils/children';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function FallingParticle({ index }: { index: number }) {
  const translateY = useSharedValue(-60);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0);
  const startX = (index / 8) * SCREEN_WIDTH - SCREEN_WIDTH * 0.1;
  const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#A29BFE', '#FD79A8', '#00B894'];
  const color = colors[index % colors.length];

  useEffect(() => {
    const delay = index * 80;
    opacity.value = withDelay(delay, withTiming(0.7, { duration: 200 }));
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(400, { duration: 2500 + index * 100, easing: Easing.in(Easing.quad) }),
          withTiming(-60, { duration: 0 }),
        ),
        -1,
      ),
    );
    translateX.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(index % 2 === 0 ? 30 : -30, { duration: 1200 }),
          withTiming(index % 2 === 0 ? -20 : 20, { duration: 1200 }),
        ),
        -1,
        true,
      ),
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: startX,
          top: 0,
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}

export default function CelebrationScreen() {
  const router = useRouter();
  const { getChild } = useChildrenStore();
  const params = useLocalSearchParams<{
    stars: string;
    badges: string;
    rewardSummary?: string;
    routineName: string;
    routineIcon: string;
    duration: string;
  }>();

  const stars = parseInt(params.stars ?? '0', 10);
  const duration = parseInt(params.duration ?? '0', 10);

  const rewardSummary = React.useMemo<CompletionRewardSummary[]>(() => {
    if (typeof params.rewardSummary === 'string' && params.rewardSummary.trim()) {
      try {
        const parsed = JSON.parse(params.rewardSummary) as CompletionRewardSummary[];
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }

    return [
      {
        childId: '',
        starsEarned: stars,
        unlockedBadgeIds: (params.badges ?? '').split(',').filter(Boolean),
      },
    ];
  }, [params.badges, params.rewardSummary, stars]);

  const totalStars = rewardSummary.reduce((sum, entry) => sum + entry.starsEarned, 0);

  const starPulse = useSharedValue(1);

  useEffect(() => {
    starPulse.value = withRepeat(
      withSequence(
        withTiming(1.25, { duration: 500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }, []);

  const starPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: starPulse.value }],
  }));

  return (
    <LinearGradient
      colors={GRADIENTS.celebration}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safe}>
        {Array.from({ length: 10 }).map((_, i) => (
          <FallingParticle key={i} index={i} />
        ))}

        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <Animated.View entering={BounceIn.duration(700)} style={styles.celebration}>
            <View style={styles.mainEmoji}>
              <OpenMoji emoji={params.routineIcon || '🎉'} size={72} />
            </View>
            <Text style={styles.title} selectable={false}>Bravo ! 🎉</Text>
            <Text style={styles.subtitle} selectable={false}>
              Tu as termine {params.routineName || 'ta routine'} !
            </Text>
          </Animated.View>

          <Animated.View
            entering={ZoomIn.delay(500).duration(400).springify()}
            style={styles.starsSection}
          >
            <Animated.View style={starPulseStyle}>
              <Star size={34} weight="fill" color={COLORS.star} />
            </Animated.View>
            <Text style={styles.starsCount} selectable={false}>+{totalStars}</Text>
            <Text style={styles.starsLabel} selectable={false}>etoiles gagnees au total !</Text>
          </Animated.View>

          {duration > 0 ? (
            <Animated.View
              entering={FadeInUp.delay(700).duration(400)}
              style={styles.durationBadge}
            >
              <Text style={styles.durationIcon} selectable={false}>⏱️</Text>
              <Text style={styles.durationText} selectable={false}>
                Realisee en {duration} minute{duration > 1 ? 's' : ''}
              </Text>
            </Animated.View>
          ) : null}

          <Animated.View
            entering={FadeInUp.delay(850).duration(500).springify()}
            style={styles.summarySection}
          >
            <Text style={styles.summaryTitle} selectable={false}>Recapitulatif par enfant</Text>

            {rewardSummary.map((entry, index) => {
              const child = entry.childId ? getChild(entry.childId) : undefined;
              const unlockedBadges = BADGES.filter((badge) => entry.unlockedBadgeIds.includes(badge.id));

              return (
                <Animated.View
                  key={`${entry.childId || 'default'}-${index}`}
                  entering={FadeInDown.delay(950 + index * 90).duration(350)}
                  style={styles.childRewardCard}
                >
                  <View style={styles.childHeader}>
                    {child ? (
                      <Avatar
                        emoji={child.avatar}
                        color={child.color}
                        size={58}
                        avatarConfig={child.avatarConfig}
                      />
                    ) : (
                      <View style={styles.fallbackAvatar}>
                        <OpenMoji emoji="⭐" size={28} />
                      </View>
                    )}
                    <View style={styles.childHeaderText}>
                      <Text style={styles.childName} selectable={false}>
                        {child ? formatChildName(child.name) : 'Routine'}
                      </Text>
                      <Text style={styles.childStars} selectable={false}>
                        +{entry.starsEarned} etoile{entry.starsEarned > 1 ? 's' : ''}
                      </Text>
                    </View>
                  </View>

                  {unlockedBadges.length > 0 ? (
                    <View style={styles.badgesList}>
                      {unlockedBadges.map((badge) => (
                        <View key={badge.id} style={styles.badgeRow}>
                          <OpenMoji emoji={badge.icon} size={34} />
                          <View style={styles.badgeTextWrap}>
                            <Text style={styles.badgeName} selectable={false}>{badge.name}</Text>
                            <Text style={styles.badgeDesc} selectable={false}>{badge.description}</Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.noBadgeText} selectable={false}>Pas de nouveau badge cette fois.</Text>
                  )}
                </Animated.View>
              );
            })}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(1200).duration(400)}>
            <AnimatedPressable
              style={styles.continueButton}
              onPress={() => router.replace('/child')}
              scaleDown={0.9}
            >
              <Text style={styles.continueText} selectable={false}>Super !</Text>
              <House size={20} weight="fill" color="#FFF" />
            </AnimatedPressable>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1, userSelect: 'none' } as any,
  container: {
    padding: SPACING.lg,
    alignItems: 'center',
    paddingBottom: SPACING.xxl,
    userSelect: 'none',
  } as any,
  celebration: {
    alignItems: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  mainEmoji: { marginBottom: SPACING.sm },
  title: {
    fontSize: FONT_SIZE.xxl + 8,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: FONT_SIZE.md + 1,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    lineHeight: 24,
  },
  starsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.full,
    ...SHADOWS.sm,
  },
  starsCount: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '900',
    color: COLORS.star,
  },
  starsLabel: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.md + 4,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.lg,
  },
  durationIcon: { fontSize: 16 },
  durationText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  summarySection: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl + 4,
    padding: SPACING.lg + 4,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  summaryTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  childRewardCard: {
    backgroundColor: `${COLORS.secondary}10`,
    borderRadius: RADIUS.xl,
    padding: SPACING.md + 4,
    marginBottom: SPACING.md,
  },
  childHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  fallbackAvatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
  },
  childHeaderText: {
    flex: 1,
    gap: 4,
  },
  childName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
    color: COLORS.text,
  },
  childStars: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.star,
  },
  badgesList: {
    gap: SPACING.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  badgeTextWrap: {
    flex: 1,
  },
  badgeName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.text,
  },
  badgeDesc: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  noBadgeText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.success,
    paddingVertical: SPACING.lg + 4,
    paddingHorizontal: SPACING.xxl + 12,
    borderRadius: RADIUS.full,
    minHeight: 72,
    ...SHADOWS.md,
  },
  continueText: {
    fontSize: FONT_SIZE.xl + 2,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 0.3,
  },
});
