import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import {
  CopySimple,
  ShareNetwork,
  Trash,
  Printer,
  PencilSimpleLine,
} from 'phosphor-react-native';
import { Card } from '../ui/Card';
import { OpenMoji } from '../ui/OpenMoji';
import { Avatar } from '../ui/Avatar';
import { COLORS, SPACING, FONT_SIZE, RADIUS, CATEGORY_CONFIG } from '../../constants/theme';
import { Child, Routine } from '../../types';
import { formatChildName } from '../../utils/children';
import { formatDuration } from '../../utils/date';
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

const STEP_PREVIEW_LIMIT = 5;

const softTint = (color: string) => `${color}20`;

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
  const { width } = useWindowDimensions();
  const isMobile = width < 760;
  const category = CATEGORY_CONFIG[routine.category];
  const totalDuration = routine.steps.reduce((sum, step) => sum + step.durationMinutes, 0);

  return (
    <RoutineShell
      icon={routine.icon}
      color={routine.color}
      title={routine.name}
      meta={[
        category?.label ?? routine.category,
        `${routine.steps.length} etapes`,
        `~${formatDuration(totalDuration)}`,
      ]}
      child={child}
      steps={routine.steps.slice(0, STEP_PREVIEW_LIMIT).map((step) => ({
        id: step.id,
        icon: step.icon,
        title: step.title,
      }))}
      routine={routine}
      childForPrint={child}
      isActive={routine.isActive}
      statusLabel={routine.isActive ? 'Active' : 'En pause'}
      isMobile={isMobile}
      onEdit={onEdit}
      onToggle={onToggle}
      onDuplicate={onDuplicate}
      onShare={onShare}
      onDelete={onDelete}
    />
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
  const { width } = useWindowDimensions();
  const isMobile = width < 760;
  const category = CATEGORY_CONFIG[group.sample.category];
  const totalDuration = group.sample.steps.reduce((sum, step) => sum + step.durationMinutes, 0);
  const activeCount = group.routines.filter((routine) => routine.isActive).length;
  const allActive = activeCount === group.routines.length;
  const statusLabel = activeCount === 0 ? 'En pause' : allActive ? 'Actif' : 'Mixte';
  const previewChildren = group.childIds
    .slice(0, 3)
    .map((childId) => childrenById.get(childId))
    .filter((child): child is Child => Boolean(child));

  return (
    <RoutineShell
      icon={group.sample.icon}
      color={group.sample.color}
      title={group.sample.name}
      meta={[
        category?.label ?? group.sample.category,
        `${group.sample.steps.length} etapes`,
        `~${formatDuration(totalDuration)}`,
      ]}
      steps={group.sample.steps.slice(0, STEP_PREVIEW_LIMIT).map((step) => ({
        id: step.id,
        icon: step.icon,
        title: step.title,
      }))}
      groupChildren={previewChildren}
      groupSummary={`${group.routines.length} routine${group.routines.length > 1 ? 's' : ''} partagee${group.routines.length > 1 ? 's' : ''} pour ${group.childIds.length} enfant${group.childIds.length > 1 ? 's' : ''}`}
      routine={group.sample}
      childForPrint={previewChildren[0]}
      isActive={allActive}
      isMuted={activeCount === 0}
      statusLabel={statusLabel}
      isMobile={isMobile}
      onEdit={onEdit}
      onToggle={onToggle}
      onDuplicate={onDuplicate}
      onShare={onShare}
      onDelete={onDelete}
    />
  );
});

function RoutineShell({
  icon,
  color,
  title,
  meta,
  child,
  steps,
  groupChildren,
  groupSummary,
  routine,
  childForPrint,
  isActive,
  isMuted = false,
  statusLabel,
  isMobile,
  onEdit,
  onToggle,
  onDuplicate,
  onShare,
  onDelete,
}: {
  icon: string;
  color: string;
  title: string;
  meta: string[];
  child?: Child;
  steps: Array<{ id: string; icon: string; title: string }>;
  groupChildren?: Child[];
  groupSummary?: string;
  routine: Routine;
  childForPrint?: Child;
  isActive: boolean;
  isMuted?: boolean;
  statusLabel: string;
  isMobile: boolean;
  onEdit: () => void;
  onToggle: () => void;
  onDuplicate: () => void;
  onShare: () => void;
  onDelete: () => void;
}) {
  return (
    <Card padded={false} style={[styles.card, isMuted && styles.cardMuted]}>
      <View style={styles.cardBody}>
        <TouchableOpacity accessibilityRole="button"
          activeOpacity={0.78}
          onPress={onEdit}
          style={[styles.headerPressable, isMobile && styles.headerPressableStacked]}
        >
          <View style={[styles.iconWrap, { backgroundColor: softTint(color) }]}>
            <OpenMoji emoji={icon} size={30} />
          </View>

          <View style={styles.headerContent}>
            <View style={styles.headerTopRow}>
              <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>
                  {title}
                </Text>
                <View style={styles.metaRow}>
                  {meta.map((label) => (
                    <MetaPill key={label} label={label} />
                  ))}
                </View>
              </View>

              {!isMobile ? (
                <View style={styles.headerUtilityRow}>
                  <IconAction
                    icon={<PencilSimpleLine size={18} weight="bold" color={COLORS.textSecondary} />}
                    onPress={onEdit}
                    label="Modifier"
                    subtle
                  />
                  <StatusChip label={statusLabel} isActive={isActive} muted={isMuted} />
                </View>
              ) : null}
            </View>

            {child ? (
              <View style={[styles.childPill, { backgroundColor: softTint(child.color) }]}>
                <Avatar
                  emoji={child.avatar}
                  color={child.color}
                  size={28}
                  avatarConfig={child.avatarConfig}
                />
                <Text style={styles.childPillText}>Pour {formatChildName(child.name)}</Text>
              </View>
            ) : null}

            {groupChildren && groupSummary ? (
              <View style={styles.groupRow}>
                <View style={styles.groupAvatarStack}>
                  {groupChildren.map((groupChild) => (
                    <Avatar
                      key={groupChild.id}
                      emoji={groupChild.avatar}
                      color={groupChild.color}
                      size={28}
                      avatarConfig={groupChild.avatarConfig}
                      style={styles.groupAvatar}
                    />
                  ))}
                </View>
                <Text style={styles.groupSummary}>{groupSummary}</Text>
              </View>
            ) : null}

            {steps.length > 0 ? (
              <View style={styles.stepsRow}>
                {steps.map((step) => (
                  <View key={step.id} style={styles.stepPill}>
                    <OpenMoji emoji={step.icon} size={14} />
                    <Text style={styles.stepPillText} numberOfLines={1}>
                      {step.title}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        </TouchableOpacity>

        <RoutineActionPanel
          routine={routine}
          child={childForPrint}
          isActive={isActive}
          statusLabel={statusLabel}
          isMuted={isMuted}
          isMobile={isMobile}
          onEdit={onEdit}
          onToggle={onToggle}
          onDuplicate={onDuplicate}
          onShare={onShare}
          onDelete={onDelete}
        />
      </View>
    </Card>
  );
}

const RoutineActionPanel = memo(function RoutineActionPanel({
  routine,
  child,
  isActive,
  statusLabel,
  isMuted,
  isMobile,
  onEdit,
  onToggle,
  onDuplicate,
  onShare,
  onDelete,
}: {
  routine?: Routine;
  child?: Child;
  isActive: boolean;
  statusLabel: string;
  isMuted?: boolean;
  isMobile: boolean;
  onEdit: () => void;
  onToggle: () => void;
  onDuplicate: () => void;
  onShare: () => void;
  onDelete: () => void;
}) {
  const iconSize = isMobile ? 20 : 18;

  const handlePrint = async () => {
    if (!routine || !child) return;
    try {
      await printRoutine(routine, child);
      showAppToast({
        title: 'Impression lancee',
        message: "Ouvre la fenetre d'impression",
        tone: 'success',
        icon: '🖨️',
      });
    } catch (error) {
      showAppAlert({
        title: 'Erreur',
        message: "Impossible d'imprimer",
        tone: 'danger',
        icon: '⚠️',
      });
    }
  };

  return (
    <View style={[styles.footerPanel, isMobile && styles.footerPanelMobile]}>
      <View style={styles.iconActionRow}>
        {Platform.OS === 'web' && routine && child ? (
          <IconAction
            icon={<Printer size={iconSize} weight="bold" color={COLORS.secondaryDark} />}
            onPress={handlePrint}
            label="Imprimer / PDF"
          />
        ) : null}
        <IconAction
          icon={<CopySimple size={iconSize} weight="bold" color={COLORS.secondaryDark} />}
          onPress={onDuplicate}
          label="Dupliquer"
        />
        <IconAction
          icon={<ShareNetwork size={iconSize} weight="bold" color={COLORS.secondaryDark} />}
          onPress={onShare}
          label="Partager"
        />
        <IconAction
          icon={<Trash size={iconSize} weight="bold" color={COLORS.error} />}
          onPress={onDelete}
          label="Supprimer"
        />
        {isMobile ? (
          <IconAction
            icon={<PencilSimpleLine size={iconSize} weight="bold" color={COLORS.textSecondary} />}
            onPress={onEdit}
            label="Modifier"
          />
        ) : null}
      </View>

      <TouchableOpacity accessibilityRole="button"
        style={[
          styles.switchStatusRow,
          isActive ? styles.switchStatusRowActive : styles.switchStatusRowInactive,
        ]}
        onPress={onToggle}
        activeOpacity={0.82}
      >
        <View style={[styles.switchTrack, isActive ? styles.switchTrackActive : styles.switchTrackInactive]}>
          <View style={[styles.switchThumb, isActive ? styles.switchThumbRight : styles.switchThumbLeft]} />
        </View>
        <Text
          style={[
            styles.statusLabel,
            isActive ? styles.statusLabelActive : styles.statusLabelInactive,
            isMuted && styles.statusLabelInactive,
          ]}
        >
          {statusLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
});

const MetaPill = memo(function MetaPill({ label }: { label: string }) {
  return (
    <View style={styles.metaPill}>
      <Text style={styles.metaPillText}>{label}</Text>
    </View>
  );
});

const StatusChip = memo(function StatusChip({
  label,
  isActive,
  muted = false,
}: {
  label: string;
  isActive: boolean;
  muted?: boolean;
}) {
  return (
    <View
      style={[
        styles.statusChip,
        isActive ? styles.statusChipActive : styles.statusChipInactive,
        muted && styles.statusChipInactive,
      ]}
    >
      <Text
        style={[
          styles.statusChipText,
          isActive ? styles.statusChipTextActive : styles.statusChipTextInactive,
        ]}
      >
        {label}
      </Text>
    </View>
  );
});

const IconAction = memo(function IconAction({
  icon,
  onPress,
  label,
  subtle = false,
}: {
  icon: React.ReactNode;
  onPress: () => void;
  label: string;
  subtle?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.iconActionBtn, subtle && styles.iconActionBtnSubtle]}
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
    marginBottom: SPACING.md,
    borderWidth: 0,
    borderRadius: 30,
    backgroundColor: COLORS.surface,
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 14 },
        shadowOpacity: 0.14,
        shadowRadius: 26,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 14px 30px rgba(74, 63, 50, 0.08)',
      },
    }),
  },
  cardMuted: {
    opacity: 0.86,
  },
  cardBody: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  headerPressable: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  headerPressableStacked: {
    width: '100%',
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
    minWidth: 0,
    gap: SPACING.sm,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  info: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  headerUtilityRow: {
    alignItems: 'flex-end',
    gap: SPACING.xs,
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    fontStyle: 'normal',
    color: COLORS.text,
    letterSpacing: 0,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  metaPill: {
    borderRadius: RADIUS.full,
    paddingVertical: 6,
    paddingHorizontal: SPACING.sm + 2,
    backgroundColor: COLORS.surfaceSecondary,
  },
  metaPillText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  childPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    borderRadius: RADIUS.full,
    paddingVertical: 8,
    paddingHorizontal: SPACING.sm + 4,
  },
  childPillText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.text,
  },
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  groupAvatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: SPACING.xs,
  },
  groupAvatar: {
    marginRight: -8,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  groupSummary: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    lineHeight: 20,
    color: '#68808A',
    fontWeight: '600',
  },
  stepsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  stepPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    maxWidth: '48%',
    backgroundColor: '#F8FCFA',
    borderRadius: 18,
    paddingVertical: 9,
    paddingHorizontal: SPACING.sm + 2,
  },
  stepPillText: {
    flexShrink: 1,
    fontSize: FONT_SIZE.sm,
    color: '#668089',
    fontWeight: '600',
  },
  footerPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.md,
    backgroundColor: '#F4FAF7',
    borderRadius: 22,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.sm + 2,
  },
  footerPanelMobile: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  iconActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  iconActionBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: '#DCEAE3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconActionBtnSubtle: {
    backgroundColor: '#F5FBF8',
  },
  switchStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    borderRadius: RADIUS.full,
    paddingVertical: 7,
    paddingHorizontal: SPACING.sm + 2,
  },
  switchStatusRowActive: {
    backgroundColor: '#EAF8F2',
  },
  switchStatusRowInactive: {
    backgroundColor: '#EEF4F1',
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
    backgroundColor: '#BED0C8',
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
  statusLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
  },
  statusLabelActive: {
    color: COLORS.success,
  },
  statusLabelInactive: {
    color: '#68808A',
  },
  statusChip: {
    borderRadius: RADIUS.full,
    paddingVertical: 6,
    paddingHorizontal: SPACING.sm + 2,
  },
  statusChipActive: {
    backgroundColor: '#EAF8F2',
  },
  statusChipInactive: {
    backgroundColor: '#EEF4F1',
  },
  statusChipText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
  },
  statusChipTextActive: {
    color: COLORS.success,
  },
  statusChipTextInactive: {
    color: '#68808A',
  },
});
