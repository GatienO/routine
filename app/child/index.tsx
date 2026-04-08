import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  withDelay,
  Easing,
  FadeInDown,
  FadeIn,
  BounceIn,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useChildrenStore } from '../../src/stores/childrenStore';
import { useAppStore } from '../../src/stores/appStore';
import { Avatar } from '../../src/components/ui/Avatar';
import { AnimatedPressable } from '../../src/components/ui/AnimatedPressable';
import { COLORS, SPACING, FONT_SIZE, SHADOWS, RADIUS } from '../../src/constants/theme';
import { ArrowLeft, HandTap } from 'phosphor-react-native';
import { useWeatherStore } from '../../src/stores/weatherStore';
import { getWeatherTheme, DEFAULT_WEATHER_THEME, getWeatherTextColor, getWeatherSecondaryTextColor } from '../../src/constants/weatherThemes';


function WobbleAvatar({ emoji, color, size, delay: d, avatarConfig }: { emoji: string; color: string; size: number; delay: number; avatarConfig?: import('../../src/types').AvatarConfig }) {
  const wobble = useSharedValue(0);

  useEffect(() => {
    wobble.value = withDelay(
      d,
      withRepeat(
        withSequence(
          withTiming(4, { duration: 600, easing: Easing.inOut(Easing.sin) }),
          withTiming(-4, { duration: 600, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 400, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      )
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${wobble.value}deg` }],
  }));

  return (
    <Animated.View style={style}>
      <Avatar emoji={emoji} color={color} size={size} avatarConfig={avatarConfig} />
    </Animated.View>
  );
}

export default function ChildSelectScreen() {
  const router = useRouter();
  const { children } = useChildrenStore();
  const { selectChild, weatherCity, useGeolocation } = useAppStore();
  const { weather, refresh: refreshWeather } = useWeatherStore();

  const wt = weather
    ? getWeatherTheme(weather.condition, weather.isDay)
    : DEFAULT_WEATHER_THEME;
  const textColor = weather ? getWeatherTextColor(weather.isDay) : COLORS.text;
  const secondaryColor = weather ? getWeatherSecondaryTextColor(weather.isDay) : COLORS.textSecondary;
  const isNight = weather ? !weather.isDay : false;

  useEffect(() => {
    refreshWeather({ cityName: weatherCity, useGeolocation });
  }, []);

  const handleSelect = (childId: string) => {
    selectChild(childId);
    router.push('/child/home');
  };

  if (children.length === 0) {
    return (
      <LinearGradient colors={wt.gradient} style={styles.gradient}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.empty}>
            <Animated.Text entering={BounceIn.duration(600)} style={styles.emptyIcon}>😊</Animated.Text>
            <Animated.Text entering={FadeInDown.delay(300)} style={[styles.emptyTitle, { color: textColor }]}>Pas encore de profil</Animated.Text>
            <Animated.Text entering={FadeInDown.delay(500)} style={[styles.emptyText, { color: secondaryColor }]}>
              Demande à tes parents de créer ton profil !
            </Animated.Text>
            <TouchableOpacity onPress={() => router.replace('/')} style={styles.backBtn}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <ArrowLeft size={18} weight="bold" color={COLORS.secondary} />
                <Text style={styles.backBtnText}>Retour</Text>
              </View>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Auto-select if only one child
  if (children.length === 1) {
    const child = children[0];
    return (
      <LinearGradient colors={[wt.gradient[0], wt.gradient[1], wt.gradient[1]]} style={styles.gradient}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.center}>
            <Animated.Text entering={FadeIn.duration(500)} style={[styles.greeting, { color: secondaryColor }]}>Bonjour</Animated.Text>

            <AnimatedPressable
              style={styles.singleChild}
              onPress={() => handleSelect(child.id)}
              scaleDown={0.9}
            >
              <Animated.View entering={BounceIn.delay(200).duration(600)}>
                <WobbleAvatar emoji={child.avatar} color={child.color} size={130} delay={400} avatarConfig={child.avatarConfig} />
              </Animated.View>
              <Animated.Text entering={FadeInDown.delay(500)} style={[styles.singleName, { color: textColor }]}>{child.name} !</Animated.Text>
              <Animated.View entering={FadeInDown.delay(700)} style={[styles.tapBubble, isNight && { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={[styles.tapText, { color: secondaryColor }]}>Appuie pour commencer</Text>
                  <HandTap size={22} weight="fill" color={secondaryColor} />
                </View>
              </Animated.View>
            </AnimatedPressable>

            <TouchableOpacity onPress={() => router.replace('/')} style={styles.backBtn}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <ArrowLeft size={18} weight="bold" color={COLORS.secondary} />
                <Text style={styles.backBtnText}>Retour</Text>
              </View>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={wt.gradient} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <Animated.Text entering={FadeInDown.duration(400)} style={[styles.title, { color: textColor }]}>Qui es-tu ? 😊</Animated.Text>
          <View style={styles.grid}>
            {children.map((child, index) => (
              <Animated.View
                key={child.id}
                entering={BounceIn.delay(200 + index * 150).duration(500)}
              >
                <AnimatedPressable
                  style={[styles.childCard, isNight && { backgroundColor: 'rgba(255,255,255,0.15)' }]}
                  onPress={() => handleSelect(child.id)}
                  scaleDown={0.88}
                >
                  <WobbleAvatar emoji={child.avatar} color={child.color} size={85} delay={index * 300} avatarConfig={child.avatarConfig} />
                  <Text style={[styles.childName, isNight ? { color: textColor } : undefined]}>{child.name}</Text>
                </AnimatedPressable>
              </Animated.View>
            ))}
          </View>
          <TouchableOpacity onPress={() => router.replace('/')} style={styles.backBtn}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <ArrowLeft size={18} weight="bold" color={COLORS.secondary} />
              <Text style={styles.backBtnText}>Retour</Text>
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZE.xxl + 4,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: SPACING.xl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.xl,
  },
  childCard: {
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: 'rgba(255,255,255,0.7)',
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
    ...SHADOWS.sm,
  },
  childName: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    color: COLORS.text,
  },
  greeting: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  singleChild: {
    alignItems: 'center',
    gap: SPACING.md,
  },
  singleName: {
    fontSize: FONT_SIZE.hero,
    fontWeight: '900',
    color: COLORS.text,
  },
  tapBubble: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.full,
    marginTop: SPACING.sm,
  },
  tapText: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    gap: SPACING.md,
  },
  emptyIcon: { fontSize: 70 },
  emptyTitle: { fontSize: FONT_SIZE.xl, fontWeight: '800', color: COLORS.text },
  emptyText: { fontSize: FONT_SIZE.md, color: COLORS.textSecondary, textAlign: 'center' },
  backBtn: { marginTop: SPACING.xl },
  backBtnText: { fontSize: FONT_SIZE.md, color: COLORS.secondary, fontWeight: '700' },
});
