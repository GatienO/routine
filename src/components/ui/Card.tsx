import React, { ReactNode } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { COLORS, RADIUS, SPACING, SHADOWS } from '../../constants/theme';

interface CardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  color?: string;
  padded?: boolean;
  elevated?: boolean;
}

export function Card({ children, style, color, padded = true, elevated = false }: CardProps) {
  return (
    <View
      style={[
        styles.card,
        padded && styles.padded,
        elevated && styles.elevated,
        color ? { borderLeftWidth: 4, borderLeftColor: color } : undefined,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  padded: {
    padding: SPACING.md + 4,
  },
  elevated: {
    ...SHADOWS.md,
    borderWidth: 0,
  },
});
