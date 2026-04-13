import React, { useEffect } from 'react';
import { Text, StyleSheet, View, useWindowDimensions } from 'react-native';
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
  OutfitVisualId,
  OutfitVisualItem,
} from '../../constants/weatherOutfits';
import { FONT_SIZE, RADIUS, SHADOWS, SPACING } from '../../constants/theme';

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
  isNight,
  size,
}: {
  tile: OutfitTile;
  index: number;
  textColor: string;
  isNight: boolean;
  size: number;
}) {
  const item = tile.items[0];

  return (
    <View style={[styles.inlineItem, isNight && styles.inlineItemNight]}>
      <ClothingIcon code={item.id} size={size} variant={index} />
      <Text style={[styles.inlineItemLabel, { color: textColor }]}>{item.label}</Text>
    </View>
  );
}

function ExtraTile({
  item,
  index,
  textColor,
  isNight,
  stacked,
}: {
  item: OutfitVisualItem;
  index: number;
  textColor: string;
  isNight: boolean;
  stacked: boolean;
}) {
  return (
    <View
      style={[
        styles.extraTile,
        isNight && styles.extraTileNight,
        stacked && styles.extraTileStacked,
      ]}
    >
      <ClothingIcon code={item.id} size={40} variant={index} />
      <Text style={[styles.extraLabel, { color: textColor }]}>{item.label}</Text>
    </View>
  );
}

export function WeatherCard({ weather }: Props) {
  const { width } = useWindowDimensions();
  const theme = getWeatherTheme(weather.condition, weather.isDay);
  const textColor = getWeatherTextColor(weather.isDay);
  const secondaryColor = getWeatherSecondaryTextColor(weather.isDay);
  const isNightTheme = !weather.isDay;
  const isNightRoutine = !weather.isDay;
  const daySurfacePrimary = 'rgba(255, 252, 247, 0.96)';
  const daySurfaceSecondary = 'rgba(255, 247, 239, 0.94)';
  const daySurfaceAccent = 'rgba(248, 239, 255, 0.92)';
  const daySurfaceBlue = 'rgba(239, 247, 255, 0.92)';
  const dayBorder = 'rgba(212, 223, 238, 0.9)';
  const dayShadow = 'rgba(164, 182, 209, 0.18)';
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
  const visibleExtras = outfitPlan.extras;
  const isWideLayout = width >= 920;
  const clothingIconSize = isWideLayout ? 76 : 60;

  return (
    <Animated.View
      entering={FadeIn.delay(150).duration(500)}
      style={[
        styles.card,
        isNightTheme
          ? {
              backgroundColor: 'rgba(15,15,40,0.75)',
              borderColor: 'rgba(255,255,255,0.12)',
            }
          : {
              backgroundColor: daySurfacePrimary,
              borderColor: dayBorder,
              shadowColor: dayShadow,
            },
      ]}
    >
      <View style={[styles.topGrid, isWideLayout && styles.topGridWide]}>
        <View
          style={[
            styles.weatherSummaryCard,
            isNightTheme ? styles.surfaceNight : styles.daySummaryCard,
          ]}
        >
          <View style={styles.summaryRow}>
            <BouncingEmoji emoji={theme.emoji} />
            <View style={styles.summaryTextBlock}>
              <Text style={[styles.cityText, { color: secondaryColor }]}>📍 {weather.city}</Text>
              <Text style={[styles.weatherLabel, { color: textColor }]}>{theme.label}</Text>
              <Text style={[styles.tempText, { color: textColor }]}>{temperatureLabel}</Text>
            </View>
          </View>
        </View>

        <View
          style={[
            styles.storyCard,
            isNightTheme ? styles.surfaceNight : styles.dayStoryCard,
          ]}
        >
          <Text style={[styles.storyEyebrow, { color: secondaryColor }]}>
            {isNightRoutine ? 'Pour cette soiree' : "Aujourd'hui"}
          </Text>
          <Text style={[styles.storyTitle, { color: textColor }]}>{theme.kidMessage}</Text>
          <Text style={[styles.storyTip, { color: secondaryColor }]}>{outfitPlan.headline}</Text>
        </View>

        {visibleExtras.length > 0 ? (
          <View
            style={[
              styles.extrasAside,
              isNightTheme ? styles.surfaceNight : styles.dayExtrasAside,
            ]}
          >
            <Text style={[styles.extrasTitle, { color: secondaryColor }]}>
              En plus avec cette meteo
            </Text>
            <View style={[styles.extrasGrid, isWideLayout && styles.extrasGridAside]}>
              {visibleExtras.map((item, index) => (
                <ExtraTile
                  key={`extra-${item.id}-${index}`}
                  item={item}
                  index={index}
                  textColor={textColor}
                  isNight={isNightTheme}
                  stacked={isWideLayout}
                />
              ))}
            </View>
          </View>
        ) : null}
      </View>

      <View
        style={[
          styles.mainPanel,
          isNightTheme ? styles.mainPanelNight : styles.dayMainPanel,
        ]}
      >
        <View style={styles.panelHeader}>
          <Text style={[styles.panelEyebrow, { color: secondaryColor }]}>Vêtements recommandés</Text>
        </View>

        <View
          style={[
            styles.outfitSummaryCard,
            isNightTheme ? styles.outfitSummaryCardNight : styles.dayOutfitSummaryCard,
          ]}
        >
          {outfitPlan.tiles.map((tile, index) => (
            <OutfitTileInline
              key={`${index}-${tile.items.map((entry) => entry.id).join('-')}`}
              tile={tile}
              index={index}
              textColor={textColor}
              isNight={isNightTheme}
              size={clothingIconSize}
            />
          ))}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    gap: SPACING.md,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  surfaceNight: {
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  daySummaryCard: {
    backgroundColor: 'rgba(255, 245, 248, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(243, 209, 224, 0.9)',
    borderRadius: RADIUS.xl,
  },
  dayStoryCard: {
    backgroundColor: 'rgba(255, 250, 242, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(245, 224, 198, 0.9)',
  },
  dayExtrasAside: {
    backgroundColor: 'rgba(245, 247, 255, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(214, 221, 244, 0.92)',
  },
  dayMainPanel: {
    backgroundColor: 'rgba(251, 252, 255, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(225, 232, 246, 0.92)',
  },
  dayOutfitSummaryCard: {
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderWidth: 1,
    borderColor: 'rgba(230, 236, 246, 0.96)',
  },
  topGrid: {
    gap: SPACING.sm,
  },
  topGridWide: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherSummaryCard: {
    minWidth: 180,
    width: 180,
    minHeight: 120,
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
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
  storyCard: {
    flex: 1,
    minHeight: 120,
    justifyContent: 'center',
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    gap: 4,
  },
  storyEyebrow: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
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
    minHeight: 120,
    justifyContent: 'center',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
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
  extrasGridAside: {
    flexDirection: 'column',
    flexWrap: 'nowrap',
  },
  extraTile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.sm,
  },
  extraTileNight: {
    backgroundColor: 'rgba(255,255,255,0.16)',
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
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: RADIUS.xl,
    padding: SPACING.sm,
    gap: SPACING.sm,
  },
  mainPanelNight: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  panelHeader: {
    gap: 4,
  },
  panelEyebrow: {
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  outfitSummaryCard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.xs,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  outfitSummaryCardNight: {
    backgroundColor: 'rgba(255,255,255,0.18)',
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
  inlineItemNight: {
    opacity: 0.96,
  },
  inlineItemLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
    textAlign: 'center',
  },
});
