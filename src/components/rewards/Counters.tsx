import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Star, Fire } from 'phosphor-react-native';
import { COLORS, SPACING, FONT_SIZE } from '../../constants/theme';

interface StarCounterProps {
  count: number;
  size?: 'sm' | 'md' | 'lg';
}

export function StarCounter({ count, size = 'md' }: StarCounterProps) {
  const iconSize = size === 'sm' ? 18 : size === 'md' ? 26 : 38;
  const textSize = size === 'sm' ? FONT_SIZE.sm : size === 'md' ? FONT_SIZE.lg : FONT_SIZE.xxl;

  return (
    <View style={styles.container}>
      <Star size={iconSize} weight="fill" color={COLORS.star} />
      <Text style={[styles.count, { fontSize: textSize }]}>{count}</Text>
    </View>
  );
}

interface StreakCounterProps {
  count: number;
}

export function StreakCounter({ count }: StreakCounterProps) {
  return (
    <View style={styles.container}>
      <Fire size={22} weight="fill" color="#FF6B6B" />
      <Text style={styles.streakCount}>{count} jour{count > 1 ? 's' : ''}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  count: {
    fontWeight: '800',
    color: COLORS.text,
  },
  streakCount: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.text,
  },
});
