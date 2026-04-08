import React, { useEffect } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { ClothingIcon } from './ClothingIcon';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  FadeIn,
} from 'react-native-reanimated';
import { WeatherData, WeatherCondition } from '../../services/weather';
import { getWeatherTheme, getWeatherTextColor, getWeatherSecondaryTextColor } from '../../constants/weatherThemes';
import { SPACING, FONT_SIZE, RADIUS, SHADOWS } from '../../constants/theme';

interface Props {
  weather: WeatherData;
}

function BouncingEmoji({ emoji }: { emoji: string }) {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.Text style={[styles.bigEmoji, style]}>{emoji}</Animated.Text>;
}

/** Day outfit based on temperature */
function getDayOutfit(temp: number): { text: string; emojis: string[] } {
  if (temp <= 0) return { text: 'Gla-gla, il gèle !', emojis: ['🥶', '🧤', '🧣', '🧥'] };
  if (temp <= 10) return { text: 'Il fait froid', emojis: ['🧣', '🧥', '👖'] };
  if (temp <= 18) return { text: 'Il fait frais', emojis: ['🧥', '👖', '👟'] };
  if (temp <= 25) return { text: 'Il fait bon', emojis: ['👕', '👟', '😊'] };
  if (temp <= 32) return { text: 'Il fait chaud', emojis: ['👕', '🩳', '🧢', '🕶️'] };
  return { text: 'Il fait très chaud !', emojis: ['🩳', '🧢', '🕶️', '💧'] };
}

/** Night outfit — pajama/bedtime oriented */
function getNightOutfit(temp: number): { text: string; emojis: string[] } {
  // Base: pyjama, doudou, livre, ours
  const base = ['👚', '🧸', '📖', '🛌'];
  if (temp <= 0) return { text: 'Nuit glaciale !', emojis: [...base, '🧦', '🧣'] };
  if (temp <= 10) return { text: 'Nuit froide', emojis: [...base, '🧦'] };
  if (temp <= 18) return { text: 'Nuit fraîche', emojis: base };
  if (temp <= 25) return { text: 'Nuit douce', emojis: base };
  if (temp <= 32) return { text: 'Nuit chaude', emojis: [...base, '💧'] };
  return { text: 'Nuit très chaude !', emojis: [...base, '👕', '💧'] };
}

/** Day weather extras */
function getDayWeatherExtras(condition: WeatherCondition): string[] {
  switch (condition) {
    case 'rain': return ['☔', '🥾'];
    case 'snow': return ['🧤', '⛄'];
    case 'thunderstorm': return ['☔', '🏠'];
    case 'fog': return ['🔦'];
    case 'clear': return ['🕶️'];
    default: return [];
  }
}

/** Night weather extras */
function getNightWeatherExtras(condition: WeatherCondition): string[] {
  switch (condition) {
    case 'rain': return ['🌧️'];
    case 'snow': return ['❄️'];
    case 'thunderstorm': return ['🏠'];
    default: return [];
  }
}

/** Morning extras */
function getMorningExtras(): string[] {
  return ['🪥'];
}

function buildOutfit(temp: number, condition: WeatherCondition, period: DayPeriod): { text: string; emojis: string[] } {
  const isNight = period === 'night';
  const base = isNight ? getNightOutfit(temp) : getDayOutfit(temp);
  const weatherExtras = isNight ? getNightWeatherExtras(condition) : getDayWeatherExtras(condition);
  const morningExtras = period === 'morning' ? getMorningExtras() : [];

  // Merge without duplicates, max 6 icons
  const seen = new Set(base.emojis);
  const extras = [...weatherExtras, ...morningExtras].filter((e) => {
    if (seen.has(e)) return false;
    seen.add(e);
    return true;
  });

  return { text: base.text, emojis: [...base.emojis, ...extras].slice(0, 6) };
}

type DayPeriod = 'morning' | 'day' | 'night';

function getDayPeriod(): DayPeriod {
  const h = new Date().getHours();
  if (h >= 6 && h < 12) return 'morning';
  if (h >= 12 && h < 17) return 'day';
  return 'night';
}

const PERIOD_CONFIG: Record<DayPeriod, { emoji: string; label: string; greeting: string }> = {
  morning: { emoji: '🌅', label: 'Matin', greeting: 'Bonjour ! Bien dormi ?' },
  day:     { emoji: '☀️', label: 'Journée', greeting: 'Bonne journée !' },
  night:   { emoji: '🌙', label: 'Soir', greeting: 'Bientôt au dodo !' },
};

export function WeatherCard({ weather }: Props) {
  const theme = getWeatherTheme(weather.condition, weather.isDay);
  const textColor = getWeatherTextColor(weather.isDay);
  const secondaryColor = getWeatherSecondaryTextColor(weather.isDay);
  const period = getDayPeriod();
  const periodInfo = PERIOD_CONFIG[period];
  const tempInfo = buildOutfit(weather.temperature, weather.condition, period);
  const isNight = !weather.isDay;

  return (
    <Animated.View entering={FadeIn.delay(150).duration(500)} style={[
      styles.card,
      isNight && { backgroundColor: 'rgba(15,15,40,0.75)', borderColor: 'rgba(255,255,255,0.12)' },
    ]}>
      {/* Period + greeting */}
      <View style={styles.periodRow}>
        <Text style={styles.periodEmoji}>{periodInfo.emoji}</Text>
        <Text style={[styles.periodGreeting, { color: textColor }]}>{periodInfo.greeting}</Text>
        <View style={[styles.periodCycle, isNight && { backgroundColor: 'rgba(255,255,255,0.12)' }]}>
          {(['morning', 'day', 'night'] as DayPeriod[]).map((p) => (
            <Text key={p} style={[styles.cycleEmoji, p === period && styles.cycleActive]}>
              {PERIOD_CONFIG[p].emoji}
            </Text>
          ))}
        </View>
      </View>

      {/* Weather row: emoji + label + temp */}
      <View style={styles.topRow}>
        <BouncingEmoji emoji={theme.emoji} />
        <View style={styles.info}>
          <Text style={[styles.label, { color: textColor }]}>{theme.label}</Text>
          <Text style={[styles.temp, { color: textColor }]}>
            {weather.temperature}°C
          </Text>
        </View>
        <View style={styles.cityCol}>
          <Text style={styles.cityIcon}>📍</Text>
          <Text style={[styles.cityName, { color: secondaryColor }]}>{weather.city}</Text>
        </View>
      </View>

      {/* Kid message */}
      <Text style={[styles.message, { color: textColor }]}>
        {theme.kidMessage} — {tempInfo.text}
      </Text>

      {/* Clothing bar */}
      <View style={[styles.clothingBar, isNight && { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
        <Text style={[styles.clothingLabel, { color: secondaryColor }]}>
          {period === 'night' ? 'Pour le dodo :' : 'Je m\'habille :'}
        </Text>
        <View style={styles.clothingIcons}>
          {tempInfo.emojis.map((e, i) => (
            <View key={i} style={[styles.clothingBubble, isNight && { backgroundColor: 'rgba(255,255,255,0.18)' }]}> 
              <ClothingIcon code={e} size={32} />
            </View>
          ))}
        </View>
      </View>

      {/* Tip */}
      <View style={[styles.tipRow, isNight && { backgroundColor: 'rgba(255,255,255,0.08)' }]}>
        <Text style={[styles.tip, { color: secondaryColor }]}>
          💡 {theme.tip}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  periodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  periodEmoji: {
    fontSize: 22,
  },
  periodGreeting: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
  },
  periodCycle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: RADIUS.full,
    paddingVertical: 4,
    paddingHorizontal: SPACING.sm,
  },
  cycleEmoji: {
    fontSize: 16,
    opacity: 0.35,
  },
  cycleActive: {
    fontSize: 20,
    opacity: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  bigEmoji: {
    fontSize: 44,
  },
  info: {
    gap: 0,
  },
  label: {
    fontSize: FONT_SIZE.md,
    fontWeight: '900',
  },
  temp: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '900',
  },
  cityCol: {
    alignItems: 'center',
    gap: 2,
  },
  cityIcon: {
    fontSize: 16,
  },
  cityName: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
  },
  message: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    lineHeight: 20,
  },
  clothingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: 'rgba(255,255,255,0.45)',
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  clothingLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
  },
  clothingIcons: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  clothingBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clothingEmoji: {
    fontSize: 24,
  },
  tipRow: {
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.sm,
  },
  tip: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    lineHeight: 20,
  },
});
