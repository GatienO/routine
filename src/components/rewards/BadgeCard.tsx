import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Lock } from 'phosphor-react-native';
import { Card } from '../ui/Card';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '../../constants/theme';
import { Badge } from '../../types';

interface BadgeCardProps {
  badge: Badge;
  unlocked: boolean;
}

export function BadgeCard({ badge, unlocked }: BadgeCardProps) {
  return (
    <Card style={[styles.card, !unlocked && styles.locked]}>
      <Text style={styles.icon}>{badge.icon}</Text>
      <Text style={styles.name}>{badge.name}</Text>
      <Text style={styles.description}>{badge.description}</Text>
      {!unlocked && (
        <View style={styles.lockOverlay}>
          <Lock size={16} weight="fill" color={COLORS.textLight} />
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    width: 140,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  locked: {
    opacity: 0.4,
  },
  icon: {
    fontSize: 40,
    marginBottom: SPACING.xs,
  },
  name: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  description: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  lockOverlay: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
  },
});
