import React, { useEffect, useMemo } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
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
import {
  OutfitZone,
  TempLevel,
  WeatherLevel,
  getOutfitVisualItem,
} from '../../constants/weatherOutfits';
import { WeatherData } from '../../services/weather';
import {
  ContextualWeatherModel,
  getContextualWeatherModel,
} from '../../services/weatherDayContext';
import { FONT_SIZE, RADIUS, SPACING } from '../../constants/theme';
import { useReducedMotionPreference } from '../../hooks/useReducedMotionPreference';

interface Props {
  weather: WeatherData;
  model?: ContextualWeatherModel;
}

const LEVEL_COLORS: Record<string, { bg: string; text: string; sub: string; border: string }> = {
  blue: { bg: '#E5F3FF', text: '#24658F', sub: '#4B7693', border: '#B7DDF4' },
  purple: { bg: '#F1ECFF', text: '#66509D', sub: '#7B6BA1', border: '#D8CCF4' },
  green: { bg: '#E8F6E4', text: '#3E7448', sub: '#5F835F', border: '#C8E2C1' },
  amber: { bg: '#FFF3C4', text: '#8A641E', sub: '#8B7040', border: '#F4DA88' },
  coral: { bg: '#FFE8DF', text: '#A14D35', sub: '#9A6958', border: '#F2BBA9' },
};

const LEVEL_EMOJIS: Record<TempLevel, string> = {
  very_cold: '❄️',
  cold: '🧥',
  mild: '🌤️',
  warm: '☀️',
  very_hot: '🥵',
};

function getLevelEmoji(weather: WeatherData, level: TempLevel): string {
  if (weather.condition === 'snow' || weather.dayForecast.hasSnow) return '❄️';
  if (weather.condition === 'rain' || weather.dayForecast.hasRain) return '🌧️';
  if (weather.condition === 'thunderstorm' || weather.dayForecast.hasThunderstorm) return '⛈️';
  return LEVEL_EMOJIS[level];
}

function visibleZones(zones: OutfitZone[], sleepMode: boolean): OutfitZone[] {
  const filtered = sleepMode
    ? zones.filter((zone) => zone.zone === 'body' || zone.zone === 'accessories')
    : zones;

  return filtered.filter((zone) => zone.items.length > 0);
}

function BouncingEmoji({ emoji }: { emoji: string }) {
  const reducedMotion = useReducedMotionPreference();
  const translateY = useSharedValue(0);

  useEffect(() => {
    if (reducedMotion) {
      translateY.value = 0;
      return;
    }
    translateY.value = withRepeat(
      withSequence(
        withTiming(-7, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, [reducedMotion, translateY]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.Text style={[styles.weatherEmoji, style]}>{emoji}</Animated.Text>;
}

function LevelHeader({
  city,
  contextLabel,
  headline,
  level,
  emoji,
  sleepMode,
}: {
  city: string;
  contextLabel?: string;
  headline: string;
  level: WeatherLevel;
  emoji: string;
  sleepMode: boolean;
}) {
  const colors = LEVEL_COLORS[level.colorKey] ?? LEVEL_COLORS.green;

  return (
    <View style={[styles.levelHeader, sleepMode && styles.levelHeaderSleep]}>
      <View style={[styles.levelIcon, { backgroundColor: colors.bg, borderColor: colors.border }]}>
        <BouncingEmoji emoji={emoji} />
      </View>
      <View style={styles.levelText}>
        <Text style={[styles.levelLabel, { color: sleepMode ? '#FFFDF8' : colors.text }]}>
          {level.label}
        </Text>
        <Text style={[styles.levelSublabel, { color: sleepMode ? 'rgba(255,253,248,0.84)' : colors.sub }]}>
          {level.sublabel}
        </Text>
        <Text style={[styles.levelMeta, sleepMode && styles.levelMetaSleep]}>
          {city}{contextLabel ? ` · ${contextLabel}` : ''} · {headline}
        </Text>
      </View>
    </View>
  );
}

export function WeatherCard({ weather, model }: Props) {
  const reducedMotion = useReducedMotionPreference();
  const weatherModel = model ?? getContextualWeatherModel(weather);
  const palette = weatherModel.palette;
  const zones = useMemo(
    () => visibleZones(weatherModel.structuredOutfit.zones, weatherModel.structuredOutfit.sleepMode),
    [weatherModel.structuredOutfit],
  );
  const sleepMode = weatherModel.structuredOutfit.sleepMode;
  const gradient = sleepMode ? (['#555174', '#8B84BA'] as [string, string]) : palette.gradient;
  let variantIndex = 0;

  return (
    <Animated.View
      entering={reducedMotion ? undefined : FadeIn.delay(120).duration(420)}
      style={[styles.cardFrame, { shadowColor: palette.shadowColor }]}
    >
      <LinearGradient colors={gradient} style={[styles.hero, sleepMode && styles.heroSleep]}>
        {sleepMode ? (
          <View pointerEvents="none" style={styles.starsLayer}>
            <Text style={[styles.star, styles.starOne]}>✦</Text>
            <Text style={[styles.star, styles.starTwo]}>✧</Text>
            <Text style={[styles.star, styles.starThree]}>✦</Text>
          </View>
        ) : null}

        <LevelHeader
          city={weather.city}
          contextLabel={weatherModel.contextLabel}
          headline={weatherModel.headline}
          level={weatherModel.weatherLevel}
          emoji={getLevelEmoji(weather, weatherModel.tempLevel)}
          sleepMode={sleepMode}
        />

        <View style={[styles.zonePanel, sleepMode && styles.zonePanelSleep]}>
          {zones.map((zone) => (
            <View key={zone.zone} style={styles.zoneRow}>
              <Text style={[styles.zoneLabel, sleepMode && styles.zoneLabelSleep]}>
                {zone.label.toUpperCase()}
              </Text>
              <View style={styles.zoneItems}>
                {zone.items.map((itemId, index) => {
                  const item = getOutfitVisualItem(itemId);
                  const variant = variantIndex;
                  variantIndex += 1;

                  return (
                    <View key={`${zone.zone}-${itemId}-${index}`} style={[styles.itemPill, sleepMode && styles.itemPillSleep]}>
                      {zone.items.length > 1 ? (
                        <View style={[styles.layerBadge, sleepMode && styles.layerBadgeSleep]}>
                          <Text style={[styles.layerBadgeText, sleepMode && styles.layerBadgeTextSleep]}>
                            {index + 1}
                          </Text>
                        </View>
                      ) : null}
                      <ClothingIcon code={item?.id ?? itemId} size={34} variant={variant} />
                      <Text style={[styles.itemLabel, sleepMode && styles.itemLabelSleep]} numberOfLines={1}>
                        {item?.label ?? itemId}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          ))}
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardFrame: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    marginBottom: 0,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 14 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
      },
      android: {
        elevation: 7,
      },
      web: {
        boxShadow: '0 14px 30px rgba(130, 110, 84, 0.14)',
      },
    }),
  },
  hero: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingTop: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    gap: SPACING.md,
    overflow: 'hidden',
  },
  heroSleep: {
    position: 'relative',
  },
  starsLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  star: {
    position: 'absolute',
    color: 'rgba(255,253,248,0.48)',
    fontSize: 18,
    fontWeight: '900',
  },
  starOne: {
    top: 18,
    right: 34,
  },
  starTwo: {
    top: 70,
    left: 22,
    fontSize: 14,
  },
  starThree: {
    bottom: 26,
    right: 76,
    fontSize: 12,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  levelHeaderSleep: {
    zIndex: 1,
  },
  levelIcon: {
    width: 68,
    height: 68,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  weatherEmoji: {
    fontSize: 38,
  },
  levelText: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  levelLabel: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '900',
    lineHeight: 25,
  },
  levelSublabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '900',
  },
  levelMeta: {
    color: 'rgba(75, 54, 25, 0.72)',
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
  },
  levelMetaSleep: {
    color: 'rgba(255,253,248,0.72)',
  },
  zonePanel: {
    gap: SPACING.sm,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255,255,255,0.48)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.44)',
    padding: SPACING.sm,
  },
  zonePanelSleep: {
    zIndex: 1,
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderColor: 'rgba(255,255,255,0.18)',
  },
  zoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  zoneLabel: {
    width: 92,
    color: 'rgba(64,64,64,0.72)',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.7,
  },
  zoneLabelSleep: {
    color: 'rgba(255,253,248,0.72)',
  },
  zoneItems: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  itemPill: {
    minHeight: 44,
    maxWidth: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.76)',
    paddingVertical: 5,
    paddingLeft: 6,
    paddingRight: SPACING.sm,
  },
  itemPillSleep: {
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  layerBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF3C4',
  },
  layerBadgeSleep: {
    backgroundColor: 'rgba(255,253,248,0.22)',
  },
  layerBadgeText: {
    color: '#8A641E',
    fontSize: 11,
    fontWeight: '900',
  },
  layerBadgeTextSleep: {
    color: '#FFFDF8',
  },
  itemLabel: {
    maxWidth: 92,
    color: '#3F3A34',
    fontSize: FONT_SIZE.xs,
    fontWeight: '900',
  },
  itemLabelSleep: {
    color: '#FFFDF8',
  },
});
