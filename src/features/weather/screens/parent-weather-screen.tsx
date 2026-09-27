import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Switch, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, CloudSun, Crosshair, MapPin, Minus, Plus } from 'phosphor-react-native';
import { PastelOrbs } from '../../../components/ui/PastelOrbs';
import { showAppToast } from '../../../components/feedback/AppFeedbackProvider';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { useAppStore } from '../../../stores/appStore';
import { useChildrenStore } from '../../../stores/childrenStore';
import { useWeatherStore } from '../../../stores/weatherStore';
import { useWeatherTimeConfigStore } from '../../../stores/weatherTimeConfigStore';
import { getWeatherFreshness, type WeatherCondition, type WeatherErrorCode } from '../../../services/weather';
import { getClothingRecommendation } from '../../../services/weatherClothingRecommendation';
import { adjustTimeByStep, DAY_LABELS, type DayOfWeek, type DayTimeConfig, resolveWeeklyTimeConfig } from '../../../utils/weatherTimeConfig';
import { CONTENT_MAX_WIDTH, FONT_SIZE, SHADOWS, SPACING, type ThemeColors } from '../../../constants/theme';
import { formatChildName } from '../../../utils/children';

type Tab = 'location' | 'hours';
const DAYS: DayOfWeek[] = [1, 2, 3, 4, 5, 6, 0];
const CONDITIONS: Record<WeatherCondition, string> = {
  clear: 'Ciel dégagé', partly_cloudy: 'Quelques nuages', cloudy: 'Nuageux', fog: 'Brouillard', rain: 'Pluie', snow: 'Neige', thunderstorm: 'Orage',
};
const ERROR_COPY: Record<WeatherErrorCode, { title: string; text: string }> = {
  'location-denied': { title: 'Localisation non autorisée', text: 'Autorisez-la dans les réglages de l’appareil ou choisissez une ville.' },
  'location-unavailable': { title: 'Position indisponible', text: 'Réessayez plus tard ou choisissez une ville.' },
  'city-not-found': { title: 'Ville introuvable', text: 'Vérifiez l’orthographe ou essayez une ville proche.' },
  network: { title: 'Réseau indisponible', text: 'La dernière météo connue reste visible si elle existe.' },
};

export function ParentWeatherScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { colors } = useAppTheme();
  const children = useChildrenStore((state) => state.children);
  const weatherCity = useAppStore((state) => state.weatherCity);
  const useGeolocation = useAppStore((state) => state.useGeolocation);
  const setWeatherCity = useAppStore((state) => state.setWeatherCity);
  const setUseGeolocation = useAppStore((state) => state.setUseGeolocation);
  const weather = useWeatherStore((state) => state.weather);
  const loading = useWeatherStore((state) => state.loading);
  const errorCode = useWeatherStore((state) => state.errorCode);
  const refreshWeather = useWeatherStore((state) => state.refresh);
  const configs = useWeatherTimeConfigStore((state) => state.configs);
  const ensureConfig = useWeatherTimeConfigStore((state) => state.ensureConfig);
  const updateDayConfig = useWeatherTimeConfigStore((state) => state.updateDayConfig);
  const copyMondayToWeek = useWeatherTimeConfigStore((state) => state.copyMondayToWeek);
  const applySchoolWeek = useWeatherTimeConfigStore((state) => state.applySchoolWeek);
  const resetConfig = useWeatherTimeConfigStore((state) => state.resetConfig);
  const [tab, setTab] = useState<Tab>('location');
  const [cityInput, setCityInput] = useState(weatherCity);
  const [childId, setChildId] = useState<string | undefined>(children[0]?.id);
  const contentWidth = Math.min(width - SPACING.lg * 2, CONTENT_MAX_WIDTH.lg);
  const compactCards = contentWidth < 600;
  const timeConfig = useMemo(() => resolveWeeklyTimeConfig(configs, childId), [childId, configs]);
  const recommendation = useMemo(() => weather ? getClothingRecommendation(weather) : null, [weather]);

  useEffect(() => setCityInput(weatherCity), [weatherCity]);
  useEffect(() => { ensureConfig(childId); }, [childId, ensureConfig]);
  useEffect(() => { if (!childId && children[0]) setChildId(children[0].id); }, [childId, children]);

  const saveLocation = async () => {
    const city = cityInput.trim();
    const updated = await refreshWeather({ cityName: useGeolocation ? undefined : city, useGeolocation }, { force: true });
    if (updated) {
      if (!useGeolocation) setWeatherCity(city);
      showAppToast({ title: 'Météo mise à jour', message: useWeatherStore.getState().weather?.city ?? (city || 'Paris'), tone: 'success', icon: '🌤️' });
    }
  };
  const toggleGeo = async (enabled: boolean) => {
    setUseGeolocation(enabled);
    if (enabled) await refreshWeather({ useGeolocation: true }, { force: true });
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <PastelOrbs quiet />
      <ScrollView contentContainerStyle={[styles.scroll, { alignItems: 'center' }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={[styles.content, { width: contentWidth, maxWidth: '100%' }]}>
          <View style={styles.headingRow}>
            <Pressable accessibilityRole="button" accessibilityLabel="Retour à Parent" onPress={() => router.replace('/parent')} style={[styles.back, { backgroundColor: colors.surface, borderColor: colors.border }]}><ArrowLeft size={21} weight="bold" color={colors.text} /></Pressable>
            <View style={styles.headingCopy}><Text style={[styles.eyebrow, { color: colors.information }]}>MÉTÉO ET RYTHMES</Text><Text style={[styles.title, { color: colors.text }]}>Préparer sans compliquer.</Text><Text style={[styles.subtitle, { color: colors.textSecondary }]}>Le parent règle la source météo et les repères horaires. L’enfant observe le temps pendant la routine.</Text></View>
          </View>

          <View style={[styles.tabs, { backgroundColor: colors.surfaceSecondary }]}>
            <TabButton label="Lieu et météo" icon={<MapPin size={18} color={tab === 'location' ? colors.information : colors.textSecondary} />} active={tab === 'location'} onPress={() => setTab('location')} colors={colors} />
            <TabButton label="Repères horaires" icon={<CloudSun size={19} color={tab === 'hours' ? colors.time : colors.textSecondary} />} active={tab === 'hours'} onPress={() => setTab('hours')} colors={colors} />
          </View>

          {tab === 'location' ? (
            <View style={styles.grid}>
              <View style={[styles.card, styles.settingsCard, compactCards && styles.compactCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[styles.cardIcon, { backgroundColor: colors.informationSoft }]}><Crosshair size={28} color={colors.information} /></View>
                <Text style={[styles.cardTitle, { color: colors.text }]}>D’où vient la météo ?</Text>
                <Text style={[styles.cardText, { color: colors.textSecondary }]}>Utilisez la position de l’appareil ou gardez une ville de référence.</Text>
                <View style={[styles.switchRow, { backgroundColor: colors.surfaceSecondary }]}><View style={styles.switchCopy}><Text style={[styles.fieldTitle, { color: colors.text }]}>Localisation automatique</Text><Text style={[styles.fieldHelp, { color: colors.textSecondary }]}>Seulement pour récupérer le temps local.</Text></View><Switch accessibilityLabel="Localisation automatique" value={useGeolocation} onValueChange={(value) => void toggleGeo(value)} trackColor={{ false: colors.border, true: colors.informationSoft }} thumbColor={useGeolocation ? colors.information : colors.textLight} /></View>
                {!useGeolocation ? <View style={styles.field}><Text style={[styles.fieldTitle, { color: colors.text }]}>Ville de référence</Text><TextInput accessibilityLabel="Ville de référence" value={cityInput} onChangeText={setCityInput} placeholder="Ex. Rennes" placeholderTextColor={colors.textLight} onSubmitEditing={() => void saveLocation()} style={[styles.input, { backgroundColor: colors.cardHighlight, borderColor: colors.border, color: colors.text }]} /></View> : null}
                {errorCode ? <ErrorCard code={errorCode} colors={colors} onChooseCity={() => { setUseGeolocation(false); setTab('location'); }} /> : null}
                <Pressable accessibilityRole="button" disabled={loading} onPress={() => void saveLocation()} style={[styles.primaryButton, { backgroundColor: colors.information, opacity: loading ? 0.65 : 1 }]}><Text style={[styles.primaryText, { color: colors.background }]}>{loading ? 'Mise à jour…' : 'Mettre à jour'}</Text></Pressable>
              </View>

              <View style={[styles.card, styles.summaryCard, compactCards && styles.compactCard, { backgroundColor: colors.informationSoft, borderColor: colors.informationSoft }]}>
                <Text style={styles.weatherEmoji}>{weather?.condition === 'rain' ? '🌧️' : weather?.condition === 'snow' ? '❄️' : weather?.condition === 'clear' ? '☀️' : '🌤️'}</Text>
                {weather && recommendation ? <><Text style={[styles.temperature, { color: colors.text }]}>{Math.round(weather.temperature)}°</Text><Text style={[styles.weatherPlace, { color: colors.text }]}>{weather.city} · {CONDITIONS[weather.condition]}</Text><Text style={[styles.cardText, { color: colors.textSecondary }]}>Ressenti {Math.round(weather.apparentTemperature ?? weather.temperature)}° · {recommendation.parentSummary.mainRecommendation}</Text><View style={[styles.advice, { backgroundColor: colors.surface }]}><Text style={[styles.adviceTitle, { color: colors.text }]}>Pour préparer la tenue</Text><Text style={[styles.fieldHelp, { color: colors.textSecondary }]}>{recommendation.parentSummary.reason}</Text></View><Text style={[styles.freshness, { color: getWeatherFreshness(weather).isStale ? colors.attention : colors.information }]}>{getWeatherFreshness(weather).label}</Text></> : <><Text style={[styles.cardTitle, { color: colors.text }]}>Aucune météo disponible</Text><Text style={[styles.cardText, { color: colors.textSecondary }]}>Renseignez un lieu, ou regardez simplement le ciel avec l’enfant.</Text></>}
              </View>
            </View>
          ) : (
            <HoursPanel colors={colors} children={children} childId={childId} setChildId={setChildId} timeConfig={timeConfig} updateDayConfig={(day, patch) => updateDayConfig(childId, day, patch)} copyMonday={() => copyMondayToWeek(childId)} schoolWeek={() => applySchoolWeek(childId)} reset={() => resetConfig(childId)} />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function TabButton({ label, icon, active, onPress, colors }: { label: string; icon: React.ReactNode; active: boolean; onPress: () => void; colors: ThemeColors }) {
  return <Pressable aria-selected={active} accessibilityRole="tab" accessibilityState={{ selected: active }} onPress={onPress} style={[styles.tab, active && { backgroundColor: colors.surface, ...SHADOWS.sm }]}>{icon}<Text style={[styles.tabText, { color: active ? colors.text : colors.textSecondary }]}>{label}</Text></Pressable>;
}

function ErrorCard({ code, colors, onChooseCity }: { code: WeatherErrorCode; colors: ThemeColors; onChooseCity: () => void }) {
  const copy = ERROR_COPY[code];
  return <View style={[styles.errorCard, { backgroundColor: colors.attentionSoft }]}><Text style={[styles.errorTitle, { color: colors.text }]}>{copy.title}</Text><Text style={[styles.fieldHelp, { color: colors.textSecondary }]}>{copy.text}</Text>{code === 'location-denied' || code === 'location-unavailable' ? <Pressable accessibilityRole="button" onPress={onChooseCity} style={styles.inlineActionButton}><Text style={[styles.inlineAction, { color: colors.attention }]}>Choisir une ville</Text></Pressable> : null}</View>;
}

function HoursPanel({ colors, children, childId, setChildId, timeConfig, updateDayConfig, copyMonday, schoolWeek, reset }: { colors: ThemeColors; children: Array<{ id: string; name: string }>; childId?: string; setChildId: (id: string) => void; timeConfig: ReturnType<typeof resolveWeeklyTimeConfig>; updateDayConfig: (day: DayOfWeek, patch: Partial<DayTimeConfig>) => void; copyMonday: () => void; schoolWeek: () => void; reset: () => void }) {
  return <View style={[styles.hoursPanel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
    <View><Text style={[styles.cardTitle, { color: colors.text }]}>Quand commence le soir ?</Text><Text style={[styles.cardText, { color: colors.textSecondary }]}>Ces repères adaptent les mots « sieste », « coucher » et « nuit ». Ils ne créent pas de planning familial.</Text></View>
    {children.length ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>{children.map((child) => <Pressable accessibilityRole="button" accessibilityState={{ selected: childId === child.id }} key={child.id} onPress={() => setChildId(child.id)} style={[styles.chip, { backgroundColor: childId === child.id ? colors.actionSoft : colors.surfaceSecondary, borderColor: childId === child.id ? colors.action : colors.border }]}><Text style={[styles.chipText, { color: colors.text }]}>{formatChildName(child.name)}</Text></Pressable>)}</ScrollView> : <Text style={[styles.cardText, { color: colors.textSecondary }]}>Les horaires par défaut s’appliquent tant qu’aucun enfant n’est créé.</Text>}
    <View style={styles.quickRow}><QuickButton label="Copier lundi" onPress={copyMonday} colors={colors} /><QuickButton label="Semaine école" onPress={schoolWeek} colors={colors} /><QuickButton label="Réinitialiser" onPress={reset} colors={colors} /></View>
    <View style={styles.days}>{DAYS.map((dayKey) => { const day = timeConfig.days.find((item) => item.dayOfWeek === dayKey); if (!day) return null; return <View key={dayKey} style={[styles.dayCard, { backgroundColor: colors.cardHighlight, borderColor: colors.border }]}><View style={styles.dayHeader}><Text style={[styles.dayTitle, { color: colors.text }]}>{DAY_LABELS[dayKey]}</Text><View style={styles.napRow}><Text style={[styles.fieldHelp, { color: colors.textSecondary }]}>Sieste</Text><Switch accessibilityLabel={`Sieste ${DAY_LABELS[dayKey]}`} value={day.napEnabled} onValueChange={(napEnabled) => updateDayConfig(dayKey, { napEnabled })} trackColor={{ false: colors.border, true: colors.actionSoft }} thumbColor={day.napEnabled ? colors.action : colors.textLight} /></View></View><View style={styles.times}><TimeStepper label="Sieste" day={DAY_LABELS[dayKey]} value={day.napTime} disabled={!day.napEnabled} onChange={(napTime) => updateDayConfig(dayKey, { napTime })} colors={colors} /><TimeStepper label="Coucher" day={DAY_LABELS[dayKey]} value={day.bedtime} onChange={(bedtime) => updateDayConfig(dayKey, { bedtime })} colors={colors} /><TimeStepper label="Nuit" day={DAY_LABELS[dayKey]} value={day.nightStartTime} onChange={(nightStartTime) => updateDayConfig(dayKey, { nightStartTime })} colors={colors} /></View></View>; })}</View>
  </View>;
}

function QuickButton({ label, onPress, colors }: { label: string; onPress: () => void; colors: ThemeColors }) { return <Pressable accessibilityRole="button" onPress={onPress} style={[styles.quickButton, { backgroundColor: colors.timeSoft }]}><Text style={[styles.quickText, { color: colors.text }]}>{label}</Text></Pressable>; }

function TimeStepper({ label, day, value, onChange, disabled = false, colors }: { label: string; day: string; value: string; onChange: (value: string) => void; disabled?: boolean; colors: ThemeColors }) {
  return <View style={[styles.timeStepper, { opacity: disabled ? 0.42 : 1 }]}><Text style={[styles.timeLabel, { color: colors.textSecondary }]}>{label}</Text><View style={styles.timeControls}><Pressable accessibilityRole="button" disabled={disabled} accessibilityLabel={`Reculer ${label} ${day} de 15 minutes`} onPress={() => onChange(adjustTimeByStep(value, -1))} style={[styles.stepButton, { backgroundColor: colors.surfaceSecondary }]}><Minus size={16} color={colors.text} /></Pressable><Text style={[styles.timeValue, { color: colors.text }]}>{value}</Text><Pressable accessibilityRole="button" disabled={disabled} accessibilityLabel={`Avancer ${label} ${day} de 15 minutes`} onPress={() => onChange(adjustTimeByStep(value, 1))} style={[styles.stepButton, { backgroundColor: colors.surfaceSecondary }]}><Plus size={16} color={colors.text} /></Pressable></View></View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1 }, scroll: { padding: SPACING.lg, paddingBottom: 120 }, content: { gap: SPACING.lg },
  headingRow: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md }, back: { width: 48, height: 48, borderRadius: 15, borderWidth: 1, alignItems: 'center', justifyContent: 'center' }, headingCopy: { flex: 1, minWidth: 0, gap: 5 }, eyebrow: { fontSize: FONT_SIZE.xs, fontWeight: '800', letterSpacing: 0.8 }, title: { fontSize: FONT_SIZE.xxl, lineHeight: 39, fontWeight: '700', letterSpacing: -0.7 }, subtitle: { maxWidth: 680, fontSize: FONT_SIZE.sm, lineHeight: 21 },
  tabs: { flexDirection: 'row', alignSelf: 'flex-start', padding: 5, borderRadius: 18, gap: 4 }, tab: { minHeight: 44, borderRadius: 14, paddingHorizontal: SPACING.md, flexDirection: 'row', alignItems: 'center', gap: 7 }, tabText: { fontSize: FONT_SIZE.sm, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md, alignItems: 'stretch' }, card: { borderRadius: 24, borderWidth: 1, padding: SPACING.lg, gap: SPACING.md, ...SHADOWS.sm }, settingsCard: { flex: 1, minWidth: 290 }, summaryCard: { flex: 1, minWidth: 280, alignItems: 'flex-start' }, compactCard: { minWidth: 0, flexBasis: '100%' }, cardIcon: { width: 62, height: 62, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }, cardTitle: { fontSize: FONT_SIZE.xl, fontWeight: '700' }, cardText: { fontSize: FONT_SIZE.sm, lineHeight: 21 }, switchRow: { minHeight: 76, borderRadius: 18, padding: SPACING.md, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }, switchCopy: { flex: 1, minWidth: 0 }, field: { gap: SPACING.sm }, fieldTitle: { fontSize: FONT_SIZE.sm, fontWeight: '700' }, fieldHelp: { marginTop: 3, fontSize: FONT_SIZE.xs, lineHeight: 18 }, input: { minHeight: 52, borderRadius: 15, borderWidth: 1, paddingHorizontal: SPACING.md, fontSize: FONT_SIZE.md }, primaryButton: { minHeight: 52, borderRadius: 15, alignItems: 'center', justifyContent: 'center' }, primaryText: { fontSize: FONT_SIZE.sm, fontWeight: '800' }, errorCard: { borderRadius: 18, padding: SPACING.md }, errorTitle: { fontSize: FONT_SIZE.sm, fontWeight: '800' }, inlineActionButton: { minHeight: 44, alignSelf: 'flex-start', justifyContent: 'center' }, inlineAction: { fontSize: FONT_SIZE.sm, fontWeight: '800' },
  weatherEmoji: { fontSize: 52 }, temperature: { fontSize: 54, lineHeight: 58, fontWeight: '700' }, weatherPlace: { fontSize: FONT_SIZE.lg, fontWeight: '700' }, advice: { width: '100%', borderRadius: 18, padding: SPACING.md }, adviceTitle: { fontSize: FONT_SIZE.sm, fontWeight: '800' }, freshness: { fontSize: FONT_SIZE.xs, fontWeight: '700' },
  hoursPanel: { borderRadius: 24, borderWidth: 1, padding: SPACING.lg, gap: SPACING.lg, ...SHADOWS.sm }, chips: { gap: SPACING.sm }, chip: { minHeight: 44, borderRadius: 14, borderWidth: 1, paddingHorizontal: SPACING.md, alignItems: 'center', justifyContent: 'center' }, chipText: { fontSize: FONT_SIZE.sm, fontWeight: '700' }, quickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm }, quickButton: { minHeight: 44, borderRadius: 14, paddingHorizontal: SPACING.md, alignItems: 'center', justifyContent: 'center' }, quickText: { fontSize: FONT_SIZE.xs, fontWeight: '700' }, days: { gap: SPACING.sm }, dayCard: { borderRadius: 19, borderWidth: 1, padding: SPACING.md, gap: SPACING.sm }, dayHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: SPACING.sm }, dayTitle: { fontSize: FONT_SIZE.md, fontWeight: '800' }, napRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs }, times: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm }, timeStepper: { flex: 1, minWidth: 155, gap: SPACING.xs }, timeLabel: { fontSize: FONT_SIZE.xs, fontWeight: '700' }, timeControls: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs }, stepButton: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }, timeValue: { flex: 1, textAlign: 'center', fontSize: FONT_SIZE.md, fontWeight: '800', fontVariant: ['tabular-nums'] },
});
