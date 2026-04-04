import React, { useEffect } from 'react';
import { StyleSheet, Dimensions, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { WeatherTheme } from '../../constants/weatherThemes';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const PARTICLE_COUNT = 8;

interface Props {
  theme: WeatherTheme;
}

function Particle({ emoji, index }: { emoji: string; index: number }) {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0);

  const startX = ((index * 137) % SCREEN_W);
  const duration = 6000 + (index % 3) * 2000;
  const delay = index * 800;

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(0.5, { duration: 1000 }));
    translateY.value = withDelay(
      delay,
      withRepeat(
        withTiming(-SCREEN_H * 0.4, {
          duration,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true,
      ),
    );
    translateX.value = withDelay(
      delay,
      withRepeat(
        withTiming((index % 2 === 0 ? 1 : -1) * 30, {
          duration: duration * 0.7,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true,
      ),
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.Text
      style={[
        styles.particle,
        { left: startX, top: SCREEN_H * 0.5 + (index % 4) * 80 },
        style,
      ]}
    >
      {emoji}
    </Animated.Text>
  );
}

export function WeatherParticles({ theme }: Props) {
  if (theme.particles.length === 0) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
        <Particle
          key={i}
          emoji={theme.particles[i % theme.particles.length]}
          index={i}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  particle: {
    position: 'absolute',
    fontSize: 22,
  },
});
