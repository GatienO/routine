import React, { useCallback } from 'react';
import { ViewStyle, StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Pressable } from 'react-native';

interface AnimatedPressableProps {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  scaleDown?: number;
  disabled?: boolean;
}

const SPRING_CONFIG = {
  damping: 12,
  stiffness: 150,
  mass: 0.8,
};

export function AnimatedPressable({
  onPress,
  style,
  children,
  scaleDown = 0.93,
  disabled = false,
}: AnimatedPressableProps) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(scaleDown, SPRING_CONFIG);
  }, [scaleDown]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { ...SPRING_CONFIG, stiffness: 200 });
  }, []);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
    >
      <Animated.View style={[style, animStyle]}>{children}</Animated.View>
    </Pressable>
  );
}
