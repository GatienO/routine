import React, { useState } from 'react';
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
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useChildrenStore } from '../../src/stores/childrenStore';
import { useRoutineStore } from '../../src/stores/routineStore';
import { Button } from '../../src/components/ui/Button';
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
} from '../../src/constants/theme';
import { RoutineCategory, RoutineStep } from '../../src/types';
import { generateId } from '../../src/utils/id';

const CATEGORIES = Object.entries(CATEGORY_CONFIG) as [RoutineCategory, typeof CATEGORY_CONFIG[string]][];

export default function AddRoutineScreen() {
  const router = useRouter();
  const { children } = useChildrenStore();
  const { addRoutine } = useRoutineStore();

  const [childId, setChildId] = useState(children[0]?.id ?? '');
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🌅');
  const [color, setColor] = useState<string>(CHILD_COLORS[0]);
  const [category, setCategory] = useState<RoutineCategory>('morning');
  const [steps, setSteps] = useState<RoutineStep[]>([]);

  // Step form
  const [showStepForm, setShowStepForm] = useState(false);
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [stepTitle, setStepTitle] = useState('');
  const [stepIcon, setStepIcon] = useState('🪥');
  const [stepDuration, setStepDuration] = useState('2');
  const [stepInstruction, setStepInstruction] = useState('');
  const [stepRequired, setStepRequired] = useState(true);
  const [stepMediaUri, setStepMediaUri] = useState('');

  const canSave = name.trim().length > 0 && childId && steps.length > 0;

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

  const handleSave = () => {
    addRoutine({
      childId,
      name: name.trim(),
      icon,
      color,
      category,
      steps,
      isActive: true,
    });
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Nouvelle routine</Text>

        {/* Child selector */}
        <Text style={styles.label}>Pour quel enfant ?</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.row}>
            {children.map((child) => (
              <TouchableOpacity
                key={child.id}
                style={[
                  styles.childChip,
                  childId === child.id && { backgroundColor: child.color + '30', borderColor: child.color },
                ]}
                onPress={() => setChildId(child.id)}
              >
                <Text style={styles.childChipEmoji}>{child.avatar}</Text>
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
                <Text>{config.icon} {config.label}</Text>
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

        {/* Steps */}
        <Text style={[styles.label, { marginTop: SPACING.xl }]}>
          Étapes ({steps.length})
        </Text>

        {steps.map((step, index) => (
          <TouchableOpacity key={step.id} activeOpacity={0.7} onPress={() => editStep(step)}>
            <Card style={[styles.stepCard, editingStepId === step.id && styles.stepCardEditing]}>
              <View style={styles.stepRow}>
                <Text style={styles.stepOrder}>{index + 1}</Text>
                <Text style={styles.stepIcon}>{step.icon}</Text>
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
                });
                if (!result.canceled && result.assets[0]) {
                  setStepMediaUri(result.assets[0].uri);
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  back: { fontSize: FONT_SIZE.md, color: COLORS.secondary, fontWeight: '600', marginBottom: SPACING.lg },
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
});
