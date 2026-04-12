import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useChildrenStore } from '../../src/stores/childrenStore';
import { useRoutineStore } from '../../src/stores/routineStore';
import { useRewardStore } from '../../src/stores/rewardStore';
import { Avatar } from '../../src/components/ui/Avatar';
import { Card } from '../../src/components/ui/Card';
import { StarCounter } from '../../src/components/rewards/Counters';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { BackButton } from '../../src/components/ui/BackButton';
import { BADGES } from '../../src/constants/badges';
import { COLORS, SPACING, FONT_SIZE, RADIUS, SHADOWS } from '../../src/constants/theme';
import { OpenMoji } from '../../src/components/ui/OpenMoji';
import { backOrReplace } from '../../src/utils/navigation';
import { formatChildName } from '../../src/utils/children';

const ROUTINES_PER_PAGE = 10;

export default function StatsScreen() {
  const router = useRouter();
  const { children } = useChildrenStore();
  const { executions, getRoutinesForChild, getRoutine } = useRoutineStore();
  const { getRewards, getUnlockedBadges } = useRewardStore();

  const [selectedChildId, setSelectedChildId] = useState<string | null>(
    children.length > 0 ? children[0].id : null,
  );
  const [routinePage, setRoutinePage] = useState(1);

  const selectedChild = children.find((child) => child.id === selectedChildId);
  const rewards = selectedChildId ? getRewards(selectedChildId) : null;
  const routines = selectedChildId ? getRoutinesForChild(selectedChildId) : [];
  const childExecutions = selectedChildId
    ? executions.filter((execution) => execution.childId === selectedChildId && execution.completedAt)
    : [];
  const unlockedBadges = selectedChildId ? getUnlockedBadges(selectedChildId) : [];

  const routineStats = useMemo(
    () =>
      routines.map((routine) => {
        const routineExecutions = childExecutions.filter(
          (execution) => execution.routineId === routine.id,
        );
        const totalStars = routineExecutions.reduce(
          (sum, execution) => sum + execution.earnedStars,
          0,
        );

        return {
          routine,
          completions: routineExecutions.length,
          totalStars,
        };
      }),
    [childExecutions, routines],
  );

  const routineTotalPages = Math.max(1, Math.ceil(routineStats.length / ROUTINES_PER_PAGE));
  const paginatedRoutineStats = routineStats.slice(
    (routinePage - 1) * ROUTINES_PER_PAGE,
    routinePage * ROUTINES_PER_PAGE,
  );

  useEffect(() => {
    setRoutinePage(1);
  }, [selectedChildId]);

  useEffect(() => {
    if (routinePage > routineTotalPages) {
      setRoutinePage(routineTotalPages);
    }
  }, [routinePage, routineTotalPages]);

  const recentExecutions = [...childExecutions]
    .sort((a, b) => (b.completedAt! > a.completedAt! ? 1 : -1))
    .slice(0, 10);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <BackButton onPress={() => backOrReplace(router, '/parent')} />
          <Text style={styles.title}>Statistiques</Text>
          <View style={styles.headerSpacer} />
        </View>

        {children.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.childSelector}
          >
            <View style={styles.childRow}>
              {children.map((child) => (
                <TouchableOpacity
                  key={child.id}
                  style={[
                    styles.childTab,
                    selectedChildId === child.id && {
                      backgroundColor: `${child.color}30`,
                      borderColor: child.color,
                    },
                  ]}
                  onPress={() => setSelectedChildId(child.id)}
                  activeOpacity={0.85}
                >
                  <Avatar
                    emoji={child.avatar}
                    color={child.color}
                    size={32}
                    avatarConfig={child.avatarConfig}
                  />
                  <Text
                    style={[
                      styles.childTabText,
                      selectedChildId === child.id && styles.childTabTextActive,
                    ]}
                  >
                    {formatChildName(child.name)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        )}

        {!selectedChild || !rewards ? (
          <Card>
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>👶</Text>
              <Text style={styles.emptyText}>
                Ajoutez un enfant pour voir ses statistiques
              </Text>
            </View>
          </Card>
        ) : (
          <>
            <View style={styles.overviewRow}>
              <Card style={styles.statCard}>
                <Text style={styles.statValue}>{rewards.totalStars}</Text>
                <Text style={styles.statLabel}>Etoiles</Text>
              </Card>
              <Card style={styles.statCard}>
                <Text style={styles.statValue}>{rewards.completedRoutines}</Text>
                <Text style={styles.statLabel}>Routines</Text>
              </Card>
            </View>

            <View style={styles.overviewRow}>
              <Card style={styles.statCard}>
                <Text style={styles.statValue}>{rewards.currentStreak}</Text>
                <Text style={styles.statLabel}>Serie actuelle</Text>
              </Card>
              <Card style={styles.statCard}>
                <Text style={styles.statValue}>{rewards.longestStreak}</Text>
                <Text style={styles.statLabel}>Meilleure serie</Text>
              </Card>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Badges ({unlockedBadges.length}/{BADGES.length})
              </Text>
              <ProgressBar
                progress={BADGES.length > 0 ? unlockedBadges.length / BADGES.length : 0}
                color={COLORS.accent}
                height={8}
                showLabel
              />
              <View style={styles.badgesRow}>
                {BADGES.map((badge) => {
                  const unlocked = rewards.unlockedBadges.includes(badge.id);

                  return (
                    <View
                      key={badge.id}
                      style={[styles.badgeMini, !unlocked && styles.badgeLocked]}
                    >
                      <OpenMoji emoji={badge.icon} size={28} />
                      <Text style={[styles.badgeName, !unlocked && styles.badgeLockedText]}>
                        {badge.name}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.routineSectionHeader}>
                <Text style={styles.sectionTitle}>Par routine</Text>
                {routineStats.length > ROUTINES_PER_PAGE ? (
                  <Text style={styles.paginationSummary}>
                    Page {routinePage}/{routineTotalPages}
                  </Text>
                ) : null}
              </View>

              {routineStats.length === 0 ? (
                <Text style={styles.emptyText}>Aucune routine creee</Text>
              ) : (
                <>
                  {paginatedRoutineStats.map(({ routine, completions, totalStars }) => (
                    <Card key={routine.id} style={styles.routineStatCard}>
                      <View style={styles.routineStatRow}>
                        <OpenMoji emoji={routine.icon} size={32} />
                        <View style={styles.routineStatInfo}>
                          <Text style={styles.routineStatName}>{routine.name}</Text>
                          <Text style={styles.routineStatSub}>
                            {completions} execution{completions !== 1 ? 's' : ''} · {totalStars}{' '}
                            etoiles
                          </Text>
                        </View>
                      </View>
                    </Card>
                  ))}

                  {routineTotalPages > 1 ? (
                    <View style={styles.paginationRow}>
                      <TouchableOpacity
                        onPress={() => setRoutinePage((page) => Math.max(1, page - 1))}
                        style={[
                          styles.paginationButton,
                          routinePage === 1 && styles.paginationButtonDisabled,
                        ]}
                        activeOpacity={0.85}
                        disabled={routinePage === 1}
                      >
                        <Text
                          style={[
                            styles.paginationButtonText,
                            routinePage === 1 && styles.paginationButtonTextDisabled,
                          ]}
                        >
                          Precedent
                        </Text>
                      </TouchableOpacity>

                      <View style={styles.paginationPages}>
                        {Array.from({ length: routineTotalPages }, (_, index) => {
                          const pageNumber = index + 1;
                          const selected = pageNumber === routinePage;

                          return (
                            <TouchableOpacity
                              key={pageNumber}
                              onPress={() => setRoutinePage(pageNumber)}
                              style={[styles.pageChip, selected && styles.pageChipActive]}
                              activeOpacity={0.85}
                            >
                              <Text
                                style={[
                                  styles.pageChipText,
                                  selected && styles.pageChipTextActive,
                                ]}
                              >
                                {pageNumber}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>

                      <TouchableOpacity
                        onPress={() =>
                          setRoutinePage((page) => Math.min(routineTotalPages, page + 1))
                        }
                        style={[
                          styles.paginationButton,
                          routinePage === routineTotalPages && styles.paginationButtonDisabled,
                        ]}
                        activeOpacity={0.85}
                        disabled={routinePage === routineTotalPages}
                      >
                        <Text
                          style={[
                            styles.paginationButtonText,
                            routinePage === routineTotalPages &&
                              styles.paginationButtonTextDisabled,
                          ]}
                        >
                          Suivant
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}
                </>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Activite recente</Text>
              {recentExecutions.length === 0 ? (
                <Text style={styles.emptyText}>Aucune activite</Text>
              ) : (
                recentExecutions.map((execution) => {
                  const routine = getRoutine(execution.routineId);
                  const date = new Date(execution.completedAt!);
                  const dateLabel = date.toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                  });

                  return (
                    <View key={execution.id} style={styles.activityRow}>
                      <OpenMoji emoji={routine?.icon ?? '📋'} size={24} />
                      <View style={styles.activityInfo}>
                        <Text style={styles.activityName}>
                          {routine?.name ?? 'Routine supprimee'}
                        </Text>
                        <Text style={styles.activityDate}>{dateLabel}</Text>
                      </View>
                      <StarCounter count={execution.earnedStars} size="sm" />
                    </View>
                  );
                })
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  headerSpacer: { width: 56 },
  title: { fontSize: FONT_SIZE.xl, fontWeight: '800', color: COLORS.text },
  childSelector: { marginBottom: SPACING.lg },
  childRow: { flexDirection: 'row', gap: SPACING.sm },
  childTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
    borderWidth: 2,
    borderColor: COLORS.surfaceSecondary,
    backgroundColor: COLORS.surface,
  },
  childTabText: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary },
  childTabTextActive: { color: COLORS.text, fontWeight: '700' },
  overviewRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: SPACING.lg },
  statValue: { fontSize: FONT_SIZE.xxl, fontWeight: '900', color: COLORS.text },
  statLabel: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary, marginTop: SPACING.xs },
  section: { marginTop: SPACING.lg },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  routineSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  paginationSummary: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  badgeMini: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    width: 80,
    ...SHADOWS.sm,
  },
  badgeLocked: { opacity: 0.4 },
  badgeName: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.text,
    textAlign: 'center',
    marginTop: 2,
  },
  badgeLockedText: { color: COLORS.textLight },
  routineStatCard: { marginBottom: SPACING.sm },
  routineStatRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  routineStatInfo: { flex: 1 },
  routineStatName: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.text },
  routineStatSub: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, marginTop: 2 },
  paginationRow: {
    marginTop: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
    flexWrap: 'wrap',
  },
  paginationButton: {
    minWidth: 108,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.surfaceSecondary,
  },
  paginationButtonDisabled: {
    opacity: 0.45,
  },
  paginationButtonText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
    color: COLORS.text,
  },
  paginationButtonTextDisabled: {
    color: COLORS.textLight,
  },
  paginationPages: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    flexWrap: 'wrap',
    justifyContent: 'center',
    flex: 1,
  },
  pageChip: {
    minWidth: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.surfaceSecondary,
    paddingHorizontal: SPACING.sm,
  },
  pageChipActive: {
    backgroundColor: `${COLORS.secondary}18`,
    borderColor: COLORS.secondary,
  },
  pageChipText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },
  pageChipTextActive: {
    color: COLORS.secondaryDark,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceSecondary,
  },
  activityInfo: { flex: 1 },
  activityName: { fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.text },
  activityDate: { fontSize: FONT_SIZE.xs, color: COLORS.textLight },
  empty: { alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.lg },
  emptyIcon: { fontSize: 40 },
  emptyText: { fontSize: FONT_SIZE.md, color: COLORS.textSecondary, textAlign: 'center' },
});
