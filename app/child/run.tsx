import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  Modal,
  Pressable,
  AppState,
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
import { completionDurationMinutes } from '../../src/utils/routineExecution';
import { useRoutineStore } from '../../src/stores/routineStore';
import { useRewardStore } from '../../src/stores/rewardStore';
import { useMoodStore } from '../../src/stores/moodStore';
import { useChildrenStore } from '../../src/stores/childrenStore';
import { MOOD_CONFIG, isNegativeMood } from '../../src/constants/moods';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { X, ArrowRight, CheckCircle, Pause, Play, ShieldCheck, SkipForward } from 'phosphor-react-native';
import { CircularTimer } from '../../src/components/ui/CircularTimer';
import { AnimatedPressable } from '../../src/components/ui/AnimatedPressable';
import { COLORS, SPACING, FONT_SIZE, RADIUS, SHADOWS } from '../../src/constants/theme';
import { getStepTimerRemaining } from '../../src/utils/stepTimer';
import { OpenMoji } from '../../src/components/ui/OpenMoji';
import { Avatar } from '../../src/components/ui/Avatar';
import { Child } from '../../src/types';
import * as Haptics from 'expo-haptics';
import { formatChildName } from '../../src/utils/children';
import { useAppTheme } from '../../src/hooks/useAppTheme';
import { useWeatherStore } from '../../src/stores/weatherStore';
import { GuidedWeatherStep } from '../../src/features/routines/components/guided-weather-step';
import { getGuidedStepKind } from '../../src/features/routines/utils/guided-steps';
import { selectActiveSteps } from '../../src/features/routines/select-active-steps';

const STEP_START_LOCK_MS = 650;

const DEFAULT_ENCOURAGEMENTS = [
  "C'est parti !",
  'Tu geres !',
  'Encore un effort !',
  'Super travail !',
  'Continue !',
];

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

function ParticipantValidationButton({
  child,
  confirmed,
  disabled,
  onPress,
  compact,
  colors,
}: {
  child: Child;
  confirmed: boolean;
  disabled: boolean;
  onPress: () => void;
  compact: boolean;
  colors: ReturnType<typeof useAppTheme>['colors'];
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
          : { backgroundColor: colors.surface, borderColor: colors.border },
        isDisabled ? styles.participantButtonDisabled : null,
      ]}
      scaleDown={0.96}
      disabled={confirmed || isDisabled}
      hitSlop={16}
      accessibilityRole="checkbox"
      accessibilityLabel={`Valider l'étape pour ${formatChildName(child.name)}`}
      accessibilityState={{ checked: confirmed, disabled: isDisabled }}
    >
      <View style={[styles.participantButtonInner, compact && styles.participantButtonInnerCompact]}>
        <Avatar
          emoji={child.avatar}
          color={child.color}
          size={compact ? 38 : 42}
          avatarConfig={child.avatarConfig}
        />
        <View style={styles.participantButtonTextWrap}>
          <Text style={[styles.participantButtonName, { color: colors.text }]} numberOfLines={1} selectable={false}>
            {formatChildName(child.name)}
          </Text>
          {!compact ? (
            <Text style={[styles.participantButtonLabel, { color: colors.textSecondary }]} selectable={false}>
              {confirmed ? 'Validé' : isDisabled ? 'Attends…' : "C'est fait"}
            </Text>
          ) : null}
        </View>
        <View
          style={[
            styles.participantButtonBadge,
            { backgroundColor: confirmed ? child.color : colors.surface, borderColor: confirmed ? child.color : colors.border },
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

function ParentModeButton({
  onOpen,
  colors,
}: {
  onOpen: () => void;
  colors: ReturnType<typeof useAppTheme>['colors'];
}) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel="Actions parent"
      accessibilityHint="Ouvre les commandes de pause et de passage d’étape"
      onPress={onOpen}
      activeOpacity={0.9}
      style={[styles.parentModeButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <ShieldCheck size={18} weight="bold" color={colors.time} />
      <Text style={[styles.parentModeText, { color: colors.time }]} selectable={false}>Parent</Text>
    </TouchableOpacity>
  );
}

function ParentActionsModal({
  visible,
  isPaused,
  pauseDisabled,
  onClose,
  onTogglePause,
  onSkipStep,
  colors,
}: {
  visible: boolean;
  isPaused: boolean;
  pauseDisabled: boolean;
  onClose: () => void;
  onTogglePause: () => void;
  onSkipStep: () => void;
  colors: ReturnType<typeof useAppTheme>['colors'];
}) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.parentModalBackdrop} onPress={onClose}>
        <Pressable style={[styles.parentActionCard, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={(event) => event.stopPropagation()}>
          <View style={styles.parentActionHeader}>
            <ShieldCheck size={20} weight="fill" color={colors.time} />
            <Text style={[styles.parentActionTitle, { color: colors.text }]} selectable={false}>Mode parent</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Fermer le mode parent" onPress={onClose} hitSlop={12}>
              <X size={20} color={colors.text} />
            </Pressable>
          </View>

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={isPaused ? 'Reprendre le minuteur' : 'Mettre le minuteur en pause'}
            onPress={onTogglePause}
            activeOpacity={0.86}
            disabled={pauseDisabled}
            style={[
              styles.parentActionButton,
              { backgroundColor: colors.timeSoft, borderColor: colors.border },
              pauseDisabled && styles.parentActionButtonDisabled,
            ]}
          >
            {isPaused ? (
              <Play size={18} weight="bold" color={colors.text} />
            ) : (
              <Pause size={18} weight="bold" color={colors.text} />
            )}
            <Text style={[styles.parentActionButtonText, { color: colors.text }]} selectable={false}>
              {isPaused ? 'Reprendre' : 'Mettre en pause'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Passer cette étape"
            onPress={onSkipStep}
            activeOpacity={0.86}
            style={[styles.parentActionButton, { backgroundColor: colors.timeSoft, borderColor: colors.border }]}
          >
            <SkipForward size={18} weight="bold" color={colors.text} />
            <Text style={[styles.parentActionButtonText, { color: colors.text }]} selectable={false}>
              Passer l’étape
            </Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default function RunRoutineScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 900;
  const { colors } = useAppTheme();
  const {
    currentExecution,
    completeStep,
    finishExecution,
    cancelExecution,
    getRoutine,
    chainQueue,
    nextInChain,
    ensureStepTimer,
    pauseCurrentStepTimer,
    resumeCurrentStepTimer,
  } = useRoutineStore();
  const { recordCompletion } = useRewardStore();
  const { getMood, isMoodFresh } = useMoodStore();
  const { getChild } = useChildrenStore();
  const weather = useWeatherStore((state) => state.weather);
  const activeChildId = currentExecution?.childId;
  const isLeavingFlowRef = useRef(false);
  const isAdvancingStepRef = useRef(false);
  const completingStepIdRef = useRef<string | null>(null);
  const [confirmedChildIds, setConfirmedChildIds] = useState<string[]>([]);
  const [stepConfirmationEnabled, setStepConfirmationEnabled] = useState(false);
  const [parentMenuVisible, setParentMenuVisible] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [routinesHydrated, setRoutinesHydrated] = useState(() => useRoutineStore.persist.hasHydrated());

  useEffect(() => {
    const unsubscribe = useRoutineStore.persist.onFinishHydration(() => setRoutinesHydrated(true));
    setRoutinesHydrated(useRoutineStore.persist.hasHydrated());
    return unsubscribe;
  }, []);

  const currentMood =
    activeChildId && isMoodFresh(activeChildId) ? getMood(activeChildId)?.mood : undefined;
  const moodConfig = currentMood ? MOOD_CONFIG[currentMood] : undefined;

  const routine = currentExecution ? getRoutine(currentExecution.routineId) : undefined;

  const activeSteps = useMemo(() => {
    if (!routine) return [];
    const baseSteps =
      currentExecution?.customStepOrder?.length ? currentExecution.customStepOrder : routine.steps;
    return selectActiveSteps(baseSteps, Boolean(currentMood && isNegativeMood(currentMood)));
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

  const completedStepIds = currentExecution?.stepsCompleted ?? [];
  const completedCount = activeSteps.filter((step) => completedStepIds.includes(step.id)).length;
  const totalSteps = activeSteps.length;
  const currentStepIndex = activeSteps.findIndex((step) => !completedStepIds.includes(step.id));
  const isAllDone = totalSteps === 0 || currentStepIndex === -1;
  const currentStep = activeSteps[currentStepIndex];
  const guidedKind = currentStep ? getGuidedStepKind(currentStep) : undefined;
  const progress = totalSteps > 0 ? completedCount / totalSteps : 0;

  const minimumStepSeconds = currentStep ? (currentStep.minimumDurationMinutes ?? 0) * 60 : 0;
  const timerDuration = currentStep
    ? Math.max(currentStep.durationMinutes, currentStep.minimumDurationMinutes ?? 0) * 60
    : 0;
  const stepTimer = currentExecution && currentStep && currentExecution.stepTimer?.stepId === currentStep.id
    ? currentExecution.stepTimer
    : undefined;
  const remaining = stepTimer ? getStepTimerRemaining(stepTimer, now) : timerDuration;
  const timer = {
    remaining,
    progress: timerDuration > 0 ? 1 - remaining / timerDuration : 1,
    isFinished: timerDuration > 0 && remaining === 0,
    isPaused: stepTimer?.isPaused ?? false,
  };
  const elapsedStepSeconds = Math.max(0, timerDuration - timer.remaining);
  const minimumTimeRemaining = Math.max(0, minimumStepSeconds - elapsedStepSeconds);
  const isMinimumTimeReached = minimumStepSeconds === 0 || elapsedStepSeconds >= minimumStepSeconds;
  const canConfirmStep = stepConfirmationEnabled && isMinimumTimeReached;
  const parentPauseDisabled = timerDuration <= 0 || timer.isFinished;

  useEffect(() => {
    if (currentStep && currentExecution) ensureStepTimer(currentStep.id, timerDuration);
  }, [currentExecution?.id, currentStep?.id, ensureStepTimer, timerDuration]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 500);
    const subscription = AppState.addEventListener('change', () => setNow(Date.now()));
    return () => { clearInterval(interval); subscription.remove(); };
  }, []);

  useEffect(() => {
    if (!routinesHydrated) return;
    if (isLeavingFlowRef.current) return;
    if (!currentExecution) {
      router.replace('/routines');
    } else if (!routine) {
      cancelExecution();
      router.replace('/routines');
    }
  }, [currentExecution, routine, routinesHydrated]);

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

  const handleComplete = useCallback(async (ignoreMinimumTime = false) => {
    if (!currentStep || !routine) {
      isAdvancingStepRef.current = false;
      completingStepIdRef.current = null;
      return;
    }
    if (!ignoreMinimumTime && minimumStepSeconds > 0 && !isMinimumTimeReached) {
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
            router.replace('/child/run');
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
            duration: completionDurationMinutes(execution.startedAt, execution.completedAt!).toString(),
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
    router.replace('/routines');
  };

  const handlePauseToggle = useCallback(async () => {
    if (timerDuration <= 0 || timer.isFinished) return;

    if (timer.isPaused) {
      resumeCurrentStepTimer();
    } else {
      pauseCurrentStepTimer();
    }

    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {}
  }, [pauseCurrentStepTimer, resumeCurrentStepTimer, timer.isFinished, timer.isPaused, timerDuration]);

  const handleParentPause = useCallback(() => {
    setParentMenuVisible(false);
    void handlePauseToggle();
  }, [handlePauseToggle]);

  const handleParentSkipStep = useCallback(() => {
    setParentMenuVisible(false);
    isAdvancingStepRef.current = true;
    void handleComplete(true);
  }, [handleComplete]);

  const encouragements = moodConfig?.encouragements ?? DEFAULT_ENCOURAGEMENTS;
  const gradientColors = [colors.background, colors.surface] as const;
  const animSpeed =
    moodConfig?.animationIntensity === 'calm'
      ? 600
      : moodConfig?.animationIntensity === 'energetic'
        ? 300
        : 400;

  if (!currentExecution || !routine || !currentStep || isAllDone) return null;

  const orderedParticipants = isMobile ? participantChildren : [...leftParticipants, ...rightParticipants];

  return (
    <LinearGradient colors={gradientColors} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <Reanimated.View
            entering={FadeIn.duration(300)}
            style={[styles.topBar, isMobile && styles.topBarMobile]}
          >
            <View style={styles.topLeftActions}>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Quitter la routine" onPress={handleQuit} style={[styles.quitBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <X size={22} weight="bold" color={colors.textLight} />
              </TouchableOpacity>
              <ParentModeButton
                onOpen={() => setParentMenuVisible(true)}
                colors={colors}
              />
            </View>
            <View style={[styles.topBarBadges, isMobile && styles.topBarBadgesMobile]}>
              {chainQueue.length > 0 ? (
                <View style={[styles.chainIndicator, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={[styles.chainIndicatorText, { color: colors.textSecondary }]} selectable={false}>+{chainQueue.length} à suivre</Text>
                </View>
              ) : null}
              <View style={[styles.counterBadge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.counter, { color: colors.text }]} selectable={false}>
                  {completedCount + 1} / {totalSteps}
                </Text>
              </View>
            </View>
          </Reanimated.View>

          <Text style={[styles.runningRoutineName, { color: colors.textSecondary }]}>
            {routine.icon} {routine.name}
          </Text>
          <ProgressBar progress={progress} color={routine.color} height={10} />

          <View style={[styles.topCenterStatus, { maxWidth: centerColumnWidth }]}>
            <Reanimated.Text
              key={`enc-${currentStepIndex}`}
              entering={FadeInDown.delay(240).duration(300)}
              style={[styles.encouragementTop, { color: colors.textSecondary }]}
              selectable={false}
            >
              {completedCount === totalSteps - 1
                ? 'Dernière étape !'
                : encouragements[completedCount % encouragements.length]}
            </Reanimated.Text>

            <Text style={[styles.validationHintTop, { color: colors.textLight }]} selectable={false}>
              {confirmedChildIds.length} / {participantChildren.length} validation
              {participantChildren.length > 1 ? 's' : ''}
            </Text>
            {minimumStepSeconds > 0 ? (
              <Text
                style={[
                  styles.validationHintTop,
                  styles.minimumTimeHint,
                  { color: isMinimumTimeReached ? colors.success : colors.warning },
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
                    colors={colors}
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
                {!guidedKind ? (
                  <Reanimated.View
                    entering={BounceIn.delay(animSpeed / 2).duration(animSpeed)}
                    style={styles.stepIcon}
                  >
                    <OpenMoji emoji={currentStep.icon} size={stepIconSize} />
                  </Reanimated.View>
                ) : null}
                <Text style={[styles.stepTitle, isMobile && styles.stepTitleMobile, { color: colors.text }]} selectable={false}>
                  {currentStep.title}
                </Text>
                {currentStep.mediaUri ? (
                  <Image source={{ uri: currentStep.mediaUri }} style={[styles.stepMedia, isMobile && styles.stepMediaMobile]} />
                ) : null}
                {currentStep.instruction && !guidedKind ? (
                  <Text
                    style={[styles.stepInstruction, isMobile && styles.stepInstructionMobile, { color: colors.textSecondary }]}
                    selectable={false}
                  >
                    {currentStep.instruction}
                  </Text>
                ) : null}
              </View>

              {guidedKind ? <GuidedWeatherStep kind={guidedKind} weather={weather} /> : null}

              {timerDuration > 0 ? (
                <View style={styles.timerContainer}>
                  <CircularTimer
                    progress={timer.progress}
                    label={formatTime(timer.remaining)}
                    color={routine.color}
                    isFinished={timer.isFinished}
                    size={guidedKind && isMobile ? 112 : timerSize}
                    strokeWidth={14}
                    trackColor={colors.surfaceSecondary}
                  />
                  {timer.isFinished ? (
                    <Text style={[styles.timerFinishedLabel, { color: colors.success }]} selectable={false}>Temps écoulé !</Text>
                  ) : timer.isPaused ? (
                    <Text style={[styles.timerFinishedLabel, { color: colors.time }]} selectable={false}>Minuteur en pause</Text>
                  ) : null}
                </View>
              ) : null}
              {currentStep.isRequired === false ? (
                <View style={[styles.optionalBadge, { backgroundColor: colors.transitionSoft }]}>
                  <Text style={[styles.optionalText, { color: colors.transition }]} selectable={false}>Facultatif</Text>
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
                  colors={colors}
                />
              ))}
            </View>
          </View>

          {currentStep.isRequired === false ? (
            <TouchableOpacity
              onPress={() => void handleComplete()}
              style={[styles.skipBtn, !canConfirmStep && styles.skipBtnDisabled]}
              disabled={!canConfirmStep}
            >
              <View style={styles.skipRow}>
                <Text
                  style={[styles.skipText, !canConfirmStep && styles.skipTextDisabled]}
                  selectable={false}
                >
                  Passer cette étape
                </Text>
                <ArrowRight
                  size={18}
                  weight="bold"
                  color={!canConfirmStep ? colors.textLight : colors.textSecondary}
                />
              </View>
            </TouchableOpacity>
          ) : null}

          <ParentActionsModal
            visible={parentMenuVisible}
            isPaused={timer.isPaused}
            pauseDisabled={parentPauseDisabled}
            onClose={() => setParentMenuVisible(false)}
            onTogglePause={handleParentPause}
            onSkipStep={handleParentSkipStep}
            colors={colors}
          />
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
  runningRoutineName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
    marginBottom: SPACING.sm,
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
  topLeftActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
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
  parentModeButton: {
    position: 'relative',
    overflow: 'hidden',
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm + 2,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  parentModeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '900',
    color: COLORS.secondaryDark,
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
    letterSpacing: 0,
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
  parentModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(45, 58, 64, 0.28)',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    paddingTop: 78,
    paddingHorizontal: SPACING.lg,
  },
  parentActionCard: {
    width: 260,
    maxWidth: '100%',
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    gap: SPACING.sm,
    ...SHADOWS.md,
  },
  parentActionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingBottom: SPACING.xs,
  },
  parentActionTitle: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    fontWeight: '900',
    color: COLORS.text,
  },
  parentActionButton: {
    minHeight: 48,
    borderRadius: RADIUS.lg,
    backgroundColor: `${COLORS.secondary}18`,
    borderWidth: 1,
    borderColor: `${COLORS.secondary}40`,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  parentActionButtonDisabled: {
    opacity: 0.45,
  },
  parentActionButtonText: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    fontWeight: '800',
    color: COLORS.text,
  },
});
