import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
import { useAppStore } from '../../src/stores/appStore';
import { useRewardStore } from '../../src/stores/rewardStore';
import { COLORS, SPACING, FONT_SIZE, RADIUS, SHADOWS } from '../../src/constants/theme';

type Phase = 'intro' | 'breathing' | 'stretching' | 'done';

const STRETCH_COUNT = 4; // Pick 4 random stretches from the pool

function pickRandomStretches(count: number) {
  const shuffled = [...STRETCHES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export default function WellnessScreen() {
  const router = useRouter();
  const { selectedChildId } = useAppStore();
  const { addStars } = useRewardStore();

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
    if (selectedChildId) {
      addStars(selectedChildId, 3);
    }
    router.replace('/child/home');
  };

  const handleQuit = () => {
    router.replace('/child/home');
  };

  return (
    <LinearGradient colors={['#E8E0F0', '#D0C4E8', '#B8A9D9']} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          {/* Top bar */}
          <Reanimated.View entering={FadeIn.duration(300)} style={styles.topBar}>
            <TouchableOpacity onPress={handleQuit} style={styles.quitBtn}>
              <Text style={styles.quitText}>✕</Text>
            </TouchableOpacity>
            <View style={styles.phaseBadge}>
              <Text style={styles.phaseLabel}>
                {phase === 'intro' && '🌙 Routine calme'}
                {phase === 'breathing' && '🌬️ Respiration'}
                {phase === 'stretching' && '🧘 Étirements'}
                {phase === 'done' && '✨ Terminé'}
              </Text>
            </View>
            <View style={{ width: 44 }} />
          </Reanimated.View>

          {phase !== 'intro' && (
            <ProgressBar progress={progress} color="#A29BFE" height={10} />
          )}

          {/* Content */}
          <View style={styles.content}>
            {phase === 'intro' && (
              <Reanimated.View entering={FadeInDown.duration(500)} style={styles.introContainer}>
                <Text style={styles.introEmoji}>🌙</Text>
                <Text style={styles.introTitle}>Routine calme</Text>
                <Text style={styles.introSubtitle}>
                  Prends un moment pour te détendre avant de dormir 💤
                </Text>

                <View style={styles.introSteps}>
                  <Reanimated.View entering={FadeInRight.delay(200)} style={styles.introStep}>
                    <Text style={styles.introStepEmoji}>🌬️</Text>
                    <View style={styles.introStepInfo}>
                      <Text style={styles.introStepTitle}>Respiration</Text>
                      <Text style={styles.introStepDesc}>5 respirations profondes pour se calmer</Text>
                    </View>
                  </Reanimated.View>
                  <Reanimated.View entering={FadeInRight.delay(400)} style={styles.introStep}>
                    <Text style={styles.introStepEmoji}>🧘</Text>
                    <View style={styles.introStepInfo}>
                      <Text style={styles.introStepTitle}>Étirements</Text>
                      <Text style={styles.introStepDesc}>{STRETCH_COUNT} exercices doux pour le corps</Text>
                    </View>
                  </Reanimated.View>
                  <Reanimated.View entering={FadeInRight.delay(600)} style={styles.introStep}>
                    <Text style={styles.introStepEmoji}>⭐</Text>
                    <View style={styles.introStepInfo}>
                      <Text style={styles.introStepTitle}>Récompense</Text>
                      <Text style={styles.introStepDesc}>+3 étoiles pour prendre soin de toi !</Text>
                    </View>
                  </Reanimated.View>
                </View>

                <Reanimated.View entering={BounceIn.delay(800)}>
                  <AnimatedPressable onPress={handleStart} style={styles.startButton} scaleDown={0.92}>
                    <Text style={styles.startButtonText}>Commencer 🧘</Text>
                  </AnimatedPressable>
                </Reanimated.View>
              </Reanimated.View>
            )}

            {phase === 'breathing' && (
              <Reanimated.View entering={FadeIn.duration(600)} style={styles.centerContent}>
                <Text style={styles.sectionHint}>Suis la bulle avec ta respiration…</Text>
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
                <Text style={styles.doneTitle}>Bravo !</Text>
                <Text style={styles.doneSubtitle}>
                  Tu as pris soin de toi ce soir.{'\n'}Bonne nuit ! 🌙💤
                </Text>
                <View style={styles.starsEarned}>
                  <Text style={styles.starsText}>+3 ⭐</Text>
                </View>
                <AnimatedPressable onPress={handleFinish} style={styles.finishButton} scaleDown={0.92}>
                  <Text style={styles.finishButtonText}>Retour 🏠</Text>
                </AnimatedPressable>
              </Reanimated.View>
            )}
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  container: { flex: 1, padding: SPACING.lg },
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
    backgroundColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quitText: { fontSize: 22, color: COLORS.textLight },
  phaseBadge: {
    backgroundColor: 'rgba(255,255,255,0.6)',
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
    flex: 1,
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
    backgroundColor: 'rgba(255,255,255,0.6)',
    padding: SPACING.md,
    borderRadius: RADIUS.xl,
  },
  introStepEmoji: { fontSize: 32 },
  introStepInfo: { flex: 1, gap: 2 },
  introStepTitle: { fontSize: FONT_SIZE.md, fontWeight: '800', color: COLORS.text },
  introStepDesc: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary },
  startButton: {
    backgroundColor: '#A29BFE',
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
    backgroundColor: 'rgba(255,255,255,0.7)',
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
