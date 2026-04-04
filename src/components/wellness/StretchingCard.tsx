import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Reanimated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { COLORS, FONT_SIZE, SPACING } from '../../constants/theme';

export interface Stretch {
  id: string;
  emoji: string;
  title: string;
  instruction: string;
  durationSeconds: number;
}

export const STRETCHES: Stretch[] = [
  {
    id: 'arms-up',
    emoji: '🙆',
    title: 'Bras en l\'air',
    instruction: 'Lève les bras le plus haut possible et étire-toi comme un chat !',
    durationSeconds: 15,
  },
  {
    id: 'touch-toes',
    emoji: '🧘',
    title: 'Touche tes pieds',
    instruction: 'Penche-toi doucement et essaie de toucher tes orteils.',
    durationSeconds: 15,
  },
  {
    id: 'butterfly',
    emoji: '🦋',
    title: 'Le papillon',
    instruction: 'Assis, colle tes pieds ensemble et fais bouger tes genoux comme des ailes.',
    durationSeconds: 20,
  },
  {
    id: 'tree',
    emoji: '🌳',
    title: 'L\'arbre',
    instruction: 'Tiens-toi sur un pied, l\'autre posé contre ta jambe. Tu es un arbre !',
    durationSeconds: 15,
  },
  {
    id: 'cat-cow',
    emoji: '🐱',
    title: 'Le chat',
    instruction: 'À quatre pattes, arrondis ton dos puis creuse-le doucement.',
    durationSeconds: 20,
  },
  {
    id: 'star',
    emoji: '⭐',
    title: 'L\'étoile de mer',
    instruction: 'Allongé sur le dos, étends tes bras et tes jambes comme une étoile.',
    durationSeconds: 20,
  },
];

interface StretchingCardProps {
  stretch: Stretch;
  remaining: number;
  current: number;
  total: number;
}

export function StretchingCard({ stretch, remaining, current, total }: StretchingCardProps) {
  const bounce = useSharedValue(1);

  useEffect(() => {
    bounce.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const emojiStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bounce.value }],
  }));

  return (
    <Reanimated.View entering={FadeInDown.duration(500).springify()} style={styles.container}>
      <Reanimated.Text style={[styles.emoji, emojiStyle]}>
        {stretch.emoji}
      </Reanimated.Text>
      <Text style={styles.title}>{stretch.title}</Text>
      <Text style={styles.instruction}>{stretch.instruction}</Text>
      <View style={styles.timerBadge}>
        <Text style={styles.timerText}>⏱️ {remaining}s</Text>
      </View>
      <Text style={styles.progressText}>
        Étirement {current} / {total}
      </Text>
    </Reanimated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  emoji: {
    fontSize: 80,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '900',
    color: COLORS.text,
    textAlign: 'center',
  },
  instruction: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: SPACING.lg,
  },
  timerBadge: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: 999,
    marginTop: SPACING.sm,
  },
  timerText: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    color: COLORS.text,
  },
  progressText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
});
