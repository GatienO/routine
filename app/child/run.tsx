import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Reanimated, {
  FadeInRight,
  FadeOutLeft,
  FadeInDown,
  FadeIn,
  BounceIn,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useRoutineStore } from '../../src/stores/routineStore';
import { useRewardStore } from '../../src/stores/rewardStore';
import { useMoodStore } from '../../src/stores/moodStore';
import { useChildrenStore } from '../../src/stores/childrenStore';
import { MOOD_CONFIG, isNegativeMood } from '../../src/constants/moods';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { X, ArrowRight, CheckCircle } from 'phosphor-react-native';
import { CircularTimer } from '../../src/components/ui/CircularTimer';
import { AnimatedPressable } from '../../src/components/ui/AnimatedPressable';
import { COLORS, SPACING, FONT_SIZE, RADIUS, SHADOWS, TOUCH } from '../../src/constants/theme';
import { useTimer } from '../../src/hooks/useTimer';
import { OpenMoji } from '../../src/components/ui/OpenMoji';
import { Avatar } from '../../src/components/ui/Avatar';
import { Child } from '../../src/types';
import * as Haptics from 'expo-haptics';
import { formatChildName } from '../../src/utils/children';

function ParticipantValidationButton({
  child,
  confirmed,
  disabled,
  onPress,
  compact,
}: {
  child: Child;
  confirmed: boolean;
  disabled: boolean;
  onPress: () => void;
  compact: boolean;
}) {
  const isDisabled = disabled && !confirmed;

  return (
    <AnimatedPressable
      onPress={onPress}
      containerStyle={styles.participantButtonContainer}
      style={[
        styles.participantButton,
        compact ? styles.participantButtonCompact : styles.participantButtonWide,
        confirmed
          ? { backgroundColor: child.color + '22', borderColor: child.color }
          : styles.participantButtonPending,
        isDisabled ? styles.participantButtonDisabled : null,
      ]}
      scaleDown={0.96}
      disabled={confirmed || isDisabled}
      hitSlop={16}
    >
      <View style={[styles.participantButtonInner, compact && styles.participantButtonInnerCompact]}>
        <Avatar
          emoji={child.avatar}
          color={child.color}
          size={compact ? 38 : 42}
          avatarConfig={child.avatarConfig}
        />
        <View style={styles.participantButtonTextWrap}>
          <Text style={styles.participantButtonName} numberOfLines={1} selectable={false}>
            {formatChildName(child.name)}
          </Text>
          {!compact ? (
            <Text style={styles.participantButtonLabel} selectable={false}>
              {confirmed ? 'Valide' : isDisabled ? 'Attends...' : "C'est fait"}
            </Text>
          ) : null}
        </View>
        <View
          style={[
            styles.participantButtonBadge,
            confirmed && { backgroundColor: child.color, borderColor: child.color },
          ]}
        >
          <CheckCircle
            size={18}
            weight={confirmed ? 'fill' : 'regular'}
            color={confirmed ? '#FFF' : child.color}
          />
        </View>
      </View>
    </AnimatedPressable>
  );
}

export default function RunRoutineScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 760;
  const {
    currentExecution,
    completeStep,
    finishExecution,
    cancelExecution,
    getRoutine,
    chainQueue,
    nextInChain,
  } = useRoutineStore();
  const { recordCompletion } = useRewardStore();
  const { getMood, isMoodFresh } = useMoodStore();
  const { getChild } = useChildrenStore();
  const activeChildId = currentExecution?.childId;
  const isLeavingFlowRef = useRef(false);
  const isAdvancingStepRef = useRef(false);
  const completingStepIdRef = useRef<string | null>(null);
  const [confirmedChildIds, setConfirmedChildIds] = useState<string[]>([]);
  const [stepConfirmationEnabled, setStepConfirmationEnabled] = useState(false);
  const [pauseHoldProgress, setPauseHoldProgress] = useState(0);
  const pauseHoldIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pauseHoldTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentMood =
    activeChildId && isMoodFresh(activeChildId) ? getMood(activeChildId)?.mood : undefined;
  const moodConfig = currentMood ? MOOD_CONFIG[currentMood] : undefined;

  const routine = currentExecution ? getRoutine(currentExecution.routineId) : undefined;

  const activeSteps = React.useMemo(() => {
    if (!routine) return [];
    const baseSteps =
      currentExecution?.customStepOrder?.length ? currentExecution.customStepOrder : routine.steps;
    if (currentMood && isNegativeMood(currentMood)) {
      return baseSteps.filter((step) => step.isRequired);
    }
    return baseSteps;
  }, [routine, currentMood, currentExecution?.customStepOrder]);

  const participantChildren = useMemo(() => {
    const ids =
      currentExecution?.participantChildIds?.length
        ? currentExecution.participantChildIds
        : currentExecution?.childId
          ? [currentExecution.childId]
          : [];

    return ids
      .map((childId) => getChild(childId))
      .filter((child): child is Child => Boolean(child));
  }, [currentExecution?.childId, currentExecution?.participantChildIds, getChild]);
  const compactParticipants = width < 900;
  const splitIndex = Math.ceil(participantChildren.length / 2);
  const leftParticipants = participantChildren.slice(0, splitIndex);
  const rightParticipants = participantChildren.slice(splitIndex);
  const centerColumnWidth = compactParticipants
    ? Math.min(width - (isMobile ? SPACING.md * 2 : SPACING.lg * 2), isMobile ? 340 : 360)
    : width >= 1440
      ? 320
      : width >= 1180
        ? 300
        : 280;
  const availableSideWidth = Math.floor(
    (width - SPACING.lg * 2 - SPACING.md * 2 - centerColumnWidth) / 2,
  );
  const sideColumnWidth = compactParticipants
    ? isMobile
      ? centerColumnWidth
      : 132
    : Math.max(260, Math.min(360, availableSideWidth));
  const timerSize = width >= 1280 ? 220 : width >= 1024 ? 204 : width >= 768 ? 186 : 156;
  const stepIconSize = width >= 1024 ? 82 : isMobile ? 62 : 70;

  const completedCount = currentExecution?.stepsCompleted.length ?? 0;
  const totalSteps = activeSteps.length;
  const currentStepIndex = completedCount;
  const isAllDone = currentStepIndex >= totalSteps;
  const currentStep = activeSteps[currentStepIndex];
  const progress = totalSteps > 0 ? completedCount / totalSteps : 0;

  const STEP_START_LOCK_MS = 650;

  const minimumStepSeconds = currentStep ? (currentStep.minimumDurationMinutes ?? 0) * 60 : 0;
  const timerDuration = currentStep
    ? Math.max(currentStep.durationMinutes, currentStep.minimumDurationMinutes ?? 0) * 60
    : 0;
  const timer = useTimer(timerDuration);
  const elapsedStepSeconds = Math.max(0, timerDuration - timer.remaining);
  const minimumTimeRemaining = Math.max(0, minimumStepSeconds - elapsedStepSeconds);
  const isMinimumTimeReached = minimumStepSeconds === 0 || elapsedStepSeconds >= minimumStepSeconds;
  const canConfirmStep = stepConfirmationEnabled && isMinimumTimeReached;
  const HOLD_TO_PAUSE_MS = 4000;

  useEffect(() => {
    if (currentStep && timerDuration > 0) {
      timer.start();
    }
    return () => timer.stop();
  }, [currentStepIndex, timerDuration]);

  useEffect(() => {
    return () => {
      if (pauseHoldIntervalRef.current) {
        clearInterval(pauseHoldIntervalRef.current);
      }
      if (pauseHoldTimeoutRef.current) {
        clearTimeout(pauseHoldTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isLeavingFlowRef.current) return;
    if (!currentExecution) {
      router.replace('/child');
    } else if (!routine) {
      cancelExecution();
      router.replace('/child');
    }
  }, [currentExecution, routine]);

  useEffect(() => {
    setConfirmedChildIds([]);
    isAdvancingStepRef.current = false;
    completingStepIdRef.current = null;
    setStepConfirmationEnabled(false);

    const unlockTimer = setTimeout(() => {
      setStepConfirmationEnabled(true);
    }, STEP_START_LOCK_MS);

    return () => clearTimeout(unlockTimer);
  }, [currentExecution?.id, currentStep?.id]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleComplete = useCallback(async () => {
    if (!currentStep || !routine) {
      isAdvancingStepRef.current = false;
      completingStepIdRef.current = null;
      return;
    }
    if (minimumStepSeconds > 0 && !isMinimumTimeReached) {
      isAdvancingStepRef.current = false;
      completingStepIdRef.current = null;
      return;
    }
    if (completingStepIdRef.current === currentStep.id) return;

    completingStepIdRef.current = currentStep.id;

    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}

    completeStep(currentStep.id);

    if (currentStepIndex + 1 >= totalSteps) {
      const execution = finishExecution();
      if (execution) {
        const rewardSummary = recordCompletion(execution);

        if (chainQueue.length > 0) {
          const nextExecution = nextInChain();
          if (nextExecution) {
            isLeavingFlowRef.current = true;
            router.replace('/child/pause');
            return;
          }
        }

        isLeavingFlowRef.current = true;
        router.replace({
          pathname: '/child/celebration',
          params: {
            stars: execution.earnedStars.toString(),
            badges: rewardSummary.flatMap((entry) => entry.unlockedBadgeIds).join(','),
            rewardSummary: JSON.stringify(rewardSummary),
            routineName: routine.name,
            routineIcon: routine.icon,
            duration: Math.round(
              (new Date(execution.completedAt!).getTime() - new Date(execution.startedAt).getTime()) /
                60000,
            ).toString(),
          },
        });
      }
    }
  }, [
    chainQueue.length,
    completeStep,
    currentStep,
    currentStepIndex,
    finishExecution,
    nextInChain,
    recordCompletion,
    routine,
    router,
    totalSteps,
    isMinimumTimeReached,
    minimumStepSeconds,
  ]);

  const handleParticipantComplete = useCallback(
    async (childId: string) => {
      if (!canConfirmStep || !currentStep) return;

      let acceptedPress = false;
      let shouldAdvance = false;

      setConfirmedChildIds((prev) => {
        if (
          prev.includes(childId) ||
          isAdvancingStepRef.current ||
          completingStepIdRef.current === currentStep.id
        ) {
          return prev;
        }

        acceptedPress = true;
        const nextConfirmedIds = [...prev, childId];
        shouldAdvance = nextConfirmedIds.length >= participantChildren.length;
        return nextConfirmedIds;
      });

      if (!acceptedPress) return;

      try {
        await Haptics.selectionAsync();
      } catch {}

      if (shouldAdvance) {
        isAdvancingStepRef.current = true;
        setTimeout(() => {
          void handleComplete();
        }, 140);
      }
    },
    [canConfirmStep, currentStep, handleComplete, participantChildren.length],
  );

  const handleQuit = () => {
    isLeavingFlowRef.current = true;
    cancelExecution();
    router.replace('/child');
  };

  const clearPauseHold = useCallback(() => {
    if (pauseHoldIntervalRef.current) {
      clearInterval(pauseHoldIntervalRef.current);
      pauseHoldIntervalRef.current = null;
    }
    if (pauseHoldTimeoutRef.current) {
      clearTimeout(pauseHoldTimeoutRef.current);
      pauseHoldTimeoutRef.current = null;
    }
    setPauseHoldProgress(0);
  }, []);

  const handlePauseToggle = useCallback(async () => {
    if (timer.isPaused) {
      timer.resume();
    } else {
      timer.pause();
    }

    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {}
  }, [timer]);

  const handlePausePressIn = useCallback(() => {
    if (timerDuration <= 0 || timer.isFinished) return;

    clearPauseHold();
    const startedAt = Date.now();

    setPauseHoldProgress(0.02);
    pauseHoldIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      setPauseHoldProgress(Math.min(1, elapsed / HOLD_TO_PAUSE_MS));
    }, 50);

    pauseHoldTimeoutRef.current = setTimeout(() => {
      clearPauseHold();
      void handlePauseToggle();
    }, HOLD_TO_PAUSE_MS);
  }, [clearPauseHold, handlePauseToggle, timer.isFinished, timerDuration]);

  const handlePausePressOut = useCallback(() => {
    clearPauseHold();
  }, [clearPauseHold]);

  const defaultEncouragements = [
    "C'est parti !",
    'Tu geres !',
    'Encore un effort !',
    'Super travail !',
    'Continue !',
  ];

  const encouragements = moodConfig?.encouragements ?? defaultEncouragements;
  const gradientColors = moodConfig?.gradientColors ?? ['#FFF8F0', '#FFE8D6'];
  const animSpeed =
    moodConfig?.animationIntensity === 'calm'
      ? 600
      : moodConfig?.animationIntensity === 'energetic'
        ? 300
        : 400;

  if (!currentExecution || !routine || !currentStep || isAllDone) return null;

  const orderedParticipants = isMobile ? participantChildren : [...leftParticipants, ...rightParticipants];

  const remainingMinutes = activeSteps
    .slice(currentStepIndex)
    .reduce(
      (sum, step) => sum + Math.max(step.durationMinutes, step.minimumDurationMinutes ?? 0),
      0,
    );
  const endTime = (() => {
    const date = new Date();
    date.setMinutes(date.getMinutes() + remainingMinutes);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  })();

  return (
    <LinearGradient colors={gradientColors} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <Reanimated.View
            entering={FadeIn.duration(300)}
            style={[styles.topBar, isMobile && styles.topBarMobile]}
          >
            <TouchableOpacity onPress={handleQuit} style={styles.quitBtn}>
              <X size={22} weight="bold" color={COLORS.textLight} />
            </TouchableOpacity>
            <View style={[styles.topBarBadges, isMobile && styles.topBarBadgesMobile]}>
              {chainQueue.length > 0 ? (
                <View style={styles.chainIndicator}>
                  <Text style={styles.chainIndicatorText} selectable={false}>+{chainQueue.length} a suivre</Text>
                </View>
              ) : null}
              <View style={styles.counterBadge}>
                <Text style={styles.counter} selectable={false}>
                  {completedCount + 1} / {totalSteps}
                </Text>
              </View>
              <View style={styles.endTimeBadge}>
                <Text style={styles.endTimeText} selectable={false}>Fin {endTime}</Text>
              </View>
            </View>
          </Reanimated.View>

          <ProgressBar progress={progress} color={routine.color} height={10} />

          <View style={[styles.topCenterStatus, { maxWidth: centerColumnWidth }]}>
            <Reanimated.Text
              key={`enc-${currentStepIndex}`}
              entering={FadeInDown.delay(240).duration(300)}
              style={styles.encouragementTop}
              selectable={false}
            >
              {completedCount === totalSteps - 1
                ? 'Derniere etape !'
                : encouragements[completedCount % encouragements.length]}
            </Reanimated.Text>

            <Text style={styles.validationHintTop} selectable={false}>
              {confirmedChildIds.length} / {participantChildren.length} validation
              {participantChildren.length > 1 ? 's' : ''}
            </Text>
            {minimumStepSeconds > 0 ? (
              <Text
                style={[
                  styles.validationHintTop,
                  styles.minimumTimeHint,
                  isMinimumTimeReached && styles.minimumTimeHintReady,
                ]}
                selectable={false}
              >
                {isMinimumTimeReached
                  ? 'Temps minimum atteint'
                  : `Validation dans ${formatTime(minimumTimeRemaining)}`}
              </Text>
            ) : null}
          </View>

          <View style={[styles.stageRow, isMobile && styles.stageColumn]}> 
            {!isMobile ? (
              <View style={[styles.participantColumn, { width: sideColumnWidth }]}> 
                {leftParticipants.map((child) => (
                  <ParticipantValidationButton
                    key={`${currentStep.id}-${child.id}`}
                    child={child}
                    confirmed={confirmedChildIds.includes(child.id)}
                    disabled={!canConfirmStep}
                    onPress={() => handleParticipantComplete(child.id)}
                    compact={compactParticipants}
                  />
                ))}
              </View>
            ) : null}

            <Reanimated.View
              key={currentStepIndex}
              entering={FadeInRight.duration(animSpeed).springify()}
              exiting={FadeOutLeft.duration(animSpeed / 2)}
              style={[
                styles.stepContainer,
                isMobile && styles.stepContainerMobile,
                { width: centerColumnWidth },
              ]}
            >
              <View style={styles.stepHeaderBlock}>
                <Reanimated.View
                  entering={BounceIn.delay(animSpeed / 2).duration(animSpeed)}
                  style={styles.stepIcon}
                >
                  <OpenMoji emoji={currentStep.icon} size={stepIconSize} />
                </Reanimated.View>
                <Text style={[styles.stepTitle, isMobile && styles.stepTitleMobile]} selectable={false}>
                  {currentStep.title}
                </Text>
                {currentStep.mediaUri ? (
                  <Image source={{ uri: currentStep.mediaUri }} style={[styles.stepMedia, isMobile && styles.stepMediaMobile]} />
                ) : null}
                {currentStep.instruction ? (
                  <Text
                    style={[styles.stepInstruction, isMobile && styles.stepInstructionMobile]}
                    selectable={false}
                  >
                    {currentStep.instruction}
                  </Text>
                ) : null}
              </View>

              {timerDuration > 0 ? (
                <View style={styles.timerContainer}>
                  <CircularTimer
                    progress={timer.progress}
                    label={formatTime(timer.remaining)}
                    color={routine.color}
                    isFinished={timer.isFinished}
                    size={timerSize}
                    strokeWidth={14}
                  />
                  {timer.isFinished ? (
                    <Text style={styles.timerFinishedLabel} selectable={false}>Temps ecoule !</Text>
                  ) : null}

                  <TouchableOpacity
                    onPressIn={handlePausePressIn}
                    onPressOut={handlePausePressOut}
                    onPress={() => {}}
                    activeOpacity={0.92}
                    disabled={timer.isFinished}
                    style={[
                      styles.pauseHoldButton,
                      isMobile && styles.pauseHoldButtonMobile,
                      timer.isPaused && styles.pauseHoldButtonPaused,
                    ]}
                  >
                    <View
                      style={[
                        styles.pauseHoldFill,
                        {
                          width: `${pauseHoldProgress * 100}%`,
                        },
                        timer.isPaused && styles.pauseHoldFillPaused,
                      ]}
                    />
                    <View style={styles.pauseHoldContent}>
                      <Text style={styles.pauseHoldTitle} selectable={false}>
                        {timer.isPaused ? 'Maintenir 4 s pour reprendre' : 'Maintenir 4 s pour pause'}
                      </Text>
                      <Text style={styles.pauseHoldText} selectable={false}>
                        {timer.isPaused
                          ? 'Reserve a un adulte'
                          : 'Securite adulte avant arret du timer'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              ) : null}
              {!currentStep.isRequired ? (
                <View style={styles.optionalBadge}>
                  <Text style={styles.optionalText} selectable={false}>Facultatif</Text>
                </View>
              ) : null}
            </Reanimated.View>

            <View
              style={[
                styles.participantColumn,
                { width: sideColumnWidth },
                isMobile && styles.participantColumnMobile,
              ]}
            >
              {(isMobile ? orderedParticipants : rightParticipants).map((child) => (
                <ParticipantValidationButton
                  key={`${currentStep.id}-${child.id}`}
                  child={child}
                  confirmed={confirmedChildIds.includes(child.id)}
                  disabled={!canConfirmStep}
                  onPress={() => handleParticipantComplete(child.id)}
                  compact={compactParticipants || isMobile}
                />
              ))}
            </View>
          </View>

          {!currentStep.isRequired ? (
            <TouchableOpacity
              onPress={handleComplete}
              style={[styles.skipBtn, !canConfirmStep && styles.skipBtnDisabled]}
              disabled={!canConfirmStep}
            >
              <View style={styles.skipRow}>
                <Text
                  style={[styles.skipText, !canConfirmStep && styles.skipTextDisabled]}
                  selectable={false}
                >
                  Passer cette etape
                </Text>
                <ArrowRight
                  size={18}
                  weight="bold"
                  color={!canConfirmStep ? COLORS.textLight : COLORS.textSecondary}
                />
              </View>
            </TouchableOpacity>
          ) : null}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1, userSelect: 'none' } as any,
  container: { flex: 1, padding: SPACING.lg, userSelect: 'none' } as any,
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  topBarMobile: {
    alignItems: 'flex-start',
  },
  topBarBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: SPACING.xs,
    flexWrap: 'wrap',
    flexShrink: 1,
    minWidth: 0,
  },
  topBarBadgesMobile: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  quitBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  counterBadge: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
  },
  counter: {
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
    color: COLORS.text,
  },
  chainIndicator: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm + 2,
    borderRadius: RADIUS.full,
  },
  chainIndicatorText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  endTimeBadge: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm + 2,
    borderRadius: RADIUS.full,
  },
  endTimeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  stageRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    gap: SPACING.md,
    paddingTop: SPACING.md,
  },
  stageColumn: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: SPACING.sm,
    overflow: 'hidden',
  },
  topCenterStatus: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    marginTop: SPACING.md,
    alignSelf: 'center',
  },
  participantColumn: {
    flexGrow: 0,
    flexShrink: 0,
    gap: SPACING.sm,
    justifyContent: 'center',
  },
  participantColumnMobile: {
    width: '100%',
    maxWidth: 340,
    alignSelf: 'center',
  },
  participantButtonContainer: {
    width: '100%',
  },
  participantButton: {
    minHeight: 76,
    borderRadius: RADIUS.xl + 4,
    borderWidth: 2,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    ...SHADOWS.sm,
  },
  participantButtonPending: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
  },
  participantButtonDisabled: {
    opacity: 0.72,
  },
  participantButtonWide: {
    width: '100%',
  },
  participantButtonCompact: {
    width: '100%',
    minHeight: 70,
    paddingHorizontal: SPACING.sm,
  },
  participantButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  participantButtonInnerCompact: {
    gap: SPACING.xs,
  },
  participantButtonTextWrap: {
    flex: 1,
  },
  participantButtonName: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '800',
    color: COLORS.text,
  },
  participantButtonLabel: {
    marginTop: 2,
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  participantButtonBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  stepContainer: {
    flexGrow: 0,
    flexShrink: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xs,
    paddingBottom: 72,
  },
  stepContainerMobile: {
    width: '100%',
    paddingBottom: SPACING.sm,
  },
  stepHeaderBlock: {
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  stepIcon: {
    marginBottom: SPACING.md,
  },
  stepTitle: {
    fontSize: FONT_SIZE.xxl + 2,
    fontWeight: '900',
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 42,
    letterSpacing: -0.3,
  },
  stepTitleMobile: {
    fontSize: FONT_SIZE.xxl - 2,
    lineHeight: 36,
  },
  stepMedia: {
    width: 180,
    height: 180,
    borderRadius: RADIUS.xl,
    marginTop: SPACING.md,
  },
  stepMediaMobile: {
    width: 156,
    height: 156,
  },
  stepInstruction: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    lineHeight: 24,
    maxWidth: 320,
  },
  stepInstructionMobile: {
    fontSize: FONT_SIZE.md,
    lineHeight: 21,
  },
  timerContainer: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  pauseHoldButton: {
    position: 'relative',
    overflow: 'hidden',
    minWidth: 200,
    maxWidth: 240,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  pauseHoldButtonMobile: {
    minWidth: 0,
    width: '100%',
    maxWidth: 320,
  },
  pauseHoldButtonPaused: {
    borderColor: COLORS.warning,
    backgroundColor: `${COLORS.warning}18`,
  },
  pauseHoldFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: `${COLORS.error}22`,
  },
  pauseHoldFillPaused: {
    backgroundColor: `${COLORS.success}22`,
  },
  pauseHoldContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    gap: 2,
  },
  pauseHoldTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
  },
  pauseHoldText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textAlign: 'center',
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
  optionalText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: COLORS.accentDark,
  },
  encouragementTop: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  validationHintTop: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.textLight,
    textAlign: 'center',
  },
  minimumTimeHint: {
    color: COLORS.warning,
  },
  minimumTimeHintReady: {
    color: COLORS.success,
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  skipBtnDisabled: {
    opacity: 0.5,
  },
  skipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  skipText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textLight,
    fontWeight: '600',
  },
  skipTextDisabled: {
    color: COLORS.textLight,
  },
});
