import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  Platform,
  Modal,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { SquaresFour, X, Heart } from 'phosphor-react-native';
import { useChildrenStore } from '../../src/stores/childrenStore';
import { useRoutineStore } from '../../src/stores/routineStore';
import { Button } from '../../src/components/ui/Button';
import { BackButton } from '../../src/components/ui/BackButton';
import { EmojiPicker, ColorPicker } from '../../src/components/ui/Pickers';
import { Card } from '../../src/components/ui/Card';
import { ROUTINE_ICONS, STEP_ICONS } from '../../src/constants/icons';
import {
  COLORS,
  CHILD_COLORS,
  CATEGORY_CONFIG,
  SPACING,
  FONT_SIZE,
  RADIUS,
  SHADOWS,
} from '../../src/constants/theme';
import { RoutineCategory, RoutineStep } from '../../src/types';
import { generateId } from '../../src/utils/id';
import { OpenMoji } from '../../src/components/ui/OpenMoji';
import { backOrReplace } from '../../src/utils/navigation';
import { StepCatalogPicker } from '../../src/components/routine/StepCatalogPicker';
import { StepCatalogItem } from '../../src/constants/stepCatalog';

const CATEGORIES = Object.entries(CATEGORY_CONFIG) as [RoutineCategory, typeof CATEGORY_CONFIG[string]][];

export default function AddRoutineScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mergeIds?: string }>();
  const { children } = useChildrenStore();
  const { addRoutine, getRoutine: getRoutineById } = useRoutineStore();

  // Merge mode: pre-fill from selected routines
  const mergeSources = React.useMemo(() => {
    if (!params.mergeIds) return [];
    return params.mergeIds.split(',').map((id) => getRoutineById(id)).filter(Boolean) as import('../../src/types').Routine[];
  }, [params.mergeIds]);
  const isMerge = mergeSources.length >= 2;

  const mergedSteps = React.useMemo(() => {
    if (!isMerge) return [];
    let order = 0;
    return mergeSources.flatMap((r) =>
      r.steps.map((s) => ({ ...s, id: generateId(), order: order++ }))
    );
  }, [isMerge]);

  const mergeNames = isMerge ? mergeSources.map((r) => r.name).join(' + ') : '';

  const [childIds, setChildIds] = useState<string[]>(isMerge ? [mergeSources[0].childId] : children[0] ? [children[0].id] : []);

  const toggleChild = (id: string) => {
    setChildIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };
  const [name, setName] = useState(isMerge ? mergeNames : '');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState(isMerge ? mergeSources[0].icon : '🌅');
  const [color, setColor] = useState<string>(isMerge ? mergeSources[0].color : CHILD_COLORS[0]);
  const [category, setCategory] = useState<RoutineCategory>(isMerge ? mergeSources[0].category : 'morning');
  const [isFavorite, setIsFavorite] = useState(isMerge ? mergeSources[0].isFavorite ?? false : false);
  const [steps, setSteps] = useState<RoutineStep[]>(isMerge ? mergedSteps : []);

  // Step form
  const [showStepForm, setShowStepForm] = useState(false);
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [stepTitle, setStepTitle] = useState('');
  const [stepIcon, setStepIcon] = useState('🪥');
  const [stepDuration, setStepDuration] = useState('2');
  const [stepInstruction, setStepInstruction] = useState('');
  const [stepRequired, setStepRequired] = useState(true);
  const [stepMediaUri, setStepMediaUri] = useState('');
  const [showStepCatalog, setShowStepCatalog] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const initialSnapshot = useMemo(
    () =>
      JSON.stringify({
        childIds: isMerge ? [mergeSources[0].childId] : children[0] ? [children[0].id] : [],
        name: isMerge ? mergeNames : '',
        description: '',
        icon: isMerge ? mergeSources[0].icon : 'ðŸŒ…',
        color: isMerge ? mergeSources[0].color : CHILD_COLORS[0],
        category: isMerge ? mergeSources[0].category : 'morning',
        isFavorite: isMerge ? mergeSources[0].isFavorite ?? false : false,
        steps: isMerge ? mergedSteps : [],
        stepDraft: {
          title: '',
          icon: 'ðŸª¥',
          duration: '2',
          instruction: '',
          required: true,
          mediaUri: '',
          editingStepId: null,
          showStepForm: false,
        },
      }),
    [children, isMerge, mergeNames, mergeSources, mergedSteps],
  );

  const currentSnapshot = useMemo(
    () =>
      JSON.stringify({
        childIds,
        name,
        description,
        icon,
        color,
        category,
        isFavorite,
        steps,
        stepDraft: {
          title: stepTitle,
          icon: stepIcon,
          duration: stepDuration,
          instruction: stepInstruction,
          required: stepRequired,
          mediaUri: stepMediaUri,
          editingStepId,
          showStepForm,
        },
      }),
    [
      category,
      childIds,
      color,
      description,
      editingStepId,
      icon,
      isFavorite,
      name,
      showStepForm,
      stepDuration,
      stepIcon,
      stepInstruction,
      stepMediaUri,
      stepRequired,
      stepTitle,
      steps,
    ],
  );

  const hasUnsavedChanges = currentSnapshot !== initialSnapshot;

  const canSave = name.trim().length > 0 && childIds.length > 0 && steps.length > 0;

  const addStep = () => {
    if (!stepTitle.trim()) return;
    const step: RoutineStep = {
      id: generateId(),
      title: stepTitle.trim(),
      icon: stepIcon,
      color: color,
      durationMinutes: parseInt(stepDuration, 10) || 2,
      instruction: stepInstruction.trim(),
      isRequired: stepRequired,
      order: steps.length,
      mediaUri: stepMediaUri || undefined,
    };
    setSteps([...steps, step]);
    resetStepForm();
  };

  const resetStepForm = () => {
    setStepTitle('');
    setStepIcon('🪥');
    setStepDuration('2');
    setStepInstruction('');
    setStepRequired(true);
    setStepMediaUri('');
    setEditingStepId(null);
    setShowStepForm(false);
  };

  const editStep = (step: RoutineStep) => {
    setEditingStepId(step.id);
    setStepTitle(step.title);
    setStepIcon(step.icon);
    setStepDuration(String(step.durationMinutes));
    setStepInstruction(step.instruction);
    setStepRequired(step.isRequired);
    setStepMediaUri(step.mediaUri ?? '');
    setShowStepForm(true);
  };

  const saveEditedStep = () => {
    if (!stepTitle.trim() || !editingStepId) return;
    setSteps(steps.map((s) =>
      s.id === editingStepId
        ? {
            ...s,
            title: stepTitle.trim(),
            icon: stepIcon,
            durationMinutes: parseInt(stepDuration, 10) || 2,
            instruction: stepInstruction.trim(),
            isRequired: stepRequired,
            mediaUri: stepMediaUri || undefined,
          }
        : s
    ));
    resetStepForm();
  };

  const removeStep = (id: string) => {
    setSteps(steps.filter((s) => s.id !== id).map((s, i) => ({ ...s, order: i })));
  };

  const moveStep = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= steps.length) return;
    const newSteps = [...steps];
    [newSteps[index], newSteps[newIndex]] = [newSteps[newIndex], newSteps[index]];
    setSteps(newSteps.map((s, i) => ({ ...s, order: i })));
  };

  const addCatalogStep = (template: StepCatalogItem) => {
    const step: RoutineStep = {
      id: generateId(),
      title: template.title,
      icon: template.icon,
      color,
      durationMinutes: template.durationMinutes,
      instruction: template.instruction,
      isRequired: template.isRequired,
      order: steps.length,
    };

    setSteps((prev) => [...prev, step]);
  };

  const handleSelectCatalogStep = (template: StepCatalogItem) => {
    addCatalogStep(template);
    setShowStepCatalog(false);
  };

  const handleSave = () => {
    childIds.forEach((cid) => {
      addRoutine({
        childId: cid,
        name: name.trim(),
        description: description.trim(),
        icon,
        color,
        category,
        isFavorite,
        steps: steps.map((s) => ({ ...s, id: generateId() })),
        isActive: true,
      });
    });
    backOrReplace(router, '/parent');
  };

  const handleBack = () => {
    if (!hasUnsavedChanges) {
      backOrReplace(router, '/parent');
      return;
    }
    setShowExitConfirm(true);
  };

  const handleDiscardChanges = () => {
    setShowExitConfirm(false);
    backOrReplace(router, '/parent');
  };

  const handleSaveChanges = () => {
    setShowExitConfirm(false);
    handleSave();
  };

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined' || !hasUnsavedChanges) {
      return;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={handleBack}>
          <Text style={styles.back}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{isMerge ? '🔀 Fusionner des routines' : 'Nouvelle routine'}</Text>

        <BackButton style={styles.backButton} onPress={handleBack} />
        {/* Child selector */}
        <Text style={styles.label}>Pour quel(s) enfant(s) ?</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.row}>
            {children.map((child) => (
              <TouchableOpacity
                key={child.id}
                style={[
                  styles.childChip,
                  childIds.includes(child.id) && { backgroundColor: child.color + '30', borderColor: child.color },
                ]}
                onPress={() => toggleChild(child.id)}
              >
                <OpenMoji emoji={child.avatar} size={18} />
                <Text style={styles.childChipText}>{child.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Name */}
        <Text style={styles.label}>Nom de la routine</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Ex: Routine du matin"
          placeholderTextColor={COLORS.textLight}
          maxLength={40}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.inputMultiline]}
          value={description}
          onChangeText={setDescription}
          placeholder="Ex: Une routine simple pour bien démarrer la journée sans stress."
          placeholderTextColor={COLORS.textLight}
          multiline
          maxLength={140}
        />

        {/* Category */}
        <Text style={styles.label}>Moment</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.row}>
            {CATEGORIES.map(([key, config]) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.categoryChip,
                  category === key && { backgroundColor: config.color + '30', borderColor: config.color },
                ]}
                onPress={() => setCategory(key)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <OpenMoji emoji={config.icon} size={16} />
                  <Text>{config.label}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Icon */}
        <Text style={styles.label}>Icône</Text>
        <EmojiPicker emojis={ROUTINE_ICONS} selected={icon} onSelect={setIcon} size={44} />

        {/* Color */}
        <Text style={styles.label}>Couleur</Text>
        <ColorPicker colors={CHILD_COLORS} selected={color} onSelect={setColor} size={36} />

        {/* Favorite */}
        <TouchableOpacity
          style={[styles.favoriteButton, isFavorite && styles.favoriteButtonActive]}
          onPress={() => setIsFavorite(!isFavorite)}
          activeOpacity={0.7}
        >
          <Heart
            size={20}
            weight={isFavorite ? 'fill' : 'regular'}
            color={isFavorite ? COLORS.error : COLORS.textSecondary}
          />
          <Text style={[styles.favoriteButtonText, isFavorite && styles.favoriteButtonTextActive]}>
            {isFavorite ? 'Favoris' : 'Ajouter aux favoris'}
          </Text>
        </TouchableOpacity>

        {/* Steps */}
        <Text style={[styles.label, { marginTop: SPACING.xl }]}>
          Étapes ({steps.length})
        </Text>

        <TouchableOpacity
          onPress={() => setShowStepCatalog(true)}
          activeOpacity={0.85}
          style={[styles.catalogButton, { borderColor: color }]}
        >
          <SquaresFour size={18} weight="fill" color={color} />
          <Text style={[styles.catalogButtonText, { color }]}>Catalogue d'etapes</Text>
        </TouchableOpacity>

        {steps.map((step, index) => (
          <TouchableOpacity key={step.id} activeOpacity={0.7} onPress={() => editStep(step)}>
            <Card style={[styles.stepCard, editingStepId === step.id && styles.stepCardEditing]}>
              <View style={styles.stepRow}>
                <Text style={styles.stepOrder}>{index + 1}</Text>
                <OpenMoji emoji={step.icon} size={28} />
                <View style={styles.stepInfo}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepMeta}>
                    {step.durationMinutes} min · {step.isRequired ? 'Obligatoire' : 'Facultatif'}
                  </Text>
                </View>
                <View style={styles.stepActions}>
                  {index > 0 && (
                    <TouchableOpacity onPress={() => moveStep(index, -1)}>
                      <Text style={styles.moveBtn}>↑</Text>
                    </TouchableOpacity>
                  )}
                  {index < steps.length - 1 && (
                    <TouchableOpacity onPress={() => moveStep(index, 1)}>
                      <Text style={styles.moveBtn}>↓</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => removeStep(step.id)}>
                    <Text style={styles.deleteBtn}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        ))}

        {showStepForm ? (
          <Card style={styles.stepFormCard}>
            <Text style={styles.stepFormTitle}>{editingStepId ? 'Modifier l\'étape' : 'Nouvelle étape'}</Text>

            <TextInput
              style={styles.input}
              value={stepTitle}
              onChangeText={setStepTitle}
              placeholder="Ex: Se brosser les dents"
              placeholderTextColor={COLORS.textLight}
              maxLength={40}
              autoFocus
            />

            <Text style={styles.sublabel}>Icône</Text>
            <EmojiPicker emojis={STEP_ICONS} selected={stepIcon} onSelect={setStepIcon} size={40} />

            <Text style={styles.sublabel}>Durée (minutes)</Text>
            <TextInput
              style={[styles.input, styles.inputSmall]}
              value={stepDuration}
              onChangeText={(t) => setStepDuration(t.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              maxLength={2}
            />

            <Text style={styles.sublabel}>Consigne (optionnel)</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              value={stepInstruction}
              onChangeText={setStepInstruction}
              placeholder="Ex: N'oublie pas le dessus de la langue !"
              placeholderTextColor={COLORS.textLight}
              multiline
              maxLength={100}
            />

            <View style={styles.requiredRow}>
              <Text style={styles.sublabel}>Obligatoire ?</Text>
              <TouchableOpacity
                style={[styles.toggle, stepRequired && styles.toggleActive]}
                onPress={() => setStepRequired(!stepRequired)}
              >
                <Text>{stepRequired ? '✅ Oui' : '⬜ Non'}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sublabel}>Image (optionnel)</Text>
            <TouchableOpacity
              style={styles.mediaPicker}
              onPress={async () => {
                const result = await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: ['images'],
                  quality: 0.7,
                  allowsEditing: true,
                  base64: Platform.OS === 'web',
                });
                if (!result.canceled && result.assets[0]) {
                  const asset = result.assets[0];
                  const imageUri =
                    Platform.OS === 'web' && asset.base64
                      ? `data:${asset.mimeType ?? 'image/jpeg'};base64,${asset.base64}`
                      : asset.uri;
                  setStepMediaUri(imageUri);
                }
              }}
            >
              {stepMediaUri ? (
                <Image source={{ uri: stepMediaUri }} style={styles.mediaPreview} />
              ) : (
                <Text style={styles.mediaPlaceholder}>📷 Ajouter une image</Text>
              )}
            </TouchableOpacity>

            <View style={styles.stepFormActions}>
              <Button title="Annuler" onPress={resetStepForm} variant="ghost" size="sm" />
              <Button
                title={editingStepId ? 'Enregistrer' : 'Ajouter l\'étape'}
                onPress={editingStepId ? saveEditedStep : addStep}
                variant="primary"
                size="sm"
                disabled={!stepTitle.trim()}
              />
            </View>
          </Card>
        ) : (
          <Button
            title="+ Ajouter une étape"
            onPress={() => setShowStepForm(true)}
            variant="outline"
            size="md"
            color={COLORS.secondary}
            style={{ marginTop: SPACING.sm }}
          />
        )}

        {/* Save */}
        <View style={styles.saveArea}>
          <Button
            title="Enregistrer la routine"
            onPress={handleSave}
            variant="primary"
            size="lg"
            disabled={!canSave}
          />
        </View>
      </ScrollView>

      <Modal
        visible={showStepCatalog}
        transparent
        animationType="fade"
        onRequestClose={() => setShowStepCatalog(false)}
      >
        <View style={styles.catalogOverlay}>
          <SafeAreaView style={styles.catalogSafe}>
            <View style={styles.catalogSheet}>
              <View style={styles.catalogHeader}>
                <View style={styles.catalogHeaderText}>
                  <Text style={styles.catalogTitle}>Catalogue d'etapes</Text>
                  <Text style={styles.catalogSubtitle}>
                    Choisis une etape prete a l'emploi puis adapte-la si besoin.
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowStepCatalog(false)}
                  style={styles.catalogCloseButton}
                >
                  <X size={18} weight="bold" color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView
                contentContainerStyle={styles.catalogScroll}
                showsVerticalScrollIndicator={false}
              >
                <StepCatalogPicker accentColor={color} onSelect={handleSelectCatalogStep} />
              </ScrollView>
            </View>
          </SafeAreaView>
        </View>
      </Modal>

      <Modal
        visible={showExitConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowExitConfirm(false)}
      >
        <View style={styles.catalogOverlay}>
          <SafeAreaView style={styles.catalogSafe}>
            <View style={styles.exitSheet}>
              <Text style={styles.exitTitle}>Modifications non enregistrees</Text>
              <Text style={styles.exitText}>
                Tu peux enregistrer tes modifications maintenant ou les annuler pour revenir aux routines parent.
              </Text>
              {!canSave ? (
                <Text style={styles.exitHint}>
                  Complete d abord la routine pour pouvoir l enregistrer.
                </Text>
              ) : null}
              <View style={styles.exitActions}>
                <Button
                  title="Annuler les modifications"
                  onPress={handleDiscardChanges}
                  variant="ghost"
                  size="md"
                  color={COLORS.error}
                  style={styles.exitGhostButton}
                />
                <Button
                  title="Enregistrer modifications"
                  onPress={handleSaveChanges}
                  variant="primary"
                  size="md"
                  disabled={!canSave}
                  style={styles.exitPrimaryButton}
                />
              </View>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  back: { fontSize: 0, color: 'transparent', marginBottom: 0, height: 0 },
  backButton: { marginBottom: SPACING.lg },
  title: { fontSize: FONT_SIZE.xl, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.xl },
  label: {
    fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.textSecondary,
    marginBottom: SPACING.sm, marginTop: SPACING.md,
  },
  sublabel: {
    fontSize: FONT_SIZE.xs, fontWeight: '600', color: COLORS.textSecondary,
    marginBottom: SPACING.xs, marginTop: SPACING.md,
  },
  input: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md,
    fontSize: FONT_SIZE.md, color: COLORS.text, borderWidth: 1, borderColor: COLORS.surfaceSecondary,
  },
  inputSmall: { width: 80 },
  inputMultiline: { minHeight: 60, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: SPACING.sm },
  childChip: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.xs,
    paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full, borderWidth: 2, borderColor: COLORS.surfaceSecondary,
    backgroundColor: COLORS.surface,
  },
  childChipEmoji: { fontSize: 20 },
  childChipText: { fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.text },
  categoryChip: {
    paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full, borderWidth: 2, borderColor: COLORS.surfaceSecondary,
    backgroundColor: COLORS.surface,
  },
  stepCard: { marginBottom: SPACING.sm },
  stepCardEditing: { borderWidth: 2, borderColor: COLORS.secondary },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  stepOrder: { fontSize: FONT_SIZE.sm, fontWeight: '800', color: COLORS.textLight, width: 20 },
  stepIcon: { fontSize: 28 },
  stepInfo: { flex: 1 },
  stepTitle: { fontSize: FONT_SIZE.md, fontWeight: '600', color: COLORS.text },
  stepMeta: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary },
  stepActions: { flexDirection: 'row', gap: SPACING.sm },
  moveBtn: { fontSize: 18, color: COLORS.textSecondary, padding: 4 },
  deleteBtn: { fontSize: 16, color: COLORS.error, padding: 4 },
  stepFormCard: { marginTop: SPACING.sm },
  stepFormTitle: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  requiredRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SPACING.md },
  toggle: {
    paddingVertical: SPACING.xs, paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full, backgroundColor: COLORS.surfaceSecondary,
  },
  toggleActive: { backgroundColor: COLORS.successLight },
  stepFormActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: SPACING.sm, marginTop: SPACING.lg },
  mediaPicker: {
    borderWidth: 1, borderColor: COLORS.surfaceSecondary, borderRadius: RADIUS.lg,
    borderStyle: 'dashed', padding: SPACING.md, alignItems: 'center', marginTop: SPACING.xs,
  },
  mediaPreview: { width: 120, height: 120, borderRadius: RADIUS.md },
  mediaPlaceholder: { fontSize: FONT_SIZE.sm, color: COLORS.textLight },
  saveArea: { marginTop: SPACING.xl },
  catalogButton: {
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    minHeight: 50,
    borderWidth: 2,
    borderRadius: RADIUS.lg,
    backgroundColor: 'transparent',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  catalogButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
  },
  favoriteButton: {
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    minHeight: 50,
    borderWidth: 2,
    borderRadius: RADIUS.lg,
    backgroundColor: 'transparent',
    borderColor: COLORS.textLight,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  favoriteButtonActive: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.error + '10',
  },
  favoriteButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  favoriteButtonTextActive: {
    color: COLORS.error,
    fontWeight: '700',
  },
  catalogOverlay: {
    flex: 1,
    backgroundColor: 'rgba(20, 24, 38, 0.42)',
    padding: SPACING.lg,
  },
  catalogSafe: {
    flex: 1,
  },
  catalogSheet: {
    flex: 1,
    marginTop: SPACING.xl,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOWS.lg,
  },
  catalogHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  catalogHeaderText: {
    flex: 1,
    gap: 4,
  },
  catalogTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    color: COLORS.text,
  },
  catalogSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  catalogCloseButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.surfaceSecondary,
  },
  catalogScroll: {
    paddingBottom: SPACING.xl,
  },
  exitSheet: {
    marginTop: SPACING.xxl,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOWS.lg,
    gap: SPACING.md,
  },
  exitTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    color: COLORS.text,
  },
  exitText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  exitHint: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.error,
    fontWeight: '600',
  },
  exitActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
  },
  exitGhostButton: {
    minWidth: 220,
  },
  exitPrimaryButton: {
    minWidth: 220,
  },
});
