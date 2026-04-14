import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Avatar } from '../../src/components/ui/Avatar';
import { AppPageHeader } from '../../src/components/ui/AppPageHeader';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { OpenMoji } from '../../src/components/ui/OpenMoji';
import { COLORS, FONT_SIZE, RADIUS, SPACING } from '../../src/constants/theme';
import {
  showAppAlert,
  showAppToast,
} from '../../src/components/feedback/AppFeedbackProvider';
import { importRoutine, parseRoutineImportInput } from '../../src/services/sharing';
import { useChildrenStore } from '../../src/stores/childrenStore';
import { useRoutineStore } from '../../src/stores/routineStore';
import { backOrReplace } from '../../src/utils/navigation';
import { formatChildName } from '../../src/utils/children';
import { formatDuration } from '../../src/utils/date';

export default function ImportScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ code?: string }>();
  const { children } = useChildrenStore();
  const { addRoutine } = useRoutineStore();

  const [input, setInput] = useState('');
  const [selectedChildIds, setSelectedChildIds] = useState<string[]>(children[0] ? [children[0].id] : []);
  const [preview, setPreview] = useState<ReturnType<typeof parseRoutineImportInput>['shareable']>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [source, setSource] = useState<ReturnType<typeof parseRoutineImportInput>['source']>('unknown');

  useEffect(() => {
    if (!params.code) return;

    const initialValue = decodeURIComponent(params.code);
    setInput(initialValue);
    const parsed = parseRoutineImportInput(initialValue);
    setPreview(parsed.shareable);
    setErrors(parsed.errors);
    setSource(parsed.source);
  }, [params.code]);

  useEffect(() => {
    if (children.length === 0) {
      setSelectedChildIds([]);
      return;
    }

    setSelectedChildIds((previous) => {
      const stillValid = previous.filter((childId) => children.some((child) => child.id === childId));
      return stillValid.length > 0 ? stillValid : [children[0].id];
    });
  }, [children]);

  const handleDecode = () => {
    const parsed = parseRoutineImportInput(input);
    setPreview(parsed.shareable);
    setErrors(parsed.errors);
    setSource(parsed.source);

    if (!parsed.shareable && parsed.errors.length > 0) {
      showAppAlert({
        title: 'Import impossible',
        message: parsed.errors[0],
        tone: 'danger',
        icon: '🧩',
      });
    }
  };

  const handleImport = () => {
    if (!preview || selectedChildIds.length === 0) return;

    selectedChildIds.forEach((childId) => {
      addRoutine(importRoutine(preview, childId));
    });

    showAppToast({
      title: 'Routine importee',
      message: `La routine a ete ajoutee pour ${selectedChildIds.length} enfant${selectedChildIds.length > 1 ? 's' : ''}.`,
      tone: 'success',
      icon: '🎉',
    });
    backOrReplace(router, '/parent');
  };

  const handleInputChange = (value: string) => {
    setInput(value);
    setPreview(null);
    setErrors([]);
    setSource('unknown');
  };

  const toggleChild = (childId: string) => {
    setSelectedChildIds((previous) =>
      previous.includes(childId)
        ? previous.filter((id) => id !== childId)
        : [...previous, childId],
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <AppPageHeader
          title="Importer une routine"
          onBack={() => backOrReplace(router, '/parent')}
          onHome={() => router.replace('/parent')}
        />

        {children.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>👨‍👩‍👧</Text>
            <Text style={styles.emptyTitle}>Aucun enfant configure</Text>
            <Text style={styles.emptyMessage}>
              Creez d abord un profil enfant avant d importer une routine.
            </Text>
            <Button
              title="Ajouter un enfant"
              onPress={() => router.push('/parent/add-child')}
              variant="primary"
              size="lg"
              color={COLORS.primary}
            />
          </View>
        ) : (
          <>
            <Text style={styles.subtitle}>
              Collez un lien profond, un code de partage ou le contenu JSON exporte.
              La validation est stricte avant import.
            </Text>

            <TextInput
              style={[styles.input, styles.codeInput]}
              value={input}
              onChangeText={handleInputChange}
              placeholder="routine://import/... ou JSON..."
              placeholderTextColor={COLORS.textLight}
              multiline
              autoFocus
            />

            <Button
              title="Verifier et previsualiser"
              onPress={handleDecode}
              variant="primary"
              size="md"
              color={COLORS.secondary}
              disabled={input.trim().length === 0}
            />

            {errors.length > 0 ? (
              <Card style={styles.errorCard}>
                <Text style={styles.errorTitle}>Validation echouee</Text>
                {errors.map((error) => (
                  <Text key={error} style={styles.errorText}>
                    • {error}
                  </Text>
                ))}
              </Card>
            ) : null}

            {preview ? (
              <View style={styles.previewSection}>
                <Card color={preview.routine.color}>
                  <View style={styles.previewHeader}>
                    <View style={styles.previewIconWrap}>
                      <OpenMoji emoji={preview.routine.icon} size={48} />
                    </View>
                    <View style={styles.previewTextBlock}>
                      <Text style={styles.previewName}>{preview.routine.name}</Text>
                      <Text style={styles.previewMeta}>
                        Source : {source === 'deep-link' ? 'lien' : source === 'json' ? 'json' : 'code'}
                      </Text>
                      <Text style={styles.previewMeta}>
                        {preview.routine.steps.length} etape{preview.routine.steps.length > 1 ? 's' : ''}
                      </Text>
                    </View>
                  </View>

                  {preview.routine.description ? (
                    <Text style={styles.previewDescription}>{preview.routine.description}</Text>
                  ) : null}

                  <View style={styles.stepsList}>
                    {preview.routine.steps.map((step, index) => (
                      <View key={`${step.title}-${index}`} style={styles.previewStepRow}>
                        <OpenMoji emoji={step.icon} size={20} />
                        <Text style={styles.previewStepText}>
                          {step.title} • {formatDuration(step.durationMinutes)}
                        </Text>
                        {step.minimumDurationMinutes ? (
                          <Text style={styles.previewStepText}>
                            Minimum {formatDuration(step.minimumDurationMinutes)}
                          </Text>
                        ) : null}
                      </View>
                    ))}
                  </View>
                </Card>

                <Text style={styles.label}>Importer pour quels enfants ?</Text>
                <View style={styles.childrenRow}>
                  {children.map((child) => (
                    <TouchableOpacity
                      key={child.id}
                      style={[
                        styles.childChip,
                        selectedChildIds.includes(child.id) && {
                          backgroundColor: `${child.color}26`,
                          borderColor: child.color,
                        },
                      ]}
                      onPress={() => toggleChild(child.id)}
                      activeOpacity={0.85}
                    >
                      <Avatar
                        emoji={child.avatar}
                        color={child.color}
                        size={32}
                        avatarConfig={child.avatarConfig}
                      />
                      <Text style={styles.childChipText}>{formatChildName(child.name)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Button
                  title={`Importer pour ${selectedChildIds.length} enfant${selectedChildIds.length > 1 ? 's' : ''}`}
                  onPress={handleImport}
                  variant="primary"
                  size="lg"
                  color={COLORS.secondary}
                  disabled={selectedChildIds.length === 0}
                />
              </View>
            ) : null}
          </>
        )}
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
  backButton: {
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    marginBottom: SPACING.xl,
    lineHeight: 22,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl,
    gap: SPACING.lg,
  },
  emptyIcon: {
    fontSize: 64,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    maxWidth: 320,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  codeInput: {
    minHeight: 140,
    textAlignVertical: 'top',
    marginBottom: SPACING.md,
  },
  errorCard: {
    marginTop: SPACING.md,
    backgroundColor: '#FFF1F0',
  },
  errorTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
    color: '#B3261E',
    marginBottom: SPACING.xs,
  },
  errorText: {
    fontSize: FONT_SIZE.sm,
    color: '#7A1D17',
    lineHeight: 20,
  },
  previewSection: {
    marginTop: SPACING.lg,
    gap: SPACING.md,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  previewIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${COLORS.secondary}10`,
  },
  previewTextBlock: {
    flex: 1,
    gap: 2,
  },
  previewName: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    color: COLORS.text,
  },
  previewMeta: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  previewDescription: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  stepsList: {
    gap: SPACING.xs,
  },
  previewStepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  previewStepText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
    fontWeight: '600',
  },
  label: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  childrenRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  childChip: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  childChipText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.text,
  },
});
