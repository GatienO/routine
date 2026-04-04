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
import { useRouter, useLocalSearchParams } from 'expo-router';
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
import { encodeRoutine, generateShareLink } from '../../src/services/sharing';
import * as Clipboard from 'expo-clipboard';

const CATEGORIES = Object.entries(CATEGORY_CONFIG) as [RoutineCategory, typeof CATEGORY_CONFIG[string]][];

export default function EditRoutineScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const { children } = useChildrenStore();
  const { getRoutine, updateRoutine, removeRoutine, duplicateRoutine } = useRoutineStore();

  const routine = getRoutine(params.id ?? '');
  if (!routine) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text>Routine non trouvée</Text>
          <Button title="Retour" onPress={() => router.back()} variant="ghost" size="sm" />
        </View>
      </SafeAreaView>
    );
  }

  const [name, setName] = useState(routine.name);
  const [icon, setIcon] = useState(routine.icon);
  const [color, setColor] = useState(routine.color);
  const [category, setCategory] = useState<RoutineCategory>(routine.category);
  const [steps, setSteps] = useState<RoutineStep[]>([...routine.steps]);

  const [showStepForm, setShowStepForm] = useState(false);
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [stepTitle, setStepTitle] = useState('');
  const [stepIcon, setStepIcon] = useState('🪥');
  const [stepDuration, setStepDuration] = useState('2');
  const [stepInstruction, setStepInstruction] = useState('');
  const [stepRequired, setStepRequired] = useState(true);
  const [stepMediaUri, setStepMediaUri] = useState('');

  const canSave = name.trim().length > 0 && steps.length > 0;

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
    updateRoutine(routine.id, {
      name: name.trim(),
      icon,
      color,
      category,
      steps,
    });
    router.back();
  };

  const handleDuplicate = () => {
    if (children.length === 1) {
      duplicateRoutine(routine.id, routine.childId);
      Alert.alert('Routine dupliquée !');
      router.back();
    } else {
      Alert.alert(
        'Dupliquer pour quel enfant ?',
        undefined,
        children.map((c) => ({
          text: `${c.avatar} ${c.name}`,
          onPress: () => {
            duplicateRoutine(routine.id, c.id);
            Alert.alert('Routine dupliquée !');
            router.back();
          },
        }))
      );
    }
  };

  const handleShare = async () => {
    const encoded = encodeRoutine(routine);
    const link = generateShareLink(encoded);
    try {
      await Clipboard.setStringAsync(encoded);
      Alert.alert('Lien copié !', 'Partagez ce code avec d\'autres parents pour qu\'ils puissent importer cette routine.');
    } catch {
      Alert.alert('Code de partage', encoded);
    }
  };

  const handleDelete = () => {
    Alert.alert('Supprimer', `Supprimer "${routine.name}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: () => {
          removeRoutine(routine.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Modifier la routine</Text>

        {/* Name */}
        <Text style={styles.label}>Nom</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
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
                <Text style={styles.stepIconText}>{step.icon}</Text>
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
              placeholder="Titre de l'étape"
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
                title={editingStepId ? 'Enregistrer' : 'Ajouter'}
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

        {/* Actions */}
        <View style={styles.mainActions}>
          <Button title="Enregistrer" onPress={handleSave} variant="primary" size="lg" disabled={!canSave} />
          <View style={styles.secondaryActions}>
            <Button title="📋 Dupliquer" onPress={handleDuplicate} variant="outline" size="sm" color={COLORS.secondary} />
            <Button title="📤 Partager" onPress={handleShare} variant="outline" size="sm" color={COLORS.secondary} />
          </View>
          <Button title="Supprimer" onPress={handleDelete} variant="ghost" size="sm" color={COLORS.error} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  back: { fontSize: FONT_SIZE.md, color: COLORS.secondary, fontWeight: '600', marginBottom: SPACING.lg },
  title: { fontSize: FONT_SIZE.xl, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.xl },
  label: { fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.textSecondary, marginBottom: SPACING.sm, marginTop: SPACING.md },
  sublabel: { fontSize: FONT_SIZE.xs, fontWeight: '600', color: COLORS.textSecondary, marginBottom: SPACING.xs, marginTop: SPACING.md },
  input: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, fontSize: FONT_SIZE.md, color: COLORS.text, borderWidth: 1, borderColor: COLORS.surfaceSecondary },
  inputSmall: { width: 80 },
  inputMultiline: { minHeight: 60, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: SPACING.sm },
  categoryChip: { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md, borderRadius: RADIUS.full, borderWidth: 2, borderColor: COLORS.surfaceSecondary, backgroundColor: COLORS.surface },
  stepCard: { marginBottom: SPACING.sm },
  stepCardEditing: { borderWidth: 2, borderColor: COLORS.secondary },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  stepOrder: { fontSize: FONT_SIZE.sm, fontWeight: '800', color: COLORS.textLight, width: 20 },
  stepIconText: { fontSize: 28 },
  stepInfo: { flex: 1 },
  stepTitle: { fontSize: FONT_SIZE.md, fontWeight: '600', color: COLORS.text },
  stepMeta: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary },
  stepActions: { flexDirection: 'row', gap: SPACING.sm },
  moveBtn: { fontSize: 18, color: COLORS.textSecondary, padding: 4 },
  deleteBtn: { fontSize: 16, color: COLORS.error, padding: 4 },
  stepFormCard: { marginTop: SPACING.sm },
  stepFormTitle: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  requiredRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SPACING.md },
  toggle: { paddingVertical: SPACING.xs, paddingHorizontal: SPACING.md, borderRadius: RADIUS.full, backgroundColor: COLORS.surfaceSecondary },
  toggleActive: { backgroundColor: COLORS.successLight },
  stepFormActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: SPACING.sm, marginTop: SPACING.lg },
  mediaPicker: {
    borderWidth: 1, borderColor: COLORS.surfaceSecondary, borderRadius: RADIUS.lg,
    borderStyle: 'dashed', padding: SPACING.md, alignItems: 'center', marginTop: SPACING.xs,
  },
  mediaPreview: { width: 120, height: 120, borderRadius: RADIUS.md },
  mediaPlaceholder: { fontSize: FONT_SIZE.sm, color: COLORS.textLight },
  mainActions: { marginTop: SPACING.xl, gap: SPACING.md },
  secondaryActions: { flexDirection: 'row', gap: SPACING.sm },
});
