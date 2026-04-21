import React, { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Modal,
  Platform,
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
import { SquaresFour, X } from 'phosphor-react-native';
import { useChildrenStore } from '../../src/stores/childrenStore';
import { useRoutineStore } from '../../src/stores/routineStore';
import { Avatar } from '../../src/components/ui/Avatar';
import { Button } from '../../src/components/ui/Button';
import { AppPageHeader } from '../../src/components/ui/AppPageHeader';
import { ColorSelectionField, IconSelectionField, CategorySelectionField } from '../../src/components/ui/Pickers';
import { Card } from '../../src/components/ui/Card';
import { OpenMoji } from '../../src/components/ui/OpenMoji';
import { StepCatalogPicker } from '../../src/components/routine/StepCatalogPicker';
import { ICON_PICKER_GROUPS, ROUTINE_ICONS, STEP_ICONS } from '../../src/constants/icons';
import { StepCatalogItem } from '../../src/constants/stepCatalog';
import { CATEGORY_CONFIG, CHILD_COLORS, COLORS, FONT_SIZE, RADIUS, SHADOWS, SPACING } from '../../src/constants/theme';
import { Routine, RoutineCategory, RoutineStep } from '../../src/types';
import { formatChildName } from '../../src/utils/children';
import { formatDuration } from '../../src/utils/date';
import { generateId } from '../../src/utils/id';
import { backOrReplace } from '../../src/utils/navigation';
import { showAppAlert } from '../../src/components/feedback/AppFeedbackProvider';

const CATEGORIES = Object.entries(CATEGORY_CONFIG) as [RoutineCategory, typeof CATEGORY_CONFIG[string]][];

export default function AddRoutineScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mergeIds?: string }>();
  const { children } = useChildrenStore();
  const { addRoutine, getRoutine: getRoutineById } = useRoutineStore();

  const mergeSources = useMemo(() => {
    if (!params.mergeIds) {
      return [];
    }

    return params.mergeIds
      .split(',')
      .map((id) => getRoutineById(id))
      .filter(Boolean) as Routine[];
  }, [getRoutineById, params.mergeIds]);

  const isMerge = mergeSources.length >= 2;

  const mergedSteps = useMemo(() => {
    if (!isMerge) {
      return [];
    }

    let order = 0;
    return mergeSources.flatMap((routine) =>
      routine.steps.map((step) => ({
        ...step,
        id: generateId(),
        order: order++,
      })),
    );
  }, [isMerge, mergeSources]);

  const mergeNames = isMerge ? mergeSources.map((routine) => routine.name).join(' + ') : '';

  const [childIds, setChildIds] = useState<string[]>(
    isMerge ? [mergeSources[0].childId] : children[0] ? [children[0].id] : [],
  );
  const [name, setName] = useState(isMerge ? mergeNames : '');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState(isMerge ? mergeSources[0].icon : '🌅');
  const [color, setColor] = useState<string>(isMerge ? mergeSources[0].color : CHILD_COLORS[0]);
  const [category, setCategory] = useState<RoutineCategory>(isMerge ? mergeSources[0].category : 'morning');
  const [isFavorite] = useState(isMerge ? mergeSources[0].isFavorite ?? false : false);
  const [steps, setSteps] = useState<RoutineStep[]>(isMerge ? mergedSteps : []);

  const [showStepForm, setShowStepForm] = useState(false);
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
  const [nameTouched, setNameTouched] = useState(false);
  const [stepTitleTouched, setStepTitleTouched] = useState(false);
  const [stepDurationTouched, setStepDurationTouched] = useState(false);

  const initialSnapshot = useMemo(
    () =>
      JSON.stringify({
        childIds: isMerge ? [mergeSources[0].childId] : children[0] ? [children[0].id] : [],
        name: isMerge ? mergeNames : '',
        description: '',
        icon: isMerge ? mergeSources[0].icon : '🌅',
        color: isMerge ? mergeSources[0].color : CHILD_COLORS[0],
        category: isMerge ? mergeSources[0].category : 'morning',
        isFavorite: isMerge ? mergeSources[0].isFavorite ?? false : false,
        steps: isMerge ? mergedSteps : [],
        stepDraft: {
          title: '',
          icon: '🪥',
          duration: '2',
          minDuration: '0',
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
          minDuration: stepMinDuration,
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
  const canSave = name.trim().length > 0 && childIds.length > 0 && steps.length > 0;

  const toggleChild = (id: string) => {
    setChildIds((prev) => (prev.includes(id) ? prev.filter((childId) => childId !== id) : [...prev, id]));
  };

  const resetStepForm = () => {
    setStepTitle('');
    setStepIcon('🪥');
    setStepDuration('2');
    setStepMinDuration('0');
    setStepInstruction('');
    setStepRequired(true);
    setStepMediaUri('');
    setEditingStepId(null);
    setShowStepForm(false);
    setStepTitleTouched(false);
    setStepDurationTouched(false);
  };

  const addStep = () => {
    if (!stepTitle.trim()) {
      return;
    }

    const durationMinutes = Math.max(0, parseFloat(stepDuration.replace(',', '.')) || 0);
    const minimumDurationMinutes = Math.max(0, parseFloat(stepMinDuration.replace(',', '.')) || 0);

    const step: RoutineStep = {
      id: generateId(),
      title: stepTitle.trim(),
      icon: stepIcon,
      color,
      durationMinutes,
      minimumDurationMinutes,
      instruction: stepInstruction.trim(),
      isRequired: stepRequired,
      order: steps.length,
      mediaUri: stepMediaUri || undefined,
    };

    setSteps((prev) => [...prev, step]);
    resetStepForm();
  };

  const editStep = (step: RoutineStep) => {
    setEditingStepId(step.id);
    setStepTitle(step.title);
    setStepIcon(step.icon);
    setStepDuration(String(step.durationMinutes));
    setStepMinDuration(String(step.minimumDurationMinutes ?? 0));
    setStepInstruction(step.instruction);
    setStepRequired(step.isRequired);
    setStepMediaUri(step.mediaUri ?? '');
    setShowStepForm(true);
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
              durationMinutes: Math.max(0, parseFloat(stepDuration.replace(',', '.')) || 0),
              minimumDurationMinutes: Math.max(0, parseFloat(stepMinDuration.replace(',', '.')) || 0),
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
  };

  const moveStep = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= steps.length) {
      return;
    }

    const reorderedSteps = [...steps];
    [reorderedSteps[index], reorderedSteps[newIndex]] = [reorderedSteps[newIndex], reorderedSteps[index]];
    setSteps(reorderedSteps.map((step, order) => ({ ...step, order })));
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
    childIds.forEach((childId) => {
      addRoutine({
        childId,
        name: name.trim(),
        description: description.trim(),
        icon,
        color,
        category,
        isFavorite,
        steps: steps.map((step) => ({ ...step, id: generateId() })),
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
    if (children.length > 0) {
      return;
    }

    showAppAlert({
      title: 'Enfant requis',
      message: 'Créez d abord un enfant avant de créer une routine.',
      tone: 'warning',
      icon: '👶',
    });
    router.replace('/parent/add-child');
  }, [children.length, router]);

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
      <View style={styles.header}>
        <AppPageHeader
          title={isMerge ? 'Fusionner des routines' : 'Nouvelle routine'}
          onBack={handleBack}
          onHome={() => router.replace('/parent')}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.label}>
          Nom de la routine
          <Text style={styles.requiredAsterisk}> *</Text>
        </Text>
        <TextInput
          style={[styles.input, nameTouched && name.trim().length === 0 && styles.inputError]}
          value={name}
          onChangeText={setName}
          onBlur={() => setNameTouched(true)}
          placeholder="Ex: Routine du matin"
          placeholderTextColor={COLORS.textLight}
          maxLength={40}
        />

        <Text style={styles.label}>
          Pour quel(s) enfant(s)
          <Text style={styles.requiredAsterisk}> *</Text>
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.row}>
            {children.map((child) => (
              <TouchableOpacity
                key={child.id}
                style={[
                  styles.childChip,
                  childIds.includes(child.id) && {
                    backgroundColor: `${child.color}30`,
                    borderColor: child.color,
                  },
                ]}
                onPress={() => toggleChild(child.id)}
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
          placeholder="Ex: Une routine simple pour bien démarrer la journée sans stress."
          placeholderTextColor={COLORS.textLight}
          multiline
          maxLength={140}
        />

        <View style={styles.selectionRow}>
          <View style={styles.selectionItem}>
            <Text style={styles.label}>
              Moment
              <Text style={styles.requiredAsterisk}> *</Text>
            </Text>
            <CategorySelectionField
              options={CATEGORIES.map(([key, config]) => ({ key, ...config }))}
              selected={category}
              onSelect={(value) => setCategory(value as RoutineCategory)}
              title="Choisir le moment de la routine"
            />
          </View>
          <View style={styles.selectionItem}>
            <Text style={styles.label}>
              Icône
              <Text style={styles.requiredAsterisk}> *</Text>
            </Text>
            <IconSelectionField
              emojis={ROUTINE_ICONS}
              groups={ICON_PICKER_GROUPS}
              selected={icon}
              onSelect={setIcon}
              title="Choisir l'icône de la routine"
            />
          </View>
          <View style={styles.selectionItem}>
            <Text style={styles.label}>
              Couleur
              <Text style={styles.requiredAsterisk}> *</Text>
            </Text>
            <ColorSelectionField
              colors={CHILD_COLORS}
              selected={color}
              onSelect={setColor}
              title="Choisir la couleur de la routine"
            />
          </View>
        </View>

        <View style={styles.stepsHeader}>
          <Text style={[styles.label, styles.stepsLabel]}>
            Étapes
            <Text style={styles.requiredAsterisk}> *</Text> ({steps.length})
          </Text>
          <View style={styles.stepButtonsRow}>
            <Button
              title="+ Ajouter une étape"
              onPress={() => setShowStepForm(true)}
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
              <Text style={styles.catalogButtonText}>Catalogue d'étapes</Text>
            </TouchableOpacity>
          </View>
        </View>

        {steps.map((step, index) => (
          <TouchableOpacity key={step.id} activeOpacity={0.72} onPress={() => editStep(step)}>
            <Card style={[styles.stepCard, editingStepId === step.id && styles.stepCardEditing]}>
              <View style={styles.stepRow}>
                <Text style={styles.stepOrder}>{index + 1}</Text>
                <OpenMoji emoji={step.icon} size={28} />
                <View style={styles.stepInfo}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepMeta}>
                    {formatDuration(step.durationMinutes)} · {step.isRequired ? 'Obligatoire' : 'Facultatif'}
                  </Text>
                  {step.minimumDurationMinutes ? (
                    <Text style={styles.stepMeta}>Minimum {formatDuration(step.minimumDurationMinutes)}</Text>
                  ) : null}
                </View>
                <View style={styles.stepActions}>
                  {index > 0 ? (
                    <TouchableOpacity onPress={() => moveStep(index, -1)} hitSlop={6}>
                      <Text style={styles.moveBtn}>↑</Text>
                    </TouchableOpacity>
                  ) : null}
                  {index < steps.length - 1 ? (
                    <TouchableOpacity onPress={() => moveStep(index, 1)} hitSlop={6}>
                      <Text style={styles.moveBtn}>↓</Text>
                    </TouchableOpacity>
                  ) : null}
                  <TouchableOpacity onPress={() => removeStep(step.id)} hitSlop={6}>
                    <Text style={styles.deleteBtn}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        ))}

        {showStepForm ? (
          <Card style={styles.stepFormCard}>
            <Text style={styles.stepFormTitle}>{editingStepId ? "Modifier l'étape" : 'Nouvelle étape'}</Text>

            <Text style={styles.sublabel}>
              Titre de l'étape
              <Text style={styles.requiredAsterisk}> *</Text>
            </Text>

            <TextInput
              style={[styles.input, stepTitleTouched && stepTitle.trim().length === 0 && styles.inputError]}
              value={stepTitle}
              onChangeText={setStepTitle}
              onBlur={() => setStepTitleTouched(true)}
              placeholder="Ex: Se brosser les dents"
              placeholderTextColor={COLORS.textLight}
              maxLength={40}
              autoFocus
            />

            <Text style={styles.sublabel}>Icône</Text>
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
                <Text style={styles.sublabel}>
                  Durée (minutes)
                  <Text style={styles.requiredAsterisk}> *</Text>
                </Text>
                <TextInput
                  style={[styles.input, styles.inputSmall, stepDurationTouched && stepDuration.trim().length === 0 && styles.inputError]}
                  value={stepDuration}
                  onChangeText={(value) => setStepDuration(value.replace(/[^0-9.,]/g, ''))}
                  onBlur={() => setStepDurationTouched(true)}
                  keyboardType="number-pad"
                  maxLength={5}
                />
              </View>
              <View style={styles.durationField}>
                <Text style={styles.sublabel}>Temps minimum</Text>
                <TextInput
                  style={[styles.input, styles.inputSmall]}
                  value={stepMinDuration}
                  onChangeText={(value) => setStepMinDuration(value.replace(/[^0-9.,]/g, ''))}
                  keyboardType="number-pad"
                  maxLength={5}
                />
              </View>
            </View>

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
                onPress={() => setStepRequired((prev) => !prev)}
                activeOpacity={0.85}
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
              activeOpacity={0.85}
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
                title={editingStepId ? 'Enregistrer' : "Ajouter l'étape"}
                onPress={editingStepId ? saveEditedStep : addStep}
                variant="primary"
                size="sm"
                disabled={!stepTitle.trim()}
              />
            </View>
          </Card>
        ) : null}

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
              {!canSave ? (
                <Text style={styles.exitHint}>Complete d'abord la routine pour pouvoir l'enregistrer.</Text>
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
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xs,
  },
  scroll: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  label: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  requiredAsterisk: {
    color: COLORS.error,
    fontWeight: '800',
  },
  stepsLabel: {
    marginTop: 0,
    marginBottom: 0,
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
  sublabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
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
  inputError: {
    borderColor: COLORS.error,
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
    borderColor: COLORS.border,
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
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  categoryChipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
  },
  stepCardEditing: {
    borderWidth: 2,
    borderColor: COLORS.secondary,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  stepOrder: {
    width: 20,
    fontSize: FONT_SIZE.sm,
    fontWeight: '800',
    color: COLORS.textLight,
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  stepMeta: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  stepActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
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
  stepFormCard: {
    marginTop: SPACING.sm,
  },
  stepFormTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  requiredRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
  },
  toggle: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
    backgroundColor: `${COLORS.textLight}14`,
  },
  toggleActive: {
    backgroundColor: COLORS.successLight,
  },
  mediaPicker: {
    marginTop: SPACING.xs,
    alignItems: 'center',
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    borderStyle: 'dashed',
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
  stepFormActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
  },
  saveArea: {
    marginTop: SPACING.xl,
  },
  catalogButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    gap: SPACING.sm,
    minHeight: 50,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderWidth: 1,
    borderRadius: RADIUS.full,
    borderColor: 'rgba(161, 77, 0, 0.12)',
    backgroundColor: '#FFF3E0',
  },
  catalogButtonText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '800',
    color: '#A14D00',
  },
  catalogOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    padding: SPACING.lg,
  },
  catalogSafe: {
    flex: 1,
  },
  catalogSheet: {
    flex: 1,
    marginTop: SPACING.xl,
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.background,
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
    borderColor: COLORS.border,
  },
  catalogScroll: {
    paddingBottom: SPACING.xl,
  },
  exitSheet: {
    marginTop: SPACING.xxl,
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.background,
    gap: SPACING.md,
    ...SHADOWS.lg,
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
    fontWeight: '600',
    color: COLORS.error,
  },
  exitActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  exitGhostButton: {
    minWidth: 220,
  },
  exitPrimaryButton: {
    minWidth: 220,
  },
});
