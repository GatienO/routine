import React, { memo, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Check, MagnifyingGlass } from 'phosphor-react-native';
import type { Routine } from '../../types';
import type { Activity } from '../../features/activities/types';
import { FONT_SIZE, SHADOWS, SPACING } from '../../constants/theme';
import { useAppTheme } from '../../hooks/useAppTheme';
import { OpenMoji } from '../ui/OpenMoji';
import { ResponsiveOverlay } from '../ui/ResponsiveOverlay';

type PickerTab = 'routines' | 'activities';

type CalendarLinkPickerProps = {
  visible: boolean;
  routines: Routine[];
  activities: Activity[];
  selectedRoutineIds?: string[];
  selectedActivityIds?: string[];
  initialTab?: PickerTab;
  title?: string;
  onClose: () => void;
  onToggleRoutine?: (routineId: string) => void;
  onToggleActivity?: (activityId: string) => void;
  onPickRoutine?: (routine: Routine) => void;
  onPickActivity?: (activity: Activity) => void;
};

export const CalendarLinkPicker = memo(function CalendarLinkPicker({
  visible,
  routines,
  activities,
  selectedRoutineIds = [],
  selectedActivityIds = [],
  initialTab = 'routines',
  title = 'Lier un contenu',
  onClose,
  onToggleRoutine,
  onToggleActivity,
  onPickRoutine,
  onPickActivity,
}: CalendarLinkPickerProps) {
  const { colors } = useAppTheme();
  const [tab, setTab] = useState<PickerTab>(initialTab);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (visible) {
      setTab(initialTab);
      setQuery('');
    }
  }, [initialTab, visible]);

  const normalizedQuery = query.trim().toLocaleLowerCase('fr');
  const filteredRoutines = useMemo(() => {
    if (!normalizedQuery) return routines;
    return routines.filter((routine) => [
      routine.name,
      routine.description,
      routine.category,
      ...routine.steps.map((step) => step.title),
    ].filter(Boolean).join(' ').toLocaleLowerCase('fr').includes(normalizedQuery));
  }, [normalizedQuery, routines]);
  const filteredActivities = useMemo(() => {
    if (!normalizedQuery) return activities;
    return activities.filter((activity) => [
      activity.title,
      activity.description,
      activity.activityType,
      activity.weather,
      ...activity.materials,
    ].join(' ').toLocaleLowerCase('fr').includes(normalizedQuery));
  }, [activities, normalizedQuery]);

  const handleRoutinePress = (routine: Routine) => {
    if (onPickRoutine) onPickRoutine(routine);
    else onToggleRoutine?.(routine.id);
  };
  const handleActivityPress = (activity: Activity) => {
    if (onPickActivity) onPickActivity(activity);
    else onToggleActivity?.(activity.id);
  };

  const resultCount = tab === 'routines' ? filteredRoutines.length : filteredActivities.length;

  return (
    <ResponsiveOverlay
      visible={visible}
      title={title}
      subtitle="Un repère peut préparer une routine ou suggérer une activité."
      onClose={onClose}
      footer={(
        <Pressable accessibilityRole="button" onPress={onClose} style={[styles.doneButton, { backgroundColor: colors.action }]}>
          <Text style={[styles.doneText, { color: colors.surface }]}>Terminer</Text>
        </Pressable>
      )}
    >
      <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <MagnifyingGlass size={19} weight="bold" color={colors.textSecondary} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Rechercher"
          placeholderTextColor={colors.textLight}
          style={[styles.searchInput, { color: colors.text }]}
        />
      </View>

      <View style={[styles.tabs, { backgroundColor: colors.surfaceSecondary }]}>
        <TabButton label="Routines" selected={tab === 'routines'} onPress={() => setTab('routines')} />
        <TabButton label="Activités" selected={tab === 'activities'} onPress={() => setTab('activities')} />
      </View>

      <Text style={[styles.resultCount, { color: colors.textSecondary }]}>
        {resultCount} proposition{resultCount > 1 ? 's' : ''}
      </Text>

      <View style={styles.list}>
        {tab === 'routines'
          ? filteredRoutines.map((routine) => {
              const selected = selectedRoutineIds.includes(routine.id);
              return (
                <Pressable aria-checked={selected}
                  key={routine.id}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: selected }}
                  onPress={() => handleRoutinePress(routine)}
                  style={[styles.row, {
                    backgroundColor: selected ? colors.actionSoft : colors.surface,
                    borderColor: selected ? colors.action : colors.border,
                  }]}
                >
                  <View style={[styles.iconWrap, { backgroundColor: `${routine.color}24` }]}>
                    <OpenMoji emoji={routine.icon} size={30} />
                  </View>
                  <View style={styles.rowText}>
                    <Text style={[styles.rowTitle, { color: colors.text }]} numberOfLines={1}>{routine.name}</Text>
                    <Text style={[styles.rowMeta, { color: colors.textSecondary }]} numberOfLines={1}>
                      {routine.steps.length} étape{routine.steps.length > 1 ? 's' : ''}
                    </Text>
                  </View>
                  <SelectionMark selected={selected} />
                </Pressable>
              );
            })
          : filteredActivities.map((activity) => {
              const selected = selectedActivityIds.includes(activity.id);
              return (
                <Pressable aria-checked={selected}
                  key={activity.id}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: selected }}
                  onPress={() => handleActivityPress(activity)}
                  style={[styles.row, {
                    backgroundColor: selected ? colors.informationSoft : colors.surface,
                    borderColor: selected ? colors.information : colors.border,
                  }]}
                >
                  <View style={[styles.iconWrap, { backgroundColor: colors.informationSoft }]}>
                    <OpenMoji emoji={activity.thumbnail} size={30} />
                  </View>
                  <View style={styles.rowText}>
                    <Text style={[styles.rowTitle, { color: colors.text }]} numberOfLines={1}>{activity.title}</Text>
                    <Text style={[styles.rowMeta, { color: colors.textSecondary }]} numberOfLines={1}>
                      {activity.duration} min · avec l’adulte
                    </Text>
                  </View>
                  <SelectionMark selected={selected} information />
                </Pressable>
              );
            })}

        {resultCount === 0 ? (
          <View style={[styles.empty, { backgroundColor: colors.surfaceSecondary }]}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Aucun résultat</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Essayez un mot plus court.</Text>
          </View>
        ) : null}
      </View>
    </ResponsiveOverlay>
  );

  function TabButton({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
    return (
      <Pressable aria-selected={selected}
        accessibilityRole="tab"
        accessibilityState={{ selected }}
        onPress={onPress}
        style={[styles.tab, selected && { backgroundColor: colors.surface, ...SHADOWS.sm }]}
      >
        <Text style={[styles.tabText, { color: selected ? colors.text : colors.textSecondary }]}>{label}</Text>
      </Pressable>
    );
  }

  function SelectionMark({ selected, information = false }: { selected: boolean; information?: boolean }) {
    const accent = information ? colors.information : colors.action;
    return (
      <View style={[styles.selectionMark, { backgroundColor: selected ? accent : colors.surfaceSecondary }]}>
        {selected ? <Check size={17} weight="bold" color={colors.surface} /> : null}
      </View>
    );
  }
});

const styles = StyleSheet.create({
  searchBox: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, borderRadius: 16, borderWidth: 1, paddingHorizontal: SPACING.md },
  searchInput: { flex: 1, minWidth: 0, fontSize: FONT_SIZE.sm },
  tabs: { flexDirection: 'row', gap: 5, padding: 5, borderRadius: 17 },
  tab: { flex: 1, minHeight: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  tabText: { fontSize: FONT_SIZE.sm, fontWeight: '700' },
  resultCount: { fontSize: FONT_SIZE.xs },
  list: { gap: SPACING.sm },
  row: { minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: SPACING.md, borderRadius: 18, borderWidth: 1, padding: SPACING.sm },
  iconWrap: { width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1, minWidth: 0 },
  rowTitle: { fontSize: FONT_SIZE.md, fontWeight: '700' },
  rowMeta: { marginTop: 3, fontSize: FONT_SIZE.xs },
  selectionMark: { width: 30, height: 30, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  empty: { minHeight: 140, borderRadius: 18, alignItems: 'center', justifyContent: 'center', padding: SPACING.lg },
  emptyTitle: { fontSize: FONT_SIZE.md, fontWeight: '700' },
  emptyText: { marginTop: 4, fontSize: FONT_SIZE.xs },
  doneButton: { minHeight: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  doneText: { fontSize: FONT_SIZE.sm, fontWeight: '700' },
});
