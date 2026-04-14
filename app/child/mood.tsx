import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  BounceIn,
  FadeIn,
} from 'react-native-reanimated';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAppStore } from '../../src/stores/appStore';
import { useMoodStore } from '../../src/stores/moodStore';
import { useRoutineStore } from '../../src/stores/routineStore';
import { AnimatedPressable } from '../../src/components/ui/AnimatedPressable';
import { MOOD_CONFIG, POSITIVE_MOODS, NEGATIVE_MOODS } from '../../src/constants/moods';
import { ChildMoodType } from '../../src/types';
import { COLORS, SPACING, FONT_SIZE, RADIUS, SHADOWS, GRADIENTS, TOUCH } from '../../src/constants/theme';
import { OpenMoji } from '../../src/components/ui/OpenMoji';
import { backOrReplace } from '../../src/utils/navigation';

export default function MoodScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ routineId: string; chainIds?: string; childId?: string }>();
  const { selectedChildId } = useAppStore();
  const { setMood } = useMoodStore();
  const { startExecution, startChain } = useRoutineStore();
  const activeChildId = params.childId ?? selectedChildId;

  const handleSelectMood = (mood: ChildMoodType) => {
    if (!activeChildId) return;
    setMood(activeChildId, mood);

    if (params.chainIds) {
      const ids = params.chainIds.split(',').filter(Boolean);
      if (ids.length >= 2) {
        startChain(ids, [activeChildId]);
        router.replace('/child/run');
        return;
      }
    }

    if (params.routineId) {
      startExecution(params.routineId, [activeChildId]);
      router.replace('/child/run');
    } else {
      backOrReplace(router, '/child');
    }
  };

  return (
    <LinearGradient colors={GRADIENTS.warmBackground} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <Animated.Text entering={FadeIn.duration(400)} style={styles.title}>
            Comment tu te sens ? 💭
          </Animated.Text>
          <Animated.Text entering={FadeInDown.delay(200).duration(300)} style={styles.subtitle}>
            Ça nous aide à t'accompagner
          </Animated.Text>

          <View style={styles.moodSection}>
            <Animated.Text entering={FadeInDown.delay(250).duration(300)} style={styles.sectionLabel}>
              😄 Ça va bien !
            </Animated.Text>
            <View style={styles.moodRow}>
              {POSITIVE_MOODS.map((mood, index) => {
                const config = MOOD_CONFIG[mood];
                return (
                  <Animated.View
                    key={mood}
                    entering={BounceIn.delay(300 + index * 100).duration(500)}
                  >
                    <AnimatedPressable
                      onPress={() => handleSelectMood(mood)}
                      style={[styles.moodCard, { backgroundColor: config.color + '20', borderColor: config.color + '60' }]}
                      scaleDown={0.9}
                    >
                      <OpenMoji emoji={config.emoji} size={40} />
                      <Text style={[styles.moodLabel, { color: config.color }]}>{config.label}</Text>
                    </AnimatedPressable>
                  </Animated.View>
                );
              })}
            </View>
          </View>

          <View style={styles.moodSection}>
            <Animated.Text entering={FadeInDown.delay(550).duration(300)} style={styles.sectionLabel}>
              😔 Pas trop…
            </Animated.Text>
            <View style={styles.moodRow}>
              {NEGATIVE_MOODS.map((mood, index) => {
                const config = MOOD_CONFIG[mood];
                return (
                  <Animated.View
                    key={mood}
                    entering={BounceIn.delay(600 + index * 100).duration(500)}
                  >
                    <AnimatedPressable
                      onPress={() => handleSelectMood(mood)}
                      style={[styles.moodCard, { backgroundColor: config.color + '20', borderColor: config.color + '60' }]}
                      scaleDown={0.9}
                    >
                      <OpenMoji emoji={config.emoji} size={40} />
                      <Text style={[styles.moodLabel, { color: config.color }]}>{config.label}</Text>
                    </AnimatedPressable>
                  </Animated.View>
                );
              })}
            </View>
          </View>

          <TouchableOpacity
            onPress={() => backOrReplace(router, '/child')}
            style={styles.skipBtn}
          >
            <Text style={styles.skipText}>Passer →</Text>
          </TouchableOpacity>
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
    padding: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.xxl + 4,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  moodSection: {
    width: '100%',
    maxWidth: 520,
    marginBottom: SPACING.lg,
  },
  sectionLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  moodCard: {
    width: 120,
    height: 120,
    borderRadius: RADIUS.xl + 4,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    borderWidth: 2,
    ...SHADOWS.sm,
  },
  moodEmoji: { fontSize: 50 },
  moodLabel: { fontSize: FONT_SIZE.md, fontWeight: '800' },
  skipBtn: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    marginTop: SPACING.sm,
  },
  skipText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textLight,
    fontWeight: '600',
  },
});
