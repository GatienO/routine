import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  TextInput,
  ScrollView,
  Pressable,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  ArrowsDownUp,
  Copy,
  FunnelSimple,
  MagnifyingGlass,
  PencilSimpleLine,
  Plus,
  Trash,
} from 'phosphor-react-native';
import { useChildrenStore } from '../../src/stores/childrenStore';
import { useRoutineStore } from '../../src/stores/routineStore';
import { CompactRoutineRow } from '../../src/components/routine/CompactRoutineRow';
import { DraggableList } from '../../src/components/ui/DraggableList';
import { CATEGORY_CONFIG } from '../../src/constants/theme';
import {
  showAppAlert,
  showAppConfirm,
  showAppToast,
} from '../../src/components/feedback/AppFeedbackProvider';
import { Routine, RoutineCategory } from '../../src/types';
import { formatChildName } from '../../src/utils/children';
import { backOrReplace } from '../../src/utils/navigation';
import { OpenMoji } from '../../src/components/ui/OpenMoji';

// ── Design tokens ──────────────────────────────────────────────────────────
const P = {
  rose:      '#E8B4D4',
  roseSoft:  '#F7E2F2',
  blue:      '#B4D4E8',
  blueSoft:  '#E2F0F7',
  green:     '#C4E8B4',
  greenSoft: '#E8F7E0',
  card:      'rgba(255,255,255,0.97)',
  text:      '#3A3250',
  textSub:   '#7B7090',
  textMuted: '#C0B8CC',
  white:     '#FFFFFF',
} as const;

// Organic halo tints — cycle per card index
const HALO: string[] = [
  P.roseSoft, P.blueSoft, P.greenSoft, '#FFF6EE', '#F2F0FF', '#F0FFF5',
];

type StatusFilter = 'all' | 'active' | 'inactive';
type CategoryFilter = 'all' | RoutineCategory;

export default function ParentRoutinesScreen() {
  const router = useRouter();
  const children = useChildrenStore((state) => state.children);
  const routines = useRoutineStore((state) => state.routines);
  const toggleRoutine = useRoutineStore((state) => state.toggleRoutine);
  const reorderRoutines = useRoutineStore((state) => state.reorderRoutines);
  const removeRoutine = useRoutineStore((state) => state.removeRoutine);
  const duplicateRoutine = useRoutineStore((state) => state.duplicateRoutine);

  const [selectedChildId, setSelectedChildId] = useState<string | null>(children[0]?.id ?? null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [organizeMode, setOrganizeMode] = useState(false);
  const [mergeMode, setMergeMode] = useState(false);
  const [mergeSelection, setMergeSelection] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const gradientColors: [string, string, string] = [P.blue, P.green, P.rose];

  if (children.length === 0) {
      setSelectedChildId(null);
      return;
    }

    if (!selectedChildId || !children.some((child) => child.id === selectedChildId)) {
      setSelectedChildId(children[0].id);
    }
  }, [children, selectedChildId]);

  const routinesByChild = useMemo(() => {
    const map: Record<string, Routine[]> = {};
    routines.forEach((routine) => {
      if (!map[routine.childId]) map[routine.childId] = [];
      map[routine.childId].push(routine);
    });
    return map;
  }, [routines]);

  const childRoutines = selectedChildId ? routinesByChild[selectedChildId] ?? [] : [];
  const categoryOptions = useMemo(
    () => (['all', ...Object.keys(CATEGORY_CONFIG)] as CategoryFilter[]),
    [],
  );
  const filteredRoutines = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return childRoutines.filter((routine) => {
      const matchesQuery =
        query.length === 0 ||
        routine.name.toLowerCase().includes(query) ||
        (routine.description ?? '').toLowerCase().includes(query);
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && routine.isActive) ||
        (statusFilter === 'inactive' && !routine.isActive);
      const matchesCategory =
        categoryFilter === 'all' || routine.category === categoryFilter;
      return matchesQuery && matchesStatus && matchesCategory;
    });
  }, [categoryFilter, childRoutines, searchQuery, statusFilter]);

  const displayedRoutines = organizeMode ? childRoutines : filteredRoutines;
  const selectedChild = children.find((child) => child.id === selectedChildId);
  const activeCount = childRoutines.filter((routine) => routine.isActive).length;
  const hasActiveFilters =
    searchQuery.length > 0 || statusFilter !== 'all' || categoryFilter !== 'all';

  const handleDeleteRoutine = async (routine: Routine) => {
    const confirmed = await showAppConfirm({
      title: 'Supprimer',
      message: `Supprimer la routine "${routine.name}" ?`,
      tone: 'danger',
      icon: '🗑️',
      confirmLabel: 'Supprimer',
      cancelLabel: 'Annuler',
      confirmKind: 'danger',
    });

    if (confirmed) {
      removeRoutine(routine.id);
    }
  };

  const handleDuplicateRoutine = (routine: Routine) => {
    duplicateRoutine(routine.id, routine.childId);
    showAppToast({
      title: 'Routine dupliquee',
      message: `"${routine.name}" a ete dupliquee.`,
      tone: 'success',
      icon: '🪄',
    });
  };

  const toggleMergeSelect = (routineId: string) => {
    setMergeSelection((prev) =>
      prev.includes(routineId)
        ? prev.filter((id) => id !== routineId)
        : [...prev, routineId],
    );
  };

  const handleMerge = () => {
    if (mergeSelection.length < 2) {
      showAppAlert({
        title: 'Selection',
        message: 'Selectionnez au moins 2 routines a fusionner.',
        tone: 'warning',
        icon: '🧩',
      });
      return;
    }

    router.push({
      pathname: '/parent/add-routine',
      params: { mergeIds: mergeSelection.join(',') },
    });
    setMergeMode(false);
    setMergeSelection([]);
  };

  const handleGoToAddRoutine = () => {
    if (children.length === 0) {
      showAppAlert({
        title: 'Enfant requis',
        message: 'Créez d abord un enfant avant de créer une routine.',
        tone: 'warning',
        icon: '👶',
      });
      router.push('/parent/add-child');
      return;
    }

    router.push('/parent/add-routine');
  };

  const header = (
    <View style={styles.headerBlock}>
      {/* ── Top bar ── */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.circleBtn}
          onPress={() => backOrReplace(router, '/parent')}
          activeOpacity={0.82}
        >
          <ArrowLeft size={20} weight="bold" color={P.textSub} />
        </TouchableOpacity>

        <Text style={styles.pageTitle}>Mes Routines</Text>

        <TouchableOpacity
          style={[
            styles.circleBtn,
            (showFilters || hasActiveFilters) && styles.circleBtnActive,
          ]}
          onPress={() => setShowFilters((v) => !v)}
          activeOpacity={0.82}
        >
          <FunnelSimple
            size={20}
            weight="bold"
            color={showFilters || hasActiveFilters ? P.white : P.textSub}
          />
        </TouchableOpacity>
      </View>

      {/* ── Collapsible filter panel ── */}
      {showFilters ? (
        <View style={styles.filterPanel}>
          {/* Child selector */}
          {children.length > 1 ? (
            <FlatList
              data={children}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.childTabsRow}
              renderItem={({ item }) => {
                const count = routinesByChild[item.id]?.length ?? 0;
                const isSelected = item.id === selectedChildId;
                return (
                  <TouchableOpacity
                    style={[styles.childTab, isSelected && styles.childTabActive]}
                    onPress={() => {
                      setSelectedChildId(item.id);
                      setOrganizeMode(false);
                      setMergeMode(false);
                      setMergeSelection([]);
                    }}
                    activeOpacity={0.82}
                  >
                    <Text style={[styles.childTabLabel, isSelected && styles.childTabLabelActive]}>
                      {formatChildName(item.name)}
                    </Text>
                    <View style={[styles.childTabBadge, isSelected && styles.childTabBadgeActive]}>
                      <Text style={[styles.childTabBadgeText, isSelected && styles.childTabBadgeTextActive]}>
                        {count}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          ) : null}

          {/* Search */}
          <View style={styles.searchShell}>
            <MagnifyingGlass size={16} color={P.textSub} weight="bold" />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Rechercher une routine…"
              placeholderTextColor={P.textMuted}
            />
          </View>

          {/* Status filter chips */}
          <ChipRow
            options={[
              { value: 'all', label: 'Toutes' },
              { value: 'active', label: '🟢 Actives' },
              { value: 'inactive', label: '⏸ Inactives' },
            ]}
            selected={statusFilter}
            onSelect={(v) => setStatusFilter(v as StatusFilter)}
            accent={P.rose}
          />

          {/* Category filter chips */}
          <ChipRow
            options={categoryOptions.map((v) => ({
              value: v,
              label:
                v === 'all'
                  ? '🗂 Toutes'
                  : `${CATEGORY_CONFIG[v]?.icon ?? ''} ${CATEGORY_CONFIG[v]?.label ?? v}`,
            }))}
            selected={categoryFilter}
            onSelect={(v) => setCategoryFilter(v as CategoryFilter)}
            accent={P.blue}
          />

          {/* Action chips */}
          <View style={styles.actionChipsRow}>
            <TouchableOpacity
              style={[styles.actionChip, organizeMode && { backgroundColor: P.blue }]}
              onPress={() => {
                setOrganizeMode(!organizeMode);
                setMergeMode(false);
                setMergeSelection([]);
              }}
              disabled={!selectedChild || childRoutines.length < 2}
              activeOpacity={0.82}
            >
              <ArrowsDownUp size={14} weight="bold" color={organizeMode ? P.white : P.textSub} />
              <Text style={[styles.actionChipText, organizeMode && { color: P.white }]}>Organiser</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionChip, mergeMode && { backgroundColor: P.rose }]}
              onPress={() => {
                setMergeMode(!mergeMode);
                setOrganizeMode(false);
                setMergeSelection([]);
              }}
              disabled={!selectedChild || childRoutines.length < 2}
              activeOpacity={0.82}
            >
              <FunnelSimple size={14} weight="bold" color={mergeMode ? P.white : P.textSub} />
              <Text style={[styles.actionChipText, mergeMode && { color: P.white }]}>Fusionner</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionChip}
              onPress={() => router.push('/parent/catalog')}
              activeOpacity={0.82}
            >
              <Text style={styles.actionChipText}>📚 Catalogue</Text>
            </TouchableOpacity>
          </View>

          {mergeMode && mergeSelection.length >= 2 ? (
            <TouchableOpacity style={styles.mergeBar} onPress={handleMerge} activeOpacity={0.88}>
              <Text style={styles.mergeBarText}>
                Fusionner {mergeSelection.length} routines →
              </Text>
            </TouchableOpacity>
          ) : null}

          {organizeMode ? (
            <View style={styles.modeBanner}>
              <Text style={styles.modeBannerText}>
                Mode organisation : {selectedChild ? formatChildName(selectedChild.name) : 'cet enfant'}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );

  if (children.length === 0) {
    return (
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safe}>
          <ScrollView contentContainerStyle={styles.listContent}>
            {header}
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>Ajoutez d&apos;abord un enfant</Text>
              <TouchableOpacity
                style={styles.emptyBtn}
                onPress={() => router.push("/parent/add-child")}
                activeOpacity={0.85}
              >
                <Text style={styles.emptyBtnText}>Créer un profil</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (organizeMode && selectedChildId) {
    return (
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safe}>
          <ScrollView contentContainerStyle={styles.listContent}>
            {header}
            <DraggableList
              data={childRoutines}
              keyExtractor={(routine) => routine.id}
              itemHeight={86}
              onReorder={(newOrder) => reorderRoutines(selectedChildId, newOrder.map((routine) => routine.id))}
              renderItem={(routine) => (
                <CompactRoutineRow
                  routine={routine}
                  onPress={() => router.push(`/parent/edit-routine?id=${routine.id}`)}
                  onToggle={() => toggleRoutine(routine.id)}
                  onDuplicate={() => handleDuplicateRoutine(routine)}
                  onDelete={() => handleDeleteRoutine(routine)}
                />
              )}
            />
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safe}>
        <FlatList
          data={displayedRoutines}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={header}
          ListEmptyComponent={(
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>🔎</Text>
              <Text style={styles.emptyTitle}>Aucune routine visible</Text>
              <Text style={styles.emptyText}>
                Ajustez votre recherche ou vos filtres pour afficher plus de routines.
              </Text>
            </View>
          )}
          ListFooterComponent={(
            <Pressable style={styles.addCard} onPress={handleGoToAddRoutine}>
              <View style={styles.addCircle}>
                <Plus size={22} color={P.text} weight="bold" />
              </View>
              <Text style={styles.addCardText}>Ajouter une routine</Text>
            </Pressable>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
          renderItem={({ item, index }) => (
            <RoutineCard
              routine={item}
              selected={mergeSelection.includes(item.id)}
              selectable={mergeMode}
              onSelect={() => toggleMergeSelect(item.id)}
              onEdit={() => router.push(`/parent/edit-routine?id=${item.id}`)}
              onToggle={() => toggleRoutine(item.id)}
              onDuplicate={() => handleDuplicateRoutine(item)}
              onDelete={() => handleDeleteRoutine(item)}
            />
          )}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

// ── RoutineCard ───────────────────────────────────────────────────────────────
function RoutineCard({
  routine,
  index,
  selected,
  selectable,
  onSelect,
  onEdit,
  onToggle,
  onDuplicate,
  onDelete,
}: {
  routine: Routine;
  index: number;
  selected: boolean;
  selectable: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onToggle: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const category = CATEGORY_CONFIG[routine.category];
  const haloColor = HALO[index % HALO.length];
  const visibleSteps = routine.steps.slice(0, 5);

  return (
    <View
      style={[
        styles.card,
        selected && styles.cardSelected,
        !routine.isActive && styles.cardInactive,
      ]}
    >
      {/* ── Top row: icon | name | pencil ── */}
      <View style={styles.cardTopRow}>
        {selectable ? (
          <TouchableOpacity
            style={[styles.selectCircle, selected && styles.selectCircleActive]}
            onPress={onSelect}
            activeOpacity={0.8}
          >
            <Text style={[styles.selectCircleText, selected && { color: P.white }]}>
              {selected ? '✓' : '+'}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.iconHalo, { backgroundColor: haloColor }]}>
            <OpenMoji emoji={routine.icon || category?.icon || '✨'} size={32} />
          </View>
        )}

        <Text style={styles.cardTitle} numberOfLines={1}>
          {routine.name}
        </Text>

        <TouchableOpacity style={styles.pencilBtn} onPress={onEdit} activeOpacity={0.75}>
          <PencilSimpleLine size={18} color={P.textMuted} weight="regular" />
        </TouchableOpacity>
      </View>

      {/* ── Steps preview ── */}
      {visibleSteps.length > 0 ? (
        <View style={styles.stepsRow}>
          {visibleSteps.map((step) => (
            <View key={step.id} style={styles.stepPill}>
              <OpenMoji emoji={step.icon} size={13} />
              <Text style={styles.stepPillText} numberOfLines={1}>{step.title}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {/* ── Footer: status + secondary actions ── */}
      <View style={styles.cardFooter}>
        <TouchableOpacity
          style={[
            styles.statusBadge,
            routine.isActive ? styles.statusBadgeOn : styles.statusBadgeOff,
          ]}
          onPress={onToggle}
          activeOpacity={0.8}
        >
          <Text
            style={[styles.statusBadgeText, !routine.isActive && styles.statusBadgeTextOff]}
          >
            {routine.isActive ? '● Active' : '○ Pause'}
          </Text>
        </TouchableOpacity>

        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.cardAction} onPress={onDuplicate} activeOpacity={0.8}>
            <Copy size={14} color={P.textSub} weight="bold" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.cardAction} onPress={onDelete} activeOpacity={0.8}>
            <Trash size={14} color="#D89090" weight="bold" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ── ChipRow ───────────────────────────────────────────────────────────────────
function ChipRow({
  options,
  selected,
  onSelect,
  accent,
}: {
  options: Array<{ value: string; label: string }>;
  selected: string;
  onSelect: (value: string) => void;
  accent: string;
}) {
  return (
    <FlatList
      data={options}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item.value}
      contentContainerStyle={{ gap: 8 }}
      renderItem={({ item }) => {
        const isSelected = item.value === selected;
        return (
          <TouchableOpacity
            style={[styles.filterChip, isSelected && { backgroundColor: accent }]}
            onPress={() => onSelect(item.value)}
            activeOpacity={0.82}
          >
            <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  // ── Root ──────────────────────────────────────────────────────────────────
  gradient: { flex: 1 },
  safe:     { flex: 1, backgroundColor: 'transparent' },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 64,
  },

  // ── Header ────────────────────────────────────────────────────────────────
  headerBlock: { marginBottom: 20, gap: 16 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  circleBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 12 },
      android: { elevation: 4 },
      web:     { boxShadow: '0 6px 12px rgba(0,0,0,0.1)' },
    }),
  },
  circleBtnActive: { backgroundColor: P.rose },
  pageTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '800',
    fontStyle: 'italic',
    color: P.white,
    letterSpacing: 0.3,
    ...Platform.select({
      ios: { textShadowColor: 'rgba(0,0,0,0.1)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6 },
    }),
  },

  // ── Filter panel ──────────────────────────────────────────────────────────
  filterPanel: {
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: 28,
    padding: 16,
    gap: 12,
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20 },
      android: { elevation: 5 },
      web:     { boxShadow: '0 10px 20px rgba(0,0,0,0.1)' },
    }),
  },
  childTabsRow: { gap: 8 },
  childTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.75)',
  },
  childTabActive:           { backgroundColor: P.blue },
  childTabLabel:            { fontSize: 14, fontWeight: '700', color: P.text },
  childTabLabelActive:      { color: P.white },
  childTabBadge: {
    minWidth: 22,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  childTabBadgeActive:      { backgroundColor: 'rgba(255,255,255,0.3)' },
  childTabBadgeText:        { fontSize: 11, fontWeight: '800', color: P.textSub },
  childTabBadgeTextActive:  { color: P.white },
  searchShell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 15, color: P.text },
  filterChip: {
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  filterChipText:       { fontSize: 13, fontWeight: '700', color: P.textSub },
  filterChipTextActive: { color: P.white },
  actionChipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  actionChipText: { fontSize: 13, fontWeight: '700', color: P.textSub },
  mergeBar: {
    backgroundColor: P.rose,
    borderRadius: 20,
    paddingVertical: 10,
    alignItems: 'center',
  },
  mergeBarText: { fontSize: 15, fontWeight: '800', color: P.white },
  modeBanner: {
    backgroundColor: `${P.blue}40`,
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  modeBannerText: { fontSize: 13, fontWeight: '600', color: P.textSub },

  // ── Routine card ──────────────────────────────────────────────────────────
  card: {
    backgroundColor: P.card,
    borderRadius: 28,
    padding: 18,
    gap: 12,
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.08, shadowRadius: 20 },
      android: { elevation: 6 },
      web:     { boxShadow: '0 10px 20px rgba(0,0,0,0.08)' },
    }),
  },
  cardSelected: { borderWidth: 2, borderColor: P.blue },
  cardInactive: { opacity: 0.72 },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconHalo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: P.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectCircleActive:  { backgroundColor: P.blue, borderColor: P.blue },
  selectCircleText:    { fontSize: 14, fontWeight: '900', color: P.textSub },
  cardTitle: {
    flex: 1,
    fontSize: 19,
    fontWeight: '800',
    fontStyle: 'italic',
    color: P.text,
    letterSpacing: 0.15,
  },
  pencilBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stepPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    maxWidth: '48%',
    backgroundColor: '#F6F5FC',
    borderRadius: 14,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  stepPillText: {
    flexShrink: 1,
    fontSize: 13,
    fontWeight: '600',
    color: P.textSub,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  statusBadgeOn:       { backgroundColor: '#E6F8F2' },
  statusBadgeOff:      { backgroundColor: 'rgba(0,0,0,0.05)' },
  statusBadgeText:     { fontSize: 12, fontWeight: '800', color: '#3BBFA0' },
  statusBadgeTextOff:  { color: P.textSub },
  cardActions: { flexDirection: 'row', gap: 6 },
  cardAction: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.04)',
  },

  // ── Add card ──────────────────────────────────────────────────────────────
  addCard: {
    marginTop: 14,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 28,
    minHeight: 84,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.07, shadowRadius: 16 },
      android: { elevation: 4 },
      web:     { boxShadow: '0 8px 16px rgba(0,0,0,0.07)' },
    }),
  },
  addCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: P.greenSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCardText: {
    fontSize: 19,
    fontWeight: '800',
    fontStyle: 'italic',
    color: P.text,
  },

  // ── Empty state ───────────────────────────────────────────────────────────
  emptyCard: {
    backgroundColor: P.card,
    borderRadius: 28,
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 14,
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.08, shadowRadius: 20 },
      android: { elevation: 5 },
      web:     { boxShadow: '0 10px 20px rgba(0,0,0,0.08)' },
    }),
  },
  emptyIcon:  { fontSize: 44 },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: P.text, textAlign: 'center' },
  emptyText:  { fontSize: 14, color: P.textSub, textAlign: 'center' },
  emptyBtn: {
    marginTop: 8,
    backgroundColor: P.blue,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 22,
  },
  emptyBtnText: { fontSize: 15, fontWeight: '800', color: P.white },
});
