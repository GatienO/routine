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
} from 'react-native';
import { useRouter } from 'expo-router';
import { useChildrenStore } from '../../src/stores/childrenStore';
import { useRoutineStore } from '../../src/stores/routineStore';
import { CompactRoutineRow } from '../../src/components/routine/CompactRoutineRow';
import { DraggableList } from '../../src/components/ui/DraggableList';
import { Button } from '../../src/components/ui/Button';
import { AppPageHeader } from '../../src/components/ui/AppPageHeader';
import { CATEGORY_CONFIG, COLORS, FONT_SIZE, RADIUS, SPACING } from '../../src/constants/theme';
import {
  showAppAlert,
  showAppConfirm,
  showAppToast,
} from '../../src/components/feedback/AppFeedbackProvider';
import { Routine, RoutineCategory } from '../../src/types';
import { formatChildName } from '../../src/utils/children';
import { backOrReplace } from '../../src/utils/navigation';

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

  useEffect(() => {
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
      <AppPageHeader
        title="Gestion des routines"
        onBack={() => backOrReplace(router, '/parent')}
        onHome={() => router.replace('/parent')}
      />
      <Text style={styles.subtitle}>
        Focus par enfant, recherche, filtres et vue compacte pour rester fluide
      </Text>

      <FlatList
        data={children}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.childTabs}
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
            >
              <Text style={[styles.childTabText, isSelected && styles.childTabTextActive]}>
                {formatChildName(item.name)} · {count}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      <TextInput
        style={styles.searchInput}
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Rechercher une routine"
        placeholderTextColor={COLORS.textLight}
      />

      <FilterRow
        title="Statut"
        options={[
          { value: 'all', label: 'Toutes' },
          { value: 'active', label: 'Actives' },
          { value: 'inactive', label: 'Inactives' },
        ]}
        selected={statusFilter}
        onSelect={(value) => setStatusFilter(value as StatusFilter)}
      />

      <FilterRow
        title="Categorie"
        options={categoryOptions.map((value) => ({
          value,
          label: value === 'all' ? 'Toutes' : CATEGORY_CONFIG[value]?.label ?? value,
        }))}
        selected={categoryFilter}
        onSelect={(value) => setCategoryFilter(value as CategoryFilter)}
      />

      <View style={styles.toolbar}>
        <Button
          title={organizeMode ? 'Fin organiser' : 'Organiser'}
          onPress={() => {
            setOrganizeMode(!organizeMode);
            setMergeMode(false);
            setMergeSelection([]);
          }}
          variant={organizeMode ? 'primary' : 'outline'}
          size="sm"
          color={COLORS.secondary}
          disabled={!selectedChild || childRoutines.length < 2}
        />
        <Button
          title={mergeMode ? 'Fin fusion' : 'Fusionner'}
          onPress={() => {
            setMergeMode(!mergeMode);
            setOrganizeMode(false);
            setMergeSelection([]);
          }}
          variant={mergeMode ? 'primary' : 'outline'}
          size="sm"
          color={COLORS.primary}
          disabled={!selectedChild || childRoutines.length < 2}
        />
        <Button
          title="Catalogue"
          onPress={() => router.push('/parent/catalog')}
          variant="ghost"
          size="sm"
          color={COLORS.secondary}
        />
        <Button
          title="Ajouter"
          onPress={handleGoToAddRoutine}
          variant="primary"
          size="sm"
          color={COLORS.primary}
        />
      </View>

      {organizeMode ? (
        <View style={styles.modeBanner}>
          <Text style={styles.modeBannerText}>
            Mode organiser actif. Vous reordonnez toutes les routines de {selectedChild ? formatChildName(selectedChild.name) : 'cet enfant'}.
          </Text>
        </View>
      ) : null}

      {mergeMode && mergeSelection.length >= 2 ? (
        <TouchableOpacity style={styles.mergeBar} onPress={handleMerge}>
          <Text style={styles.mergeBarText}>
            Fusionner {mergeSelection.length} routines
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );

  if (children.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.listContent}>
          {header}
          <View style={styles.emptyWrapper}>
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>ðŸ“‹</Text>
              <Text style={styles.emptyTitle}>Ajoutez d abord un enfant</Text>
              <Button
                title="Creer un profil"
                onPress={() => router.push('/parent/add-child')}
                variant="primary"
                size="sm"
                color={COLORS.secondary}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (organizeMode && selectedChildId) {
    return (
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
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={displayedRoutines}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={header}
        ListEmptyComponent={(
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>ðŸ”Ž</Text>
            <Text style={styles.emptyTitle}>Aucune routine visible</Text>
            <Text style={styles.emptyText}>
              Ajustez votre recherche ou vos filtres pour afficher plus de routines.
            </Text>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: SPACING.sm }} />}
        renderItem={({ item }) => (
          <CompactRoutineRow
            routine={item}
            selected={mergeSelection.includes(item.id)}
            selectable={mergeMode}
            onSelect={() => toggleMergeSelect(item.id)}
            onPress={() => router.push(`/parent/edit-routine?id=${item.id}`)}
            onToggle={() => toggleRoutine(item.id)}
            onDuplicate={() => handleDuplicateRoutine(item)}
            onDelete={() => handleDeleteRoutine(item)}
          />
        )}
      />
    </SafeAreaView>
  );
}

function FilterRow({
  title,
  options,
  selected,
  onSelect,
}: {
  title: string;
  options: Array<{ value: string; label: string }>;
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <View style={styles.filterBlock}>
      <Text style={styles.filterTitle}>{title}</Text>
      <FlatList
        data={options}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.value}
        contentContainerStyle={styles.filterRow}
        renderItem={({ item }) => {
          const isSelected = item.value === selected;
          return (
            <TouchableOpacity
              style={[styles.filterChip, isSelected && styles.filterChipActive]}
              onPress={() => onSelect(item.value)}
            >
              <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  headerBlock: {
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  backBtn: {},
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  childTabs: {
    gap: SPACING.sm,
  },
  childTab: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
    backgroundColor: `${COLORS.textLight}14`,
  },
  childTabActive: {
    backgroundColor: COLORS.secondary,
  },
  childTabText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  childTabTextActive: {
    color: '#FFF',
  },
  searchInput: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
  },
  filterBlock: {
    gap: SPACING.xs,
  },
  filterTitle: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  filterRow: {
    gap: SPACING.xs,
  },
  filterChip: {
    paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: `${COLORS.textLight}14`,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  filterChipTextActive: {
    color: '#FFF',
  },
  toolbar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  modeBanner: {
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.secondary + '16',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  modeBannerText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  mergeBar: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  mergeBarText: {
    color: '#FFF',
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
  },
  empty: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  emptyWrapper: {
    flex: 1,
  },
  emptyIcon: {
    fontSize: 42,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
    color: COLORS.text,
  },
  emptyText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
