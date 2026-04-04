import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { WeatherData } from '../../services/weather';
import { getWeatherTheme, getWeatherSecondaryTextColor } from '../../constants/weatherThemes';
import { SPACING, FONT_SIZE, RADIUS } from '../../constants/theme';

interface Props {
  weather: WeatherData;
}

export function WeatherBadge({ weather }: Props) {
  const theme = getWeatherTheme(weather.condition, weather.isDay);
  const textColor = getWeatherSecondaryTextColor(weather.isDay);

  return (
    <View style={styles.badge}>
      <Text style={styles.emoji}>{theme.emoji}</Text>
      <Text style={[styles.temp, { color: textColor }]}>
        {weather.temperature}°C
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: 'rgba(255,255,255,0.4)',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  emoji: { fontSize: 18 },
  temp: { fontSize: FONT_SIZE.xs, fontWeight: '700' },
});
