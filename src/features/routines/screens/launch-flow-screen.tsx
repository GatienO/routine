import React, { useEffect, useMemo, useRef, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, ArrowRight, CaretDown, CaretUp, Check, CheckCircle, Clock, PencilSimple, Play, UsersThree } from 'phosphor-react-native';
import { Avatar } from '../../../components/ui/Avatar';
import { OpenMoji } from '../../../components/ui/OpenMoji';
import { MOOD_CONFIG, NEGATIVE_MOODS, POSITIVE_MOODS } from '../../../constants/moods';
import { CONTENT_MAX_WIDTH, FONT_SIZE, SHADOWS, SPACING } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { useChildrenStore } from '../../../stores/childrenStore';
import { useMoodStore } from '../../../stores/moodStore';
import { useRoutineStore } from '../../../stores/routineStore';
import type { ChildMoodType, Routine, RoutineStep } from '../../../types';
import { formatChildName } from '../../../utils/children';
import { formatDuration } from '../../../utils/date';

type LaunchStage = 'prepare' | 'presence' | 'mood';
const STAGES: Array<{ id: LaunchStage; label: string }> = [
  { id: 'prepare', label: 'Préparer' }, { id: 'presence', label: 'Présence' }, { id: 'mood', label: 'Humeur' },
];
const parseIds = (value?: string) => Array.from(new Set((value ?? '').split(',').map((id) => id.trim()).filter(Boolean)));

export function LaunchFlowScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { colors } = useAppTheme();
  const params = useLocalSearchParams<{ routineIds?: string; routineId?: string; childIds?: string; childId?: string; stage?: LaunchStage }>();
  const children = useChildrenStore((state) => state.children);
  const routines = useRoutineStore((state) => state.routines);
  const pendingOrders = useRoutineStore((state) => state.pendingStepOrders);
  const setPendingOrders = useRoutineStore((state) => state.setPendingStepOrders);
  const startExecution = useRoutineStore((state) => state.startExecution);
  const startChain = useRoutineStore((state) => state.startChain);
  const setMood = useMoodStore((state) => state.setMood);
  const validInitialStage = params.stage && STAGES.some((item) => item.id === params.stage) ? params.stage : 'prepare';
  const [stage, setStage] = useState<LaunchStage>(validInitialStage);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirmedIds, setConfirmedIds] = useState<string[]>([]);
  const [moods, setMoods] = useState<Record<string, ChildMoodType>>({});
  const [orders, setOrders] = useState<Record<string, string[]>>({});
  const launchLocked = useRef(false);

  const routineIds = useMemo(() => parseIds(params.routineIds ?? params.routineId), [params.routineId, params.routineIds]);
  const launchRoutines = useMemo(() => routineIds.map((id) => routines.find((routine) => routine.id === id)).filter((routine): routine is Routine => Boolean(routine)), [routineIds, routines]);
  const requestedIds = useMemo(() => parseIds(params.childIds ?? params.childId), [params.childId, params.childIds]);
  const selectedChildren = useMemo(() => children.filter((child) => selectedIds.includes(child.id)), [children, selectedIds]);
  const hasEmptyRoutine = launchRoutines.some((routine) => routine.steps.length === 0);
  const allPresent = selectedIds.length > 0 && selectedIds.every((id) => confirmedIds.includes(id));
  const moodChild = selectedChildren.find((child) => !moods[child.id]);
  const compact = width < 560;
  const contentWidth = Math.min(width - (width < 390 ? SPACING.md * 2 : SPACING.lg * 2), CONTENT_MAX_WIDTH.md);

  useEffect(() => {
    if (launchRoutines.length === 0) return;
    const defaults = Array.from(new Set(launchRoutines.map((routine) => routine.childId)));
    const requested = requestedIds.filter((id) => children.some((child) => child.id === id));
    const next = requested.length ? requested : defaults.filter((id) => children.some((child) => child.id === id));
    setSelectedIds((current) => current.length === next.length && current.every((id, index) => id === next[index]) ? current : next);
  }, [children, launchRoutines, requestedIds]);

  useEffect(() => {
    setOrders(launchRoutines.reduce<Record<string, string[]>>((next, routine) => {
      next[routine.id] = (pendingOrders[routine.id] ?? routine.steps).map((step) => step.id);
      return next;
    }, {}));
  }, [launchRoutines, pendingOrders]);

  useEffect(() => {
    if (routineIds.length && !launchRoutines.length) router.replace('/routines');
  }, [launchRoutines.length, routineIds.length, router]);

  if (!launchRoutines.length) return null;
  const leadRoutine = launchRoutines[0];
  const duration = launchRoutines.reduce((sum, routine) => sum + routine.steps.reduce((stepSum, step) => stepSum + step.durationMinutes, 0), 0);
  const stepCount = launchRoutines.reduce((sum, routine) => sum + routine.steps.length, 0);

  const toggleChild = (childId: string) => {
    setSelectedIds((current) => current.includes(childId) ? current.filter((id) => id !== childId) : [...current, childId]);
    setConfirmedIds((current) => current.filter((id) => id !== childId));
    setMoods((current) => { const next = { ...current }; delete next[childId]; return next; });
  };
  const moveStep = (routineId: string, stepId: string, direction: -1 | 1) => setOrders((current) => {
    const order = [...(current[routineId] ?? [])];
    const index = order.indexOf(stepId);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= order.length) return current;
    [order[index], order[target]] = [order[target], order[index]];
    return { ...current, [routineId]: order };
  });
  const resolvedOrders = () => launchRoutines.reduce<Record<string, RoutineStep[]>>((next, routine) => {
    const byId = new Map(routine.steps.map((step) => [step.id, step]));
    next[routine.id] = (orders[routine.id] ?? []).map((id) => byId.get(id)).filter((step): step is RoutineStep => Boolean(step));
    return next;
  }, {});
  const goBack = () => stage === 'mood' ? setStage('presence') : stage === 'presence' ? setStage('prepare') : router.replace('/routines');
  const chooseMood = (mood: ChildMoodType) => {
    if (!moodChild) return;
    setMood(moodChild.id, mood);
    setMoods((current) => ({ ...current, [moodChild.id]: mood }));
  };
  const start = () => {
    if (launchLocked.current || !selectedIds.length || hasEmptyRoutine) return;
    launchLocked.current = true;
    const stepOrders = resolvedOrders();
    setPendingOrders(stepOrders);
    const execution = launchRoutines.length > 1 ? startChain(routineIds, selectedIds, stepOrders) : startExecution(routineIds[0], selectedIds, stepOrders);
    if (!execution) { launchLocked.current = false; return; }
    router.replace('/child/run');
  };

  const prepare = (
    <>
      <View style={[styles.hero, { backgroundColor: colors.transitionSoft }]}>
        <View style={[styles.heroIcon, { backgroundColor: colors.surface }]}><OpenMoji emoji={leadRoutine.icon} size={48} /></View>
        <View style={styles.heroCopy}><Text style={[styles.eyebrow, { color: colors.transition }]}>AVANT DE COMMENCER</Text><Text style={[styles.title, { color: colors.text }]}>{launchRoutines.length > 1 ? `${launchRoutines.length} routines à la suite` : leadRoutine.name}</Text><Text style={[styles.subtitle, { color: colors.textSecondary }]}>{stepCount} étapes · {formatDuration(duration)} · toujours avec un adulte</Text></View>
      </View>
      <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.sectionHeading}><UsersThree size={21} weight="bold" color={colors.action} /><Text style={[styles.sectionTitle, { color: colors.text }]}>Participants</Text></View>
        <Text style={[styles.help, { color: colors.textSecondary }]}>Choisissez les enfants qui font cette routine maintenant.</Text>
        <View style={styles.childrenGrid}>{children.map((child) => { const selected = selectedIds.includes(child.id); return (
          <TouchableOpacity aria-checked={selected} key={child.id} accessibilityRole="checkbox" accessibilityState={{ checked: selected }} accessibilityLabel={`${selected ? 'Retirer' : 'Ajouter'} ${formatChildName(child.name)}`} onPress={() => toggleChild(child.id)} activeOpacity={0.82} style={[styles.childChoice, { borderColor: selected ? colors.action : colors.border, backgroundColor: selected ? colors.actionSoft : colors.surfaceSecondary }]}>
            <Avatar emoji={child.avatar} color={child.color} size={52} avatarConfig={child.avatarConfig} /><Text style={[styles.childName, { color: colors.text }]} numberOfLines={1}>{formatChildName(child.name)}</Text><View style={[styles.choiceCheck, { borderColor: selected ? colors.action : colors.border, backgroundColor: selected ? colors.action : colors.surface }]}>{selected ? <Check size={14} weight="bold" color={colors.background} /> : null}</View>
          </TouchableOpacity>
        ); })}</View>
      </View>
      <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.sectionHeading}><Clock size={21} weight="bold" color={colors.time} /><Text style={[styles.sectionTitle, { color: colors.text }]}>Déroulé</Text></View>
        {launchRoutines.map((routine) => <View key={routine.id} style={styles.routineBlock}>
          {launchRoutines.length > 1 ? <Text style={[styles.routineLabel, { color: colors.text }]}>{routine.name}</Text> : null}
          {(orders[routine.id] ?? routine.steps.map((step) => step.id)).map((stepId, index, order) => { const step = routine.steps.find((item) => item.id === stepId); return step ? (
            <View key={step.id} style={[styles.stepRow, { borderColor: colors.divider }]}><View style={[styles.stepIndex, { backgroundColor: colors.timeSoft }]}><Text style={[styles.stepIndexText, { color: colors.time }]}>{index + 1}</Text></View><OpenMoji emoji={step.icon} size={27} /><View style={styles.stepCopy}><Text style={[styles.stepTitle, { color: colors.text }]} numberOfLines={2}>{step.title}</Text><Text style={[styles.stepMeta, { color: colors.textSecondary }]}>{formatDuration(step.durationMinutes)}</Text></View><View style={styles.orderButtons}><TouchableOpacity accessibilityRole="button" accessibilityLabel={`Monter ${step.title}`} disabled={index === 0} onPress={() => moveStep(routine.id, step.id, -1)} style={styles.orderButton}><CaretUp size={16} weight="bold" color={index === 0 ? colors.textLight : colors.time} /></TouchableOpacity><TouchableOpacity accessibilityRole="button" accessibilityLabel={`Descendre ${step.title}`} disabled={index === order.length - 1} onPress={() => moveStep(routine.id, step.id, 1)} style={styles.orderButton}><CaretDown size={16} weight="bold" color={index === order.length - 1 ? colors.textLight : colors.time} /></TouchableOpacity></View></View>
          ) : null; })}
        </View>)}
        {hasEmptyRoutine ? <View style={[styles.warning, { backgroundColor: colors.attentionSoft }]}><Text style={[styles.warningText, { color: colors.attention }]}>Cette routine ne contient aucune étape. Ajoutez-en une avant de la lancer.</Text><TouchableOpacity accessibilityRole="button" onPress={() => router.push({ pathname: '/parent/edit-routine', params: { id: leadRoutine.id } })} style={styles.editLink}><PencilSimple size={17} color={colors.attention} /><Text style={[styles.editLinkText, { color: colors.attention }]}>Modifier</Text></TouchableOpacity></View> : null}
      </View>
    </>
  );

  const presence = <View style={styles.centerStage}><Text style={styles.stageEmoji}>👋</Text><Text style={[styles.stageTitle, { color: colors.text }]}>Tout le monde est là ?</Text><Text style={[styles.stageHelp, { color: colors.textSecondary }]}>Chaque enfant touche son avatar. L’adulte reste à côté.</Text><View style={styles.presenceGrid}>{selectedChildren.map((child) => { const confirmed = confirmedIds.includes(child.id); return (
    <TouchableOpacity aria-checked={confirmed} key={child.id} accessibilityRole="checkbox" accessibilityState={{ checked: confirmed }} accessibilityLabel={`Confirmer la présence de ${formatChildName(child.name)}`} onPress={() => setConfirmedIds((current) => current.includes(child.id) ? current.filter((id) => id !== child.id) : [...current, child.id])} activeOpacity={0.82} style={[styles.presenceCard, { backgroundColor: confirmed ? colors.actionSoft : colors.surface, borderColor: confirmed ? colors.action : colors.border }]}><Avatar emoji={child.avatar} color={child.color} size={compact ? 78 : 96} avatarConfig={child.avatarConfig} /><Text style={[styles.presenceName, { color: colors.text }]}>{formatChildName(child.name)}</Text><View style={[styles.presenceStatus, { backgroundColor: confirmed ? colors.action : colors.surfaceSecondary }]}>{confirmed ? <CheckCircle size={18} weight="fill" color={colors.background} /> : null}<Text style={[styles.presenceStatusText, { color: confirmed ? colors.background : colors.textSecondary }]}>{confirmed ? 'Je suis là !' : 'Toucher ici'}</Text></View></TouchableOpacity>
  ); })}</View></View>;

  const mood = <View style={styles.centerStage}><Text style={styles.stageEmoji}>💭</Text><Text style={[styles.stageTitle, { color: colors.text }]}>{moodChild ? `${formatChildName(moodChild.name)}, comment ça va ?` : 'Tout est prêt !'}</Text><Text style={[styles.stageHelp, { color: colors.textSecondary }]}>{moodChild ? 'Une réponse simple pour adapter le rythme. Il n’y a pas de mauvaise humeur.' : 'Les humeurs sont enregistrées. Vous pouvez commencer.'}</Text>{moodChild ? <View style={styles.moodGrid}>{[...POSITIVE_MOODS, ...NEGATIVE_MOODS].map((item) => { const option = MOOD_CONFIG[item]; return <TouchableOpacity key={item} accessibilityRole="button" accessibilityLabel={option.label} onPress={() => chooseMood(item)} activeOpacity={0.8} style={[styles.moodCard, { backgroundColor: colors.surface, borderColor: colors.border }]}><OpenMoji emoji={option.emoji} size={38} /><Text style={[styles.moodLabel, { color: colors.text }]}>{option.label}</Text></TouchableOpacity>; })}</View> : <View style={[styles.readyCard, { backgroundColor: colors.actionSoft }]}><Play size={32} weight="fill" color={colors.action} /><Text style={[styles.readyText, { color: colors.text }]}>{selectedChildren.map((child) => formatChildName(child.name)).join(', ')}</Text></View>}</View>;

  const disabled = stage === 'prepare' ? !selectedIds.length || hasEmptyRoutine : stage === 'presence' ? !allPresent : false;
  const primaryLabel = stage === 'prepare' ? 'Confirmer les participants' : stage === 'presence' ? 'Choisir les humeurs' : moodChild ? 'Passer cette humeur' : 'Commencer la routine';
  const primaryAction = () => stage === 'prepare' ? setStage('presence') : stage === 'presence' ? setStage('mood') : moodChild ? setMoods((current) => ({ ...current, [moodChild.id]: 'motivated' })) : start();

  return <LinearGradient colors={[colors.background, colors.surface, colors.background]} style={styles.gradient}><SafeAreaView style={styles.safe}><View style={[styles.shell, { width: contentWidth, maxWidth: '100%' }]}>
    <View style={styles.topBar}><TouchableOpacity accessibilityRole="button" accessibilityLabel="Retour" onPress={goBack} style={[styles.backButton, { backgroundColor: colors.surface, borderColor: colors.border }]}><ArrowLeft size={21} weight="bold" color={colors.text} /></TouchableOpacity><View style={styles.progressSteps}>{STAGES.map((item, index) => { const activeIndex = STAGES.findIndex((candidate) => candidate.id === stage); const active = index === activeIndex; const done = index < activeIndex; return <View key={item.id} style={styles.progressItem}><View style={[styles.progressDot, { backgroundColor: done || active ? colors.action : colors.surfaceSecondary, borderColor: done || active ? colors.action : colors.border }]}>{done ? <Check size={12} weight="bold" color={colors.background} /> : <Text style={[styles.progressNumber, { color: active ? colors.background : colors.textSecondary }]}>{index + 1}</Text>}</View>{!compact ? <Text style={[styles.progressLabel, { color: active ? colors.text : colors.textSecondary }]}>{item.label}</Text> : null}</View>; })}</View></View>
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">{stage === 'prepare' ? prepare : stage === 'presence' ? presence : mood}</ScrollView>
    <View style={[styles.footer, { backgroundColor: colors.navigationBackdrop, borderColor: colors.border }]}><TouchableOpacity accessibilityRole="button" onPress={goBack} style={[styles.secondaryButton, { borderColor: colors.border }]}><Text style={[styles.secondaryButtonText, { color: colors.text }]}>Retour</Text></TouchableOpacity><TouchableOpacity aria-disabled={disabled} accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={primaryAction} activeOpacity={0.84} style={[styles.primaryButton, { backgroundColor: disabled ? colors.surfaceSecondary : colors.action }]}><Text style={[styles.primaryButtonText, { color: disabled ? colors.textLight : colors.background }]}>{primaryLabel}</Text><ArrowRight size={19} weight="bold" color={disabled ? colors.textLight : colors.background} /></TouchableOpacity></View>
  </View></SafeAreaView></LinearGradient>;
}

const styles = StyleSheet.create({
  gradient: { flex: 1 }, safe: { flex: 1, alignItems: 'center' }, shell: { flex: 1 }, topBar: { minHeight: 72, paddingHorizontal: SPACING.sm, flexDirection: 'row', alignItems: 'center', gap: SPACING.md }, backButton: { width: 46, height: 46, borderRadius: 15, borderWidth: 1, alignItems: 'center', justifyContent: 'center' }, progressSteps: { flex: 1, flexDirection: 'row', justifyContent: 'flex-end', gap: SPACING.md }, progressItem: { flexDirection: 'row', alignItems: 'center', gap: 6 }, progressDot: { width: 27, height: 27, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' }, progressNumber: { fontSize: FONT_SIZE.xs, fontWeight: '800' }, progressLabel: { fontSize: FONT_SIZE.xs, fontWeight: '700' }, scroll: { padding: SPACING.sm, paddingBottom: SPACING.xl, gap: SPACING.md },
  hero: { borderRadius: 24, padding: SPACING.lg, flexDirection: 'row', alignItems: 'center', gap: SPACING.md }, heroIcon: { width: 74, height: 74, borderRadius: 22, alignItems: 'center', justifyContent: 'center' }, heroCopy: { flex: 1, minWidth: 0, gap: 4 }, eyebrow: { fontSize: FONT_SIZE.xs, fontWeight: '800', letterSpacing: 0.8 }, title: { fontSize: FONT_SIZE.xl, lineHeight: 29, fontWeight: '800' }, subtitle: { fontSize: FONT_SIZE.sm, lineHeight: 20 }, panel: { borderRadius: 22, borderWidth: 1, padding: SPACING.md, gap: SPACING.md, ...SHADOWS.sm }, sectionHeading: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }, sectionTitle: { fontSize: FONT_SIZE.lg, fontWeight: '800' }, help: { fontSize: FONT_SIZE.sm, lineHeight: 20, marginTop: -SPACING.sm },
  childrenGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm }, childChoice: { minWidth: 150, flexGrow: 1, minHeight: 76, borderRadius: 18, borderWidth: 1.5, padding: SPACING.sm, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }, childName: { flex: 1, minWidth: 0, fontSize: FONT_SIZE.md, fontWeight: '700' }, choiceCheck: { width: 25, height: 25, borderRadius: 13, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' }, routineBlock: { gap: 2 }, routineLabel: { fontSize: FONT_SIZE.sm, fontWeight: '800', marginBottom: SPACING.xs }, stepRow: { minHeight: 66, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, borderBottomWidth: 1 }, stepIndex: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }, stepIndexText: { fontSize: FONT_SIZE.sm, fontWeight: '800' }, stepCopy: { flex: 1, minWidth: 0 }, stepTitle: { fontSize: FONT_SIZE.sm, fontWeight: '700' }, stepMeta: { fontSize: FONT_SIZE.xs, marginTop: 2 }, orderButtons: { flexDirection: 'row' }, orderButton: { width: 36, height: 44, alignItems: 'center', justifyContent: 'center' },
  warning: { borderRadius: 16, padding: SPACING.md, gap: SPACING.sm }, warningText: { fontSize: FONT_SIZE.sm, lineHeight: 20, fontWeight: '600' }, editLink: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 6 }, editLinkText: { fontSize: FONT_SIZE.sm, fontWeight: '800' }, centerStage: { flex: 1, minHeight: 520, alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING.lg }, stageEmoji: { fontSize: 45 }, stageTitle: { fontSize: FONT_SIZE.xl, fontWeight: '800', textAlign: 'center', marginTop: SPACING.sm }, stageHelp: { maxWidth: 440, fontSize: FONT_SIZE.sm, lineHeight: 21, textAlign: 'center', marginTop: SPACING.sm, marginBottom: SPACING.lg },
  presenceGrid: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: SPACING.md }, presenceCard: { minWidth: 180, maxWidth: 260, flexGrow: 1, minHeight: 220, borderRadius: 26, borderWidth: 2, padding: SPACING.lg, alignItems: 'center', justifyContent: 'center', gap: SPACING.md, ...SHADOWS.sm }, presenceName: { fontSize: FONT_SIZE.lg, fontWeight: '800' }, presenceStatus: { minHeight: 44, borderRadius: 22, paddingHorizontal: SPACING.md, flexDirection: 'row', alignItems: 'center', gap: 6 }, presenceStatusText: { fontSize: FONT_SIZE.sm, fontWeight: '800' }, moodGrid: { width: '100%', maxWidth: 560, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: SPACING.sm }, moodCard: { width: 112, minHeight: 112, borderRadius: 24, borderWidth: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.xs, ...SHADOWS.sm }, moodLabel: { fontSize: FONT_SIZE.sm, fontWeight: '700' }, readyCard: { width: '100%', maxWidth: 440, minHeight: 150, borderRadius: 26, alignItems: 'center', justifyContent: 'center', gap: SPACING.md }, readyText: { fontSize: FONT_SIZE.lg, fontWeight: '800', textAlign: 'center' },
  footer: { borderTopWidth: 1, padding: SPACING.sm, flexDirection: 'row', gap: SPACING.sm }, secondaryButton: { minHeight: 54, borderRadius: 17, borderWidth: 1, paddingHorizontal: SPACING.md, alignItems: 'center', justifyContent: 'center' }, secondaryButtonText: { fontSize: FONT_SIZE.sm, fontWeight: '700' }, primaryButton: { minHeight: 54, flex: 1, borderRadius: 17, paddingHorizontal: SPACING.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm }, primaryButtonText: { fontSize: FONT_SIZE.sm, fontWeight: '800', textAlign: 'center', flexShrink: 1 },
});
