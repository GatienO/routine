import React from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useRouter } from 'expo-router';
import { CONTENT_MAX_WIDTH, FONT_SIZE, SPACING } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { useChildrenStore } from '../../../stores/childrenStore';
import { useLocalProfileStore } from '../../../stores/localProfileStore';
import { formatChildName } from '../../../utils/children';

export function OnboardingCompleteScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { colors } = useAppTheme();
  const profileName = useLocalProfileStore((state) => state.profileName);
  const completeOnboarding = useLocalProfileStore((state) => state.completeOnboarding);
  const firstChild = useChildrenStore((state) => state.children[0]);
  const contentWidth = Math.min(width - SPACING.lg * 2, CONTENT_MAX_WIDTH.sm);

  const finish = () => {
    completeOnboarding();
    router.replace('/routines');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.content, { width: contentWidth }]}>
          <View style={[styles.symbol, { backgroundColor: colors.actionSoft }]}><Text style={styles.symbolText}>🌿</Text></View>
          <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>Votre espace est prêt</Text>
          <Text style={[styles.intro, { color: colors.textSecondary }]}>{profileName} et {firstChild ? formatChildName(firstChild.name) : 'votre enfant'} peuvent maintenant retrouver leurs repères sur l’accueil.</Text>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.family, { color: colors.text }]}>{profileName}</Text>
            <Text style={[styles.detail, { color: colors.textSecondary }]}>1 enfant · Code Parent activé</Text>
          </View>
          <View style={styles.spacer} />
          <Pressable accessibilityRole="button" onPress={finish} style={[styles.primary, { backgroundColor: colors.action }]}><Text style={[styles.primaryText, { color: colors.background }]}>Ouvrir l’accueil</Text></Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 }, scroll: { flexGrow: 1, alignItems: 'center', padding: SPACING.lg },
  content: { flexGrow: 1, minHeight: 520, maxWidth: '100%', gap: SPACING.md },
  symbol: { width: 88, height: 88, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginTop: SPACING.xl },
  symbolText: { fontSize: 43 },
  title: { fontSize: FONT_SIZE.xxl, lineHeight: 37, fontWeight: '800', marginTop: SPACING.sm },
  intro: { fontSize: FONT_SIZE.sm, lineHeight: 22 },
  card: { borderWidth: 1, borderRadius: 20, padding: SPACING.lg, marginTop: SPACING.md },
  family: { fontSize: FONT_SIZE.lg, fontWeight: '800' },
  detail: { fontSize: FONT_SIZE.sm, marginTop: SPACING.xs },
  spacer: { flexGrow: 1 },
  primary: { minHeight: 54, borderRadius: 15, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.md },
  primaryText: { fontSize: FONT_SIZE.md, fontWeight: '800' },
});
