import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  withRepeat,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { COLORS, FONT_SIZE, SPACING } from '../../constants/theme';

interface BreathingBubbleProps {
  /** Number of breathing cycles */
  cycles?: number;
  /** Called when all cycles complete */
  onComplete?: () => void;
  /** Inhale duration in ms */
  inhaleDuration?: number;
  /** Exhale duration in ms */
  exhaleDuration?: number;
  /** Hold duration in ms */
  holdDuration?: number;
}

const PHASES = ['Inspire… 🌬️', 'Retiens… ✨', 'Expire… 💨', 'Pause… 🌙'] as const;

export function BreathingBubble({
  cycles = 5,
  onComplete,
  inhaleDuration = 3000,
  exhaleDuration = 4000,
  holdDuration = 2000,
}: BreathingBubbleProps) {
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0.6);
  const [phase, setPhase] = useState<string>(PHASES[0]);
  const [currentCycle, setCurrentCycle] = useState(1);
  const [finished, setFinished] = useState(false);

  const cycleDuration = inhaleDuration + holdDuration + exhaleDuration + holdDuration;

  useEffect(() => {
    if (finished) return;

    let cancelled = false;
    let phaseTimeout: ReturnType<typeof setTimeout>;
    let cycleTimeout: ReturnType<typeof setTimeout>;

    const runCycle = (cycleNum: number) => {
      if (cancelled || cycleNum > cycles) {
        if (!cancelled) {
          setFinished(true);
          onComplete?.();
        }
        return;
      }

      setCurrentCycle(cycleNum);

      // Inhale
      setPhase(PHASES[0]);
      scale.value = withTiming(1.0, { duration: inhaleDuration, easing: Easing.inOut(Easing.ease) });
      opacity.value = withTiming(1, { duration: inhaleDuration, easing: Easing.inOut(Easing.ease) });

      phaseTimeout = setTimeout(() => {
        if (cancelled) return;
        // Hold
        setPhase(PHASES[1]);

        phaseTimeout = setTimeout(() => {
          if (cancelled) return;
          // Exhale
          setPhase(PHASES[2]);
          scale.value = withTiming(0.5, { duration: exhaleDuration, easing: Easing.inOut(Easing.ease) });
          opacity.value = withTiming(0.6, { duration: exhaleDuration, easing: Easing.inOut(Easing.ease) });

          phaseTimeout = setTimeout(() => {
            if (cancelled) return;
            // Pause
            setPhase(PHASES[3]);

            cycleTimeout = setTimeout(() => {
              if (cancelled) return;
              runCycle(cycleNum + 1);
            }, holdDuration);
          }, exhaleDuration);
        }, holdDuration);
      }, inhaleDuration);
    };

    runCycle(1);

    return () => {
      cancelled = true;
      clearTimeout(phaseTimeout);
      clearTimeout(cycleTimeout);
    };
  }, []);

  const bubbleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  if (finished) {
    return (
      <View style={styles.container}>
        <View style={[styles.bubble, styles.bubbleFinished]}>
          <Text style={styles.finishedEmoji}>😌</Text>
        </View>
        <Text style={styles.phaseText}>Bien joué, tu es apaisé ! ✨</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Reanimated.View style={[styles.bubble, bubbleStyle]}>
        <View style={styles.innerBubble}>
          <Text style={styles.breathEmoji}>🫧</Text>
        </View>
      </Reanimated.View>
      <Text style={styles.phaseText}>{phase}</Text>
      <Text style={styles.cycleText}>
        Respiration {currentCycle} / {cycles}
      </Text>
    </View>
  );
}

const BUBBLE_SIZE = 180;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.lg,
  },
  bubble: {
    width: BUBBLE_SIZE,
    height: BUBBLE_SIZE,
    borderRadius: BUBBLE_SIZE / 2,
    backgroundColor: '#A29BFE40',
    borderWidth: 3,
    borderColor: '#A29BFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerBubble: {
    width: BUBBLE_SIZE * 0.6,
    height: BUBBLE_SIZE * 0.6,
    borderRadius: (BUBBLE_SIZE * 0.6) / 2,
    backgroundColor: '#A29BFE20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleFinished: {
    backgroundColor: '#55EFC430',
    borderColor: COLORS.success,
  },
  breathEmoji: {
    fontSize: 48,
  },
  finishedEmoji: {
    fontSize: 64,
  },
  phaseText: {
    fontSize: FONT_SIZE.xl + 2,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
  },
  cycleText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
});
