import React, { useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Reanimated, {
  FadeInRight,
  FadeOutLeft,
  FadeInDown,
  FadeIn,
  BounceIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useRoutineStore } from '../../src/stores/routineStore';
import { useRewardStore } from '../../src/stores/rewardStore';
import { useAppStore } from '../../src/stores/appStore';
import { useMoodStore } from '../../src/stores/moodStore';
import { MOOD_CONFIG, isNegativeMood } from '../../src/constants/moods';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { X, Check, ArrowRight } from 'phosphor-react-native';
import { CircularTimer } from '../../src/components/ui/CircularTimer';
import { AnimatedPressable } from '../../src/components/ui/AnimatedPressable';
import { COLORS, SPACING, FONT_SIZE, RADIUS, SHADOWS } from '../../src/constants/theme';
import { useTimer } from '../../src/hooks/useTimer';
import { OpenMoji } from '../../src/components/ui/OpenMoji';
import * as Haptics from 'expo-haptics';

function PulsingButton({ color, onPress, text, icon }: { color: string; onPress: () => void; text: string; icon?: React.ReactNode }) {
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.04, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      style={[styles.doneButton, { backgroundColor: color || COLORS.success }]}
      scaleDown={0.9}
    >
      <Reanimated.View style={[pulseStyle, { flexDirection: 'row', alignItems: 'center', gap: 6 }]}>
        <Text style={styles.doneButtonText}>{text}</Text>
        {icon}
      </Reanimated.View>
    </AnimatedPressable>
  );
}

export default function RunRoutineScreen() {
  const router = useRouter();
  const { currentExecution, completeStep, finishExecution, cancelExecution, getRoutine, chainQueue, nextInChain } =
    useRoutineStore();
  const { recordCompletion } = useRewardStore();
  const { selectedChildId } = useAppStore();
  const { getMood, isMoodFresh } = useMoodStore();

  const currentMood = selectedChildId && isMoodFresh(selectedChildId)
    ? getMood(selectedChildId)?.mood
    : undefined;
  const moodConfig = currentMood ? MOOD_CONFIG[currentMood] : undefined;

  const routine = currentExecution ? getRoutine(currentExecution.routineId) : undefined;

  // Filter steps: skip optional steps when mood is negative (less difficulty)
  const activeSteps = React.useMemo(() => {
    if (!routine) return [];
    if (currentMood && isNegativeMood(currentMood)) {
      return routine.steps.filter((s) => s.isRequired);
    }
    return routine.steps;
  }, [routine, currentMood]);

  const completedCount = currentExecution?.stepsCompleted.length ?? 0;
  const totalSteps = activeSteps.length;
  const currentStepIndex = completedCount;
  const isAllDone = currentStepIndex >= totalSteps;
  const currentStep = activeSteps[currentStepIndex];
  const progress = totalSteps > 0 ? completedCount / totalSteps : 0;

  const lastCompletionTime = useRef(0);
  const STEP_COOLDOWN_MS = 800;

  const timerDuration = currentStep ? currentStep.durationMinutes * 60 : 0;
  const timer = useTimer(timerDuration);

  // Start timer when step changes
  useEffect(() => {
    if (currentStep && currentStep.durationMinutes > 0) {
      timer.start();
    }
    return () => timer.stop();
  }, [currentStepIndex]);

  // Redirect if no execution or routine
  useEffect(() => {
    if (!currentExecution) {
      router.replace('/child/home');
    } else if (!routine) {
      cancelExecution();
      router.replace('/child/home');
    }
  }, [currentExecution, routine]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleComplete = useCallback(async () => {
    if (!currentStep || !routine) return;

    const now = Date.now();
    if (now - lastCompletionTime.current < STEP_COOLDOWN_MS) return;
    lastCompletionTime.current = now;

    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}

    completeStep(currentStep.id);

    // Check if this was the last step
    if (currentStepIndex + 1 >= totalSteps) {
      const execution = finishExecution();
      if (execution) {
        const newBadges = recordCompletion(execution);

        // Check if there are more routines in the chain
        if (chainQueue.length > 0) {
          const nextExec = nextInChain();
          if (nextExec) {
            // Continue to next routine — no navigation needed, component re-renders
            return;
          }
        }

        router.replace({
          pathname: '/child/celebration',
          params: {
            stars: execution.earnedStars.toString(),
            badges: newBadges.join(','),
            routineName: routine.name,
            routineIcon: routine.icon,
            duration: Math.round(
              (new Date(execution.completedAt!).getTime() - new Date(execution.startedAt).getTime()) / 60000
            ).toString(),
          },
        });
      }
    }
  }, [currentStep, currentStepIndex, totalSteps, chainQueue]);

  const handleQuit = () => {
    cancelExecution();
    router.replace('/child/home');
  };

  const defaultEncouragements = [
    'C\'est parti ! 💪',
    'Tu gères ! 🌟',
    'Encore un effort ! ✨',
    'Super travail ! 🎯',
    'Continue ! 💫',
  ];

  const encouragements = moodConfig?.encouragements ?? defaultEncouragements;
  const gradientColors = moodConfig?.gradientColors ?? ['#FFF8F0', '#FFE8D6'];

  // Adapt animation duration based on mood intensity
  const animSpeed = moodConfig?.animationIntensity === 'calm' ? 600
    : moodConfig?.animationIntensity === 'energetic' ? 300
    : 400;

  if (!currentExecution || !routine || !currentStep || isAllDone) return null;

  // Calculate estimated end time from remaining steps
  const remainingMinutes = activeSteps
    .slice(currentStepIndex)
    .reduce((sum, s) => sum + s.durationMinutes, 0);
  const endTime = (() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + remainingMinutes);
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  })();

  return (
    <LinearGradient colors={gradientColors} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          {/* Top bar */}
          <Reanimated.View entering={FadeIn.duration(300)} style={styles.topBar}>
            <TouchableOpacity onPress={handleQuit} style={styles.quitBtn}>
              <X size={22} weight="bold" color={COLORS.textLight} />
            </TouchableOpacity>
            {chainQueue.length > 0 && (
              <View style={styles.chainIndicator}>
                <Text style={styles.chainIndicatorText}>
                  ⛓️ +{chainQueue.length} à suivre
                </Text>
              </View>
            )}
            <View style={styles.counterBadge}>
              <Text style={styles.counter}>
                {completedCount + 1} / {totalSteps}
              </Text>
            </View>
            <View style={styles.endTimeBadge}>
              <Text style={styles.endTimeText}>🏁 {endTime}</Text>
            </View>
          </Reanimated.View>

          {/* Progress */}
          <ProgressBar progress={progress} color={routine.color} height={10} />

          {/* Step Content */}
          <Reanimated.View
            key={currentStepIndex}
            entering={FadeInRight.duration(animSpeed).springify()}
            exiting={FadeOutLeft.duration(animSpeed / 2)}
            style={styles.stepContainer}
          >
            <Reanimated.View
              entering={BounceIn.delay(animSpeed / 2).duration(animSpeed)}
              style={styles.stepIcon}
            >
              <OpenMoji emoji={currentStep.icon} size={64} />
            </Reanimated.View>
            <Text style={styles.stepTitle}>{currentStep.title}</Text>
            {currentStep.mediaUri ? (
              <Image source={{ uri: currentStep.mediaUri }} style={styles.stepMedia} />
            ) : null}
            {currentStep.instruction ? (
              <Text style={styles.stepInstruction}>{currentStep.instruction}</Text>
            ) : null}
            {currentStep.durationMinutes > 0 ? (
              <View style={styles.timerContainer}>
                <CircularTimer
                  progress={timer.progress}
                  label={formatTime(timer.remaining)}
                  color={routine.color}
                  isFinished={timer.isFinished}
                  size={150}
                  strokeWidth={12}
                />
                {timer.isFinished && (
                  <Text style={styles.timerFinishedLabel}>Temps écoulé !</Text>
                )}
              </View>
            ) : null}
            {!currentStep.isRequired && (
              <View style={styles.optionalBadge}>
                <Text style={styles.optionalText}>Facultatif</Text>
              </View>
            )}
          </Reanimated.View>

          {/* Encouragement */}
          <Reanimated.Text
            key={`enc-${currentStepIndex}`}
            entering={FadeInDown.delay(300).duration(300)}
            style={styles.encouragement}
          >
            {completedCount === totalSteps - 1
              ? 'Dernière étape ! 🎉'
              : encouragements[completedCount % encouragements.length]}
          </Reanimated.Text>

          {/* Action button */}
          <PulsingButton
            color={routine.color}
            onPress={handleComplete}
            text="C'est fait !"
            icon={<Check size={20} weight="bold" color="#FFF" />}
          />

          {/* Skip if optional */}
          {!currentStep.isRequired && (
            <TouchableOpacity onPress={handleComplete} style={styles.skipBtn}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={styles.skipText}>Passer cette étape</Text>
                <ArrowRight size={18} weight="bold" color={COLORS.textSecondary} />
              </View>
            </TouchableOpacity>
          )}
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
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBadge: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
  },
  counter: { fontSize: FONT_SIZE.md, fontWeight: '800', color: COLORS.textSecondary },
  chainIndicator: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  chainIndicatorText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  endTimeBadge: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  endTimeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  stepIcon: { fontSize: 90, marginBottom: SPACING.lg },
  stepTitle: {
    fontSize: FONT_SIZE.xxl + 2,
    fontWeight: '900',
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 42,
  },
  stepMedia: {
    width: 180,
    height: 180,
    borderRadius: RADIUS.xl,
    marginTop: SPACING.md,
  },
  stepInstruction: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.md,
    lineHeight: 26,
  },
  timerContainer: {
    marginTop: SPACING.lg,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  timerFinishedLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.success,
    marginTop: SPACING.xs,
  },
  optionalBadge: {
    backgroundColor: COLORS.accent + '40',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
    marginTop: SPACING.md,
  },
  optionalText: { fontSize: FONT_SIZE.xs, fontWeight: '600', color: COLORS.accentDark },
  encouragement: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  doneButton: {
    paddingVertical: SPACING.lg + 2,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    ...SHADOWS.md,
    marginBottom: SPACING.md,
  },
  doneButtonText: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '900',
    color: '#FFF',
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  skipText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textLight,
    fontWeight: '600',
  },
});
