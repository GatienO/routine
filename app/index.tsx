import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { AnimatedPressable } from '../src/components/ui/AnimatedPressable';
import { COLORS, SPACING, FONT_SIZE, SHADOWS, RADIUS } from '../src/constants/theme';

const FLOATING_EMOJIS = ['🌟', '✨', '🎯', '🏆', '🎉', '💪'];

function FloatingDecor({ emoji, index }: { emoji: string; index: number }) {
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const delay = index * 200;
    opacity.value = withDelay(delay, withTiming(0.4, { duration: 600 }));
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-12, { duration: 1800 + index * 200, easing: Easing.inOut(Easing.sin) }),
          withTiming(12, { duration: 1800 + index * 200, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    );
    rotate.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(10, { duration: 2000 }),
          withTiming(-10, { duration: 2000 })
        ),
        -1,
        true
      )
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return <Animated.Text style={[styles.floatingEmoji, style]}>{emoji}</Animated.Text>;
}

export default function WelcomeScreen() {
  const router = useRouter();

  const heroScale = useSharedValue(0.8);

  useEffect(() => {
    heroScale.value = withSpring(1, { damping: 8, stiffness: 80 });
  }, []);

  const heroStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heroScale.value }],
  }));

  return (
    <LinearGradient
      colors={['#FFF8F0', '#FFE8D6', '#FFDCC8']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          {/* Floating decorations */}
          <View style={styles.floatingRow}>
            {FLOATING_EMOJIS.map((emoji, i) => (
              <FloatingDecor key={i} emoji={emoji} index={i} />
            ))}
          </View>

          {/* Hero */}
          <Animated.View
            entering={FadeInDown.duration(600).springify()}
            style={[styles.hero, heroStyle]}
          >
            <Text style={styles.emoji}>🌟</Text>
            <Text style={styles.title}>Routine</Text>
            <Text style={styles.subtitle}>
              Transforme tes tâches{'\n'}en super aventure !
            </Text>
          </Animated.View>

          {/* Buttons */}
          <Animated.View
            entering={FadeInUp.delay(300).duration(500)}
            style={styles.buttons}
          >
            <AnimatedPressable
              onPress={() => router.push('/pin')}
              style={[styles.bigButton, { backgroundColor: COLORS.secondary }]}
            >
              <Text style={styles.bigButtonText}>👨‍👩‍👧 Espace Parent</Text>
            </AnimatedPressable>
            <AnimatedPressable
              onPress={() => router.push('/child')}
              style={[styles.bigButton, { backgroundColor: COLORS.primary }]}
            >
              <Text style={styles.bigButtonText}>🧒 C'est parti !</Text>
            </AnimatedPressable>
          </Animated.View>

          <Animated.Text
            entering={FadeInUp.delay(600).duration(400)}
            style={styles.footer}
          >
            Configurez les routines dans l'espace parent{'\n'}
            puis laissez votre enfant s'amuser !
          </Animated.Text>
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
  floatingRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    position: 'absolute',
    top: 60,
  },
  floatingEmoji: { fontSize: 28 },
  hero: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  emoji: {
    fontSize: 90,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.hero + 8,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    lineHeight: 28,
  },
  buttons: {
    width: '100%',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  bigButton: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    ...SHADOWS.md,
  },
  bigButtonText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    color: '#FFF',
  },
  footer: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 18,
  },
});
