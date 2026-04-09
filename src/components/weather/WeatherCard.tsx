import React, { useEffect } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { ClothingIcon } from './ClothingIcon';
import { WeatherData } from '../../services/weather';
import {
  getWeatherSecondaryTextColor,
  getWeatherTextColor,
  getWeatherTheme,
} from '../../constants/weatherThemes';
import {
  buildOutfitPlan,
  OutfitTile,
  OutfitVisualItem,
} from '../../constants/weatherOutfits';
import { FONT_SIZE, RADIUS, SHADOWS, SPACING } from '../../constants/theme';

interface Props {
  weather: WeatherData;
}

type DayPeriod = 'morning' | 'day' | 'night';

const PERIOD_CONFIG: Record<DayPeriod, { emoji: string; greeting: string }> = {
  morning: { emoji: '🌅', greeting: 'Bonjour !' },
  day: { emoji: '☀️', greeting: 'Bonne journee !' },
  night: { emoji: '🌙', greeting: 'Bientot au dodo !' },
};

function getDayPeriod(): DayPeriod {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'day';
  return 'night';
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

  return <Animated.Text style={[styles.weatherEmoji, style]}>{emoji}</Animated.Text>;
}

function OutfitTileInline({
  tile,
  index,
  textColor,
  isNight,
}: {
  tile: OutfitTile;
  index: number;
  textColor: string;
  isNight: boolean;
}) {
  const item = tile.items[0];

  return (
    <View style={[styles.inlineItem, isNight && styles.inlineItemNight]}>
      <ClothingIcon code={item.id} size={42} variant={index} />
      <Text style={[styles.inlineItemLabel, { color: textColor }]}>{item.label}</Text>
    </View>
  );
}

function ExtraTile({
  item,
  index,
  textColor,
  isNight,
}: {
  item: OutfitVisualItem;
  index: number;
  textColor: string;
  isNight: boolean;
}) {
  return (
    <View style={[styles.extraTile, isNight && styles.extraTileNight]}>
      <ClothingIcon code={item.id} size={38} variant={index} />
      <Text style={[styles.extraLabel, { color: textColor }]}>{item.label}</Text>
    </View>
  );
}

export function WeatherCard({ weather }: Props) {
  const theme = getWeatherTheme(weather.condition, weather.isDay);
  const textColor = getWeatherTextColor(weather.isDay);
  const secondaryColor = getWeatherSecondaryTextColor(weather.isDay);
  const period = getDayPeriod();
  const periodInfo = PERIOD_CONFIG[period];
  const isNightTheme = !weather.isDay;
  const isNightRoutine = period === 'night';
  const outfitForecast = isNightRoutine ? weather.nightForecast : weather.dayForecast;
  const outfitTemperature = isNightRoutine ? outfitForecast.minTemperature : weather.temperature;
  const outfitCondition = isNightRoutine ? outfitForecast.dominantCondition : weather.condition;
  const outfitPlan = buildOutfitPlan(
    outfitTemperature,
    outfitCondition,
    weather.isDay,
    outfitForecast,
    isNightRoutine ? 'night' : 'day',
  );
  const temperatureLabel = `${weather.temperature}°C`;

  return (
    <Animated.View
      entering={FadeIn.delay(150).duration(500)}
      style={[
        styles.card,
        isNightTheme && {
          backgroundColor: 'rgba(15,15,40,0.75)',
          borderColor: 'rgba(255,255,255,0.12)',
        },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={styles.periodRow}>
          <Text style={styles.periodEmoji}>{periodInfo.emoji}</Text>
          <Text style={[styles.periodGreeting, { color: textColor }]}>{periodInfo.greeting}</Text>
        </View>
      </View>

      <View style={[styles.mainPanel, isNightTheme && styles.mainPanelNight]}>
        <View style={styles.panelHeader}>
          <Text style={[styles.panelEyebrow, { color: secondaryColor }]}>
            {isNightRoutine ? 'Pour le dodo' : 'Habits a mettre'}
          </Text>
          <Text style={[styles.panelTitle, { color: textColor }]}>{outfitPlan.headline}</Text>
        </View>

        <View style={[styles.outfitSummaryCard, isNightTheme && styles.outfitSummaryCardNight]}>
          {outfitPlan.tiles.map((tile, index) => (
            <OutfitTileInline
              key={`${index}-${tile.items.map((entry) => entry.id).join('-')}`}
              tile={tile}
              index={index}
              textColor={textColor}
              isNight={isNightTheme}
            />
          ))}
        </View>

        {outfitPlan.extras.length > 0 ? (
          <View style={styles.extrasSection}>
            <Text style={[styles.extrasTitle, { color: secondaryColor }]}>
              En plus avec cette meteo
            </Text>
            <View style={styles.extrasGrid}>
              {outfitPlan.extras.map((item, index) => (
                <ExtraTile
                  key={`extra-${item.id}-${index}`}
                  item={item}
                  index={index}
                  textColor={textColor}
                  isNight={isNightTheme}
                />
              ))}
            </View>
          </View>
        ) : null}
      </View>

      <View style={styles.footerRow}>
        <View style={styles.footerMain}>
          <BouncingEmoji emoji={theme.emoji} />
          <View style={[styles.tempBadge, isNightTheme && styles.tempBadgeNight]}>
            <Text style={[styles.tempBadgeText, { color: textColor }]}>{temperatureLabel}</Text>
          </View>
          <View style={styles.footerInfo}>
            <Text style={[styles.weatherLabel, { color: textColor }]}>{theme.label}</Text>
            <Text style={[styles.cityText, { color: secondaryColor }]}>📍 {weather.city}</Text>
          </View>
        </View>
      </View>

      <Text style={[styles.message, { color: textColor }]}>{theme.kidMessage}</Text>

      <View style={[styles.tipRow, isNightTheme && styles.tipRowNight]}>
        <Text style={[styles.tipText, { color: secondaryColor }]}>💡 {theme.tip}</Text>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  periodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  periodEmoji: {
    fontSize: 24,
  },
  periodGreeting: {
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
    flexShrink: 1,
  },
  tempBadge: {
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderRadius: RADIUS.full,
    paddingVertical: 6,
    paddingHorizontal: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tempBadgeNight: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  tempBadgeText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '900',
  },
  mainPanel: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    gap: SPACING.md,
  },
  mainPanelNight: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  panelHeader: {
    gap: 4,
  },
  panelEyebrow: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  panelTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '900',
  },
  outfitSummaryCard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: 'rgba(255,255,255,0.84)',
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  outfitSummaryCardNight: {
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  inlineItem: {
    minWidth: 72,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.xs,
  },
  inlineItemNight: {
    opacity: 0.96,
  },
  inlineItemLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
    textAlign: 'center',
  },
  extrasSection: {
    gap: SPACING.sm,
  },
  extrasTitle: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  extrasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  extraTile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.sm,
  },
  extraTileNight: {
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  extraLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '800',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  footerMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  weatherEmoji: {
    fontSize: 42,
  },
  footerInfo: {
    gap: 2,
    flexShrink: 1,
  },
  weatherLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: '900',
  },
  cityText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
  },
  message: {
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
    lineHeight: 20,
  },
  tipRow: {
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.sm,
  },
  tipRowNight: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  tipText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    lineHeight: 20,
  },
});
