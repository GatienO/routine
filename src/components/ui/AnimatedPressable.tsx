import React, { useCallback } from 'react';
import { AccessibilityRole, AccessibilityState, ViewStyle, StyleProp, Insets } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Pressable } from 'react-native';
import { useReducedMotionPreference } from '../../hooks/useReducedMotionPreference';

interface AnimatedPressableProps {
  onPress: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  scaleDown?: number;
  disabled?: boolean;
  hitSlop?: Insets | number;
  accessibilityRole?: AccessibilityRole;
  accessibilityLabel?: string;
  accessibilityState?: AccessibilityState;
}

const SPRING_CONFIG = {
  damping: 12,
  stiffness: 150,
  mass: 0.8,
};

export function AnimatedPressable({
  onPress,
  containerStyle,
  style,
  children,
  scaleDown = 0.93,
  disabled = false,
  hitSlop,
  accessibilityRole = 'button',
  accessibilityLabel,
  accessibilityState,
}: AnimatedPressableProps) {
  const reducedMotion = useReducedMotionPreference();
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    if (reducedMotion) return;
    scale.value = withSpring(scaleDown, SPRING_CONFIG);
  }, [reducedMotion, scale, scaleDown]);

  const handlePressOut = useCallback(() => {
    if (reducedMotion) {
      scale.value = 1;
      return;
    }
    scale.value = withSpring(1, { ...SPRING_CONFIG, stiffness: 200 });
  }, [reducedMotion, scale]);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      hitSlop={hitSlop}
      pressRetentionOffset={16}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={accessibilityState}
      aria-checked={accessibilityState?.checked}
      aria-expanded={accessibilityState?.expanded}
      aria-disabled={disabled || accessibilityState?.disabled}
      aria-pressed={accessibilityRole === 'button' ? accessibilityState?.selected : undefined}
      aria-selected={accessibilityRole === 'tab' ? accessibilityState?.selected : undefined}
      style={containerStyle}
    >
      <Animated.View style={[style, animStyle]}>{children}</Animated.View>
    </Pressable>
  );
}
