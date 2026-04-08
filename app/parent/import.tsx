import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useChildrenStore } from '../../src/stores/childrenStore';
import { useRoutineStore } from '../../src/stores/routineStore';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { decodeRoutine, importRoutine } from '../../src/services/sharing';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '../../src/constants/theme';
import { OpenMoji } from '../../src/components/ui/OpenMoji';

export default function ImportScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ code?: string }>();
  const { children } = useChildrenStore();
  const { addRoutine } = useRoutineStore();

  const [code, setCode] = useState('');
  const [selectedChildId, setSelectedChildId] = useState(children[0]?.id ?? '');
  const [preview, setPreview] = useState<ReturnType<typeof decodeRoutine>>(null);

  // Auto-fill from deep link
  useEffect(() => {
    if (params.code) {
      const decoded = decodeURIComponent(params.code);
      setCode(decoded);
      const result = decodeRoutine(decoded);
      if (result) setPreview(result);
    }
  }, [params.code]);

  const handleDecode = () => {
    const trimmed = code.trim();
    // Strip the routine://import/ prefix if present
    const cleaned = trimmed.replace(/^routine:\/\/import\//, '');
    const result = decodeRoutine(cleaned);
    if (!result) {
      Alert.alert('Code invalide', 'Ce code de partage n\'est pas valide.');
      return;
    }
    setPreview(result);
  };

  const handleImport = () => {
    if (!preview || !selectedChildId) return;
    const routineData = importRoutine(preview, selectedChildId);
    addRoutine(routineData);
    Alert.alert('Routine importée !', 'Vous pouvez la modifier dans l\'espace parent.');
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>📥 Importer une routine</Text>
        <Text style={styles.subtitle}>
          Collez le code de partage reçu d'un autre parent.
        </Text>

        <TextInput
          style={[styles.input, styles.codeInput]}
          value={code}
          onChangeText={setCode}
          placeholder="Collez le code ici..."
          placeholderTextColor={COLORS.textLight}
          multiline
          autoFocus
        />

        {!preview ? (
          <Button
            title="Décoder"
            onPress={handleDecode}
            variant="primary"
            size="md"
            color={COLORS.secondary}
            disabled={code.trim().length === 0}
          />
        ) : (
          <View style={styles.previewSection}>
            <Card color={preview.routine.color}>
              <View style={{ alignItems: 'center', marginBottom: SPACING.sm }}>
                <OpenMoji emoji={preview.routine.icon} size={48} />
              </View>
              <Text style={styles.previewName}>{preview.routine.name}</Text>
              <Text style={styles.previewSteps}>
                {preview.routine.steps.length} étapes
              </Text>
              {preview.routine.steps.map((step, i) => (
                <View key={i} style={[styles.previewStep, { flexDirection: 'row', alignItems: 'center', gap: 6 }]}>
                  <OpenMoji emoji={step.icon} size={20} />
                  <Text>{step.title}</Text>
                </View>
              ))}
            </Card>

            <Text style={styles.label}>Pour quel enfant ?</Text>
            <View style={styles.childrenRow}>
              {children.map((child) => (
                <TouchableOpacity
                  key={child.id}
                  style={[
                    styles.childChip,
                    selectedChildId === child.id && {
                      backgroundColor: child.color + '30',
                      borderColor: child.color,
                    },
                  ]}
                  onPress={() => setSelectedChildId(child.id)}
                >
                  <Text>{child.avatar} {child.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Button
              title="Importer cette routine"
              onPress={handleImport}
              variant="primary"
              size="lg"
              disabled={!selectedChildId}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  back: { fontSize: FONT_SIZE.md, color: COLORS.secondary, fontWeight: '600', marginBottom: SPACING.lg },
  title: { fontSize: FONT_SIZE.xl, fontWeight: '800', color: COLORS.text },
  subtitle: { fontSize: FONT_SIZE.md, color: COLORS.textSecondary, marginTop: SPACING.xs, marginBottom: SPACING.xl },
  input: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md,
    fontSize: FONT_SIZE.md, color: COLORS.text, borderWidth: 1, borderColor: COLORS.surfaceSecondary,
  },
  codeInput: { minHeight: 100, textAlignVertical: 'top', marginBottom: SPACING.md },
  label: { fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.textSecondary, marginBottom: SPACING.sm, marginTop: SPACING.lg },
  previewSection: { marginTop: SPACING.lg, gap: SPACING.md },
  previewIcon: { fontSize: 40, textAlign: 'center' },
  previewName: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.text, textAlign: 'center', marginTop: SPACING.xs },
  previewSteps: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, textAlign: 'center', marginBottom: SPACING.md },
  previewStep: { fontSize: FONT_SIZE.sm, color: COLORS.text, marginVertical: 2 },
  childrenRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  childChip: {
    paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full, borderWidth: 2, borderColor: COLORS.surfaceSecondary,
    backgroundColor: COLORS.surface,
  },
});
