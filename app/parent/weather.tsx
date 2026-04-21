import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { CloudSun } from 'phosphor-react-native';
import { AppPageHeader } from '../../src/components/ui/AppPageHeader';
import { showAppToast } from '../../src/components/feedback/AppFeedbackProvider';
import { COLORS, FONT_SIZE, RADIUS, SHADOWS, SPACING } from '../../src/constants/theme';
import { useAppStore } from '../../src/stores/appStore';
import { useWeatherStore } from '../../src/stores/weatherStore';
import { backOrReplace } from '../../src/utils/navigation';

export default function ParentWeatherScreen() {
  const router = useRouter();
  const weatherCity = useAppStore((state) => state.weatherCity);
  const useGeolocation = useAppStore((state) => state.useGeolocation);
  const setWeatherCity = useAppStore((state) => state.setWeatherCity);
  const setUseGeolocation = useAppStore((state) => state.setUseGeolocation);
  const refreshWeather = useWeatherStore((state) => state.refresh);
  const [cityInput, setCityInput] = useState(weatherCity);

  useEffect(() => {
    setCityInput(weatherCity);
  }, [weatherCity]);

  const handleToggleGeo = (value: boolean) => {
    setUseGeolocation(value);
    if (value) refreshWeather({ useGeolocation: true });
  };

  const handleSaveCity = () => {
    const trimmed = cityInput.trim();
    setWeatherCity(trimmed);
    refreshWeather({ cityName: trimmed, useGeolocation });
    showAppToast({
      title: 'Ville enregistree',
      message: trimmed ? `Meteo pour : ${trimmed}` : 'Meteo par defaut : Paris',
      tone: 'success',
      icon: '📍',
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <AppPageHeader
          title="Config meteo"
          onBack={() => backOrReplace(router, '/parent')}
          onHome={() => router.replace('/parent')}
        />

        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <CloudSun size={34} weight="duotone" color={COLORS.secondaryDark} />
          </View>
          <Text style={styles.title}>Configurer la meteo</Text>
          <Text style={styles.subtitle}>
            Choisis la geolocalisation automatique ou renseigne une ville de reference.
          </Text>

          <View style={styles.settings}>
            <View style={styles.row}>
              <View style={styles.rowText}>
                <Text style={styles.label}>Geolocalisation automatique</Text>
                <Text style={styles.hint}>Utilise la position de l'appareil pour adapter la meteo.</Text>
              </View>
              <Switch
                value={useGeolocation}
                onValueChange={handleToggleGeo}
                trackColor={{ false: COLORS.border, true: COLORS.secondaryLight }}
                thumbColor={useGeolocation ? COLORS.secondary : COLORS.textLight}
              />
            </View>

            {!useGeolocation ? (
              <View style={styles.citySection}>
                <Text style={styles.label}>Ville de reference</Text>
                <TextInput
                  style={styles.input}
                  value={cityInput}
                  onChangeText={setCityInput}
                  placeholder="Ex : Rennes, Lyon, Marseille..."
                  placeholderTextColor={COLORS.textLight}
                  returnKeyType="done"
                  onSubmitEditing={handleSaveCity}
                />
                <Text style={styles.hint}>
                  {weatherCity ? `Meteo actuelle : ${weatherCity}` : 'Par defaut : Paris'}
                </Text>
              </View>
            ) : null}
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSaveCity} activeOpacity={0.85}>
            <Text style={styles.saveButtonText}>Enregistrer</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  card: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    borderRadius: RADIUS.xl + 4,
    backgroundColor: COLORS.surface,
    padding: SPACING.xl,
    gap: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.lg,
  },
  iconWrap: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondarySoft,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '900',
    color: COLORS.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  settings: {
    gap: SPACING.lg,
    marginTop: SPACING.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: SPACING.md,
  },
  rowText: {
    flex: 1,
    gap: 4,
  },
  citySection: {
    gap: SPACING.sm,
  },
  label: {
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
    color: COLORS.text,
  },
  hint: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    backgroundColor: COLORS.cardHighlight,
  },
  saveButton: {
    minHeight: 50,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.secondary,
    marginTop: SPACING.md,
  },
  saveButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '900',
    color: '#FFF',
  },
});
