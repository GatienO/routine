import React, { useEffect } from 'react';
import { Text, StyleSheet, View, useWindowDimensions, Platform } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { ClothingIcon } from './ClothingIcon';
import { WeatherData } from '../../services/weather';
import { getClothingRecommendation } from '../../services/weatherClothingRecommendation';
import { getWeatherTheme } from '../../constants/weatherThemes';
import {
  OutfitTile,
  OutfitVisualItem,
} from '../../constants/weatherOutfits';
import { COLORS, FONT_SIZE, RADIUS, SPACING } from '../../constants/theme';

interface Props {
  weather: WeatherData;
}

const WEATHER_CARD_GRADIENT: [string, string] = ['#CBECC5', '#E8F8DD'];
const WEATHER_PANEL_GRADIENT: [string, string] = ['#ECF9E8', '#F7FDF2'];
const WEATHER_SOFT_GRADIENT: [string, string] = ['#DDF3D8', '#F0FAEA'];
const WEATHER_TILE_GRADIENT: [string, string] = ['#F5FCF1', '#FFFFFF'];
const WEATHER_BORDER = '#CFE7C8';

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
  }, [translateY]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.Text style={[styles.weatherEmoji, style]}>{emoji}</Animated.Text>;
}

function OutfitTileInline({
  tile,
  index,
  textColor,
  size,
}: {
  tile: OutfitTile;
  index: number;
  textColor: string;
  size: number;
}) {
  const item = tile.items[0];

  return (
    <View style={styles.inlineItem}>
      <ClothingIcon code={item.id} size={size} variant={index} />
      <Text style={[styles.inlineItemLabel, { color: textColor }]}>{item.label}</Text>
    </View>
  );
}

function ExtraTile({
  item,
  index,
  textColor,
  stacked,
}: {
  item: OutfitVisualItem;
  index: number;
  textColor: string;
  stacked: boolean;
}) {
  return (
    <LinearGradient colors={WEATHER_TILE_GRADIENT} style={[styles.extraTile, stacked && styles.extraTileStacked]}>
      <ClothingIcon code={item.id} size={40} variant={index} />
      <Text style={[styles.extraLabel, { color: textColor }]}>{item.label}</Text>
    </LinearGradient>
  );
}

export function WeatherCard({ weather }: Props) {
  const { width } = useWindowDimensions();
  const theme = getWeatherTheme(weather.condition, weather.isDay);
  const textColor = COLORS.text;
  const secondaryColor = '#6C8468';
  const eyebrowColor = '#8BA481';
  const isNightRoutine = !weather.isDay;
  const recommendation = getClothingRecommendation(weather);
  const outfitPlan = recommendation.outfitPlan;
  const temperatureLabel = `${weather.temperature}°C`;
  const dayRangeLabel = `${weather.dayForecast.minTemperature} / ${weather.dayForecast.maxTemperature}°C`;
  const visibleExtras = outfitPlan.extras;
  const isWideLayout = width >= 920;
  const clothingIconSize = isWideLayout ? 76 : 60;

  return (
    <Animated.View entering={FadeIn.delay(150).duration(500)} style={styles.cardFrame}>
      <LinearGradient colors={WEATHER_CARD_GRADIENT} style={styles.card}>
      <View style={[styles.topGrid, isWideLayout && styles.topGridWide]}>
        <LinearGradient colors={WEATHER_PANEL_GRADIENT} style={styles.weatherSummaryCard}>
          <View style={styles.summaryRow}>
            <BouncingEmoji emoji={theme.emoji} />
            <View style={styles.summaryTextBlock}>
              <Text style={[styles.cityText, { color: secondaryColor }]}>📍 {weather.city}</Text>
              <Text style={[styles.weatherLabel, { color: textColor }]}>{theme.label}</Text>
              <Text style={[styles.tempText, { color: textColor }]}>{temperatureLabel}</Text>
              <Text style={[styles.rangeText, { color: secondaryColor }]}>{dayRangeLabel}</Text>
            </View>
          </View>
        </LinearGradient>

        <LinearGradient colors={WEATHER_PANEL_GRADIENT} style={styles.storyCard}>
          <Text style={[styles.storyEyebrow, { color: eyebrowColor }]}>
            {isNightRoutine ? 'Pour cette soiree' : "Aujourd'hui"}
          </Text>
          <Text style={[styles.storyTitle, { color: textColor }]}>{recommendation.childMessage}</Text>
          <Text style={[styles.storyTip, { color: secondaryColor }]}>{outfitPlan.headline}</Text>
        </LinearGradient>

        {visibleExtras.length > 0 ? (
          <LinearGradient colors={WEATHER_SOFT_GRADIENT} style={styles.extrasAside}>
            <Text style={[styles.extrasTitle, { color: eyebrowColor }]}>
              En plus avec cette meteo
            </Text>
            <View style={[styles.extrasGrid, isWideLayout && styles.extrasGridAside]}>
              {visibleExtras.map((item, index) => (
                <ExtraTile
                  key={`extra-${item.id}-${index}`}
                  item={item}
                  index={index}
                  textColor={textColor}
                  stacked={isWideLayout}
                />
              ))}
            </View>
          </LinearGradient>
        ) : null}
      </View>

      <LinearGradient colors={WEATHER_PANEL_GRADIENT} style={styles.mainPanel}>
        <View style={styles.panelHeader}>
          <Text style={[styles.panelEyebrow, { color: textColor }]}>Vetements recommandes</Text>
        </View>

        <LinearGradient colors={WEATHER_SOFT_GRADIENT} style={styles.outfitSummaryCard}>
          {outfitPlan.tiles.map((tile, index) => (
            <OutfitTileInline
              key={`${index}-${tile.items.map((entry) => entry.id).join('-')}`}
              tile={tile}
              index={index}
              textColor={textColor}
              size={clothingIconSize}
            />
          ))}
        </LinearGradient>
      </LinearGradient>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardFrame: {
    borderRadius: 30,
    marginBottom: SPACING.md,
    ...Platform.select({
      ios: {
        shadowColor: '#8CB386',
        shadowOffset: { width: 0, height: 14 },
        shadowOpacity: 0.14,
        shadowRadius: 26,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 18px 34px rgba(140, 179, 134, 0.18)',
      },
    }),
  },
  card: {
    borderRadius: 30,
    padding: SPACING.lg,
    gap: SPACING.md,
    borderWidth: 1,
    borderColor: WEATHER_BORDER,
    overflow: 'hidden',
  },
  topGrid: {
    gap: SPACING.sm,
  },
  topGridWide: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  weatherSummaryCard: {
    minWidth: 184,
    width: 300,
    minHeight: 132,
    justifyContent: 'center',
    borderRadius: 24,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: WEATHER_BORDER,
    overflow: 'hidden',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  summaryTextBlock: {
    gap: 2,
    flexShrink: 1,
  },
  weatherEmoji: {
    fontSize: 42,
  },
  cityText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
  },
  weatherLabel: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '900',
  },
  tempText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '900',
  },
  rangeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
  },
  storyCard: {
    flex: 1,
    minHeight: 132,
    justifyContent: 'center',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: WEATHER_BORDER,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    gap: 6,
    overflow: 'hidden',
  },
  storyEyebrow: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  storyTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '900',
    textAlign: 'center',
  },
  storyTip: {
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
    lineHeight: 22,
    textAlign: 'center',
  },
  extrasAside: {
    minWidth: 230,
    width: 230,
    minHeight: 132,
    justifyContent: 'center',
    borderRadius: 24,
    padding: SPACING.md,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: WEATHER_BORDER,
    overflow: 'hidden',
  },
  extrasTitle: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  extrasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  extrasGridAside: {
    flexDirection: 'column',
    flexWrap: 'nowrap',
  },
  extraTile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.sm,
    borderWidth: 1,
    borderColor: WEATHER_BORDER,
    overflow: 'hidden',
  },
  extraTileStacked: {
    width: '100%',
  },
  extraLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '800',
  },
  mainPanel: {
    width: '100%',
    borderRadius: 24,
    padding: SPACING.md,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: WEATHER_BORDER,
    overflow: 'hidden',
  },
  panelHeader: {
    gap: 4,
  },
  panelEyebrow: {
    fontSize: FONT_SIZE.md,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  outfitSummaryCard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
    borderRadius: 20,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    borderWidth: 1,
    borderColor: WEATHER_BORDER,
    overflow: 'hidden',
  },
  inlineItem: {
    flexGrow: 1,
    flexBasis: 108,
    minWidth: 108,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  inlineItemLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
    textAlign: 'center',
  },
});
