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
  Modal,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { CaretDown, CaretUp, SquaresFour, X } from 'phosphor-react-native';
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

export default function EditRoutineScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const { getRoutine, updateRoutine, removeRoutine } = useRoutineStore();

  const routine = getRoutine(params.id ?? '');
  if (!routine) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text>Routine non trouvee</Text>
          <BackButton style={styles.centerBackButton} onPress={() => backOrReplace(router, '/parent')} />
        </View>
      </SafeAreaView>
    );
  }

  const [name, setName] = useState(routine.name);
  const [description, setDescription] = useState(routine.description ?? '');
  const [icon, setIcon] = useState(routine.icon);
  const [color, setColor] = useState(routine.color);
  const [category, setCategory] = useState<RoutineCategory>(routine.category);
  const [steps, setSteps] = useState<RoutineStep[]>([...routine.steps]);

  const [showNewStepForm, setShowNewStepForm] = useState(false);
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
        name: routine.name,
        description: routine.description ?? '',
        icon: routine.icon,
        color: routine.color,
        category: routine.category,
        steps: routine.steps,
        stepDraft: {
          title: '',
          icon: 'ðŸª¥',
          duration: '2',
          instruction: '',
          required: true,
          mediaUri: '',
          editingStepId: null,
          showNewStepForm: false,
        },
      }),
    [routine],
  );

  const currentSnapshot = useMemo(
    () =>
      JSON.stringify({
        name,
        description,
        icon,
        color,
        category,
        steps,
        stepDraft: {
          title: stepTitle,
          icon: stepIcon,
          duration: stepDuration,
          instruction: stepInstruction,
          required: stepRequired,
          mediaUri: stepMediaUri,
          editingStepId,
          showNewStepForm,
        },
      }),
    [
      category,
      color,
      description,
      editingStepId,
      icon,
      name,
      showNewStepForm,
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

  const canSave = name.trim().length > 0 && steps.length > 0;

  const resetStepForm = () => {
    setStepTitle('');
    setStepIcon('🪥');
    setStepDuration('2');
    setStepInstruction('');
    setStepRequired(true);
    setStepMediaUri('');
    setEditingStepId(null);
    setShowNewStepForm(false);
  };

  const openNewStepForm = () => {
    resetStepForm();
    setShowNewStepForm(true);
  };

  const toggleEditStep = (step: RoutineStep) => {
    if (editingStepId === step.id) {
      resetStepForm();
      return;
    }

    setEditingStepId(step.id);
    setShowNewStepForm(false);
    setStepTitle(step.title);
    setStepIcon(step.icon);
    setStepDuration(String(step.durationMinutes));
    setStepInstruction(step.instruction);
    setStepRequired(step.isRequired);
    setStepMediaUri(step.mediaUri ?? '');
  };

  const addStep = () => {
    if (!stepTitle.trim()) return;

    const step: RoutineStep = {
      id: generateId(),
      title: stepTitle.trim(),
      icon: stepIcon,
      color,
      durationMinutes: parseInt(stepDuration, 10) || 2,
      instruction: stepInstruction.trim(),
      isRequired: stepRequired,
      order: steps.length,
      mediaUri: stepMediaUri || undefined,
    };

    setSteps([...steps, step]);
    resetStepForm();
  };

  const saveEditedStep = () => {
    if (!stepTitle.trim() || !editingStepId) return;

    setSteps(
      steps.map((step) =>
        step.id === editingStepId
          ? {
              ...step,
              title: stepTitle.trim(),
              icon: stepIcon,
              durationMinutes: parseInt(stepDuration, 10) || 2,
              instruction: stepInstruction.trim(),
              isRequired: stepRequired,
              mediaUri: stepMediaUri || undefined,
            }
          : step,
      ),
    );

    resetStepForm();
  };

  const removeStep = (id: string) => {
    setSteps(steps.filter((step) => step.id !== id).map((step, index) => ({ ...step, order: index })));
    if (editingStepId === id) {
      resetStepForm();
    }
  };

  const moveStep = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= steps.length) return;

    const nextSteps = [...steps];
    [nextSteps[index], nextSteps[newIndex]] = [nextSteps[newIndex], nextSteps[index]];
    setSteps(nextSteps.map((step, order) => ({ ...step, order })));
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
    updateRoutine(routine.id, {
      name: name.trim(),
      description: description.trim(),
      icon,
      color,
      category,
      steps,
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

  const handleDelete = () => {
    Alert.alert('Supprimer', `Supprimer "${routine.name}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: () => {
          removeRoutine(routine.id);
          backOrReplace(router, '/parent');
        },
      },
    ]);
  };

  const pickStepImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets[0]) {
      setStepMediaUri(result.assets[0].uri);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined' || !hasUnsavedChanges) {
      return;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const renderStepEditor = (mode: 'edit' | 'new') => (
    <View style={styles.stepEditor}>
      <Text style={styles.stepEditorTitle}>
        {mode === 'edit' ? "Modifier l'etape" : 'Nouvelle etape'}
      </Text>

      <TextInput
        style={styles.input}
        value={stepTitle}
        onChangeText={setStepTitle}
        placeholder="Titre de l'etape"
        placeholderTextColor={COLORS.textLight}
        maxLength={40}
        autoFocus={mode === 'edit'}
      />

      <Text style={styles.sublabel}>Icone</Text>
      <EmojiPicker emojis={STEP_ICONS} selected={stepIcon} onSelect={setStepIcon} size={40} />

      <Text style={styles.sublabel}>Duree (minutes)</Text>
      <TextInput
        style={[styles.input, styles.inputSmall]}
        value={stepDuration}
        onChangeText={(value) => setStepDuration(value.replace(/[^0-9]/g, ''))}
        keyboardType="number-pad"
        maxLength={2}
      />

      <Text style={styles.sublabel}>Consigne</Text>
      <TextInput
        style={[styles.input, styles.inputMultiline]}
        value={stepInstruction}
        onChangeText={setStepInstruction}
        placeholder="Consigne optionnelle"
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
          <Text>{stepRequired ? 'Oui' : 'Non'}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sublabel}>Image (optionnel)</Text>
      <TouchableOpacity style={styles.mediaPicker} onPress={pickStepImage}>
        {stepMediaUri ? (
          <Image source={{ uri: stepMediaUri }} style={styles.mediaPreview} />
        ) : (
          <Text style={styles.mediaPlaceholder}>Ajouter une image</Text>
        )}
      </TouchableOpacity>

      <View style={styles.stepEditorActions}>
        <Button title="Annuler" onPress={resetStepForm} variant="ghost" size="sm" />
        <Button
          title={mode === 'edit' ? "Modifier l'etape" : "Ajouter l'etape"}
          onPress={mode === 'edit' ? saveEditedStep : addStep}
          variant="primary"
          size="sm"
          disabled={!stepTitle.trim()}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <BackButton style={styles.backButton} onPress={handleBack} />
        <Text style={styles.title}>Modifier la routine</Text>

        <Text style={styles.label}>Nom</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} maxLength={40} />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.inputMultiline]}
          value={description}
          onChangeText={setDescription}
          placeholder="Resume court de la routine"
          placeholderTextColor={COLORS.textLight}
          multiline
          maxLength={140}
        />

        <Text style={styles.label}>Moment</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.row}>
            {CATEGORIES.map(([key, config]) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.categoryChip,
                  category === key && {
                    backgroundColor: config.color + '30',
                    borderColor: config.color,
                  },
                ]}
                onPress={() => setCategory(key)}
              >
                <View style={styles.categoryChipContent}>
                  <OpenMoji emoji={config.icon} size={16} />
                  <Text>{config.label}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <Text style={styles.label}>Icone</Text>
        <EmojiPicker emojis={ROUTINE_ICONS} selected={icon} onSelect={setIcon} size={44} />

        <Text style={styles.label}>Couleur</Text>
        <ColorPicker colors={CHILD_COLORS} selected={color} onSelect={setColor} size={36} />

        <Text style={[styles.label, styles.stepsLabel]}>Etapes ({steps.length})</Text>

        <TouchableOpacity
          onPress={() => setShowStepCatalog(true)}
          activeOpacity={0.85}
          style={[styles.catalogButton, { borderColor: color }]}
        >
          <SquaresFour size={18} weight="fill" color={color} />
          <Text style={[styles.catalogButtonText, { color }]}>Catalogue d'etapes</Text>
        </TouchableOpacity>

        {steps.map((step, index) => {
          const isOpen = editingStepId === step.id;

          return (
            <Card
              key={step.id}
              style={[styles.stepCard, isOpen && styles.stepCardOpen]}
            >
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => toggleEditStep(step)}
                style={styles.stepHeader}
              >
                <View style={styles.stepHeaderMain}>
                  <Text style={styles.stepOrder}>{index + 1}</Text>
                  <OpenMoji emoji={step.icon} size={28} />
                  <View style={styles.stepInfo}>
                    <Text style={styles.stepTitle}>{step.title}</Text>
                    <Text style={styles.stepMeta}>
                      {step.durationMinutes} min · {step.isRequired ? 'Obligatoire' : 'Facultatif'}
                    </Text>
                  </View>
                </View>

                <View style={styles.stepHeaderActions}>
                  {index > 0 ? (
                    <TouchableOpacity onPress={() => moveStep(index, -1)} hitSlop={8}>
                      <Text style={styles.moveBtn}>↑</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.actionSpacer} />
                  )}

                  {index < steps.length - 1 ? (
                    <TouchableOpacity onPress={() => moveStep(index, 1)} hitSlop={8}>
                      <Text style={styles.moveBtn}>↓</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.actionSpacer} />
                  )}

                  <TouchableOpacity onPress={() => removeStep(step.id)} hitSlop={8}>
                    <Text style={styles.deleteBtn}>✕</Text>
                  </TouchableOpacity>

                  <View style={styles.caretWrap}>
                    {isOpen ? (
                      <CaretUp size={18} weight="bold" color={COLORS.textSecondary} />
                    ) : (
                      <CaretDown size={18} weight="bold" color={COLORS.textSecondary} />
                    )}
                  </View>
                </View>
              </TouchableOpacity>

              {isOpen ? renderStepEditor('edit') : null}
            </Card>
          );
        })}

        {showNewStepForm ? (
          <Card style={styles.newStepCard}>
            {renderStepEditor('new')}
          </Card>
        ) : (
          <Button
            title="+ Ajouter une etape"
            onPress={openNewStepForm}
            variant="outline"
            size="md"
            color={COLORS.secondary}
            style={styles.addStepButton}
          />
        )}

        <View style={styles.mainActions}>
          <Button title="Enregistrer" onPress={handleSave} variant="primary" size="lg" disabled={!canSave} />
          <Button title="Supprimer" onPress={handleDelete} variant="ghost" size="sm" color={COLORS.error} />
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  centerBackButton: { marginTop: SPACING.lg },
  backButton: { marginBottom: SPACING.lg },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.xl,
  },
  label: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  sublabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    marginTop: SPACING.md,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.surfaceSecondary,
  },
  inputSmall: { width: 80 },
  inputMultiline: { minHeight: 60, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: SPACING.sm },
  categoryChip: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
    borderWidth: 2,
    borderColor: COLORS.surfaceSecondary,
    backgroundColor: COLORS.surface,
  },
  categoryChipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stepsLabel: {
    marginTop: SPACING.xl,
  },
  stepCard: {
    marginBottom: SPACING.sm,
    overflow: 'hidden',
  },
  stepCardOpen: {
    borderWidth: 2,
    borderColor: COLORS.secondary,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  stepHeaderMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  stepOrder: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '800',
    color: COLORS.textLight,
    width: 22,
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.text,
  },
  stepMeta: {
    marginTop: 2,
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  stepHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  moveBtn: {
    fontSize: 18,
    color: COLORS.textSecondary,
    padding: 4,
  },
  deleteBtn: {
    fontSize: 16,
    color: COLORS.error,
    padding: 4,
  },
  actionSpacer: {
    width: 18,
  },
  caretWrap: {
    marginLeft: 2,
    padding: 2,
  },
  stepEditor: {
    marginTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceSecondary,
    paddingTop: SPACING.md,
  },
  stepEditorTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  requiredRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  toggle: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceSecondary,
  },
  toggleActive: {
    backgroundColor: COLORS.successLight,
  },
  mediaPicker: {
    borderWidth: 1,
    borderColor: COLORS.surfaceSecondary,
    borderRadius: RADIUS.lg,
    borderStyle: 'dashed',
    padding: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  mediaPreview: {
    width: 120,
    height: 120,
    borderRadius: RADIUS.md,
  },
  mediaPlaceholder: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textLight,
  },
  stepEditorActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
  },
  newStepCard: {
    marginTop: SPACING.sm,
  },
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
  addStepButton: {
    marginTop: SPACING.sm,
  },
  mainActions: {
    marginTop: SPACING.xl,
    gap: SPACING.md,
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
