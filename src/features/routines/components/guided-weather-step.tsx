import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CheckCircle } from 'phosphor-react-native';
import { ClothingIcon } from '../../../components/weather/ClothingIcon';
import { getOutfitVisualItem } from '../../../constants/weatherOutfits';
import { FONT_SIZE, SHADOWS, SPACING } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { getWeatherFreshness, type WeatherData } from '../../../services/weather';
import { getClothingRecommendation } from '../../../services/weatherClothingRecommendation';
import type { GuidedStepKind } from '../utils/guided-steps';

type Props = { kind: GuidedStepKind; weather: WeatherData | null };

function weatherEmoji(weather: WeatherData) {
  if (weather.condition === 'rain') return '🌧️';
  if (weather.condition === 'snow') return '❄️';
  if (weather.condition === 'thunderstorm') return '⛈️';
  if (weather.condition === 'cloudy' || weather.condition === 'fog') return '☁️';
  if (weather.condition === 'partly_cloudy') return '🌤️';
  return '☀️';
}

export function GuidedWeatherStep({ kind, weather }: Props) {
  const { colors } = useAppTheme();
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const recommendation = useMemo(() => weather ? getClothingRecommendation(weather) : null, [weather]);
  const freshness = weather ? getWeatherFreshness(weather) : null;
  const outfitItems = useMemo(() => {
    if (!recommendation) return [];
    return recommendation.outfitPlan.tiles
      .flatMap((tile) => tile.items)
      .concat(recommendation.outfitPlan.extras)
      .filter((item, index, all) => all.findIndex((candidate) => candidate.id === item.id) === index)
      .slice(0, 4);
  }, [recommendation]);

  if (!weather || !recommendation) {
    return <View style={[styles.fallback, { backgroundColor: colors.informationSoft }]}><Text style={styles.fallbackEmoji}>🪟</Text><Text style={[styles.fallbackTitle, { color: colors.text }]}>Regardons dehors</Text><Text style={[styles.fallbackText, { color: colors.textSecondary }]}>La météo n’est pas disponible. On observe le ciel ensemble et l’adulte aide à choisir une tenue confortable.</Text></View>;
  }

  if (kind === 'weather-look') {
    return <View style={[styles.weatherCard, { backgroundColor: colors.informationSoft }]}><Text style={styles.weatherEmoji}>{weatherEmoji(weather)}</Text><Text style={[styles.temperature, { color: colors.text }]}>{Math.round(weather.apparentTemperature ?? weather.temperature)}°</Text><Text style={[styles.weatherMessage, { color: colors.text }]}>{recommendation.childMessage}</Text><Text style={[styles.weatherReason, { color: colors.textSecondary }]}>{freshness?.isStale ? 'Cette météo date un peu : on vérifie aussi par la fenêtre.' : 'On regarde le ciel, puis on choisit ensemble.'}</Text></View>;
  }

  return <View style={styles.wrapper}><Text style={[styles.prompt, { color: colors.text }]}>Quels vêtements vont nous aider aujourd’hui ?</Text><Text style={[styles.helper, { color: colors.textSecondary }]}>Touche les cartes pour découvrir pourquoi. Il n’y a pas de mauvaise réponse.</Text><View style={styles.grid}>{outfitItems.map((item, index) => { const active = selected.has(item.id); const details = getOutfitVisualItem(item.id); const reason = recommendation.outfitReasons[item.id] ?? 'Confortable pour cette journée'; return <TouchableOpacity aria-checked={active} key={item.id} accessibilityRole="checkbox" accessibilityState={{ checked: active }} accessibilityLabel={`${details?.label ?? item.id}. ${reason}`} activeOpacity={0.82} onPress={() => setSelected((current) => { const next = new Set(current); active ? next.delete(item.id) : next.add(item.id); return next; })} style={[styles.itemCard, { backgroundColor: active ? colors.actionSoft : colors.surface, borderColor: active ? colors.action : colors.border }]}><View style={styles.itemTop}><ClothingIcon code={item.id} size={54} variant={index} />{active ? <CheckCircle size={22} weight="fill" color={colors.action} /> : null}</View><Text style={[styles.itemLabel, { color: colors.text }]}>{details?.label ?? item.id}</Text><Text style={[styles.itemReason, { color: colors.textSecondary }]}>{active ? reason : 'Toucher pour comprendre'}</Text></TouchableOpacity>; })}</View></View>;
}

const styles = StyleSheet.create({
  wrapper: { width: '100%', maxWidth: 560, alignItems: 'center', gap: SPACING.sm }, prompt: { fontSize: FONT_SIZE.lg, lineHeight: 25, fontWeight: '800', textAlign: 'center' }, helper: { maxWidth: 420, fontSize: FONT_SIZE.xs, lineHeight: 18, textAlign: 'center', marginBottom: SPACING.xs }, grid: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: SPACING.sm }, itemCard: { width: 150, minHeight: 155, borderRadius: 22, borderWidth: 1.5, padding: SPACING.sm, justifyContent: 'center', ...SHADOWS.sm }, itemTop: { minHeight: 62, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }, itemLabel: { fontSize: FONT_SIZE.sm, fontWeight: '800', marginTop: 3 }, itemReason: { fontSize: FONT_SIZE.xs, lineHeight: 16, marginTop: 4 }, weatherCard: { width: '100%', maxWidth: 420, minHeight: 235, borderRadius: 28, padding: SPACING.lg, alignItems: 'center', justifyContent: 'center' }, weatherEmoji: { fontSize: 58 }, temperature: { fontSize: 42, fontWeight: '900', marginTop: SPACING.xs }, weatherMessage: { fontSize: FONT_SIZE.lg, lineHeight: 25, fontWeight: '800', textAlign: 'center', marginTop: SPACING.sm }, weatherReason: { fontSize: FONT_SIZE.sm, textAlign: 'center', marginTop: SPACING.sm }, fallback: { width: '100%', maxWidth: 420, minHeight: 220, borderRadius: 28, padding: SPACING.lg, alignItems: 'center', justifyContent: 'center' }, fallbackEmoji: { fontSize: 48 }, fallbackTitle: { fontSize: FONT_SIZE.lg, fontWeight: '800', marginTop: SPACING.sm }, fallbackText: { fontSize: FONT_SIZE.sm, lineHeight: 20, textAlign: 'center', marginTop: SPACING.sm },
});
