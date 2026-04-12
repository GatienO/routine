import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { CopySimple, ShareNetwork, Trash, Printer } from 'phosphor-react-native';
import { Card } from '../ui/Card';
import { OpenMoji } from '../ui/OpenMoji';
import { Avatar } from '../ui/Avatar';
import { COLORS, SPACING, FONT_SIZE, RADIUS, CATEGORY_CONFIG } from '../../constants/theme';
import { Child, Routine } from '../../types';
import { formatChildName } from '../../utils/children';
import { printRoutine } from '../../services/exportRoutine';
import {
  showAppAlert,
  showAppToast,
} from '../feedback/AppFeedbackProvider';

export type RoutineGroup = {
  key: string;
  sample: Routine;
  routines: Routine[];
  childIds: string[];
};

type SharedProps = {
  onEdit: () => void;
  onToggle: () => void;
  onDuplicate: () => void;
  onShare: () => void;
  onDelete: () => void;
};

export const CompactRoutineRow = memo(function CompactRoutineRow({
  routine,
  child,
  onEdit,
  onToggle,
  onDuplicate,
  onShare,
  onDelete,
}: {
  routine: Routine;
  child?: Child;
} & SharedProps) {
  const category = CATEGORY_CONFIG[routine.category];
  const totalDuration = routine.steps.reduce((sum, step) => sum + step.durationMinutes, 0);

  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <TouchableOpacity activeOpacity={0.78} onPress={onEdit} style={styles.mainPressable}>
          <View style={[styles.iconWrap, { backgroundColor: `${routine.color}20` }]}>
            <OpenMoji emoji={routine.icon} size={28} />
          </View>
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>
              {routine.name}
            </Text>
            <Text style={styles.meta}>
              {category?.label ?? routine.category} · {routine.steps.length} etapes · ~{totalDuration} min
            </Text>
            {child ? <Text style={styles.subMeta}>Pour {formatChildName(child.name)}</Text> : null}
          </View>
        </TouchableOpacity>

        <RoutineActionPanel
          routine={routine}
          child={child}
          isActive={routine.isActive}
          statusLabel={routine.isActive ? 'Actif' : 'Off'}
          onToggle={onToggle}
          onDuplicate={onDuplicate}
          onShare={onShare}
          onDelete={onDelete}
        />
      </View>
    </Card>
  );
});

export const CompactRoutineGroupRow = memo(function CompactRoutineGroupRow({
  group,
  childrenById,
  onEdit,
  onToggle,
  onDuplicate,
  onShare,
  onDelete,
}: {
  group: RoutineGroup;
  childrenById: Map<string, Child>;
} & SharedProps) {
  const category = CATEGORY_CONFIG[group.sample.category];
  const totalDuration = group.sample.steps.reduce((sum, step) => sum + step.durationMinutes, 0);
  const activeCount = group.routines.filter((routine) => routine.isActive).length;
  const allActive = activeCount === group.routines.length;
  const statusLabel = activeCount === 0 ? 'Off' : allActive ? 'Actif' : 'Mixte';
  const previewChildren = group.childIds
    .slice(0, 3)
    .map((childId) => childrenById.get(childId))
    .filter((child): child is Child => Boolean(child));

  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <TouchableOpacity activeOpacity={0.78} onPress={onEdit} style={styles.mainPressable}>
          <View style={[styles.iconWrap, { backgroundColor: `${group.sample.color}20` }]}>
            <OpenMoji emoji={group.sample.icon} size={28} />
          </View>
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>
              {group.sample.name}
            </Text>
            <Text style={styles.meta}>
              {category?.label ?? group.sample.category} · {group.sample.steps.length} etapes · ~{totalDuration} min
            </Text>
            <View style={styles.groupChildrenRow}>
              {previewChildren.map((child) => (
                <Avatar
                  key={child.id}
                  emoji={child.avatar}
                  color={child.color}
                  size={26}
                  avatarConfig={child.avatarConfig}
                  style={styles.groupAvatar}
                />
              ))}
            </View>
          </View>
        </TouchableOpacity>

        <RoutineActionPanel
          routine={group.sample}
          child={previewChildren[0]}
          isActive={allActive}
          statusLabel={statusLabel}
          onToggle={onToggle}
          onDuplicate={onDuplicate}
          onShare={onShare}
          onDelete={onDelete}
        />
      </View>
    </Card>
  );
});

const RoutineActionPanel = memo(function RoutineActionPanel({
  routine,
  child,
  isActive,
  statusLabel,
  onToggle,
  onDuplicate,
  onShare,
  onDelete,
}: {
  routine?: Routine;
  child?: Child;
  isActive: boolean;
  statusLabel: string;
  onToggle: () => void;
  onDuplicate: () => void;
  onShare: () => void;
  onDelete: () => void;
}) {
  const handlePrint = async () => {
    if (!routine || !child) return;
    try {
      await printRoutine(routine, child);
      showAppToast({
        title: 'Impression lancée',
        message: 'Ouvre la fenêtre d\'impression',
        tone: 'success',
        icon: '🖨️',
      });
    } catch (error) {
      showAppAlert({
        title: 'Erreur',
        message: 'Impossible d\'imprimer',
        tone: 'danger',
        icon: '⚠️',
      });
    }
  };

  return (
    <>
      <View style={styles.titleControls}>
        <View style={styles.iconActionRow}>
          {Platform.OS === 'web' && routine && child && (
            <IconAction
              icon={<Printer size={15} weight="bold" color={COLORS.secondary} />}
              onPress={handlePrint}
              label="Imprimer / PDF"
            />
          )}
          <IconAction
            icon={<CopySimple size={15} weight="bold" color={COLORS.secondaryDark} />}
            onPress={onDuplicate}
            label="Dupliquer"
          />
          <IconAction
            icon={<ShareNetwork size={15} weight="bold" color={COLORS.secondaryDark} />}
            onPress={onShare}
            label="Partager"
          />
          <IconAction
            icon={<Trash size={15} weight="bold" color={COLORS.error} />}
            onPress={onDelete}
            label="Supprimer"
          />
        </View>

        <View style={styles.switchStatusRow}>
          <TouchableOpacity style={styles.switchWrap} onPress={onToggle} activeOpacity={0.8}>
            <View style={[styles.switchTrack, isActive ? styles.switchTrackActive : styles.switchTrackInactive]}>
              <View style={[styles.switchThumb, isActive ? styles.switchThumbRight : styles.switchThumbLeft]} />
            </View>
          </TouchableOpacity>
          <View style={[styles.statusPill, isActive ? styles.statusPillActive : styles.statusPillInactive]}>
            <Text style={[styles.statusText, isActive ? styles.statusTextActive : styles.statusTextInactive]}>
              {statusLabel}
            </Text>
          </View>
        </View>
      </View>
    </>
  );
});

const IconAction = memo(function IconAction({
  icon,
  onPress,
  label,
}: {
  icon: React.ReactNode;
  onPress: () => void;
  label: string;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.iconActionBtn}
      accessibilityRole="button"
      accessibilityLabel={label}
      activeOpacity={0.78}
      hitSlop={8}
    >
      {icon}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    marginBottom: SPACING.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  mainPressable: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  titleControls: {
    flexShrink: 0,
    alignItems: 'flex-end',
    gap: 6,
    width: 118,
  },
  iconActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  iconActionBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  name: {
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
    color: COLORS.text,
  },
  meta: {
    marginTop: 2,
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  subMeta: {
    marginTop: 4,
    fontSize: FONT_SIZE.xs,
    color: COLORS.textLight,
    fontWeight: '700',
  },
  statusPill: {
    minWidth: 52,
    borderRadius: RADIUS.full,
    paddingVertical: 3,
    paddingHorizontal: SPACING.sm,
    alignItems: 'center',
  },
  statusPillActive: {
    backgroundColor: `${COLORS.success}18`,
  },
  statusPillInactive: {
    backgroundColor: COLORS.surfaceSecondary,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  statusTextActive: {
    color: COLORS.success,
  },
  statusTextInactive: {
    color: COLORS.textSecondary,
  },
  groupChildrenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 4,
  },
  groupAvatar: {
    marginRight: -6,
  },
  switchWrap: {
    alignSelf: 'center',
  },
  switchTrack: {
    width: 46,
    height: 28,
    borderRadius: 14,
    padding: 2,
    justifyContent: 'center',
  },
  switchTrackActive: {
    backgroundColor: COLORS.success,
  },
  switchTrackInactive: {
    backgroundColor: COLORS.textLight,
  },
  switchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFF',
  },
  switchThumbLeft: {
    alignSelf: 'flex-start',
  },
  switchThumbRight: {
    alignSelf: 'flex-end',
  },
});
