import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Card } from '../ui/Card';
import { OpenMoji } from '../ui/OpenMoji';
import { EditIcon, DuplicateIcon, DeleteIcon } from '../ui/ModernIcons';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '../../constants/theme';
import { CATEGORY_CONFIG } from '../../constants/theme';
import { Routine } from '../../types';
import { formatDuration } from '../../utils/date';

interface RoutineCardProps {
  routine: Routine;
  onPress: () => void;
  onToggle?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
  showToggle?: boolean;
}

export function RoutineCard({
  routine,
  onPress,
  onToggle,
  onDuplicate,
  onDelete,
  showActions = false,
  showToggle = false,
}: RoutineCardProps) {
  const category = CATEGORY_CONFIG[routine.category];
  const totalDuration = routine.steps.reduce((sum, s) => sum + s.durationMinutes, 0);

  return (
    <Card color={routine.color} style={!routine.isActive ? styles.inactive : undefined}>
      <View style={showActions ? styles.headerRow : undefined}>
        {showActions && onToggle && (
          <TouchableOpacity
            style={[styles.activeBtn, routine.isActive ? styles.activeBtnOn : styles.activeBtnOff]}
            onPress={onToggle}
            activeOpacity={0.7}
          >
            <Text style={styles.activeBtnIcon}>{routine.isActive ? '✅' : '⏸️'}</Text>
            <Text style={[styles.activeBtnLabel, !routine.isActive && { color: COLORS.textLight }]}>
              {routine.isActive ? 'Actif' : 'Off'}
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={showActions ? styles.headerCenter : undefined}>
          <View style={styles.header}>
            <OpenMoji emoji={routine.icon} size={36} />
            <View style={styles.info}>
              <Text style={styles.name}>{routine.name}</Text>
              {routine.description ? (
                <Text style={styles.description} numberOfLines={2}>{routine.description}</Text>
              ) : null}
              <View style={styles.meta}>
                <Text style={styles.category}>
                  {category?.icon} {category?.label}
                </Text>
                <Text style={styles.dot}>·</Text>
                <Text style={styles.steps}>{routine.steps.length} étapes</Text>
                <Text style={styles.dot}>·</Text>
                <Text style={styles.duration}>~{formatDuration(totalDuration)}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
        {showActions && (
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.actionBtn} onPress={onPress} activeOpacity={0.7}>
              <EditIcon size={18} color={COLORS.textSecondary} style={{ marginBottom: 2 }} />
              <Text style={styles.actionLabel}>Modifier</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={onDuplicate} activeOpacity={0.7}>
              <DuplicateIcon size={18} color={COLORS.textSecondary} style={{ marginBottom: 2 }} />
              <Text style={styles.actionLabel}>Dupliquer</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={onDelete} activeOpacity={0.7}>
              <DeleteIcon size={18} color={COLORS.error} style={{ marginBottom: 2 }} />
              <Text style={[styles.actionLabel, { color: COLORS.error }]}>Suppr.</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Legacy toggle only (no action bar) */}
      {!showActions && showToggle && onToggle && (
        <View style={styles.legacyToggleRow}>
          <TouchableOpacity
            style={[
              styles.toggle,
              { backgroundColor: routine.isActive ? COLORS.success : COLORS.textLight },
            ]}
            onPress={onToggle}
          >
            <View
              style={[
                styles.toggleDot,
                routine.isActive ? styles.toggleOn : styles.toggleOff,
              ]}
            />
          </TouchableOpacity>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.md,
    minWidth: 48,
  },
  activeBtnOn: {
    backgroundColor: COLORS.successLight ?? '#E8F5E9',
  },
  activeBtnOff: {
    backgroundColor: COLORS.surfaceSecondary,
  },
  activeBtnIcon: {
    fontSize: 20,
  },
  activeBtnLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  headerCenter: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  icon: {
    fontSize: 36,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  description: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: 6,
  },
  category: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  dot: {
    color: COLORS.textLight,
    fontSize: FONT_SIZE.xs,
  },
  steps: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  duration: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    padding: 2,
  },
  toggleDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFF',
  },
  toggleOn: {
    alignSelf: 'flex-end',
  },
  toggleOff: {
    alignSelf: 'flex-start',
  },
  inactive: {
    opacity: 0.5,
  },
  actionBtn: {
    alignItems: 'center',
    gap: 2,
    paddingVertical: SPACING.xs,
    paddingHorizontal: 6,
    borderRadius: RADIUS.md,
  },
  actionIcon: {
    fontSize: 18,
  },
  actionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },

  legacyToggleRow: {
    position: 'absolute',
    right: SPACING.md,
    top: SPACING.md,
  },
});
