import React, { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { CaretDown, CaretUp, House, SquaresFour, X } from 'phosphor-react-native';
import { useRoutineStore } from '../../src/stores/routineStore';
import { useChildrenStore } from '../../src/stores/childrenStore';
import { Button } from '../../src/components/ui/Button';
import { BackButton } from '../../src/components/ui/BackButton';
import { ColorSelectionField, IconSelectionField, CategorySelectionField } from '../../src/components/ui/Pickers';
import { Card } from '../../src/components/ui/Card';
import { Avatar } from '../../src/components/ui/Avatar';
import { OpenMoji } from '../../src/components/ui/OpenMoji';
import { showAppConfirm } from '../../src/components/feedback/AppFeedbackProvider';
import { StepCatalogPicker } from '../../src/components/routine/StepCatalogPicker';
import { ICON_PICKER_GROUPS, ROUTINE_ICONS, STEP_ICONS } from '../../src/constants/icons';
import { StepCatalogItem } from '../../src/constants/stepCatalog';
import { CATEGORY_CONFIG, CHILD_COLORS, COLORS, FONT_SIZE, RADIUS, SHADOWS, SPACING } from '../../src/constants/theme';
import { RoutineCategory, RoutineStep } from '../../src/types';
import { formatChildName } from '../../src/utils/children';
import { generateId } from '../../src/utils/id';
import { backOrReplace } from '../../src/utils/navigation';

const CATEGORIES = Object.entries(CATEGORY_CONFIG) as [RoutineCategory, typeof CATEGORY_CONFIG[string]][];

export default function EditRoutineScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const { children } = useChildrenStore();
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

  const [childId, setChildId] = useState(routine.childId);
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
  const [stepMinDuration, setStepMinDuration] = useState('0');
  const [stepInstruction, setStepInstruction] = useState('');
  const [stepRequired, setStepRequired] = useState(true);
  const [stepMediaUri, setStepMediaUri] = useState('');
  const [showStepCatalog, setShowStepCatalog] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const initialSnapshot = useMemo(
    () =>
      JSON.stringify({
        childId: routine.childId,
        name: routine.name,
        description: routine.description ?? '',
        icon: routine.icon,
        color: routine.color,
        category: routine.category,
        steps: routine.steps,
        stepDraft: {
          title: '',
          icon: '🪥',
          duration: '2',
          minDuration: '0',
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
        childId,
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
          minDuration: stepMinDuration,
          instruction: stepInstruction,
          required: stepRequired,
          mediaUri: stepMediaUri,
          editingStepId,
          showNewStepForm,
        },
      }),
    [
      childId,
      category,
      color,
      description,
      editingStepId,
      icon,
      name,
      showNewStepForm,
      stepDuration,
      stepMinDuration,
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
    setStepMinDuration('0');
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
    setStepMinDuration(String(step.minimumDurationMinutes ?? 0));
    setStepInstruction(step.instruction);
    setStepRequired(step.isRequired);
    setStepMediaUri(step.mediaUri ?? '');
  };

  const addStep = () => {
    if (!stepTitle.trim()) {
      return;
    }

    const step: RoutineStep = {
      id: generateId(),
      title: stepTitle.trim(),
      icon: stepIcon,
      color,
      durationMinutes: Math.max(0, parseInt(stepDuration, 10) || 0),
      minimumDurationMinutes: Math.max(0, parseInt(stepMinDuration, 10) || 0),
      instruction: stepInstruction.trim(),
      isRequired: stepRequired,
      order: steps.length,
      mediaUri: stepMediaUri || undefined,
    };

    setSteps((prev) => [...prev, step]);
    resetStepForm();
  };

  const saveEditedStep = () => {
    if (!stepTitle.trim() || !editingStepId) {
      return;
    }

    setSteps((prev) =>
      prev.map((step) =>
        step.id === editingStepId
          ? {
              ...step,
              title: stepTitle.trim(),
              icon: stepIcon,
              durationMinutes: Math.max(0, parseInt(stepDuration, 10) || 0),
              minimumDurationMinutes: Math.max(0, parseInt(stepMinDuration, 10) || 0),
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
    setSteps((prev) => prev.filter((step) => step.id !== id).map((step, index) => ({ ...step, order: index })));
    if (editingStepId === id) {
      resetStepForm();
    }
  };

  const moveStep = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= steps.length) {
      return;
    }

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
      minimumDurationMinutes: template.minimumDurationMinutes ?? 0,
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
      childId,
      name: name.trim(),
      description: description.trim(),
      icon,
      color,
      category,
      isFavorite: routine.isFavorite ?? false,
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

  const handleDelete = async () => {
    const confirmed = await showAppConfirm({
      title: 'Supprimer',
      message: `Supprimer "${routine.name}" ?`,
      tone: 'danger',
      icon: '🗑️',
      confirmLabel: 'Supprimer',
      cancelLabel: 'Annuler',
      confirmKind: 'danger',
    });

    if (!confirmed) {
      return;
    }

    removeRoutine(routine.id);
    backOrReplace(router, '/parent');
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
      <Text style={styles.stepEditorTitle}>{mode === 'edit' ? "Modifier l'etape" : 'Nouvelle etape'}</Text>

      <TextInput
        style={styles.input}
        value={stepTitle}
        onChangeText={setStepTitle}
        placeholder="Titre de l'etape"
        placeholderTextColor={COLORS.textLight}
        maxLength={40}
        autoFocus
      />

      <Text style={styles.sublabel}>Icone</Text>
      <IconSelectionField
        emojis={STEP_ICONS}
        groups={ICON_PICKER_GROUPS}
        selected={stepIcon}
        onSelect={setStepIcon}
        title="Choisir l'icône de l'étape"
        previewSize={60}
      />

      <View style={styles.durationRow}>
        <View style={styles.durationField}>
          <Text style={styles.sublabel}>Duree (minutes)</Text>
          <TextInput
            style={[styles.input, styles.inputSmall]}
            value={stepDuration}
            onChangeText={(value) => setStepDuration(value.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad"
            maxLength={2}
          />
        </View>
        <View style={styles.durationField}>
          <Text style={styles.sublabel}>Temps minimum</Text>
          <TextInput
            style={[styles.input, styles.inputSmall]}
            value={stepMinDuration}
            onChangeText={(value) => setStepMinDuration(value.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad"
            maxLength={2}
          />
        </View>
      </View>

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
          onPress={() => setStepRequired((prev) => !prev)}
          activeOpacity={0.85}
        >
          <Text>{stepRequired ? 'Oui' : 'Non'}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sublabel}>Image (optionnel)</Text>
      <TouchableOpacity style={styles.mediaPicker} onPress={pickStepImage} activeOpacity={0.85}>
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
      <View style={styles.header}>
        <View style={styles.headerSide}>
          <BackButton onPress={handleBack} />
        </View>
        <Text style={styles.headerTitle}>Modifier la routine</Text>
        <View style={[styles.headerSide, styles.headerSideRight]}>
          <TouchableOpacity
            onPress={() => router.replace('/parent')}
            style={styles.headerIconButton}
            activeOpacity={0.8}
          >
            <House size={24} weight="bold" color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.label}>Nom de la routine</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} maxLength={40} />

        <Text style={styles.label}>Pour quel(s) enfant(s) ?</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.row}>
            {children.map((child) => (
              <TouchableOpacity
                key={child.id}
                style={[
                  styles.childChip,
                  childId === child.id && {
                    backgroundColor: `${child.color}30`,
                    borderColor: child.color,
                  },
                ]}
                onPress={() => setChildId(child.id)}
                activeOpacity={0.85}
              >
                <Avatar emoji={child.avatar} color={child.color} size={24} avatarConfig={child.avatarConfig} />
                <Text style={styles.childChipText}>{formatChildName(child.name)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

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

        <View style={styles.selectionRow}>
          <View style={styles.selectionItem}>
            <Text style={styles.label}>Moment</Text>
            <CategorySelectionField
              options={CATEGORIES.map(([key, config]) => ({ key, ...config }))}
              selected={category}
              onSelect={(value) => setCategory(value as RoutineCategory)}
              title="Choisir le moment de la routine"
            />
          </View>
          <View style={styles.selectionItem}>
            <Text style={styles.label}>Icône</Text>
            <IconSelectionField
              emojis={ROUTINE_ICONS}
              groups={ICON_PICKER_GROUPS}
              selected={icon}
              onSelect={setIcon}
              title="Choisir l'icône de la routine"
            />
          </View>
          <View style={styles.selectionItem}>
            <Text style={styles.label}>Couleur</Text>
            <ColorSelectionField
              colors={CHILD_COLORS}
              selected={color}
              onSelect={setColor}
              title="Choisir la couleur de la routine"
            />
          </View>
        </View>

        <View style={styles.stepsHeader}>
          <Text style={[styles.label, styles.stepsLabel]}>Étapes ({steps.length})</Text>
          <View style={styles.stepButtonsRow}>
            <Button
              title="+ Ajouter une étape"
              onPress={openNewStepForm}
              variant="outline"
              size="md"
              color={COLORS.secondary}
              style={styles.stepActionButton}
            />
            <TouchableOpacity
              onPress={() => setShowStepCatalog(true)}
              activeOpacity={0.85}
              style={styles.catalogButton}
            >
              <SquaresFour size={18} weight="fill" color="#A14D00" />
              <Text style={styles.catalogButtonText}>Catalogue d'etapes</Text>
            </TouchableOpacity>
          </View>
        </View>

        {steps.map((step, index) => {
          const isOpen = editingStepId === step.id;

          return (
            <Card key={step.id} style={[styles.stepCard, isOpen && styles.stepCardOpen]}>
              <TouchableOpacity activeOpacity={0.85} onPress={() => toggleEditStep(step)} style={styles.stepHeader}>
                <View style={styles.stepHeaderMain}>
                  <Text style={styles.stepOrder}>{index + 1}</Text>
                  <OpenMoji emoji={step.icon} size={28} />
                  <View style={styles.stepInfo}>
                    <Text style={styles.stepTitle}>{step.title}</Text>
                    <Text style={styles.stepMeta}>
                      {step.durationMinutes} min · {step.isRequired ? 'Obligatoire' : 'Facultatif'}
                    </Text>
                    {step.minimumDurationMinutes ? (
                      <Text style={styles.stepMeta}>Minimum {step.minimumDurationMinutes} min</Text>
                    ) : null}
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
          <Card style={styles.newStepCard}>{renderStepEditor('new')}</Card>
        ) : null}

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
                  activeOpacity={0.85}
                >
                  <X size={18} weight="bold" color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={styles.catalogScroll} showsVerticalScrollIndicator={false}>
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
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerBackButton: {
    marginTop: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm,
  },
  headerSide: {
    width: 56,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerSideRight: {
    alignItems: 'flex-end',
  },
  headerTitle: {
    flex: 1,
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
  },
  headerIconButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  scroll: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
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
  inputSmall: {
    width: 80,
  },
  durationRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    flexWrap: 'wrap',
  },
  durationField: {
    alignItems: 'flex-start',
  },
  inputMultiline: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  childChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
    borderWidth: 2,
    borderColor: COLORS.surfaceSecondary,
    backgroundColor: COLORS.surface,
  },
  childChipText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  selectionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.xl,
    flexWrap: 'wrap',
  },
  selectionItem: {
    alignItems: 'flex-start',
    minWidth: 84,
  },
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
  stepsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.md,
    marginTop: SPACING.xl,
    marginBottom: SPACING.sm,
    flexWrap: 'wrap',
  },
  stepsLabel: {
    marginTop: 0,
    marginBottom: 0,
  },
  stepButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flexWrap: 'wrap',
  },
  stepActionButton: {
    alignSelf: 'flex-start',
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
    width: 22,
    fontSize: FONT_SIZE.sm,
    fontWeight: '800',
    color: COLORS.textLight,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    gap: SPACING.sm,
    minHeight: 50,
    borderWidth: 1,
    borderRadius: RADIUS.full,
    backgroundColor: '#FFF3E0',
    borderColor: 'rgba(161, 77, 0, 0.12)',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  catalogButtonText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '800',
    color: '#A14D00',
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
