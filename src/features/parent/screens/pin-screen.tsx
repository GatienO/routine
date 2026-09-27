import React, { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { BackHandler, Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Backspace, LockSimple } from 'phosphor-react-native';
import { useAppStore } from '../../../stores/appStore';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { useFocusRing } from '../../../hooks/useFocusRing';
import { ThemeModeControl } from '../../../components/ui/ThemeModeControl';
import { consumePinOrigin, parentPinDestination, pinReturnDestination } from '../../../utils/pinNavigation';

const DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '<'];
const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;

const subscribeHydration = (notify: () => void) => useAppStore.persist.onFinishHydration(notify);
const isHydrated = () => useAppStore.persist.hasHydrated();

export default function PinScreen() {
  const hydrated = useSyncExternalStore(subscribeHydration, isHydrated, () => false);
  const { colors } = useAppTheme();
  // A direct link must wait for the saved PIN before choosing creation vs entry.
  if (!hydrated) return <View style={styles.safe}><Text accessibilityLiveRegion="polite" style={{ color: colors.text }}>Chargement…</Text></View>;
  return <PinContent />;
}

function PinContent() {
  const { focusStyle: backFocus, ...backFocusProps } = useFocusRing();
  const { focusStyle: cancelFocus, ...cancelFocusProps } = useFocusRing();
  const [focusedDigit, setFocusedDigit] = useState<string | null>(null);
  const router = useRouter();
  const params = useLocalSearchParams<{ redirect?: string | string[]; returnTo?: string | string[] }>();
  const { parentPin, isParentMode, setParentPin, setParentMode } = useAppStore();
  const { colors } = useAppTheme();
  const { width } = useWindowDimensions();
  const [pin, setPin] = useState('');
  const [isSetup] = useState(!parentPin);
  const [confirmPin, setConfirmPin] = useState<string | null>(null);
  const [error, setError] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completed = useRef(false);
  const backButton = useRef<React.ElementRef<typeof Pressable>>(null);
  const returnTo = pinReturnDestination(first(params.returnTo), isParentMode);
  const destination = parentPinDestination(first(params.redirect));
  const originLabel = returnTo.startsWith('/activities') || returnTo.startsWith('/explore') ? 'Activités' : returnTo.startsWith('/parent') ? 'Parent' : returnTo.startsWith('/child') ? 'l’écran précédent' : 'Routines';

  useEffect(() => {
    if (Platform.OS === 'web') backButton.current?.focus();
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, []);

  const cancel = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    if (consumePinOrigin() === returnTo && router.canGoBack()) router.back();
    else router.replace(returnTo as '/routines');
  }, [returnTo, router]);

  useFocusEffect(useCallback(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => { cancel(); return true; });
    return () => subscription.remove();
  }, [cancel]));

  const handleDigit = useCallback((digit: string) => {
    if (error || completed.current) return;
    if (digit === '<') { setPin((value) => value.slice(0, -1)); return; }
    if (!/^\d$/.test(digit) || pin.length >= 4) return;
    const next = pin + digit;
    setPin(next);
    if (next.length !== 4) return;
    if (isSetup && confirmPin === null) { setConfirmPin(next); setPin(''); return; }
    if (next === (isSetup ? confirmPin : parentPin)) {
      completed.current = true;
      if (isSetup) setParentPin(next);
      setParentMode(true);
      consumePinOrigin();
      router.replace(destination as '/parent');
      return;
    }
    setError(isSetup ? 'Les codes ne correspondent pas. Réessayez.' : 'Code incorrect. Réessayez.');
    timer.current = setTimeout(() => {
      setPin('');
      if (isSetup) setConfirmPin(null);
      setError('');
    }, isSetup ? 1000 : 800);
  }, [confirmPin, destination, error, isSetup, parentPin, pin, router, setParentMode, setParentPin]);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const onKey = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey || event.repeat) return;
      if (event.key === 'Escape') { event.preventDefault(); cancel(); }
      else if (/^\d$/.test(event.key) || event.key === 'Backspace') {
        event.preventDefault(); handleDigit(event.key === 'Backspace' ? '<' : event.key);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [cancel, handleDigit]);

  const title = isSetup ? (confirmPin === null ? 'Créez votre code' : 'Confirmez votre code') : 'Espace parent';
  return (
    <SafeAreaView style={styles.safe}>

      <View style={styles.header}>
        <Pressable {...backFocusProps} ref={backButton} onPress={cancel} accessibilityRole="button" accessibilityLabel={`Annuler et revenir à ${originLabel}`} style={[styles.back, backFocus, { backgroundColor: colors.surface }]}>
          <ArrowLeft size={22} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.textSecondary }]}>Retour à {originLabel}</Text>
        <ThemeModeControl />
      </View>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={[styles.card, width >= 720 && { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, padding: 32 }]}>
          <View style={[styles.lock, { backgroundColor: colors.actionSoft }]}><LockSimple size={30} weight="regular" color={colors.action} /></View>
          <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{isSetup ? (confirmPin === null ? 'Choisissez un code à 4 chiffres.' : 'Entrez le même code pour confirmer.') : 'Entrez votre code à 4 chiffres.'}</Text>
          <View accessible accessibilityLabel={`${pin.length} chiffres saisis sur 4`} style={styles.dots}>
            {[0, 1, 2, 3].map((index) => <View key={index} style={[styles.dot, { borderColor: error ? colors.error : colors.action, backgroundColor: pin.length > index ? (error ? colors.error : colors.action) : 'transparent' }]} />)}
          </View>
          <Text accessibilityLiveRegion="assertive" style={[styles.error, { color: colors.error }]}>{error || ' '}</Text>
          <View style={styles.keypad}>
            {DIGITS.map((digit, index) => digit === '' ? <View key={index} style={styles.key} /> : (
              <Pressable key={index} onFocus={() => setFocusedDigit(digit)} onBlur={() => setFocusedDigit(null)} onPress={() => handleDigit(digit)} accessibilityRole="button" accessibilityLabel={digit === '<' ? 'Effacer le dernier chiffre' : digit} disabled={Boolean(error)} style={({ pressed }) => [styles.key, styles.keySurface, focusedDigit === digit && Platform.OS === 'web' && { outlineStyle: 'solid', outlineWidth: 2, outlineOffset: 2, outlineColor: colors.action }, { backgroundColor: pressed ? colors.actionSoft : width >= 720 ? colors.background : colors.surface, borderColor: colors.border }]}>
                {digit === '<' ? <Backspace size={25} weight="regular" color={colors.text} /> : <Text style={[styles.keyText, { color: colors.text }]}>{digit}</Text>}
              </Pressable>
            ))}
          </View>
          <Pressable {...cancelFocusProps} onPress={cancel} accessibilityRole="button" style={[styles.cancel, cancelFocus]}><Text style={[styles.cancelText, { color: colors.textSecondary }]}>Annuler</Text></Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { width: '100%', maxWidth: 1320, alignSelf: 'center', minHeight: 68, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: { width: 44, height: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: 14, fontWeight: '600' },
  scroll: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  card: { width: '100%', maxWidth: 400, padding: 16, borderRadius: 22, alignItems: 'center', flexShrink: 0 },
  lock: { width: 64, height: 64, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '700', textAlign: 'center' },
  subtitle: { fontSize: 14, lineHeight: 22, textAlign: 'center', marginTop: 8 },
  dots: { flexDirection: 'row', gap: 16, marginTop: 24 },
  dot: { width: 16, height: 16, borderRadius: 8, borderWidth: 2 },
  error: { minHeight: 40, paddingTop: 8, fontSize: 14, textAlign: 'center' },
  keypad: { width: '100%', maxWidth: 336, flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  key: { flexBasis: '30%', flexGrow: 1, minHeight: 64, alignItems: 'center', justifyContent: 'center' },
  keySurface: { borderRadius: 14, borderWidth: 1 },
  keyText: { fontSize: 26, fontWeight: '600' },
  cancel: { minHeight: 44, minWidth: 100, marginTop: 16, alignItems: 'center', justifyContent: 'center' },
  cancelText: { fontSize: 14, fontWeight: '600' },
});
