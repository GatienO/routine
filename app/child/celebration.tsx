import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
  FadeIn,
  BounceIn,
  ZoomIn,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { AnimatedPressable } from '../../src/components/ui/AnimatedPressable';
import { Star, House, Trophy } from 'phosphor-react-native';
import { BADGES } from '../../src/constants/badges';
import { COLORS, SPACING, FONT_SIZE, SHADOWS, RADIUS } from '../../src/constants/theme';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CONFETTI = ['🎊', '⭐', '🌟', '✨', '🎉', '💫', '🥳', '🎆', '🌈', '🦄'];

function FloatingEmoji({ emoji, index }: { emoji: string; index: number }) {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);

  useEffect(() => {
    const delay = index * 100;
    opacity.value = withDelay(delay, withTiming(0.8, { duration: 400 }));
    scale.value = withDelay(delay, withSpring(1, { damping: 6, stiffness: 120 }));
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-25, { duration: 1000 + index * 150, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 1000 + index * 150, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    );
    translateX.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(index % 2 === 0 ? 12 : -12, { duration: 1300, easing: Easing.inOut(Easing.sin) }),
          withTiming(index % 2 === 0 ? -12 : 12, { duration: 1300, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    );
    rotate.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(20, { duration: 900 }),
          withTiming(-20, { duration: 900 })
        ),
        -1,
        true
      )
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { rotate: `${rotate.value}deg` },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.Text style={[styles.confettiEmoji, style]}>{emoji}</Animated.Text>
  );
}

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
          withTiming(-60, { duration: 0 })
        ),
        -1
      )
    );
    translateX.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(index % 2 === 0 ? 30 : -30, { duration: 1200 }),
          withTiming(index % 2 === 0 ? -20 : 20, { duration: 1200 })
        ),
        -1,
        true
      )
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
  const params = useLocalSearchParams<{
    stars: string;
    badges: string;
    routineName: string;
    routineIcon: string;
  }>();

  const stars = parseInt(params.stars ?? '0', 10);
  const newBadgeIds = (params.badges ?? '').split(',').filter(Boolean);
  const newBadges = BADGES.filter((b) => newBadgeIds.includes(b.id));

  const starPulse = useSharedValue(1);

  useEffect(() => {
    starPulse.value = withRepeat(
      withSequence(
        withTiming(1.25, { duration: 500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }, []);

  const starPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: starPulse.value }],
  }));

  return (
    <LinearGradient
      colors={['#FFF8F0', '#FFE8D6', '#FFDCC8']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safe}>
        {/* Falling particles */}
        {Array.from({ length: 10 }).map((_, i) => (
          <FallingParticle key={i} index={i} />
        ))}

        <View style={styles.container}>
          <Animated.View
            entering={BounceIn.duration(700)}
            style={styles.celebration}
          >
            <Text style={styles.mainEmoji}>{params.routineIcon || '🎉'}</Text>
            <Text style={styles.title}>Bravo ! 🎉</Text>
            <Text style={styles.subtitle}>
              Tu as terminé {params.routineName || 'ta routine'} !
            </Text>
          </Animated.View>

          <Animated.View
            entering={ZoomIn.delay(500).duration(400).springify()}
            style={styles.starsSection}
          >
            <Animated.View style={starPulseStyle}>
              <Star size={44} weight="fill" color={COLORS.star} />
            </Animated.View>
            <Text style={styles.starsCount}>+{stars}</Text>
            <Text style={styles.starsLabel}>étoile{stars > 1 ? 's' : ''} gagnée{stars > 1 ? 's' : ''} !</Text>
          </Animated.View>

          {newBadges.length > 0 && (
            <Animated.View
              entering={FadeInUp.delay(900).duration(500).springify()}
              style={styles.badgesSection}
            >
              <Text style={styles.badgesTitle}>Nouveau badge !</Text>
              {newBadges.map((badge) => (
                <View key={badge.id} style={styles.badgeRow}>
                  <Text style={styles.badgeIcon}>{badge.icon}</Text>
                  <View>
                    <Text style={styles.badgeName}>{badge.name}</Text>
                    <Text style={styles.badgeDesc}>{badge.description}</Text>
                  </View>
                </View>
              ))}
            </Animated.View>
          )}

          <View style={styles.confettiRow}>
            {CONFETTI.map((emoji, i) => (
              <FloatingEmoji key={i} emoji={emoji} index={i} />
            ))}
          </View>

          <Animated.View entering={FadeInDown.delay(1200).duration(400)}>
            <AnimatedPressable
              style={styles.continueButton}
              onPress={() => router.replace('/child/home')}
              scaleDown={0.9}
            >
              <Text style={styles.continueText}>Super !</Text>
              <House size={20} weight="fill" color="#FFF" />
            </AnimatedPressable>
          </Animated.View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  celebration: { alignItems: 'center', marginBottom: SPACING.xl },
  mainEmoji: { fontSize: 90, marginBottom: SPACING.md },
  title: {
    fontSize: FONT_SIZE.hero + 4,
    fontWeight: '900',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  starsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
    backgroundColor: 'rgba(255,255,255,0.6)',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.full,
  },
  starsIcon: { fontSize: 40 },
  starsCount: { fontSize: FONT_SIZE.xxl + 4, fontWeight: '900', color: COLORS.star },
  starsLabel: { fontSize: FONT_SIZE.lg, color: COLORS.textSecondary, fontWeight: '600' },
  badgesSection: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 20,
    padding: SPACING.lg,
    width: '100%',
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  badgesTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  badgeIcon: { fontSize: 40 },
  badgeName: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.text },
  badgeDesc: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary },
  confettiRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  confettiEmoji: { fontSize: 30 },
  continueButton: {
    backgroundColor: COLORS.success,
    paddingVertical: SPACING.lg + 2,
    paddingHorizontal: SPACING.xxl + 8,
    borderRadius: RADIUS.full,
    ...SHADOWS.md,
  },
  continueText: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '900',
    color: '#FFF',
  },
});
