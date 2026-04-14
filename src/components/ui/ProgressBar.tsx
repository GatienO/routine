import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';

interface ProgressBarProps {
  progress: number; // 0 to 1
  color?: string;
  height?: number;
  showLabel?: boolean;
}

export function ProgressBar({
  progress,
  color = COLORS.primary,
  height = 12,
  showLabel = false,
}: ProgressBarProps) {
  const clampedProgress = Math.min(1, Math.max(0, progress));
  const percent = Math.round(clampedProgress * 100);

  const animatedWidth = useSharedValue(0);

  useEffect(() => {
    animatedWidth.value = withSpring(clampedProgress * 100, {
      damping: 18,
      stiffness: 90,
      mass: 0.8,
    });
  }, [clampedProgress]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${animatedWidth.value}%` as any,
    backgroundColor: color,
    height,
    borderRadius: RADIUS.full,
  }));

  return (
    <View style={styles.container}>
      <View style={[styles.track, { height: height + 4, borderRadius: RADIUS.full }]}>
        <Animated.View style={fillStyle} />
      </View>
      {showLabel && (
        <Text style={styles.label}>{percent}%</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  track: {
    flex: 1,
    backgroundColor: COLORS.border,
    overflow: 'hidden',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    minWidth: 36,
    textAlign: 'right',
  },
});
