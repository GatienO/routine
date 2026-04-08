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
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useChildrenStore } from '../../src/stores/childrenStore';
import { useRoutineStore } from '../../src/stores/routineStore';
import { Button } from '../../src/components/ui/Button';
import { EmojiPicker, ColorPicker } from '../../src/components/ui/Pickers';
import { Avatar } from '../../src/components/ui/Avatar';
import { OpenMoji } from '../../src/components/ui/OpenMoji';
import { CHILD_COLORS, COLORS, SPACING, FONT_SIZE, RADIUS } from '../../src/constants/theme';
import {
  PROFILE_TABS,
  AVATAR_FACES,
  COMPANION_GROUPS,
  PASSION_GROUPS,
  type ProfileTab,
} from '../../src/constants/profileCustomization';

export default function AddChildScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const { addChild, updateChild, removeChild, getChild } = useChildrenStore();
  const { removeRoutine, routines } = useRoutineStore();
  const editing = params.id ? getChild(params.id) : undefined;

  const [name, setName] = useState(editing?.name ?? '');
  const [avatar, setAvatar] = useState(editing?.avatar ?? '🧒');
  const [color, setColor] = useState(editing?.color ?? CHILD_COLORS[0]);
  const [age, setAge] = useState(editing?.age?.toString() ?? '');
  const [companion, setCompanion] = useState(editing?.companion ?? '');
  const [passions, setPassions] = useState<string[]>(editing?.passions ?? []);

  const [activeTab, setActiveTab] = useState<ProfileTab>('avatar');

  const canSave = name.trim().length > 0 && age.length > 0;

  const togglePassion = (emoji: string) => {
    setPassions((prev) =>
      prev.includes(emoji)
        ? prev.filter((p) => p !== emoji)
        : prev.length < 5
          ? [...prev, emoji]
          : prev,
    );
  };

  const handleSave = () => {
    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 18) {
      Alert.alert('Âge invalide', "L'âge doit être entre 1 et 18 ans.");
      return;
    }
    const data = {
      name: name.trim(),
      avatar,
      color,
      age: ageNum,
      companion: companion || undefined,
      passions: passions.length > 0 ? passions : undefined,
    };
    if (editing) {
      updateChild(editing.id, data);
    } else {
      addChild(data);
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
      ],
    );
  };

  /* ── Tab content renderers ── */

  const renderAvatarTab = () => (
    <EmojiPicker emojis={[...AVATAR_FACES]} selected={avatar} onSelect={setAvatar} size={60} />
  );

  const renderCompanionTab = () => (
    <View style={{ gap: SPACING.sm }}>
      {COMPANION_GROUPS.map((group) => (
        <View key={group.label}>
          <Text style={styles.groupLabel}>
            {group.icon} {group.label}
          </Text>
          <EmojiPicker
            emojis={[...group.emojis]}
            selected={companion}
            onSelect={setCompanion}
            size={54}
          />
        </View>
      ))}
    </View>
  );

  const renderPassionTab = () => (
    <View style={{ gap: SPACING.sm }}>
      <Text style={styles.passionHint}>
        {passions.length}/5 sélectionnées
      </Text>
      {PASSION_GROUPS.map((group) => (
        <View key={group.label}>
          <Text style={styles.groupLabel}>
            {group.icon} {group.label}
          </Text>
          <View style={styles.passionGrid}>
            {group.emojis.map((emoji) => {
              const selected = passions.includes(emoji);
              return (
                <TouchableOpacity
                  key={emoji}
                  style={[
                    styles.passionItem,
                    selected && styles.passionItemSelected,
                  ]}
                  onPress={() => togglePassion(emoji)}
                  activeOpacity={0.7}
                >
                  <OpenMoji emoji={emoji} size={60} />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );

  const tabContent: Record<ProfileTab, () => React.JSX.Element> = {
    avatar: renderAvatarTab,
    companion: renderCompanionTab,
    passion: renderPassionTab,
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

        {/* Top row: avatar preview + fields + tab picker */}
        <View style={styles.avatarSection}>
          {/* Left: avatar preview + companion badge */}
          <View style={styles.avatarPreviewCol}>
            <View style={styles.avatarWrapper}>
              <View style={styles.avatarRing} />
              <Avatar emoji={avatar} color={color} size={110} style={styles.avatarMain} />
              {companion ? (
                <View style={styles.companionBadge}>
                  <View style={styles.companionRing} />
                  <View style={styles.companionInner}>
                    <OpenMoji emoji={companion} size={32} />
                  </View>
                </View>
              ) : null}
            </View>
            <Text style={styles.previewName}>{name || 'Prénom'}</Text>
            {passions.length > 0 && (
              <View style={styles.passionPreview}>
                {passions.map((p) => (
                  <OpenMoji key={p} emoji={p} size={18} />
                ))}
              </View>
            )}
          </View>

          {/* Center: name & age */}
          <View style={styles.fieldsCol}>
            <Text style={styles.fieldLabel}>Prénom</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Prénom"
              placeholderTextColor={COLORS.textLight}
              maxLength={20}
              autoFocus={!editing}
            />
            <Text style={styles.fieldLabel}>Âge</Text>
            <TextInput
              style={[styles.input, styles.inputSmall]}
              value={age}
              onChangeText={(t) => setAge(t.replace(/[^0-9]/g, ''))}
              placeholder="5"
              placeholderTextColor={COLORS.textLight}
              keyboardType="number-pad"
              maxLength={2}
            />
          </View>

          {/* Right: tabbed customization panel */}
          <View style={styles.avatarCustomCol}>
            {/* Tab bar */}
            <View style={styles.tabBar}>
              {PROFILE_TABS.map((tab) => {
                const active = activeTab === tab.key;
                return (
                  <TouchableOpacity
                    key={tab.key}
                    style={[styles.tabBtn, active && styles.tabBtnActive]}
                    onPress={() => setActiveTab(tab.key)}
                    activeOpacity={0.7}
                  >
                    <OpenMoji emoji={tab.icon} size={20} />
                    <Text
                      style={[styles.tabLabel, active && styles.tabLabelActive]}
                    >
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {/* Tab content */}
            <ScrollView
              style={styles.tabContent}
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}
            >
              {tabContent[activeTab]()}
            </ScrollView>
          </View>
        </View>

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
  title: { fontSize: FONT_SIZE.xl, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.lg },
  avatarSection: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
  },
  avatarPreviewCol: {
    width: '25%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: SPACING.md,
  },
  previewName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  avatarWrapper: {
    position: 'relative',
    width: 130,
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarRing: {
    position: 'absolute',
    width: 126,
    height: 126,
    borderRadius: 63,
    borderWidth: 4,
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.surface,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 1,
  },
  avatarMain: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: '#FFF',
    backgroundColor: '#FFF',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 6,
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  companionBadge: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    bottom: -9,
    right: -9,
    zIndex: 3,
  },
  companionRing: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 4,
    borderColor: '#FFD1E3', // rose pale
    backgroundColor: '#FFF',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 1,
  },
  companionInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#FFF',
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 2,
  },
  passionPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 2,
    marginTop: SPACING.xs,
  },
  fieldsCol: {
    width: '20%',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.xs,
  },
  fieldLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  avatarCustomCol: {
    width: '50%',
    marginLeft: '5%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.surfaceSecondary,
    overflow: 'hidden',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceSecondary,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    gap: 2,
  },
  tabBtnActive: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.secondary,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  tabLabelActive: {
    color: COLORS.secondary,
  },
  tabContent: {
    padding: SPACING.sm,
    maxHeight: 260,
  },
  groupLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  passionHint: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textLight,
    textAlign: 'right',
  },
  passionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  passionItem: {
    padding: 4,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  passionItemSelected: {
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.surfaceSecondary,
  },
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
