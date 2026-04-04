import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import Reanimated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { COLORS, FONT_SIZE } from '../../constants/theme';

const AnimatedCircle = Reanimated.createAnimatedComponent(Circle);

interface CircularTimerProps {
  /** 0 to 1 */
  progress: number;
  /** Remaining time formatted string, e.g. "2:30" */
  label: string;
  /** Diameter of the circle */
  size?: number;
  /** Stroke width */
  strokeWidth?: number;
  /** Active color */
  color?: string;
  /** Track (background) color */
  trackColor?: string;
  /** Whether timer is finished */
  isFinished?: boolean;
}

export function CircularTimer({
  progress,
  label,
  size = 140,
  strokeWidth = 10,
  color = COLORS.secondary,
  trackColor = COLORS.successLight,
  isFinished = false,
}: CircularTimerProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withTiming(progress, {
      duration: 800,
      easing: Easing.out(Easing.ease),
    });
  }, [progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animatedProgress.value),
  }));

  const activeColor = isFinished ? COLORS.success : color;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <G rotation={-90} origin={`${size / 2}, ${size / 2}`}>
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={activeColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animatedProps={animatedProps}
          />
        </G>
      </Svg>
      <View style={styles.labelContainer}>
        <Text style={[styles.label, isFinished && { color: COLORS.success }]}>
          {isFinished ? '✅' : label}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    color: COLORS.text,
  },
});
