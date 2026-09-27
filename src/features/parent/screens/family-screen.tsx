import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, PencilSimple, Plus, Trash } from 'phosphor-react-native';
import { PastelOrbs } from '../../../components/ui/PastelOrbs';
import { ResponsiveOverlay } from '../../../components/ui/ResponsiveOverlay';
import { Avatar } from '../../../components/ui/Avatar';
import { showAppConfirm, showAppToast } from '../../../components/feedback/AppFeedbackProvider';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { useChildrenStore } from '../../../stores/childrenStore';
import { useRoutineStore } from '../../../stores/routineStore';
import { useRewardStore } from '../../../stores/rewardStore';
import { useAppStore } from '../../../stores/appStore';
import { AVATAR_ASSET_OPTIONS } from '../../../constants/avatarAssets';
import { CHILD_COLORS, CONTENT_MAX_WIDTH, FONT_SIZE, SHADOWS, SPACING, type ThemeColors } from '../../../constants/theme';
import type { Child } from '../../../types';
import { formatChildName } from '../../../utils/children';

export function FamilyScreen({ openEditorFromRoute = false }: { openEditorFromRoute?: boolean }) {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; first?: string; onboarding?: string }>();
  const { width } = useWindowDimensions();
  const { colors } = useAppTheme();
  const children = useChildrenStore((state) => state.children);
  const routines = useRoutineStore((state) => state.routines);
  const rewards = useRewardStore((state) => state.rewards);
  const parentPin = useAppStore((state) => state.parentPin);
  const [editorOpen, setEditorOpen] = useState(openEditorFromRoute);
  const [editedChild, setEditedChild] = useState<Child | null>(null);
  const contentWidth = Math.min(width - SPACING.lg * 2, CONTENT_MAX_WIDTH.lg);

  useEffect(() => {
    if (!openEditorFromRoute) return;
    setEditedChild(params.id ? children.find((child) => child.id === params.id) ?? null : null);
    setEditorOpen(true);
  }, [children, openEditorFromRoute, params.id]);

  const closeEditor = () => {
    setEditorOpen(false); setEditedChild(null);
    if (openEditorFromRoute) router.replace('/parent/children');
  };
  const openCreate = () => { setEditedChild(null); setEditorOpen(true); };
  const openEdit = (child: Child) => { setEditedChild(child); setEditorOpen(true); };
  const finishEditor = () => {
    if (params.onboarding === '1') {
      router.replace(parentPin ? '/parent' : '/pin?redirect=%2Fparent');
      return;
    }
    closeEditor();
  };

  return <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}><PastelOrbs quiet /><ScrollView contentContainerStyle={[styles.scroll, { alignItems: 'center' }]} showsVerticalScrollIndicator={false}><View style={[styles.content, { width: contentWidth, maxWidth: '100%' }]}>
    <View style={styles.headingRow}><Pressable accessibilityRole="button" accessibilityLabel="Retour à Parent" onPress={() => router.replace('/parent')} style={[styles.back, { backgroundColor: colors.surface, borderColor: colors.border }]}><ArrowLeft size={21} weight="bold" color={colors.text} /></Pressable><View style={styles.headingCopy}><Text style={[styles.eyebrow, { color: colors.action }]}>FAMILLE</Text><Text style={[styles.title, { color: colors.text }]}>Les enfants accompagnés.</Text><Text style={[styles.subtitle, { color: colors.textSecondary }]}>Ces repères adaptent les routines, le calendrier et la progression. L’application reste organisée autour des outils du parent.</Text></View><Pressable accessibilityRole="button" onPress={openCreate} style={[styles.create, { backgroundColor: colors.action }]}><Plus size={19} weight="bold" color={colors.background} /><Text style={[styles.createText, { color: colors.background }]}>Ajouter</Text></Pressable></View>
    {children.length ? <View style={styles.grid}>{children.map((child) => { const routineCount = routines.filter((routine) => routine.childId === child.id).length; const stars = rewards[child.id]?.totalStars ?? 0; return <Pressable accessibilityRole="button" key={child.id} onPress={() => openEdit(child)} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={[styles.avatarHalo, { backgroundColor: colors.actionSoft }]}><Avatar emoji={child.avatar} color={child.color} size={74} avatarConfig={child.avatarConfig} /></View><View style={styles.cardCopy}><Text style={[styles.childName, { color: colors.text }]}>{formatChildName(child.name)}</Text><Text style={[styles.childAge, { color: colors.textSecondary }]}>{child.age} ans</Text><View style={styles.stats}><Stat value={routineCount} label="routines" colors={colors} /><Stat value={stars} label="étoiles" colors={colors} /></View></View><View style={[styles.editIcon, { backgroundColor: colors.surfaceSecondary }]}><PencilSimple size={18} color={colors.text} /></View></Pressable>; })}<Pressable accessibilityRole="button" onPress={openCreate} style={[styles.card, styles.addCard, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}><View style={[styles.addIcon, { backgroundColor: colors.actionSoft }]}><Plus size={28} color={colors.action} /></View><View style={styles.cardCopy}><Text style={[styles.childName, { color: colors.text }]}>Ajouter un enfant</Text><Text style={[styles.childAge, { color: colors.textSecondary }]}>Pour adapter les outils parentaux.</Text></View></Pressable></View> : <View style={[styles.empty, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={[styles.addIcon, { backgroundColor: colors.actionSoft }]}><Plus size={28} color={colors.action} /></View><Text style={[styles.emptyTitle, { color: colors.text }]}>Ajoutez le premier enfant</Text><Text style={[styles.emptyText, { color: colors.textSecondary }]}>Un prénom et un âge suffisent. Tout reste sur cet appareil.</Text><Pressable accessibilityRole="button" onPress={openCreate} style={[styles.emptyAction, { backgroundColor: colors.actionSoft }]}><Text style={[styles.emptyActionText, { color: colors.action }]}>Ajouter un enfant</Text></Pressable></View>}
  </View></ScrollView><ChildEditor visible={editorOpen} child={editedChild} onClose={closeEditor} onSaved={finishEditor} /></SafeAreaView>;
}

function ChildEditor({ visible, child, onClose, onSaved }: { visible: boolean; child: Child | null; onClose: () => void; onSaved: () => void }) {
  const { colors } = useAppTheme();
  const addChild = useChildrenStore((state) => state.addChild);
  const updateChild = useChildrenStore((state) => state.updateChild);
  const removeChild = useChildrenStore((state) => state.removeChild);
  const routines = useRoutineStore((state) => state.routines);
  const removeRoutine = useRoutineStore((state) => state.removeRoutine);
  const [name, setName] = useState(''); const [age, setAge] = useState(''); const [avatar, setAvatar] = useState(AVATAR_ASSET_OPTIONS[0].id); const [color, setColor] = useState<string>(CHILD_COLORS[0]);
  useEffect(() => { if (!visible) return; setName(child?.name ?? ''); setAge(child?.age ? String(child.age) : ''); setAvatar(child?.avatar ?? AVATAR_ASSET_OPTIONS[0].id); setColor(child?.color ?? CHILD_COLORS[0]); }, [child, visible]);
  const save = () => {
    const parsedAge = Number(age); if (!name.trim() || !Number.isInteger(parsedAge) || parsedAge < 1 || parsedAge > 18) { showAppToast({ title: 'Informations incomplètes', message: 'Ajoutez un prénom et un âge entre 1 et 18 ans.', tone: 'warning', icon: '🌿' }); return; }
    if (child) updateChild(child.id, { name: name.trim(), age: parsedAge, avatar, color }); else addChild({ name: name.trim(), age: parsedAge, avatar, color });
    showAppToast({ title: child ? 'Repères modifiés' : 'Enfant ajouté', message: formatChildName(name), tone: 'success', icon: '🌿' }); onSaved();
  };
  const remove = async () => {
    if (!child) return; const childRoutines = routines.filter((routine) => routine.childId === child.id);
    const confirmed = await showAppConfirm({ title: `Supprimer ${formatChildName(child.name)} ?`, message: `${childRoutines.length} routine${childRoutines.length > 1 ? 's' : ''} associée${childRoutines.length > 1 ? 's' : ''} sera également supprimée.`, tone: 'danger', icon: '🧹', confirmLabel: 'Supprimer', cancelLabel: 'Garder', confirmKind: 'danger' });
    if (confirmed) { childRoutines.forEach((routine) => removeRoutine(routine.id)); removeChild(child.id); onClose(); }
  };
  const footer = <View style={styles.footer}>{child ? <Pressable accessibilityRole="button" onPress={() => void remove()} style={[styles.deleteButton, { backgroundColor: colors.attentionSoft }]}><Trash size={18} color={colors.attention} /><Text style={[styles.deleteText, { color: colors.attention }]}>Supprimer</Text></Pressable> : null}<Pressable accessibilityRole="button" onPress={save} style={[styles.saveButton, { backgroundColor: colors.action }]}><Text style={[styles.saveText, { color: colors.background }]}>{child ? 'Enregistrer' : 'Ajouter l’enfant'}</Text></Pressable></View>;
  return <ResponsiveOverlay visible={visible} title={child ? 'Modifier les repères' : 'Ajouter un enfant'} subtitle="Ces informations servent uniquement à adapter les outils." onClose={onClose} footer={footer}><View style={styles.preview}><View style={[styles.previewHalo, { backgroundColor: colors.actionSoft }]}><Avatar emoji={avatar} color={color} size={96} /></View><Text style={[styles.previewName, { color: colors.text }]}>{formatChildName(name || 'Prénom')}</Text></View><Field label="Prénom" colors={colors}><TextInput value={name} onChangeText={setName} placeholder="Ex. Emma" placeholderTextColor={colors.textLight} maxLength={30} style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]} /></Field><Field label="Âge" colors={colors}><TextInput value={age} onChangeText={setAge} keyboardType="number-pad" placeholder="Ex. 6" placeholderTextColor={colors.textLight} maxLength={2} style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]} /></Field><Field label="Illustration" colors={colors}><View style={styles.avatarGrid}>{AVATAR_ASSET_OPTIONS.slice(0, 12).map((option) => <Pressable accessibilityRole="button" aria-pressed={avatar === option.id} key={option.id} accessibilityLabel={`Choisir ${option.label}`} accessibilityState={{ selected: avatar === option.id }} onPress={() => setAvatar(option.id)} style={[styles.avatarChoice, { backgroundColor: avatar === option.id ? colors.actionSoft : colors.surfaceSecondary, borderColor: avatar === option.id ? colors.action : colors.surfaceSecondary }]}><Avatar emoji={option.id} color={color} size={46} /></Pressable>)}</View></Field><Field label="Couleur" colors={colors}><View style={styles.colorGrid}>{CHILD_COLORS.slice(0, 10).map((item) => <Pressable accessibilityRole="button" key={item} accessibilityLabel={`Choisir la couleur ${item}`} onPress={() => setColor(item)} style={[styles.colorChoice, { backgroundColor: item, borderColor: color === item ? colors.text : colors.surface }]} />)}</View></Field></ResponsiveOverlay>;
}

function Stat({ value, label, colors }: { value: number; label: string; colors: ThemeColors }) { return <View style={[styles.stat, { backgroundColor: colors.surfaceSecondary }]}><Text style={[styles.statValue, { color: colors.text }]}>{value}</Text><Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text></View>; }
function Field({ label, colors, children }: { label: string; colors: ThemeColors; children: React.ReactNode }) { return <View style={styles.field}><Text style={[styles.fieldLabel, { color: colors.text }]}>{label}</Text>{children}</View>; }

const styles = StyleSheet.create({
  safe: { flex: 1 }, scroll: { padding: SPACING.lg, paddingBottom: 120 }, content: { gap: SPACING.lg }, headingRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', gap: SPACING.md }, back: { width: 48, height: 48, borderRadius: 15, borderWidth: 1, alignItems: 'center', justifyContent: 'center' }, headingCopy: { flex: 1, minWidth: 250, gap: 5 }, eyebrow: { fontSize: FONT_SIZE.xs, fontWeight: '800', letterSpacing: 0.8 }, title: { fontSize: FONT_SIZE.xxl, lineHeight: 39, fontWeight: '700', letterSpacing: -0.7 }, subtitle: { maxWidth: 680, fontSize: FONT_SIZE.sm, lineHeight: 21 }, create: { minHeight: 50, borderRadius: 15, paddingHorizontal: SPACING.md, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }, createText: { fontSize: FONT_SIZE.sm, fontWeight: '800' }, grid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md }, card: { flexGrow: 1, flexBasis: 310, minHeight: 148, borderRadius: 22, borderWidth: 1, padding: SPACING.md, flexDirection: 'row', alignItems: 'center', gap: SPACING.md, ...SHADOWS.sm }, addCard: { borderStyle: 'dashed' }, avatarHalo: { width: 94, height: 94, borderRadius: 32, alignItems: 'center', justifyContent: 'center' }, cardCopy: { flex: 1, minWidth: 0 }, childName: { fontSize: FONT_SIZE.lg, fontWeight: '800' }, childAge: { marginTop: 3, fontSize: FONT_SIZE.sm, lineHeight: 20 }, stats: { marginTop: SPACING.sm, flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs }, stat: { minWidth: 64, borderRadius: 12, paddingVertical: 5, paddingHorizontal: SPACING.sm, alignItems: 'center' }, statValue: { fontSize: FONT_SIZE.sm, fontWeight: '800' }, statLabel: { fontSize: 10 }, editIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }, addIcon: { width: 64, height: 64, borderRadius: 22, alignItems: 'center', justifyContent: 'center' }, empty: { minHeight: 330, borderRadius: 22, borderWidth: 1, padding: SPACING.xl, alignItems: 'center', justifyContent: 'center', gap: SPACING.sm }, emptyTitle: { fontSize: FONT_SIZE.xl, fontWeight: '700' }, emptyText: { maxWidth: 480, fontSize: FONT_SIZE.sm, lineHeight: 21, textAlign: 'center' }, emptyAction: { minHeight: 48, marginTop: SPACING.sm, borderRadius: 14, paddingHorizontal: SPACING.lg, alignItems: 'center', justifyContent: 'center' }, emptyActionText: { fontSize: FONT_SIZE.sm, fontWeight: '800' }, preview: { alignItems: 'center', gap: SPACING.sm }, previewHalo: { width: 116, height: 116, borderRadius: 38, alignItems: 'center', justifyContent: 'center' }, previewName: { fontSize: FONT_SIZE.xl, fontWeight: '800' }, field: { gap: SPACING.sm }, fieldLabel: { fontSize: FONT_SIZE.sm, fontWeight: '800' }, input: { minHeight: 52, borderRadius: 15, borderWidth: 1, paddingHorizontal: SPACING.md, fontSize: FONT_SIZE.md }, avatarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm }, avatarChoice: { width: 62, height: 62, borderRadius: 19, borderWidth: 1, alignItems: 'center', justifyContent: 'center' }, colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm }, colorChoice: { width: 44, height: 44, borderRadius: 15, borderWidth: 3 }, footer: { flexDirection: 'row', gap: SPACING.sm }, deleteButton: { minHeight: 50, borderRadius: 15, paddingHorizontal: SPACING.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }, deleteText: { fontSize: FONT_SIZE.sm, fontWeight: '800' }, saveButton: { minHeight: 50, flex: 1, borderRadius: 15, paddingHorizontal: SPACING.md, alignItems: 'center', justifyContent: 'center' }, saveText: { fontSize: FONT_SIZE.sm, fontWeight: '800' },
});
