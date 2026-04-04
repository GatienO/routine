import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Card } from '../ui/Card';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '../../constants/theme';
import { CATEGORY_CONFIG } from '../../constants/theme';
import { Routine } from '../../types';

interface RoutineCardProps {
  routine: Routine;
  onPress: () => void;
  onToggle?: () => void;
  showToggle?: boolean;
  stepsCount?: number;
}

export function RoutineCard({
  routine,
  onPress,
  onToggle,
  showToggle = false,
}: RoutineCardProps) {
  const category = CATEGORY_CONFIG[routine.category];
  const totalDuration = routine.steps.reduce((sum, s) => sum + s.durationMinutes, 0);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card color={routine.color} style={!routine.isActive ? styles.inactive : undefined}>
        <View style={styles.header}>
          <Text style={styles.icon}>{routine.icon}</Text>
          <View style={styles.info}>
            <Text style={styles.name}>{routine.name}</Text>
            <View style={styles.meta}>
              <Text style={styles.category}>
                {category?.icon} {category?.label}
              </Text>
              <Text style={styles.dot}>·</Text>
              <Text style={styles.steps}>{routine.steps.length} étapes</Text>
              <Text style={styles.dot}>·</Text>
              <Text style={styles.duration}>~{totalDuration} min</Text>
            </View>
          </View>
          {showToggle && onToggle && (
            <TouchableOpacity
              style={[
                styles.toggle,
                { backgroundColor: routine.isActive ? COLORS.success : COLORS.textLight },
              ]}
              onPress={onToggle}
            >
              <View
                style={[
                  styles.toggleDot,
                  routine.isActive ? styles.toggleOn : styles.toggleOff,
                ]}
              />
            </TouchableOpacity>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  icon: {
    fontSize: 36,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: 2,
  },
  category: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  dot: {
    color: COLORS.textLight,
    fontSize: FONT_SIZE.xs,
  },
  steps: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  duration: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    padding: 2,
  },
  toggleDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFF',
  },
  toggleOn: {
    alignSelf: 'flex-end',
  },
  toggleOff: {
    alignSelf: 'flex-start',
  },
  inactive: {
    opacity: 0.5,
  },
});
