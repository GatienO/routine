import React, { useEffect, useState, useSyncExternalStore } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../ui/Button';
import { CONTENT_MAX_WIDTH, FONT_SIZE, SPACING } from '../../constants/theme';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useAppStore } from '../../stores/appStore';
import { useChildrenStore } from '../../stores/childrenStore';
import { useLocalProfileStore } from '../../stores/localProfileStore';

const subscribeAppHydration = (notify: () => void) => useAppStore.persist.onFinishHydration(notify);
const appHydratedSnapshot = () => useAppStore.persist.hasHydrated();

export function LocalProfileGate() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { colors, isDark } = useAppTheme();
  const profileHydrated = useLocalProfileStore((state) => state.hasHydrated);
  const profileName = useLocalProfileStore((state) => state.profileName);
  const onboardingActive = useLocalProfileStore((state) => state.onboardingActive);
  const initializeProfile = useLocalProfileStore((state) => state.initializeProfile);
  const renameProfile = useLocalProfileStore((state) => state.renameProfile);
  const appHydrated = useSyncExternalStore(subscribeAppHydration, appHydratedSnapshot, () => false);
  const parentPin = useAppStore((state) => state.parentPin);
  const childrenHydrated = useChildrenStore((state) => state.hasHydrated);
  const childCount = useChildrenStore((state) => state.children.length);
  const [draftName, setDraftName] = useState(profileName);

  useEffect(() => setDraftName(profileName), [profileName]);

  if (!profileHydrated || !appHydrated || !childrenHydrated) {
    return <View style={styles.loading}><Text style={{ color: colors.text }}>Chargement du profil…</Text></View>;
  }

  const trimmedName = draftName.trim();
  const canStart = !profileName && !parentPin && childCount === 0;
  const continueToNextStep = () => {
    if (!trimmedName) return;
    if (profileName) renameProfile(trimmedName);
    else initializeProfile(trimmedName, canStart);

    if (canStart || (onboardingActive && !parentPin)) {
      router.replace('/pin');
    } else if (onboardingActive && childCount === 0) {
      router.replace('/onboarding/child');
    } else {
      router.replace('/routines');
    }
  };

  const contentWidth = Math.min(width - SPACING.lg * 2, CONTENT_MAX_WIDTH.sm);
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={[styles.content, { width: contentWidth }]}>
          <View style={[styles.brand, { backgroundColor: colors.actionSoft }]}><Text style={[styles.brandText, { color: colors.action }]}>R··</Text></View>
          <View style={styles.progress} accessibilityLabel="Étape 1 sur 3, famille">
            <View style={[styles.progressBar, { backgroundColor: colors.action }]} />
            <View style={[styles.progressBar, { backgroundColor: colors.border }]} />
            <View style={[styles.progressBar, { backgroundColor: colors.border }]} />
          </View>
          <Text style={[styles.eyebrow, { color: colors.action }]}>1 sur 3 · Famille</Text>
          <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>Bienvenue dans Routine</Text>
          <Text style={[styles.intro, { color: colors.textSecondary }]}>Des repères simples pour votre famille. Vos données restent sur cet appareil.</Text>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.label, { color: colors.text }]}>Nom de votre famille</Text>
            <TextInput
              accessibilityLabel="Nom de votre famille"
              style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
              value={draftName}
              onChangeText={setDraftName}
              placeholder="Ex. Famille Martin"
              placeholderTextColor={colors.textLight}
              maxLength={40}
              returnKeyType="done"
              onSubmitEditing={continueToNextStep}
            />
            <Text style={[styles.hint, { color: colors.textSecondary }]}>Ce nom sert à reconnaître votre espace local.</Text>
          </View>
          <View style={styles.spacer} />
          <Button title="Continuer" onPress={continueToNextStep} variant="primary" size="lg" color={isDark ? colors.actionSoft : colors.action} disabled={!trimmedName} />
          <Text style={[styles.footer, { color: colors.textSecondary }]}>Aucun compte à créer</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { flexGrow: 1, alignItems: 'center', paddingVertical: SPACING.lg, paddingHorizontal: SPACING.lg },
  content: { flexGrow: 1, minHeight: 560, maxWidth: '100%', gap: SPACING.sm },
  brand: { width: 52, height: 52, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  brandText: { fontSize: 21, fontWeight: '900' },
  progress: { flexDirection: 'row', gap: 7, marginTop: SPACING.xl, marginBottom: SPACING.xs },
  progressBar: { flex: 1, height: 6, borderRadius: 6 },
  eyebrow: { fontSize: FONT_SIZE.xs, fontWeight: '800', letterSpacing: 0.8 },
  title: { fontSize: FONT_SIZE.xxl, lineHeight: 37, fontWeight: '800', marginTop: 2 },
  intro: { fontSize: FONT_SIZE.sm, lineHeight: 22, marginBottom: SPACING.md },
  card: { borderWidth: 1, borderRadius: 20, padding: SPACING.lg, gap: SPACING.sm },
  label: { fontSize: FONT_SIZE.sm, fontWeight: '800' },
  input: { minHeight: 52, borderWidth: 1, borderRadius: 14, paddingHorizontal: SPACING.md, fontSize: FONT_SIZE.md },
  hint: { fontSize: FONT_SIZE.xs, lineHeight: 18 },
  spacer: { flexGrow: 1 },
  footer: { textAlign: 'center', fontSize: FONT_SIZE.xs, marginTop: SPACING.sm },
});
