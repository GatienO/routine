import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useChildrenStore } from '../../src/stores/childrenStore';
import { useRoutineStore } from '../../src/stores/routineStore';
import { Button } from '../../src/components/ui/Button';
import { AppPageHeader } from '../../src/components/ui/AppPageHeader';
import { EmojiPicker, ColorPicker } from '../../src/components/ui/Pickers';
import { Avatar } from '../../src/components/ui/Avatar';
import { OpenMoji } from '../../src/components/ui/OpenMoji';
import { CHILD_COLORS, COLORS, SPACING, FONT_SIZE, RADIUS } from '../../src/constants/theme';
import {
  PROFILE_TABS,
  COMPANION_GROUPS,
  PASSION_GROUPS,
  type ProfileTab,
} from '../../src/constants/profileCustomization';
import { AVATAR_ASSET_OPTIONS } from '../../src/constants/avatarAssets';
import {
  showAppAlert,
  showAppConfirm,
} from '../../src/components/feedback/AppFeedbackProvider';
import { backOrReplace } from '../../src/utils/navigation';
import { formatChildName } from '../../src/utils/children';

const AVATAR_RING_SHADOW =
  Platform.OS === 'web'
    ? { boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.12)', elevation: 4 }
    : {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 4,
      };

const AVATAR_MAIN_SHADOW =
  Platform.OS === 'web'
    ? { boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.18)', elevation: 6 }
    : {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.18,
        shadowRadius: 10,
        elevation: 6,
      };

const COMPANION_RING_SHADOW =
  Platform.OS === 'web'
    ? { boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.12)', elevation: 4 }
    : {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 4,
      };

const COMPANION_INNER_SHADOW =
  Platform.OS === 'web'
    ? { boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.18)', elevation: 6 }
    : {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.18,
        shadowRadius: 8,
        elevation: 6,
      };

export default function AddChildScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams<{ id?: string }>();
  const { addChild, updateChild, removeChild, getChild } = useChildrenStore();
  const { removeRoutine, routines } = useRoutineStore();
  const editing = params.id ? getChild(params.id) : undefined;

  const [name, setName] = useState(editing?.name ?? '');
  const [avatar, setAvatar] = useState(editing?.avatar ?? AVATAR_ASSET_OPTIONS[0].id);
  const [color, setColor] = useState(editing?.color ?? CHILD_COLORS[0]);
  const [age, setAge] = useState(editing?.age?.toString() ?? '');
  const [companion, setCompanion] = useState(editing?.companion ?? '');
  const [passions, setPassions] = useState<string[]>(editing?.passions ?? []);
  const [activeTab, setActiveTab] = useState<ProfileTab>('avatar');
  const [nameTouched, setNameTouched] = useState(false);
  const [ageTouched, setAgeTouched] = useState(false);
  const stackedLayout = width < 980;
  const contentWidth = Math.min(width - SPACING.lg * 2, 1180);

  const canSave = name.trim().length > 0 && age.length > 0;

  const togglePassion = (emoji: string) => {
    setPassions((prev) =>
      prev.includes(emoji)
        ? prev.filter((value) => value !== emoji)
        : prev.length < 5
          ? [...prev, emoji]
          : prev,
    );
  };

  const handleSave = () => {
    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 18) {
      showAppAlert({
        title: 'Age invalide',
        message: "L'age doit etre entre 1 et 18 ans.",
        tone: 'warning',
        icon: '🎂',
      });
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

    backOrReplace(router, '/parent');
  };

  const handleDelete = async () => {
    if (!editing) return;

    const confirmed = await showAppConfirm({
      title: 'Supprimer le profil',
      message: `Supprimer ${formatChildName(editing.name)} et toutes ses routines ?`,
      tone: 'danger',
      icon: '🧹',
      confirmLabel: 'Supprimer',
      cancelLabel: 'Annuler',
      confirmKind: 'danger',
    });

    if (!confirmed) return;

    routines
      .filter((routine) => routine.childId === editing.id)
      .forEach((routine) => removeRoutine(routine.id));
    removeChild(editing.id);
    backOrReplace(router, '/parent');
  };

  const renderAvatarTab = () => (
    <View style={styles.avatarAssetGrid}>
      {AVATAR_ASSET_OPTIONS.map((option) => {
        const selected = avatar === option.id;

        return (
          <TouchableOpacity
            key={option.id}
            style={[styles.avatarAssetCard, selected && styles.avatarAssetCardSelected]}
            onPress={() => setAvatar(option.id)}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.avatarAssetPreview,
                selected && styles.avatarAssetPreviewSelected,
              ]}
            >
              <Image source={option.source} style={styles.avatarAssetImage} resizeMode="contain" />
            </View>
            <Text style={[styles.avatarAssetLabel, selected && styles.avatarAssetLabelSelected]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderCompanionTab = () => (
    <View style={styles.sectionStack}>
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
    <View style={styles.sectionStack}>
      <Text style={styles.passionHint}>{passions.length}/5 selectionnees</Text>
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
                  style={[styles.passionItem, selected && styles.passionItemSelected]}
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
      <ScrollView contentContainerStyle={[styles.scroll, styles.scrollCentered]}>
        <View style={[styles.content, { width: contentWidth, maxWidth: '100%' }]}>
          <AppPageHeader
            title={editing ? 'Modifier le profil' : 'Nouvel enfant'}
            onBack={() => backOrReplace(router, '/parent')}
            onHome={() => router.replace('/parent')}
          />

        <View style={[styles.avatarSection, stackedLayout && styles.avatarSectionStacked]}>
          <View style={[styles.avatarPreviewCol, stackedLayout && styles.avatarPreviewColStacked]}>
            <View style={styles.avatarWrapper}>
              <View
                style={[
                  styles.avatarRing,
                  {
                    borderColor: color,
                    backgroundColor: `${color}18`,
                  },
                ]}
              />
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
            <Text style={styles.previewName}>{formatChildName(name) || 'Prenom'}</Text>
            {passions.length > 0 ? (
              <View style={styles.passionPreview}>
                {passions.map((passion) => (
                  <OpenMoji key={passion} emoji={passion} size={18} />
                ))}
              </View>
            ) : null}
          </View>

          <View style={[styles.fieldsCol, stackedLayout && styles.fieldsColStacked]}>
            <Text style={styles.fieldLabel}>
              Prenom
              <Text style={styles.requiredAsterisk}> *</Text>
            </Text>
            <TextInput
              style={[styles.input, nameTouched && name.trim().length === 0 && styles.inputError]}
              value={name}
              onChangeText={setName}
              onBlur={() => setNameTouched(true)}
              placeholder="Prenom"
              placeholderTextColor={COLORS.textLight}
              maxLength={20}
              autoFocus={!editing}
            />

            <Text style={styles.fieldLabel}>
              Age
              <Text style={styles.requiredAsterisk}> *</Text>
            </Text>
            <TextInput
              style={[styles.input, styles.inputSmall, ageTouched && age.trim().length === 0 && styles.inputError]}
              value={age}
              onChangeText={(value) => setAge(value.replace(/[^0-9]/g, ''))}
              onBlur={() => setAgeTouched(true)}
              placeholder="5"
              placeholderTextColor={COLORS.textLight}
              keyboardType="number-pad"
              maxLength={2}
            />
          </View>

          <View style={[styles.avatarCustomCol, stackedLayout && styles.avatarCustomColStacked]}>
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
                    <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <ScrollView
              style={styles.tabContent}
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}
            >
              {tabContent[activeTab]()}
            </ScrollView>
          </View>
        </View>

        <Text style={[styles.label, { marginTop: SPACING.lg }]}>
          Couleur
          <Text style={styles.requiredAsterisk}> *</Text>
        </Text>
        <ColorPicker colors={CHILD_COLORS} selected={color} onSelect={setColor} />

        <View style={styles.actions}>
          <Button
            title={editing ? 'Enregistrer' : 'Ajouter'}
            onPress={handleSave}
            variant="primary"
            size="lg"
            disabled={!canSave}
            color={COLORS.secondary}
          />
          {editing ? (
            <Button
              title="Supprimer le profil"
              onPress={handleDelete}
              variant="ghost"
              size="sm"
              color={COLORS.error}
            />
          ) : null}
        </View>
        </View>
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
  scrollCentered: {
    alignItems: 'center',
  },
  content: {
    width: '100%',
  },
  back: { marginBottom: SPACING.lg },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  avatarSection: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  avatarSectionStacked: {
    flexDirection: 'column',
  },
  avatarPreviewCol: {
    width: '25%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: SPACING.md,
  },
  avatarPreviewColStacked: {
    width: '100%',
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
    ...AVATAR_RING_SHADOW,
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
    ...AVATAR_MAIN_SHADOW,
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
    borderColor: '#FFD1E3',
    backgroundColor: '#FFF',
    ...COMPANION_RING_SHADOW,
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
    ...COMPANION_INNER_SHADOW,
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
  fieldsColStacked: {
    width: '100%',
    paddingHorizontal: 0,
  },
  fieldLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  requiredAsterisk: {
    color: COLORS.error,
    fontWeight: '800',
  },
  avatarCustomCol: {
    width: '50%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.surfaceSecondary,
    overflow: 'hidden',
  },
  avatarCustomColStacked: {
    width: '100%',
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
  avatarAssetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  avatarAssetCard: {
    width: 92,
    alignItems: 'center',
    gap: SPACING.xs,
    padding: SPACING.xs,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: COLORS.surface,
  },
  avatarAssetCardSelected: {
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.secondary + '10',
  },
  avatarAssetPreview: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: COLORS.surfaceSecondary,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarAssetPreviewSelected: {
    borderColor: COLORS.secondary,
  },
  avatarAssetImage: {
    width: 54,
    height: 54,
  },
  avatarAssetLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  avatarAssetLabelSelected: {
    color: COLORS.secondary,
  },
  sectionStack: {
    gap: SPACING.sm,
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
  label: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
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
  inputError: {
    borderColor: COLORS.error,
  },
  inputSmall: {
    width: 80,
  },
  actions: {
    marginTop: SPACING.xl,
    gap: SPACING.md,
  },
});
