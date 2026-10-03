import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Reanimated, {
  FadeIn,
  FadeInDown,
  FadeInRight,
  FadeOutLeft,
  BounceIn,
  SlideInUp,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { BreathingBubble } from '../../src/components/wellness/BreathingBubble';
import { StretchingCard, STRETCHES } from '../../src/components/wellness/StretchingCard';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { AnimatedPressable } from '../../src/components/ui/AnimatedPressable';
import { useRewardStore } from '../../src/stores/rewardStore';
import { useRoutineStore } from '../../src/stores/routineStore';
import { COLORS, SPACING, FONT_SIZE, RADIUS, SHADOWS } from '../../src/constants/theme';
import { useAppTheme } from '../../src/hooks/useAppTheme';

type Phase = 'intro' | 'breathing' | 'stretching' | 'done';

const STRETCH_COUNT = 4; // Pick 4 random stretches from the pool

function pickRandomStretches(count: number) {
  const shuffled = [...STRETCHES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export default function WellnessScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const { addStars } = useRewardStore();
  const currentExecution = useRoutineStore((state) => state.currentExecution);

  const [phase, setPhase] = useState<Phase>('intro');
  const [stretches] = useState(() => pickRandomStretches(STRETCH_COUNT));
  const [stretchIndex, setStretchIndex] = useState(0);
  const [stretchRemaining, setStretchRemaining] = useState(0);

  const currentStretch = stretches[stretchIndex];
  const totalPhases = 3; // intro doesn't count, breathing=1, stretching=2, done=3
  const currentPhaseNum = phase === 'breathing' ? 1 : phase === 'stretching' ? 2 : phase === 'done' ? 3 : 0;
  const progress = currentPhaseNum / totalPhases;

  // Stretch countdown timer
  useEffect(() => {
    if (phase !== 'stretching' || !currentStretch) return;

    setStretchRemaining(currentStretch.durationSeconds);

    const interval = setInterval(() => {
      setStretchRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, stretchIndex]);

  // Auto-advance stretch when timer ends
  useEffect(() => {
    if (phase !== 'stretching' || stretchRemaining > 0) return;
    if (!currentStretch) return;

    const timeout = setTimeout(() => {
      if (stretchIndex + 1 >= stretches.length) {
        setPhase('done');
        try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
      } else {
        setStretchIndex((i) => i + 1);
        try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
      }
    }, 800);

    return () => clearTimeout(timeout);
  }, [stretchRemaining, phase]);

  const handleBreathingDone = useCallback(() => {
    setPhase('stretching');
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
  }, []);

  const handleStart = () => {
    setPhase('breathing');
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
  };

  const handleFinish = () => {
    // Award 3 stars for completing wellness routine
    const participantIds = currentExecution?.participantChildIds?.length
      ? currentExecution.participantChildIds
      : currentExecution?.childId
        ? [currentExecution.childId]
        : [];
    participantIds.forEach((childId) => addStars(childId, 3));
    router.replace('/routines');
  };

  const handleQuit = () => {
    router.replace('/routines');
  };

  return (
    <View style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          {/* Top bar */}
          <Reanimated.View entering={FadeIn.duration(300)} style={styles.topBar}>
            <TouchableOpacity onPress={handleQuit} style={[styles.quitBtn, { backgroundColor: colors.surface }]}>
              <Text style={[styles.quitText, { color: colors.textSecondary }]}>✕</Text>
            </TouchableOpacity>
            <View style={[styles.phaseBadge, { backgroundColor: colors.surface }]}>
              <Text style={[styles.phaseLabel, { color: colors.textSecondary }]}>
                {phase === 'intro' && '🌙 Routine calme'}
                {phase === 'breathing' && '🌬️ Respiration'}
                {phase === 'stretching' && '🧘 Étirements'}
                {phase === 'done' && '✨ Terminé'}
              </Text>
            </View>
            <View style={{ width: 44 }} />
          </Reanimated.View>

          {phase !== 'intro' && (
          <ProgressBar progress={progress} color={colors.time} height={10} />
          )}

          {/* Content */}
          <View style={styles.content}>
            {phase === 'intro' && (
              <Reanimated.View entering={FadeInDown.duration(500)} style={styles.introContainer}>
                <Text style={styles.introEmoji}>🌙</Text>
                <Text style={[styles.introTitle, { color: colors.text }]}>Routine calme</Text>
                <Text style={[styles.introSubtitle, { color: colors.textSecondary }]}>
                  Prends un moment pour te détendre avant de dormir 💤
                </Text>

                <View style={styles.introSteps}>
                  <Reanimated.View entering={FadeInRight.delay(200)} style={[styles.introStep, { backgroundColor: colors.surface }]}>
                    <Text style={styles.introStepEmoji}>🌬️</Text>
                    <View style={styles.introStepInfo}>
                      <Text style={[styles.introStepTitle, { color: colors.text }]}>Respiration</Text>
                      <Text style={[styles.introStepDesc, { color: colors.textSecondary }]}>5 respirations profondes pour se calmer</Text>
                    </View>
                  </Reanimated.View>
                  <Reanimated.View entering={FadeInRight.delay(400)} style={[styles.introStep, { backgroundColor: colors.surface }]}>
                    <Text style={styles.introStepEmoji}>🧘</Text>
                    <View style={styles.introStepInfo}>
                      <Text style={[styles.introStepTitle, { color: colors.text }]}>Étirements</Text>
                      <Text style={[styles.introStepDesc, { color: colors.textSecondary }]}>{STRETCH_COUNT} exercices doux pour le corps</Text>
                    </View>
                  </Reanimated.View>
                  <Reanimated.View entering={FadeInRight.delay(600)} style={[styles.introStep, { backgroundColor: colors.surface }]}>
                    <Text style={styles.introStepEmoji}>⭐</Text>
                    <View style={styles.introStepInfo}>
                      <Text style={[styles.introStepTitle, { color: colors.text }]}>Récompense</Text>
                      <Text style={[styles.introStepDesc, { color: colors.textSecondary }]}>+3 étoiles pour prendre soin de toi !</Text>
                    </View>
                  </Reanimated.View>
                </View>

                <Reanimated.View entering={BounceIn.delay(800)}>
                  <AnimatedPressable onPress={handleStart} style={[styles.startButton, { backgroundColor: colors.time }]} scaleDown={0.92}>
                    <Text style={[styles.startButtonText, { color: isDark ? COLORS.text : '#FFF' }]}>Commencer 🧘</Text>
                  </AnimatedPressable>
                </Reanimated.View>
              </Reanimated.View>
            )}

            {phase === 'breathing' && (
              <Reanimated.View entering={FadeIn.duration(600)} style={styles.centerContent}>
                <Text style={[styles.sectionHint, { color: colors.textSecondary }]}>Suis la bulle avec ta respiration…</Text>
                <BreathingBubble cycles={5} onComplete={handleBreathingDone} />
              </Reanimated.View>
            )}

            {phase === 'stretching' && currentStretch && (
              <Reanimated.View
                key={currentStretch.id}
                entering={FadeInRight.duration(500).springify()}
                exiting={FadeOutLeft.duration(300)}
                style={styles.centerContent}
              >
                <StretchingCard
                  stretch={currentStretch}
                  remaining={stretchRemaining}
                  current={stretchIndex + 1}
                  total={stretches.length}
                />
              </Reanimated.View>
            )}

            {phase === 'done' && (
              <Reanimated.View entering={SlideInUp.duration(600).springify()} style={styles.doneContainer}>
                <Text style={styles.doneEmoji}>🌟</Text>
                <Text style={[styles.doneTitle, { color: colors.text }]}>Bravo !</Text>
                <Text style={[styles.doneSubtitle, { color: colors.textSecondary }]}>
                  Tu as pris soin de toi ce soir.{'\n'}Bonne nuit ! 🌙💤
                </Text>
                <View style={[styles.starsEarned, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.starsText, { color: colors.star }]}>+3 ⭐</Text>
                </View>
                <AnimatedPressable onPress={handleFinish} style={[styles.finishButton, { backgroundColor: colors.success }]} scaleDown={0.92}>
                  <Text style={[styles.finishButtonText, { color: isDark ? COLORS.text : '#FFF' }]}>Retour 🏠</Text>
                </AnimatedPressable>
              </Reanimated.View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  container: { flexGrow: 1, padding: SPACING.lg, paddingBottom: SPACING.xl },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  quitBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quitText: { fontSize: 22, color: COLORS.textLight },
  phaseBadge: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
  },
  phaseLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.xl,
  },
  sectionHint: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },

  // Intro
  introContainer: {
    alignItems: 'center',
    gap: SPACING.lg,
  },
  introEmoji: { fontSize: 80 },
  introTitle: {
    fontSize: FONT_SIZE.hero,
    fontWeight: '900',
    color: COLORS.text,
    textAlign: 'center',
  },
  introSubtitle: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 28,
  },
  introSteps: {
    width: '100%',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  introStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.xl,
  },
  introStepEmoji: { fontSize: 32 },
  introStepInfo: { flex: 1, gap: 2 },
  introStepTitle: { fontSize: FONT_SIZE.md, fontWeight: '800', color: COLORS.text },
  introStepDesc: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary },
  startButton: {
    backgroundColor: COLORS.secondary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl + SPACING.lg,
    borderRadius: RADIUS.full,
    marginTop: SPACING.md,
    ...SHADOWS.md,
  },
  startButtonText: {
    color: '#FFF',
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
  },

  // Done
  doneContainer: {
    alignItems: 'center',
    gap: SPACING.lg,
  },
  doneEmoji: { fontSize: 90 },
  doneTitle: {
    fontSize: FONT_SIZE.hero,
    fontWeight: '900',
    color: COLORS.text,
  },
  doneSubtitle: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 28,
  },
  starsEarned: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.full,
  },
  starsText: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '900',
    color: COLORS.star,
  },
  finishButton: {
    backgroundColor: COLORS.success,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl + SPACING.lg,
    borderRadius: RADIUS.full,
    marginTop: SPACING.sm,
    ...SHADOWS.md,
  },
  finishButtonText: {
    color: '#FFF',
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
  },
});
