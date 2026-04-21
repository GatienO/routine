import React, { useDeferredValue, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  FlatList,
  ListRenderItem,
  TouchableOpacity,
  TextInput,
  Switch,
  Modal,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowsDownUp } from 'phosphor-react-native';
import { useChildrenStore } from '../stores/childrenStore';
import { useRoutineStore } from '../stores/routineStore';
import { useRewardStore } from '../stores/rewardStore';
import { useAppStore } from '../stores/appStore';
import { useWeatherStore } from '../stores/weatherStore';
import { useLocalProfileStore } from '../stores/localProfileStore';
import { Card } from '../components/ui/Card';
import { DraggableList } from '../components/ui/DraggableList';
import { RoutineShareModal } from '../components/routine/RoutineShareModal';
import { AppTutorialModal } from '../components/tutorial/AppTutorialModal';
import { COLORS, SPACING, FONT_SIZE, RADIUS, SHADOWS } from '../constants/theme';
import { Child, Routine } from '../types';
import {
  CompactRoutineGroupRow,
  CompactRoutineRow,
  RoutineGroup,
} from '../components/parent/CompactRoutineRows';
import {
  CategoryFilterValue,
  ParentDashboardHeader,
  SortMode,
  StatusFilterValue,
} from '../components/parent/ParentDashboardHeader';
import {
  showAppAlert,
  showAppConfirm,
  showAppToast,
} from '../components/feedback/AppFeedbackProvider';
import { formatChildName } from '../utils/children';

type RoutineListItem =
  | { type: 'group'; key: string; group: RoutineGroup }
  | { type: 'routine'; key: string; routine: Routine };

const ROUTINES_PER_PAGE = 10;
const STATUS_FILTER_OPTIONS: StatusFilterValue[] = ['active', 'inactive'];
const CATEGORY_FILTER_OPTIONS: CategoryFilterValue[] = [
  'morning',
  'evening',
  'school',
  'home',
  'weekend',
  'emotion',
  'custom',
];

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
  const profileName = useLocalProfileStore((state) => state.profileName);
  const profileId = useLocalProfileStore((state) => state.profileId);
  const tutorialCompletedAt = useLocalProfileStore((state) => state.tutorialCompletedAt);
  const completeTutorial = useLocalProfileStore((state) => state.completeTutorial);
  const { refresh: refreshWeather } = useWeatherStore();

  const [cityInput, setCityInput] = useState(weatherCity);
  const [selectedChildIds, setSelectedChildIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<StatusFilterValue[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<CategoryFilterValue[]>([]);
  const [organizeMode, setOrganizeMode] = useState(false);
  const [showWeatherSettings, setShowWeatherSettings] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [routinesExpanded, setRoutinesExpanded] = useState(true);
  const [sortMode, setSortMode] = useState<SortMode>('recent');
  const [routineToShare, setRoutineToShare] = useState<Routine | null>(null);

  const deferredSearch = useDeferredValue(searchQuery.trim().toLowerCase());
  const selectedChildIdSet = useMemo(() => new Set(selectedChildIds), [selectedChildIds]);

  useEffect(() => {
    cleanupExpiredTrash();
  }, [cleanupExpiredTrash]);

  useEffect(() => {
    setCityInput(weatherCity);
  }, [weatherCity]);

  useEffect(() => {
    setSelectedChildIds((previous) =>
      previous.filter((childId) => children.some((child) => child.id === childId)),
    );
  }, [children]);

  useEffect(() => {
    if (selectedChildIds.length !== 1) {
      setOrganizeMode(false);
    }
  }, [selectedChildIds.length]);

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

    return Array.from(groups.values());
  }, [routines]);

  const selectedChild = selectedChildIds.length === 1 ? childrenById.get(selectedChildIds[0]) : undefined;
  const selectedChildRoutines = selectedChild ? (routinesByChild.get(selectedChild.id) ?? []) : [];
  const showSingleChildView = Boolean(selectedChild);

  const matchesStatusFilter = (isActive: boolean) => {
    if (selectedStatuses.length === 0) return true;

    return (
      (selectedStatuses.includes('active') && isActive) ||
      (selectedStatuses.includes('inactive') && !isActive)
    );
  };

  const matchesCategoryFilter = (category: CategoryFilterValue) => {
    if (selectedCategories.length === 0) return true;
    return selectedCategories.includes(category);
  };

  const filteredGroups = useMemo(() => {
    const scopedGroups = groupedRoutines.reduce<RoutineGroup[]>((accumulator, group) => {
      const scopedRoutines = selectedChildIds.length === 0
        ? group.routines
        : group.routines.filter((routine) => selectedChildIdSet.has(routine.childId));

      if (scopedRoutines.length === 0) {
        return accumulator;
      }

      const scopedGroup: RoutineGroup = {
        ...group,
        sample: scopedRoutines[0],
        routines: scopedRoutines,
        childIds: Array.from(new Set(scopedRoutines.map((routine) => routine.childId))),
      };

      if (!matchesCategoryFilter(scopedGroup.sample.category)) {
        return accumulator;
      }

      const activeCount = scopedGroup.routines.filter((routine) => routine.isActive).length;
      if (!matchesStatusFilter(activeCount > 0)) {
        return accumulator;
      }

      if (deferredSearch) {
        const haystack = [
          scopedGroup.sample.name,
          scopedGroup.sample.description ?? '',
          scopedGroup.sample.steps.map((step) => step.title).join(' '),
          scopedGroup.childIds.map((childId) => childrenById.get(childId)?.name ?? '').join(' '),
        ].join(' ').toLowerCase();

        if (!haystack.includes(deferredSearch)) {
          return accumulator;
        }
      }

      accumulator.push(scopedGroup);
      return accumulator;
    }, []);

    return scopedGroups.sort((left, right) => {
      if (sortMode === 'alphabetical') {
        return left.sample.name.localeCompare(right.sample.name, 'fr', { sensitivity: 'base' });
      }

      const leftNewest = Math.max(...left.routines.map((routine) => Date.parse(routine.updatedAt || routine.createdAt || '')));
      const rightNewest = Math.max(...right.routines.map((routine) => Date.parse(routine.updatedAt || routine.createdAt || '')));
      const leftTime = Number.isFinite(leftNewest) ? leftNewest : 0;
      const rightTime = Number.isFinite(rightNewest) ? rightNewest : 0;
      return rightTime - leftTime;
    });
  }, [
    childrenById,
    deferredSearch,
    groupedRoutines,
    selectedChildIdSet,
    selectedChildIds.length,
    selectedCategories,
    selectedStatuses,
    sortMode,
  ]);

  const filteredChildRoutines = useMemo(() => {
    const scopedRoutines = selectedChildRoutines.filter((routine) => {
      if (!matchesCategoryFilter(routine.category)) return false;
      if (!matchesStatusFilter(routine.isActive)) return false;
      if (!deferredSearch) return true;

      const haystack = [
        routine.name,
        routine.description ?? '',
        routine.steps.map((step) => step.title).join(' '),
      ].join(' ').toLowerCase();

      return haystack.includes(deferredSearch);
    });

    return scopedRoutines.sort((left, right) => {
      if (sortMode === 'alphabetical') {
        return left.name.localeCompare(right.name, 'fr', { sensitivity: 'base' });
      }

      const leftTime = Date.parse(left.updatedAt || left.createdAt || '');
      const rightTime = Date.parse(right.updatedAt || right.createdAt || '');
      return (Number.isFinite(rightTime) ? rightTime : 0) - (Number.isFinite(leftTime) ? leftTime : 0);
    });
  }, [deferredSearch, selectedCategories, selectedChildRoutines, selectedStatuses, sortMode]);

  const listData: RoutineListItem[] = useMemo(() => {
    if (showSingleChildView) {
      return filteredChildRoutines.map((routine) => ({ type: 'routine', key: routine.id, routine }));
    }

    return filteredGroups.map((group) => ({ type: 'group', key: group.key, group }));
  }, [filteredChildRoutines, filteredGroups, showSingleChildView]);

  const totalPages = Math.max(1, Math.ceil(listData.length / ROUTINES_PER_PAGE));
  const paginatedListData = useMemo(
    () => listData.slice((currentPage - 1) * ROUTINES_PER_PAGE, currentPage * ROUTINES_PER_PAGE),
    [currentPage, listData],
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [
    deferredSearch,
    selectedChildIds.join(','),
    selectedStatuses.join(','),
    selectedCategories.join(','),
  ]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleToggleChildSelection = (childId: string) => {
    setSelectedChildIds((previous) =>
      previous.includes(childId)
        ? previous.filter((currentId) => currentId !== childId)
        : [...previous, childId],
    );
  };

  const handleToggleStatus = (value: StatusFilterValue) => {
    setSelectedStatuses((previous) => {
      const next = previous.includes(value)
        ? previous.filter((currentValue) => currentValue !== value)
        : [...previous, value];

      return next.length === STATUS_FILTER_OPTIONS.length ? [] : next;
    });
  };

  const handleToggleCategory = (value: CategoryFilterValue) => {
    setSelectedCategories((previous) => {
      const next = previous.includes(value)
        ? previous.filter((currentValue) => currentValue !== value)
        : [...previous, value];

      return next.length === CATEGORY_FILTER_OPTIONS.length ? [] : next;
    });
  };

  const handleSaveCity = () => {
    const trimmed = cityInput.trim();
    setWeatherCity(trimmed);
    refreshWeather({ cityName: trimmed, useGeolocation });
    showAppToast({
      title: 'Ville enregistree',
      message: trimmed ? `Meteo pour : ${trimmed}` : 'Meteo par defaut : Paris',
      tone: 'success',
      icon: '📍',
    });
  };

  const handleToggleGeo = (value: boolean) => {
    setUseGeolocation(value);
    if (value) refreshWeather({ useGeolocation: true });
  };

  const handleDeleteRoutine = async (routine: Routine) => {
    const confirmed = await showAppConfirm({
      title: 'Corbeille',
      message: `Mettre la routine "${routine.name}" dans la corbeille pendant 30 jours ?`,
      tone: 'warning',
      icon: '🗑️',
      confirmLabel: 'Mettre en corbeille',
      cancelLabel: 'Annuler',
      confirmKind: 'danger',
    });

    if (confirmed) {
      trashRoutine(routine.id);
    }
  };

  const handleDeleteGroup = async (group: RoutineGroup) => {
    const count = group.routines.length;
    const label = count > 1
      ? `Mettre les ${count} routines du groupe "${group.sample.name}" dans la corbeille pendant 30 jours ?`
      : `Mettre la routine "${group.sample.name}" dans la corbeille pendant 30 jours ?`;

    const confirmed = await showAppConfirm({
      title: 'Corbeille',
      message: label,
      tone: 'warning',
      icon: '🗑️',
      confirmLabel: 'Mettre en corbeille',
      cancelLabel: 'Annuler',
      confirmKind: 'danger',
    });

    if (confirmed) {
      group.routines.forEach((routine) => trashRoutine(routine.id));
    }
  };

  const handleDuplicateRoutine = (routine: Routine) => {
    const duplicated = duplicateRoutine(routine.id, routine.childId);
    if (duplicated) {
      showAppToast({
        title: 'Routine dupliquee',
        message: `"${duplicated.name}" a ete creee.`,
        tone: 'success',
        icon: '🪄',
      });
    } else {
      showAppAlert({
        title: 'Erreur',
        message: 'Impossible de dupliquer la routine.',
        tone: 'danger',
        icon: '⚠️',
      });
    }
  };

  const handleShareRoutine = (routine: Routine) => {
    setRoutineToShare(routine);
  };

  const handleToggleGroup = (group: RoutineGroup) => {
    const nextState = !group.routines.every((routine) => routine.isActive);
    group.routines.forEach((routine) => updateRoutine(routine.id, { isActive: nextState }));
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

  const handleToggleOrganize = () => {
    if (!selectedChild || selectedChildRoutines.length <= 1) return;
    if (!organizeMode) {
      setSearchQuery('');
      setSelectedStatuses([]);
      setSelectedCategories([]);
    }
    setOrganizeMode((previous) => !previous);
  };

  const headerElement = (
    <View style={styles.headerLayer}>
      <ParentDashboardHeader
        children={children}
        selectedChildIds={selectedChildIds}
        onToggleChild={handleToggleChildSelection}
        onClearChildSelection={() => setSelectedChildIds([])}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedStatuses={selectedStatuses}
        onToggleStatus={handleToggleStatus}
        onClearStatuses={() => setSelectedStatuses([])}
        selectedCategories={selectedCategories}
        onToggleCategory={handleToggleCategory}
        onClearCategories={() => setSelectedCategories([])}
        onGoToCatalog={() => router.push('/parent/catalog')}
        onGoToAddRoutine={handleGoToAddRoutine}
        onGoToChildren={() => router.push('/parent/children')}
        onGoToRewards={() => router.push('/parent/rewards')}
        onGoToStats={() => router.push('/parent/stats')}
        onGoToImport={() => router.push('/parent/import')}
        onGoToTrash={() => router.push('/parent/trash')}
        onOpenProfile={() => setShowProfileModal(true)}
        onOpenWeatherSettings={() => setShowWeatherSettings(true)}
        routinesExpanded={routinesExpanded}
        onToggleRoutinesExpanded={() => setRoutinesExpanded((previous) => !previous)}
        sortMode={sortMode}
        onToggleSortMode={() =>
          setSortMode((previous) => (previous === 'recent' ? 'alphabetical' : 'recent'))
        }
      />
    </View>
  );

  const listFooterElement = (
    <View>
      {routinesExpanded && totalPages > 1 ? (
        <View style={styles.paginationSection}>
          <Text style={styles.paginationSummary}>
            Page {currentPage}/{totalPages} · {listData.length} routines
          </Text>
          <View style={styles.paginationRow}>
            <TouchableOpacity
              onPress={() => setCurrentPage((page) => Math.max(1, page - 1))}
              style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]}
              activeOpacity={0.85}
              disabled={currentPage === 1}
            >
              <Text
                style={[
                  styles.paginationButtonText,
                  currentPage === 1 && styles.paginationButtonTextDisabled,
                ]}
              >
                Precedent
              </Text>
            </TouchableOpacity>

            <View style={styles.pageChipRow}>
              {Array.from({ length: totalPages }, (_, index) => {
                const pageNumber = index + 1;
                const selected = pageNumber === currentPage;

                return (
                  <TouchableOpacity
                    key={pageNumber}
                    onPress={() => setCurrentPage(pageNumber)}
                    style={[styles.pageChip, selected && styles.pageChipActive]}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.pageChipText, selected && styles.pageChipTextActive]}>
                      {pageNumber}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              onPress={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              style={[
                styles.paginationButton,
                currentPage === totalPages && styles.paginationButtonDisabled,
              ]}
              activeOpacity={0.85}
              disabled={currentPage === totalPages}
            >
              <Text
                style={[
                  styles.paginationButtonText,
                  currentPage === totalPages && styles.paginationButtonTextDisabled,
                ]}
              >
                Suivant
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}
    </View>
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

  const emptyMessage = showSingleChildView
    ? `Aucune routine pour ${selectedChild ? formatChildName(selectedChild.name) : 'cet enfant'} avec ces filtres.`
    : selectedChildIds.length > 1
      ? 'Aucune routine pour cette selection d enfants.'
      : 'Aucune routine ne correspond a ces filtres.';

  if (organizeMode && selectedChild) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll}>
          {headerElement}
          <View style={styles.organizeHint}>
            <ArrowsDownUp size={16} weight="bold" color={COLORS.secondary} />
            <Text style={styles.organizeHintText}>
              Appui long puis glisse pour reordonner les routines de {formatChildName(selectedChild.name)}.
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
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={routinesExpanded ? paginatedListData : []}
        keyExtractor={(item) => item.key}
        renderItem={renderRoutineItem}
        ListHeaderComponent={headerElement}
        ListEmptyComponent={routinesExpanded ? (
          <Card>
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🧭</Text>
              <Text style={styles.emptyText}>{emptyMessage}</Text>
            </View>
          </Card>
        ) : null}
        ListFooterComponent={listFooterElement}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        initialNumToRender={8}
        windowSize={8}
        removeClippedSubviews
      />
      <ParentWeatherSettingsModal
        visible={showWeatherSettings}
        cityInput={cityInput}
        onCityInputChange={setCityInput}
        weatherCity={weatherCity}
        useGeolocation={useGeolocation}
        onToggleGeo={handleToggleGeo}
        onClose={() => setShowWeatherSettings(false)}
        onSaveCity={handleSaveCity}
      />
      <LocalProfileModal
        visible={showProfileModal}
        profileName={profileName}
        profileId={profileId}
        tutorialCompletedAt={tutorialCompletedAt}
        onClose={() => setShowProfileModal(false)}
        onRestartTutorial={() => {
          setShowProfileModal(false);
          setShowTutorial(true);
        }}
      />
      <RoutineShareModal
        visible={routineToShare !== null}
        routine={routineToShare}
        onClose={() => setRoutineToShare(null)}
      />
      <AppTutorialModal
        visible={showTutorial}
        onClose={() => setShowTutorial(false)}
        onComplete={completeTutorial}
      />
    </SafeAreaView>
  );
}

function LocalProfileModal({
  visible,
  profileName,
  profileId,
  tutorialCompletedAt,
  onClose,
  onRestartTutorial,
}: {
  visible: boolean;
  profileName: string;
  profileId: string | null;
  tutorialCompletedAt: string | null;
  onClose: () => void;
  onRestartTutorial: () => void;
}) {
  const shortProfileId = profileId ? profileId.slice(-6) : 'LOCAL';
  const tutorialStatus = tutorialCompletedAt
    ? `Guide terminé le ${new Date(tutorialCompletedAt).toLocaleDateString('fr-FR')}`
    : 'Guide non terminé pour le moment';

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.weatherModalBackdrop} onPress={onClose}>
        <Pressable style={styles.profileModalCard} onPress={(event) => event.stopPropagation()}>
          <View style={styles.profileModalBadge}>
            <Text style={styles.profileModalBadgeText}>Profil local parent</Text>
          </View>
          <Text style={styles.profileModalTitle}>{profileName || 'Profil local'}</Text>
          <Text style={styles.profileModalId}>ID {shortProfileId}</Text>
          <Text style={styles.profileModalText}>
            Ce profil garde les routines, enfants et réglages uniquement sur cet appareil.
          </Text>
          <Text style={styles.profileModalHint}>{tutorialStatus}</Text>

          <View style={styles.profileModalActions}>
            <TouchableOpacity onPress={onClose} style={styles.weatherModalSecondaryBtn} activeOpacity={0.85}>
              <Text style={styles.weatherModalSecondaryBtnText}>Fermer</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onRestartTutorial} style={styles.weatherModalPrimaryBtn} activeOpacity={0.85}>
              <Text style={styles.weatherModalPrimaryBtnText}>Relancer le tutoriel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function ParentWeatherSettingsModal({
  visible,
  cityInput,
  onCityInputChange,
  weatherCity,
  useGeolocation,
  onToggleGeo,
  onClose,
  onSaveCity,
}: {
  visible: boolean;
  cityInput: string;
  onCityInputChange: (value: string) => void;
  weatherCity: string;
  useGeolocation: boolean;
  onToggleGeo: (value: boolean) => void;
  onClose: () => void;
  onSaveCity: () => void;
}) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.weatherModalBackdrop} onPress={onClose}>
        <Pressable style={styles.weatherModalCard} onPress={(event) => event.stopPropagation()}>
          <View style={styles.weatherModalIconWrap}>
            <Text style={styles.weatherModalIcon}>☁️</Text>
          </View>
          <Text style={styles.weatherModalTitle}>Configurer la meteo</Text>
          <Text style={styles.weatherModalSubtitle}>
            Choisis la geolocalisation automatique ou renseigne une ville de reference.
          </Text>

          <View style={styles.weatherSettings}>
            <View style={styles.weatherRow}>
              <Text style={styles.weatherLabel}>Geolocalisation automatique</Text>
              <Switch
                value={useGeolocation}
                onValueChange={onToggleGeo}
                trackColor={{ false: COLORS.border, true: COLORS.secondaryLight }}
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
                </View>
                <Text style={styles.weatherHint}>
                  {weatherCity ? `Meteo actuelle : ${weatherCity}` : 'Par defaut : Paris'}
                </Text>
              </>
            )}
          </View>

          <View style={styles.weatherModalActions}>
            <TouchableOpacity onPress={onClose} style={styles.weatherModalSecondaryBtn}>
              <Text style={styles.weatherModalSecondaryBtnText}>Fermer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                onSaveCity();
                onClose();
              }}
              style={styles.weatherModalPrimaryBtn}
            >
              <Text style={styles.weatherModalPrimaryBtnText}>Enregistrer</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
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
  headerLayer: {
    position: 'relative',
    zIndex: 40,
  },
  empty: {
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.xl,
  },
  emptyIcon: {
    fontSize: 40,
  },
  emptyText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  paginationSection: {
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  paginationSummary: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
    flexWrap: 'wrap',
  },
  paginationButton: {
    minWidth: 112,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  paginationButtonDisabled: {
    opacity: 0.4,
  },
  paginationButtonText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '800',
    color: COLORS.text,
  },
  paginationButtonTextDisabled: {
    color: COLORS.textLight,
  },
  pageChipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    flex: 1,
  },
  pageChip: {
    minWidth: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pageChipActive: {
    backgroundColor: `${COLORS.secondary}18`,
    borderColor: COLORS.secondary,
  },
  pageChipText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },
  pageChipTextActive: {
    color: COLORS.secondaryDark,
  },
  organizeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: `${COLORS.secondary}14`,
    borderRadius: RADIUS.xl,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  organizeHintText: {
    flex: 1,
    color: COLORS.secondaryDark,
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    lineHeight: 20,
  },
  weatherModalBackdrop: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  weatherModalCard: {
    width: '100%',
    maxWidth: 560,
    borderRadius: RADIUS.xl + 4,
    backgroundColor: COLORS.surface,
    padding: SPACING.xl,
    gap: SPACING.md,
    ...SHADOWS.lg,
  },
  weatherModalIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E7F9FC',
  },
  weatherModalIcon: {
    fontSize: 30,
  },
  weatherModalTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '900',
    color: COLORS.text,
    textAlign: 'center',
  },
  weatherModalSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  weatherSettings: {
    gap: SPACING.md,
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
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.sm + 2,
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
    lineHeight: 18,
  },
  weatherModalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  weatherModalSecondaryBtn: {
    minWidth: 110,
    height: 48,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  weatherModalSecondaryBtnText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },
  weatherModalPrimaryBtn: {
    minWidth: 132,
    height: 48,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.secondary,
  },
  weatherModalPrimaryBtnText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '800',
    color: '#FFF',
  },
  profileModalCard: {
    width: '100%',
    maxWidth: 520,
    borderRadius: RADIUS.xl + 4,
    backgroundColor: COLORS.surface,
    padding: SPACING.xl,
    gap: SPACING.md,
    ...SHADOWS.lg,
  },
  profileModalBadge: {
    alignSelf: 'center',
    paddingVertical: 6,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: `${COLORS.secondary}18`,
  },
  profileModalBadgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
    color: COLORS.secondaryDark,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  profileModalTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '900',
    color: COLORS.text,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  profileModalId: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.textLight,
    textAlign: 'center',
  },
  profileModalText: {
    fontSize: FONT_SIZE.md,
    lineHeight: 24,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  profileModalHint: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.secondaryDark,
    textAlign: 'center',
  },
  profileModalActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    flexWrap: 'wrap',
    marginTop: SPACING.md,
  },
});
