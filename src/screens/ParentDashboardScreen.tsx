import React, { useDeferredValue, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  FlatList,
  ListRenderItem,
  TouchableOpacity,
  TextInput,
  Switch,
  Share,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { ArrowsDownUp } from 'phosphor-react-native';
import { useChildrenStore } from '../stores/childrenStore';
import { useRoutineStore } from '../stores/routineStore';
import { useRewardStore } from '../stores/rewardStore';
import { useAppStore } from '../stores/appStore';
import { useWeatherStore } from '../stores/weatherStore';
import { buildRoutineShareText } from '../services/sharing';
import { Card } from '../components/ui/Card';
import { DraggableList } from '../components/ui/DraggableList';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '../constants/theme';
import { Child, Routine } from '../types';
import {
  CompactRoutineGroupRow,
  CompactRoutineRow,
  RoutineGroup,
} from '../components/parent/CompactRoutineRows';
import {
  CategoryFilter,
  ChildScope,
  ParentDashboardHeader,
  StatusFilter,
} from '../components/parent/ParentDashboardHeader';

type RoutineListItem =
  | { type: 'group'; key: string; group: RoutineGroup }
  | { type: 'routine'; key: string; routine: Routine };

export function ParentDashboardScreen() {
  const router = useRouter();
  const children = useChildrenStore((state) => state.children);
  const routines = useRoutineStore((state) => state.routines);
  const toggleRoutine = useRoutineStore((state) => state.toggleRoutine);
  const updateRoutine = useRoutineStore((state) => state.updateRoutine);
  const reorderRoutines = useRoutineStore((state) => state.reorderRoutines);
  const trashRoutine = useRoutineStore((state) => state.trashRoutine);
  const duplicateRoutine = useRoutineStore((state) => state.duplicateRoutine);
  const cleanupExpiredTrash = useRoutineStore((state) => state.cleanupExpiredTrash);
  const rewardMap = useRewardStore((state) => state.rewards);
  const weatherCity = useAppStore((state) => state.weatherCity);
  const useGeolocation = useAppStore((state) => state.useGeolocation);
  const setWeatherCity = useAppStore((state) => state.setWeatherCity);
  const setUseGeolocation = useAppStore((state) => state.setUseGeolocation);
  const { refresh: refreshWeather } = useWeatherStore();

  const [cityInput, setCityInput] = useState(weatherCity);
  const [selectedChildScope, setSelectedChildScope] = useState<ChildScope>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [organizeMode, setOrganizeMode] = useState(false);
  const [showWeatherSettings, setShowWeatherSettings] = useState(false);

  const deferredSearch = useDeferredValue(searchQuery.trim().toLowerCase());

  useEffect(() => {
    cleanupExpiredTrash();
  }, [cleanupExpiredTrash]);

  useEffect(() => {
    setCityInput(weatherCity);
  }, [weatherCity]);

  useEffect(() => {
    if (selectedChildScope === 'all') {
      setOrganizeMode(false);
      return;
    }

    const exists = children.some((child) => child.id === selectedChildScope);
    if (!exists) {
      setSelectedChildScope('all');
      setOrganizeMode(false);
    }
  }, [children, selectedChildScope]);

  const childrenById = useMemo(() => {
    const map = new Map<string, Child>();
    children.forEach((child) => map.set(child.id, child));
    return map;
  }, [children]);

  const routinesByChild = useMemo(() => {
    const map = new Map<string, Routine[]>();
    routines.forEach((routine) => {
      const current = map.get(routine.childId) ?? [];
      current.push(routine);
      map.set(routine.childId, current);
    });
    return map;
  }, [routines]);

  const groupedRoutines = useMemo(() => {
    const groups = new Map<string, RoutineGroup>();

    routines.forEach((routine) => {
      const signature = JSON.stringify({
        name: routine.name,
        description: routine.description ?? '',
        icon: routine.icon,
        color: routine.color,
        category: routine.category,
        steps: routine.steps.map((step) => ({
          title: step.title,
          icon: step.icon,
          durationMinutes: step.durationMinutes,
          instruction: step.instruction,
          isRequired: step.isRequired,
          order: step.order,
        })),
      });

      const existing = groups.get(signature);
      if (existing) {
        existing.routines.push(routine);
        if (!existing.childIds.includes(routine.childId)) existing.childIds.push(routine.childId);
      } else {
        groups.set(signature, {
          key: signature,
          sample: routine,
          routines: [routine],
          childIds: [routine.childId],
        });
      }
    });

    return Array.from(groups.values()).sort((left, right) =>
      left.sample.name.localeCompare(right.sample.name, 'fr', { sensitivity: 'base' }),
    );
  }, [routines]);

  const selectedChild = selectedChildScope === 'all' ? undefined : childrenById.get(selectedChildScope);
  const selectedChildRoutines = selectedChild ? (routinesByChild.get(selectedChild.id) ?? []) : [];

  const filteredGroups = useMemo(() => {
    return groupedRoutines.filter((group) => {
      if (categoryFilter !== 'all' && group.sample.category !== categoryFilter) return false;
      const activeCount = group.routines.filter((routine) => routine.isActive).length;
      if (statusFilter === 'active' && activeCount === 0) return false;
      if (statusFilter === 'inactive' && activeCount > 0) return false;
      if (!deferredSearch) return true;

      const haystack = [
        group.sample.name,
        group.sample.description ?? '',
        group.sample.steps.map((step) => step.title).join(' '),
        group.childIds.map((childId) => childrenById.get(childId)?.name ?? '').join(' '),
      ].join(' ').toLowerCase();

      return haystack.includes(deferredSearch);
    });
  }, [groupedRoutines, categoryFilter, statusFilter, deferredSearch, childrenById]);

  const filteredChildRoutines = useMemo(() => {
    return selectedChildRoutines.filter((routine) => {
      if (categoryFilter !== 'all' && routine.category !== categoryFilter) return false;
      if (statusFilter === 'active' && !routine.isActive) return false;
      if (statusFilter === 'inactive' && routine.isActive) return false;
      if (!deferredSearch) return true;

      const haystack = [
        routine.name,
        routine.description ?? '',
        routine.steps.map((step) => step.title).join(' '),
      ].join(' ').toLowerCase();

      return haystack.includes(deferredSearch);
    });
  }, [selectedChildRoutines, categoryFilter, statusFilter, deferredSearch]);

  const listData: RoutineListItem[] = useMemo(() => {
    if (selectedChildScope === 'all') {
      return filteredGroups.map((group) => ({ type: 'group', key: group.key, group }));
    }

    return filteredChildRoutines.map((routine) => ({ type: 'routine', key: routine.id, routine }));
  }, [selectedChildScope, filteredGroups, filteredChildRoutines]);

  const handleSaveCity = () => {
    const trimmed = cityInput.trim();
    setWeatherCity(trimmed);
    refreshWeather({ cityName: trimmed, useGeolocation });
    Alert.alert('Ville enregistree', trimmed ? `Meteo pour : ${trimmed}` : 'Meteo par defaut (Paris)');
  };

  const handleToggleGeo = (value: boolean) => {
    setUseGeolocation(value);
    if (value) refreshWeather({ useGeolocation: true });
  };

  const handleDeleteRoutine = (routine: Routine) => {
    confirmAction(
      'Corbeille',
      `Mettre la routine "${routine.name}" dans la corbeille pendant 30 jours ?`,
      () => trashRoutine(routine.id),
    );
  };

  const handleDeleteGroup = (group: RoutineGroup) => {
    const count = group.routines.length;
    const label = count > 1
      ? `Mettre les ${count} routines du groupe "${group.sample.name}" dans la corbeille pendant 30 jours ?`
      : `Mettre la routine "${group.sample.name}" dans la corbeille pendant 30 jours ?`;

    confirmAction('Corbeille', label, () =>
      group.routines.forEach((routine) => trashRoutine(routine.id)),
    );
  };

  const handleDuplicateRoutine = (routine: Routine) => {
    const duplicated = duplicateRoutine(routine.id, routine.childId);
    if (duplicated) {
      Alert.alert('Routine dupliquee', `"${duplicated.name}" a ete creee.`);
    } else {
      Alert.alert('Erreur', 'Impossible de dupliquer la routine.');
    }
  };

  const handleShareRoutine = async (routine: Routine) => {
    const message = buildRoutineShareText(routine);

    try {
      await Share.share({
        title: routine.name,
        message,
      });
    } catch {
      try {
        await Clipboard.setStringAsync(message);
        Alert.alert('Texte copie', 'Le resume de la routine a ete copie.');
      } catch {
        Alert.alert('Erreur', 'Impossible de partager la routine.');
      }
    }
  };

  const handleToggleGroup = (group: RoutineGroup) => {
    const nextState = !group.routines.every((routine) => routine.isActive);
    group.routines.forEach((routine) => updateRoutine(routine.id, { isActive: nextState }));
  };

  const handleToggleOrganize = () => {
    if (!selectedChild || selectedChildRoutines.length <= 1) return;
    if (!organizeMode) {
      setSearchQuery('');
      setStatusFilter('all');
      setCategoryFilter('all');
    }
    setOrganizeMode((prev) => !prev);
  };

  const headerElement = (
    <ParentDashboardHeader
      children={children}
      selectedChildScope={selectedChildScope}
      onSelectChildScope={setSelectedChildScope}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      statusFilter={statusFilter}
      onStatusFilterChange={setStatusFilter}
      categoryFilter={categoryFilter}
      onCategoryFilterChange={setCategoryFilter}
      onLogout={() => router.replace('/')}
      onGoToCatalog={() => router.push('/parent/catalog')}
      onGoToAddRoutine={() => router.push('/parent/add-routine')}
      onGoToChildren={() => router.push('/parent/children')}
      onGoToRewards={() => router.push('/parent/rewards')}
      onGoToStats={() => router.push('/parent/stats')}
      onGoToImport={() => router.push('/parent/import')}
      onGoToTrash={() => router.push('/parent/trash')}
    />
  );

  const weatherElement = (
    <ParentWeatherSection
      showWeatherSettings={showWeatherSettings}
      onToggleWeatherSettings={() => setShowWeatherSettings((prev) => !prev)}
      cityInput={cityInput}
      onCityInputChange={setCityInput}
      weatherCity={weatherCity}
      useGeolocation={useGeolocation}
      onToggleGeo={handleToggleGeo}
      onSaveCity={handleSaveCity}
    />
  );

  const renderRoutineItem: ListRenderItem<RoutineListItem> = ({ item }) => {
    if (item.type === 'group') {
      return (
        <CompactRoutineGroupRow
          group={item.group}
          childrenById={childrenById}
          onEdit={() => router.push(`/parent/edit-routine?id=${item.group.sample.id}`)}
          onToggle={() => handleToggleGroup(item.group)}
          onDuplicate={() => handleDuplicateRoutine(item.group.sample)}
          onShare={() => handleShareRoutine(item.group.sample)}
          onDelete={() => handleDeleteGroup(item.group)}
        />
      );
    }

    return (
      <CompactRoutineRow
        routine={item.routine}
        child={childrenById.get(item.routine.childId)}
        onEdit={() => router.push(`/parent/edit-routine?id=${item.routine.id}`)}
        onToggle={() => toggleRoutine(item.routine.id)}
        onDuplicate={() => handleDuplicateRoutine(item.routine)}
        onShare={() => handleShareRoutine(item.routine)}
        onDelete={() => handleDeleteRoutine(item.routine)}
      />
    );
  };

  const emptyMessage = selectedChildScope === 'all'
    ? 'Aucune routine ne correspond a ces filtres.'
    : selectedChild
      ? `Aucune routine pour ${selectedChild.name} avec ces filtres.`
      : 'Aucune routine trouvee.';

  if (organizeMode && selectedChild) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll}>
          {headerElement}
          <View style={styles.organizeHint}>
            <ArrowsDownUp size={16} weight="bold" color={COLORS.secondary} />
            <Text style={styles.organizeHintText}>
              Appui long puis glisse pour reordonner les routines de {selectedChild.name}.
            </Text>
          </View>
          <DraggableList
            data={selectedChildRoutines}
            keyExtractor={(routine) => routine.id}
            onReorder={(newOrder) => reorderRoutines(selectedChild.id, newOrder.map((routine) => routine.id))}
            itemHeight={86}
            renderItem={(routine) => (
              <CompactRoutineRow
                routine={routine}
                child={selectedChild}
                onEdit={() => router.push(`/parent/edit-routine?id=${routine.id}`)}
                onToggle={() => toggleRoutine(routine.id)}
                onDuplicate={() => handleDuplicateRoutine(routine)}
                onShare={() => handleShareRoutine(routine)}
                onDelete={() => handleDeleteRoutine(routine)}
              />
            )}
          />
          {weatherElement}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={listData}
        keyExtractor={(item) => item.key}
        renderItem={renderRoutineItem}
        ListHeaderComponent={headerElement}
        ListEmptyComponent={
          <Card>
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🧭</Text>
              <Text style={styles.emptyText}>{emptyMessage}</Text>
            </View>
          </Card>
        }
        ListFooterComponent={weatherElement}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        initialNumToRender={8}
        windowSize={8}
        removeClippedSubviews
      />
    </SafeAreaView>
  );
}

function ParentWeatherSection({
  showWeatherSettings,
  onToggleWeatherSettings,
  cityInput,
  onCityInputChange,
  weatherCity,
  useGeolocation,
  onToggleGeo,
  onSaveCity,
}: {
  showWeatherSettings: boolean;
  onToggleWeatherSettings: () => void;
  cityInput: string;
  onCityInputChange: (value: string) => void;
  weatherCity: string;
  useGeolocation: boolean;
  onToggleGeo: (value: boolean) => void;
  onSaveCity: () => void;
}) {
  return (
    <View style={styles.weatherSection}>
      <TouchableOpacity onPress={onToggleWeatherSettings} style={styles.weatherToggle}>
        <Text style={styles.weatherTitle}>Meteo</Text>
        <Text style={styles.weatherToggleText}>{showWeatherSettings ? 'Masquer' : 'Configurer'}</Text>
      </TouchableOpacity>

      {showWeatherSettings ? (
        <Card>
          <View style={styles.weatherSettings}>
            <View style={styles.weatherRow}>
              <Text style={styles.weatherLabel}>Geolocalisation automatique</Text>
              <Switch
                value={useGeolocation}
                onValueChange={onToggleGeo}
                trackColor={{ false: COLORS.surfaceSecondary, true: COLORS.secondaryLight }}
                thumbColor={useGeolocation ? COLORS.secondary : COLORS.textLight}
              />
            </View>
            {useGeolocation ? (
              <Text style={styles.weatherHint}>La meteo sera basee sur la position de l appareil.</Text>
            ) : (
              <>
                <Text style={styles.weatherSubLabel}>Ou entrez votre ville :</Text>
                <View style={styles.weatherCityRow}>
                  <TextInput
                    style={styles.weatherInput}
                    value={cityInput}
                    onChangeText={onCityInputChange}
                    placeholder="Ex : Rennes, Lyon, Marseille..."
                    placeholderTextColor={COLORS.textLight}
                    returnKeyType="done"
                    onSubmitEditing={onSaveCity}
                  />
                  <TouchableOpacity onPress={onSaveCity} style={styles.weatherSaveBtn}>
                    <Text style={styles.weatherSaveBtnText}>OK</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.weatherHint}>
                  {weatherCity ? `Meteo actuelle : ${weatherCity}` : 'Par defaut : Paris'}
                </Text>
              </>
            )}
          </View>
        </Card>
      ) : null}
    </View>
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
  empty: {
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.lg,
  },
  emptyIcon: {
    fontSize: 34,
  },
  emptyText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  organizeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.secondary + '14',
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  organizeHintText: {
    flex: 1,
    color: COLORS.secondaryDark,
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
  },
  weatherSection: {
    marginTop: SPACING.lg,
  },
  weatherToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  weatherTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    color: COLORS.text,
  },
  weatherToggleText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  weatherSettings: {
    gap: SPACING.sm,
  },
  weatherRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: SPACING.md,
  },
  weatherLabel: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.text,
  },
  weatherSubLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  weatherCityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  weatherInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.surfaceSecondary,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    backgroundColor: COLORS.surface,
  },
  weatherSaveBtn: {
    minWidth: 52,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
  },
  weatherSaveBtnText: {
    color: '#FFF',
    fontSize: FONT_SIZE.sm,
    fontWeight: '800',
  },
  weatherHint: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
});
  const confirmAction = (title: string, message: string, onConfirm: () => void) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      if (window.confirm(`${title}\n\n${message}`)) {
        onConfirm();
      }
      return;
    }

    Alert.alert(title, message, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Confirmer', style: 'destructive', onPress: onConfirm },
    ]);
  };
