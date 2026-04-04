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
import { EmojiPicker, ColorPicker } from '../../src/components/ui/Pickers';
import { Avatar } from '../../src/components/ui/Avatar';
import { AVATAR_ICONS } from '../../src/constants/icons';
import { CHILD_COLORS, COLORS, SPACING, FONT_SIZE, RADIUS } from '../../src/constants/theme';

export default function AddChildScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const { children, addChild, updateChild, removeChild, getChild } = useChildrenStore();
  const { removeRoutine, routines } = useRoutineStore();
  const editing = params.id ? getChild(params.id) : undefined;

  const [name, setName] = useState(editing?.name ?? '');
  const [avatar, setAvatar] = useState(editing?.avatar ?? '🦁');
  const [color, setColor] = useState(editing?.color ?? CHILD_COLORS[0]);
  const [age, setAge] = useState(editing?.age?.toString() ?? '');

  const canSave = name.trim().length > 0 && age.length > 0;

  const handleSave = () => {
    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 18) {
      Alert.alert('Âge invalide', 'L\'âge doit être entre 1 et 18 ans.');
      return;
    }
    if (editing) {
      updateChild(editing.id, { name: name.trim(), avatar, color, age: ageNum });
    } else {
      addChild({ name: name.trim(), avatar, color, age: ageNum });
    }
    router.back();
  };

  const handleDelete = () => {
    if (!editing) return;
    Alert.alert(
      'Supprimer le profil',
      `Supprimer ${editing.name} et toutes ses routines ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            routines
              .filter((r) => r.childId === editing.id)
              .forEach((r) => removeRoutine(r.id));
            removeChild(editing.id);
            router.back();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Retour</Text>
        </TouchableOpacity>

        <Text style={styles.title}>
          {editing ? 'Modifier le profil' : 'Nouvel enfant'}
        </Text>

        {/* Preview */}
        <View style={styles.preview}>
          <Avatar emoji={avatar} color={color} size={80} />
          <Text style={styles.previewName}>{name || 'Prénom'}</Text>
        </View>

        {/* Name */}
        <Text style={styles.label}>Prénom</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Prénom de l'enfant"
          placeholderTextColor={COLORS.textLight}
          maxLength={20}
          autoFocus={!editing}
        />

        {/* Age */}
        <Text style={styles.label}>Âge</Text>
        <TextInput
          style={[styles.input, styles.inputSmall]}
          value={age}
          onChangeText={(t) => setAge(t.replace(/[^0-9]/g, ''))}
          placeholder="5"
          placeholderTextColor={COLORS.textLight}
          keyboardType="number-pad"
          maxLength={2}
        />

        {/* Avatar */}
        <Text style={styles.label}>Avatar</Text>
        <EmojiPicker emojis={AVATAR_ICONS} selected={avatar} onSelect={setAvatar} />

        {/* Color */}
        <Text style={[styles.label, { marginTop: SPACING.lg }]}>Couleur</Text>
        <ColorPicker colors={CHILD_COLORS} selected={color} onSelect={setColor} />

        {/* Save */}
        <View style={styles.actions}>
          <Button
            title={editing ? 'Enregistrer' : 'Ajouter'}
            onPress={handleSave}
            variant="primary"
            size="lg"
            disabled={!canSave}
            color={COLORS.secondary}
          />
          {editing && (
            <Button
              title="Supprimer le profil"
              onPress={handleDelete}
              variant="ghost"
              size="sm"
              color={COLORS.error}
            />
          )}
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
  preview: { alignItems: 'center', marginBottom: SPACING.xl },
  previewName: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.text, marginTop: SPACING.sm },
  label: { fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.textSecondary, marginBottom: SPACING.sm, marginTop: SPACING.md },
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
  actions: { marginTop: SPACING.xl, gap: SPACING.md },
});
