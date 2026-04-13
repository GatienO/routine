import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { OpenMoji } from '../ui/OpenMoji';
import { Routine } from '../../types';
import { CATEGORY_CONFIG, COLORS, FONT_SIZE, RADIUS, SPACING } from '../../constants/theme';
import { EditIcon, DuplicateIcon, DeleteIcon } from '../ui/ModernIcons';
import { formatDuration } from '../../utils/date';

interface CompactRoutineRowProps {
  routine: Routine;
  selected?: boolean;
  selectable?: boolean;
  onPress: () => void;
  onToggle: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onSelect?: () => void;
}

export function CompactRoutineRow({
  routine,
  selected = false,
  selectable = false,
  onPress,
  onToggle,
  onDuplicate,
  onDelete,
  onSelect,
}: CompactRoutineRowProps) {
  const category = CATEGORY_CONFIG[routine.category];
  const totalDuration = routine.steps.reduce((sum, step) => sum + step.durationMinutes, 0);

  return (
    <View
      style={[
        styles.row,
        !routine.isActive && styles.rowInactive,
        selected && styles.rowSelected,
      ]}
    >
      {selectable ? (
        <TouchableOpacity
          style={[styles.selectBadge, selected && styles.selectBadgeActive]}
          onPress={onSelect}
          activeOpacity={0.7}
        >
          <Text style={[styles.selectBadgeText, selected && styles.selectBadgeTextActive]}>
            {selected ? '✓' : '+'}
          </Text>
        </TouchableOpacity>
      ) : null}

      <TouchableOpacity style={styles.main} onPress={onPress} activeOpacity={0.75}>
        <View style={[styles.iconWrap, { backgroundColor: routine.color + '18' }]}>
          <OpenMoji emoji={routine.icon} size={28} />
        </View>
        <View style={styles.info}>
          <View style={styles.titleRow}>
            <Text style={styles.name} numberOfLines={1}>{routine.name}</Text>
            <View style={[styles.statusPill, routine.isActive ? styles.statusOn : styles.statusOff]}>
              <Text style={[styles.statusText, !routine.isActive && styles.statusTextOff]}>
                {routine.isActive ? 'Active' : 'Off'}
              </Text>
            </View>
          </View>
          {routine.description ? (
            <Text style={styles.description} numberOfLines={1}>{routine.description}</Text>
          ) : null}
          <Text style={styles.meta}>
            {category?.label ?? routine.category} · {routine.steps.length} etapes · ~{formatDuration(totalDuration)}
          </Text>
        </View>
      </TouchableOpacity>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.toggleBtn, routine.isActive ? styles.toggleBtnOn : styles.toggleBtnOff]}
          onPress={onToggle}
          activeOpacity={0.7}
        >
          <Text style={[styles.toggleText, !routine.isActive && styles.toggleTextOff]}>
            {routine.isActive ? 'ON' : 'OFF'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={onPress} activeOpacity={0.7}>
          <EditIcon size={16} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={onDuplicate} activeOpacity={0.7}>
          <DuplicateIcon size={16} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={onDelete} activeOpacity={0.7}>
          <DeleteIcon size={16} color={COLORS.error} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceSecondary,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.sm,
  },
  rowInactive: {
    opacity: 0.72,
  },
  rowSelected: {
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.secondary + '10',
  },
  selectBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.textLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectBadgeActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  selectBadgeText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '900',
    color: COLORS.textSecondary,
  },
  selectBadgeTextActive: {
    color: '#FFF',
  },
  main: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  name: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
    color: COLORS.text,
  },
  statusPill: {
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },
  statusOn: {
    backgroundColor: COLORS.successLight,
  },
  statusOff: {
    backgroundColor: COLORS.surfaceSecondary,
  },
  statusText: {
    color: COLORS.success,
    fontSize: 11,
    fontWeight: '800',
  },
  statusTextOff: {
    color: COLORS.textSecondary,
  },
  description: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  meta: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  toggleBtn: {
    minWidth: 46,
    borderRadius: RADIUS.full,
    paddingVertical: 6,
    paddingHorizontal: SPACING.sm,
    alignItems: 'center',
  },
  toggleBtnOn: {
    backgroundColor: COLORS.successLight,
  },
  toggleBtnOff: {
    backgroundColor: COLORS.surfaceSecondary,
  },
  toggleText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.success,
  },
  toggleTextOff: {
    color: COLORS.textSecondary,
  },
  actionBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceSecondary,
  },
});
