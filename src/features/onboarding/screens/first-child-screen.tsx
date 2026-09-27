import React, { useRef, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Avatar } from '../../../components/ui/Avatar';
import { AVATAR_ASSET_OPTIONS } from '../../../constants/avatarAssets';
import { CHILD_COLORS, CONTENT_MAX_WIDTH, FONT_SIZE, SPACING } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { useChildrenStore } from '../../../stores/childrenStore';

export function FirstChildScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { colors } = useAppTheme();
  const addChild = useChildrenStore((state) => state.addChild);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [error, setError] = useState('');
  const saving = useRef(false);
  const contentWidth = Math.min(width - SPACING.lg * 2, CONTENT_MAX_WIDTH.sm);

  const save = () => {
    if (saving.current) return;
    const parsedAge = Number(age);
    if (!name.trim() || !Number.isInteger(parsedAge) || parsedAge < 1 || parsedAge > 18) {
      setError('Ajoutez un prénom et un âge entre 1 et 18 ans.');
      return;
    }
    saving.current = true;
    addChild({ name: name.trim(), age: parsedAge, avatar: AVATAR_ASSET_OPTIONS[0].id, color: CHILD_COLORS[0] });
    router.replace('/onboarding/complete');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={[styles.content, { width: contentWidth }]}>
          <View style={styles.progress} accessibilityLabel="Étape 3 sur 3, enfant">
            {[0, 1, 2].map((index) => <View key={index} style={[styles.progressBar, { backgroundColor: colors.action }]} />)}
          </View>
          <Text style={[styles.eyebrow, { color: colors.action }]}>3 sur 3 · Enfant</Text>
          <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>Ajoutez votre premier enfant</Text>
          <Text style={[styles.intro, { color: colors.textSecondary }]}>Un prénom et un âge suffisent pour adapter les routines et le calendrier.</Text>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.avatar, { backgroundColor: colors.timeSoft }]}><Avatar emoji={AVATAR_ASSET_OPTIONS[0].id} color={CHILD_COLORS[0]} size={64} /></View>
            <Text style={[styles.label, { color: colors.text }]}>Prénom</Text>
            <TextInput accessibilityLabel="Prénom de l’enfant" value={name} onChangeText={(value) => { setName(value); setError(''); }} placeholder="Ex. Emma" placeholderTextColor={colors.textLight} maxLength={30} style={[styles.input, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]} />
            <Text style={[styles.label, { color: colors.text }]}>Âge</Text>
            <TextInput accessibilityLabel="Âge de l’enfant" value={age} onChangeText={(value) => { setAge(value); setError(''); }} keyboardType="number-pad" placeholder="Ex. 6" placeholderTextColor={colors.textLight} maxLength={2} style={[styles.input, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]} />
            <Text style={[styles.hint, { color: colors.textSecondary }]}>L’illustration et la couleur pourront être changées plus tard.</Text>
            {error ? <Text accessibilityLiveRegion="assertive" style={[styles.error, { color: colors.attention }]}>{error}</Text> : null}
          </View>
          <View style={styles.spacer} />
          <Pressable accessibilityRole="button" onPress={save} style={[styles.primary, { backgroundColor: colors.action }]}><Text style={[styles.primaryText, { color: colors.background }]}>Créer le profil enfant</Text></Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Retour à la famille" onPress={() => router.replace('/onboarding/family')} style={styles.back}><Text style={{ color: colors.textSecondary }}>Retour</Text></Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 }, scroll: { flexGrow: 1, alignItems: 'center', padding: SPACING.lg },
  content: { flexGrow: 1, minHeight: 560, maxWidth: '100%', gap: SPACING.sm },
  progress: { flexDirection: 'row', gap: 7, marginTop: SPACING.lg, marginBottom: SPACING.xs },
  progressBar: { flex: 1, height: 6, borderRadius: 6 },
  eyebrow: { fontSize: FONT_SIZE.xs, fontWeight: '800', letterSpacing: 0.8 },
  title: { fontSize: FONT_SIZE.xxl, lineHeight: 37, fontWeight: '800' },
  intro: { fontSize: FONT_SIZE.sm, lineHeight: 22, marginBottom: SPACING.md },
  card: { borderWidth: 1, borderRadius: 20, padding: SPACING.lg, gap: SPACING.sm },
  avatar: { alignSelf: 'center', width: 88, height: 88, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.sm },
  label: { fontSize: FONT_SIZE.sm, fontWeight: '800' },
  input: { minHeight: 52, borderWidth: 1, borderRadius: 14, paddingHorizontal: SPACING.md, fontSize: FONT_SIZE.md },
  hint: { fontSize: FONT_SIZE.xs, lineHeight: 18 },
  error: { fontSize: FONT_SIZE.sm, lineHeight: 20 },
  spacer: { flexGrow: 1 },
  primary: { minHeight: 54, borderRadius: 15, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.md },
  primaryText: { fontSize: FONT_SIZE.md, fontWeight: '800' },
  back: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
});
