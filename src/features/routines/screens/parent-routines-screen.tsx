import React, { useMemo, useState } from 'react';
import { Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Copy, MagnifyingGlass, PencilSimple, Plus, Star, Trash } from 'phosphor-react-native';
import { PastelOrbs } from '../../../components/ui/PastelOrbs';
import { ResponsiveOverlay } from '../../../components/ui/ResponsiveOverlay';
import { RoutineShareModal } from '../../../components/routine/RoutineShareModal';
import { OpenMoji } from '../../../components/ui/OpenMoji';
import { showAppAlert, showAppConfirm, showAppToast } from '../../../components/feedback/AppFeedbackProvider';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { useChildrenStore } from '../../../stores/childrenStore';
import { useRoutineStore } from '../../../stores/routineStore';
import type { Routine } from '../../../types';
import { CATEGORY_CONFIG, CONTENT_MAX_WIDTH, FONT_SIZE, SHADOWS, SPACING, type ThemeColors } from '../../../constants/theme';
import { formatChildName } from '../../../utils/children';
import { formatDuration } from '../../../utils/date';

type Status = 'all' | 'active' | 'paused';

export function ParentRoutinesScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { colors } = useAppTheme();
  const children = useChildrenStore((state) => state.children);
  const routines = useRoutineStore((state) => state.routines);
  const toggleRoutine = useRoutineStore((state) => state.toggleRoutine);
  const toggleFavorite = useRoutineStore((state) => state.toggleFavorite);
  const duplicateRoutine = useRoutineStore((state) => state.duplicateRoutine);
  const trashRoutine = useRoutineStore((state) => state.trashRoutine);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<Status>('all');
  const [childFilter, setChildFilter] = useState<string>('all');
  const [selected, setSelected] = useState<Routine | null>(null);
  const [sharing, setSharing] = useState<Routine | null>(null);
  const [exporting, setExporting] = useState(false);
  const exportDocument = async (print: boolean) => {
    const child = children.find((item) => item.id === selected?.childId);
    if (!selected || !child || exporting) return;
    setExporting(true);
    try {
      const service = await import('../../../services/exportRoutine');
      if (print) await service.printRoutine(selected, child);
      else await service.exportRoutineToPDF(selected, child);
    } catch {
      showAppAlert({ title: 'Export impossible', message: 'Réessayez et autorisez la fenêtre d’impression si nécessaire.', tone: 'warning' });
    } finally { setExporting(false); }
  };
  const contentWidth = Math.min(width - SPACING.lg * 2, CONTENT_MAX_WIDTH.lg);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('fr');
    return routines.filter((routine) => {
      const matchesQuery = !normalized || `${routine.name} ${routine.description ?? ''}`.toLocaleLowerCase('fr').includes(normalized);
      const matchesStatus = status === 'all' || (status === 'active' ? routine.isActive : !routine.isActive);
      return matchesQuery && matchesStatus && (childFilter === 'all' || routine.childId === childFilter);
    });
  }, [childFilter, query, routines, status]);

  const createRoutine = () => {
    if (!children.length) {
      showAppAlert({ title: 'Ajoutez d’abord un enfant', message: 'Une routine doit être associée à au moins un enfant.', tone: 'warning', icon: '🌿' });
      router.push('/parent/add-child');
      return;
    }
    router.push('/parent/add-routine');
  };

  const duplicate = () => {
    if (!selected) return;
    const copy = duplicateRoutine(selected.id, selected.childId);
    if (copy) showAppToast({ title: 'Routine dupliquée', message: copy.name, tone: 'success', icon: copy.icon });
    setSelected(null);
  };
  const remove = async () => {
    if (!selected) return;
    const routine = selected;
    const confirmed = await showAppConfirm({ title: 'Placer dans la corbeille ?', message: routine.name, tone: 'warning', icon: routine.icon, confirmLabel: 'Mettre à la corbeille', cancelLabel: 'Garder', confirmKind: 'danger' });
    if (confirmed) { trashRoutine(routine.id); setSelected(null); }
  };

  return <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
    <PastelOrbs quiet />
    <ScrollView contentContainerStyle={[styles.scroll, { alignItems: 'center' }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <View style={[styles.content, { width: contentWidth, maxWidth: '100%' }]}>
        <View style={styles.headingRow}>
          <Pressable accessibilityRole="button" accessibilityLabel="Retour à Parent" onPress={() => router.replace('/parent')} style={[styles.back, { backgroundColor: colors.surface, borderColor: colors.border }]}><ArrowLeft size={21} weight="bold" color={colors.text} /></Pressable>
          <View style={styles.headingCopy}><Text style={[styles.eyebrow, { color: colors.action }]}>OUTILS PARENT</Text><Text style={[styles.title, { color: colors.text }]}>Préparer les routines.</Text><Text style={[styles.subtitle, { color: colors.textSecondary }]}>Toutes les routines de la famille au même endroit. Le prénom indique à qui elles sont destinées.</Text></View>
          <Pressable accessibilityRole="button" onPress={createRoutine} style={[styles.create, { backgroundColor: colors.action }]}><Plus size={19} weight="bold" color={colors.background} /><Text style={[styles.createText, { color: colors.background }]}>Nouvelle routine</Text></Pressable>
        </View>

        <View style={[styles.tools, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.search, { backgroundColor: colors.cardHighlight, borderColor: colors.border }]}><MagnifyingGlass size={18} color={colors.textSecondary} /><TextInput value={query} onChangeText={setQuery} placeholder="Rechercher une routine" placeholderTextColor={colors.textLight} style={[styles.searchInput, { color: colors.text }]} /></View>
          <View style={styles.filterRow}><Filter label="Toutes" active={status === 'all'} onPress={() => setStatus('all')} colors={colors} /><Filter label="Actives" active={status === 'active'} onPress={() => setStatus('active')} colors={colors} /><Filter label="En pause" active={status === 'paused'} onPress={() => setStatus('paused')} colors={colors} /></View>
          {children.length > 1 ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}><Filter label="Tous les enfants" active={childFilter === 'all'} onPress={() => setChildFilter('all')} colors={colors} />{children.map((child) => <Filter key={child.id} label={formatChildName(child.name)} active={childFilter === child.id} onPress={() => setChildFilter(child.id)} colors={colors} />)}</ScrollView> : null}
        </View>

        <View style={styles.listHeading}><Text style={[styles.sectionTitle, { color: colors.text }]}>Routines</Text><Text style={[styles.count, { color: colors.textSecondary }]}>{filtered.length} sur {routines.length}</Text></View>
        {filtered.length ? <View style={styles.list}>{filtered.map((routine) => <RoutineRow key={routine.id} routine={routine} childName={children.find((child) => child.id === routine.childId)?.name} colors={colors} onToggle={() => toggleRoutine(routine.id)} onToggleFavorite={() => toggleFavorite(routine.id)} onEdit={() => router.push(`/parent/edit-routine?id=${routine.id}`)} onMore={() => setSelected(routine)} />)}</View> : <View style={[styles.empty, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={styles.emptyEmoji}>🌿</Text><Text style={[styles.emptyTitle, { color: colors.text }]}>{routines.length ? 'Aucun résultat' : 'Aucune routine préparée'}</Text><Text style={[styles.emptyText, { color: colors.textSecondary }]}>{routines.length ? 'Essayez un autre filtre.' : 'Créez une routine courte, puis ajustez-la avec l’enfant pendant le moment accompagné.'}</Text>{routines.length ? <Pressable accessibilityRole="button" onPress={() => { setQuery(''); setStatus('all'); setChildFilter('all'); }} style={[styles.emptyAction, { backgroundColor: colors.actionSoft }]}><Text style={[styles.emptyActionText, { color: colors.action }]}>Effacer les filtres</Text></Pressable> : <Pressable accessibilityRole="button" onPress={createRoutine} style={[styles.emptyAction, { backgroundColor: colors.actionSoft }]}><Text style={[styles.emptyActionText, { color: colors.action }]}>Créer une routine</Text></Pressable>}</View>}
      </View>
    </ScrollView>
    <ResponsiveOverlay visible={Boolean(selected)} title={selected?.name ?? 'Routine'} subtitle="Les actions secondaires restent regroupées ici." onClose={() => setSelected(null)}>
      <Pressable accessibilityRole="button" onPress={() => { setSharing(selected); setSelected(null); }} style={[styles.overlayAction, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.overlayTitle, { color: colors.text }]}>Partager ou exporter en JSON</Text></Pressable>
      {Platform.OS === 'web' ? <>
        <Pressable accessibilityRole="button" disabled={exporting} onPress={() => void exportDocument(false)} style={[styles.overlayAction, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.overlayTitle, { color: colors.text }]}>{exporting ? 'Préparation…' : 'Télécharger le PDF'}</Text></Pressable>
        <Pressable accessibilityRole="button" disabled={exporting} onPress={() => void exportDocument(true)} style={[styles.overlayAction, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.overlayTitle, { color: colors.text }]}>Imprimer</Text></Pressable>
      </> : null}
      {selected ? <><Pressable accessibilityRole="button" onPress={() => { const id = selected.id; setSelected(null); router.push(`/parent/edit-routine?id=${id}`); }} style={[styles.overlayAction, { backgroundColor: colors.surface, borderColor: colors.border }]}><PencilSimple size={20} color={colors.text} /><View style={styles.overlayCopy}><Text style={[styles.overlayTitle, { color: colors.text }]}>Modifier</Text><Text style={[styles.overlayText, { color: colors.textSecondary }]}>Changer les étapes, le nom ou les enfants.</Text></View></Pressable><Pressable accessibilityRole="button" onPress={duplicate} style={[styles.overlayAction, { backgroundColor: colors.surface, borderColor: colors.border }]}><Copy size={20} color={colors.text} /><View style={styles.overlayCopy}><Text style={[styles.overlayTitle, { color: colors.text }]}>Dupliquer</Text><Text style={[styles.overlayText, { color: colors.textSecondary }]}>Créer une copie entièrement modifiable.</Text></View></Pressable><Pressable accessibilityRole="button" onPress={() => void remove()} style={[styles.overlayAction, { backgroundColor: colors.attentionSoft, borderColor: colors.attentionSoft }]}><Trash size={20} color={colors.attention} /><View style={styles.overlayCopy}><Text style={[styles.overlayTitle, { color: colors.text }]}>Mettre à la corbeille</Text><Text style={[styles.overlayText, { color: colors.textSecondary }]}>La routine pourra être restaurée pendant 30 jours.</Text></View></Pressable></> : null}
    </ResponsiveOverlay>
    <RoutineShareModal visible={Boolean(sharing)} routine={sharing} onClose={() => setSharing(null)} />
  </SafeAreaView>;
}

function Filter({ label, active, onPress, colors }: { label: string; active: boolean; onPress: () => void; colors: ThemeColors }) { return <Pressable aria-pressed={active} accessibilityRole="button" accessibilityState={{ selected: active }} onPress={onPress} style={[styles.filter, { backgroundColor: active ? colors.actionSoft : colors.surfaceSecondary, borderColor: active ? colors.action : colors.surfaceSecondary }]}><Text style={[styles.filterText, { color: colors.text }]}>{label}</Text></Pressable>; }

function RoutineRow({ routine, childName, colors, onToggle, onToggleFavorite, onEdit, onMore }: { routine: Routine; childName?: string; colors: ThemeColors; onToggle: () => void; onToggleFavorite: () => void; onEdit: () => void; onMore: () => void }) {
  const category = CATEGORY_CONFIG[routine.category];
  const duration = routine.steps.reduce((sum, step) => sum + step.durationMinutes, 0);
  return <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={styles.rowMain}><View style={[styles.icon, { backgroundColor: routine.isActive ? colors.actionSoft : colors.surfaceSecondary }]}><OpenMoji emoji={routine.icon} size={34} /></View><View style={styles.rowCopy}><Text style={[styles.rowTitle, { color: colors.text }]} numberOfLines={2}>{routine.name}</Text><Text style={[styles.rowMeta, { color: colors.textSecondary }]}>{formatChildName(childName ?? 'Enfant')} · {category?.label ?? 'Routine'} · {routine.steps.length} étape{routine.steps.length > 1 ? 's' : ''} · {formatDuration(duration)}</Text></View><Pressable accessibilityRole="button" accessibilityLabel={`Plus d’actions pour ${routine.name}`} onPress={onMore} style={styles.more}><Text style={[styles.moreText, { color: colors.text }]}>•••</Text></Pressable></View><View style={[styles.rowFooter, { borderColor: colors.divider }]}><Pressable aria-checked={routine.isActive} accessibilityRole="switch" accessibilityState={{ checked: routine.isActive }} accessibilityLabel={`${routine.isActive ? 'Mettre en pause' : 'Activer'} ${routine.name}`} onPress={onToggle} style={styles.toggleControl}><View style={[styles.toggle, { backgroundColor: routine.isActive ? colors.action : colors.surfaceSecondary }]}><View style={[styles.toggleKnob, { backgroundColor: colors.surface, transform: [{ translateX: routine.isActive ? 18 : 0 }] }]} /></View><Text style={[styles.toggleLabel, { color: routine.isActive ? colors.action : colors.textSecondary }]}>{routine.isActive ? 'Active' : 'En pause'}</Text></Pressable><View style={styles.rowActions}><Pressable aria-pressed={Boolean(routine.isFavorite)} accessibilityRole="button" accessibilityState={{ selected: Boolean(routine.isFavorite) }} accessibilityLabel={`${routine.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'} ${routine.name}`} onPress={onToggleFavorite} style={[styles.favoriteButton, { backgroundColor: routine.isFavorite ? colors.transitionSoft : colors.surfaceSecondary }]}><Star size={19} weight={routine.isFavorite ? 'fill' : 'regular'} color={routine.isFavorite ? colors.transition : colors.textSecondary} /></Pressable><Pressable accessibilityRole="button" accessibilityLabel={`Modifier ${routine.name}`} onPress={onEdit} style={[styles.editButton, { backgroundColor: colors.surfaceSecondary }]}><PencilSimple size={18} color={colors.text} /><Text style={[styles.editText, { color: colors.text }]}>Modifier</Text></Pressable></View></View></View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1 }, scroll: { padding: SPACING.lg, paddingBottom: 120 }, content: { gap: SPACING.lg }, headingRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', gap: SPACING.md }, back: { width: 48, height: 48, borderRadius: 15, borderWidth: 1, alignItems: 'center', justifyContent: 'center' }, headingCopy: { flex: 1, minWidth: 250, gap: 5 }, eyebrow: { fontSize: FONT_SIZE.xs, fontWeight: '800', letterSpacing: 0.8 }, title: { fontSize: FONT_SIZE.xxl, lineHeight: 39, fontWeight: '700', letterSpacing: -0.7 }, subtitle: { maxWidth: 680, fontSize: FONT_SIZE.sm, lineHeight: 21 }, create: { minHeight: 50, borderRadius: 15, paddingHorizontal: SPACING.md, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }, createText: { fontSize: FONT_SIZE.sm, fontWeight: '800' },
  tools: { borderRadius: 22, borderWidth: 1, padding: SPACING.md, gap: SPACING.sm, ...SHADOWS.sm }, search: { minHeight: 52, borderRadius: 15, borderWidth: 1, paddingHorizontal: SPACING.md, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }, searchInput: { flex: 1, minWidth: 0, fontSize: FONT_SIZE.sm }, filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm }, filter: { minHeight: 42, borderRadius: 14, borderWidth: 1, paddingHorizontal: SPACING.md, alignItems: 'center', justifyContent: 'center' }, filterText: { fontSize: FONT_SIZE.xs, fontWeight: '700' }, listHeading: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }, sectionTitle: { fontSize: FONT_SIZE.xl, fontWeight: '700' }, count: { fontSize: FONT_SIZE.xs }, list: { gap: SPACING.sm },
  row: { minHeight: 116, borderRadius: 20, borderWidth: 1, padding: SPACING.sm, gap: SPACING.sm, ...SHADOWS.sm }, rowMain: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }, icon: { width: 58, height: 58, borderRadius: 19, alignItems: 'center', justifyContent: 'center' }, rowCopy: { flex: 1, minWidth: 0 }, rowTitle: { fontSize: FONT_SIZE.md, lineHeight: 21, fontWeight: '800' }, rowMeta: { marginTop: 5, fontSize: FONT_SIZE.xs, lineHeight: 17 }, more: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }, moreText: { fontSize: FONT_SIZE.lg, fontWeight: '800', letterSpacing: 1 }, rowFooter: { minHeight: 48, borderTopWidth: 1, paddingTop: SPACING.sm, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: SPACING.sm }, toggleControl: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }, toggle: { width: 48, height: 30, borderRadius: 15, padding: 3, justifyContent: 'center' }, toggleKnob: { width: 24, height: 24, borderRadius: 12, ...SHADOWS.sm }, toggleLabel: { fontSize: FONT_SIZE.xs, fontWeight: '800' }, rowActions: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs }, favoriteButton: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }, editButton: { minHeight: 44, borderRadius: 14, paddingHorizontal: SPACING.md, flexDirection: 'row', alignItems: 'center', gap: 6 }, editText: { fontSize: FONT_SIZE.xs, fontWeight: '800' },
  empty: { minHeight: 320, borderRadius: 22, borderWidth: 1, padding: SPACING.xl, alignItems: 'center', justifyContent: 'center', gap: SPACING.sm }, emptyEmoji: { fontSize: 44 }, emptyTitle: { fontSize: FONT_SIZE.xl, fontWeight: '700', textAlign: 'center' }, emptyText: { maxWidth: 480, fontSize: FONT_SIZE.sm, lineHeight: 21, textAlign: 'center' }, emptyAction: { minHeight: 48, marginTop: SPACING.sm, borderRadius: 14, paddingHorizontal: SPACING.lg, alignItems: 'center', justifyContent: 'center' }, emptyActionText: { fontSize: FONT_SIZE.sm, fontWeight: '800' },
  overlayAction: { minHeight: 76, borderRadius: 18, borderWidth: 1, padding: SPACING.md, flexDirection: 'row', alignItems: 'center', gap: SPACING.md }, overlayCopy: { flex: 1, minWidth: 0 }, overlayTitle: { fontSize: FONT_SIZE.md, fontWeight: '800' }, overlayText: { marginTop: 3, fontSize: FONT_SIZE.xs, lineHeight: 17 },
});
