import React, { useState } from 'react';
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
import { BadgeCard } from '../../src/components/rewards/BadgeCard';
import { StarCounter } from '../../src/components/rewards/Counters';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { BADGES } from '../../src/constants/badges';
import { COLORS, SPACING, FONT_SIZE, RADIUS, SHADOWS } from '../../src/constants/theme';
import { OpenMoji } from '../../src/components/ui/OpenMoji';

export default function StatsScreen() {
  const router = useRouter();
  const { children } = useChildrenStore();
  const { executions, getRoutinesForChild, getRoutine } = useRoutineStore();
  const { getRewards, getUnlockedBadges } = useRewardStore();

  const [selectedChildId, setSelectedChildId] = useState<string | null>(
    children.length > 0 ? children[0].id : null
  );

  const selectedChild = children.find((c) => c.id === selectedChildId);
  const rewards = selectedChildId ? getRewards(selectedChildId) : null;
  const routines = selectedChildId ? getRoutinesForChild(selectedChildId) : [];
  const childExecutions = selectedChildId
    ? executions.filter((e) => e.childId === selectedChildId && e.completedAt)
    : [];
  const unlockedBadges = selectedChildId ? getUnlockedBadges(selectedChildId) : [];

  // Per-routine stats
  const routineStats = routines.map((routine) => {
    const routineExecs = childExecutions.filter((e) => e.routineId === routine.id);
    const totalStars = routineExecs.reduce((sum, e) => sum + e.earnedStars, 0);
    return {
      routine,
      completions: routineExecs.length,
      totalStars,
    };
  });

  // Recent executions (last 10)
  const recentExecs = [...childExecutions]
    .sort((a, b) => (b.completedAt! > a.completedAt! ? 1 : -1))
    .slice(0, 10);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>← Retour</Text>
          </TouchableOpacity>
          <Text style={styles.title}>📊 Statistiques</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Child selector */}
        {children.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.childSelector}>
            <View style={styles.childRow}>
              {children.map((child) => (
                <TouchableOpacity
                  key={child.id}
                  style={[
                    styles.childTab,
                    selectedChildId === child.id && { backgroundColor: child.color + '30', borderColor: child.color },
                  ]}
                  onPress={() => setSelectedChildId(child.id)}
                >
                  <Avatar emoji={child.avatar} color={child.color} size={32} avatarConfig={child.avatarConfig} />
                  <Text style={[
                    styles.childTabText,
                    selectedChildId === child.id && { color: COLORS.text, fontWeight: '700' },
                  ]}>
                    {child.name}
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
              <Text style={styles.emptyText}>Ajoutez un enfant pour voir ses statistiques</Text>
            </View>
          </Card>
        ) : (
          <>
            {/* Overview cards */}
            <View style={styles.overviewRow}>
              <Card style={styles.statCard}>
                <Text style={styles.statValue}>{rewards.totalStars}</Text>
                <Text style={styles.statLabel}>⭐ Étoiles</Text>
              </Card>
              <Card style={styles.statCard}>
                <Text style={styles.statValue}>{rewards.completedRoutines}</Text>
                <Text style={styles.statLabel}>✅ Routines</Text>
              </Card>
            </View>
            <View style={styles.overviewRow}>
              <Card style={styles.statCard}>
                <Text style={styles.statValue}>{rewards.currentStreak}</Text>
                <Text style={styles.statLabel}>🔥 Série actuelle</Text>
              </Card>
              <Card style={styles.statCard}>
                <Text style={styles.statValue}>{rewards.longestStreak}</Text>
                <Text style={styles.statLabel}>🏆 Meilleure série</Text>
              </Card>
            </View>

            {/* Badges progress */}
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
                    <View key={badge.id} style={[styles.badgeMini, !unlocked && styles.badgeLocked]}>
                      <OpenMoji emoji={badge.icon} size={28} />
                      <Text style={[styles.badgeName, !unlocked && styles.badgeLockedText]}>
                        {badge.name}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Per-routine stats */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Par routine</Text>
              {routineStats.length === 0 ? (
                <Text style={styles.emptyText}>Aucune routine créée</Text>
              ) : (
                routineStats.map(({ routine, completions, totalStars }) => (
                  <Card key={routine.id} style={styles.routineStatCard}>
                    <View style={styles.routineStatRow}>
                      <OpenMoji emoji={routine.icon} size={32} />
                      <View style={styles.routineStatInfo}>
                        <Text style={styles.routineStatName}>{routine.name}</Text>
                        <Text style={styles.routineStatSub}>
                          {completions} exécution{completions !== 1 ? 's' : ''} · {totalStars} ⭐
                        </Text>
                      </View>
                    </View>
                  </Card>
                ))
              )}
            </View>

            {/* Recent activity */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Activité récente</Text>
              {recentExecs.length === 0 ? (
                <Text style={styles.emptyText}>Aucune activité</Text>
              ) : (
                recentExecs.map((exec) => {
                  const routine = getRoutine(exec.routineId);
                  const date = new Date(exec.completedAt!);
                  const dateStr = date.toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                  });
                  return (
                    <View key={exec.id} style={styles.activityRow}>
                      <OpenMoji emoji={routine?.icon ?? '📋'} size={24} />
                      <View style={styles.activityInfo}>
                        <Text style={styles.activityName}>{routine?.name ?? 'Routine supprimée'}</Text>
                        <Text style={styles.activityDate}>{dateStr}</Text>
                      </View>
                      <StarCounter count={exec.earnedStars} size="sm" />
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
  backText: { fontSize: FONT_SIZE.md, color: COLORS.textSecondary, fontWeight: '600' },
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
  badgeIcon: { fontSize: 24 },
  badgeName: { fontSize: FONT_SIZE.xs, color: COLORS.text, textAlign: 'center', marginTop: 2 },
  badgeLockedText: { color: COLORS.textLight },
  routineStatCard: { marginBottom: SPACING.sm },
  routineStatRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  routineIcon: { fontSize: 32 },
  routineStatInfo: { flex: 1 },
  routineStatName: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.text },
  routineStatSub: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, marginTop: 2 },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceSecondary,
  },
  activityIcon: { fontSize: 24 },
  activityInfo: { flex: 1 },
  activityName: { fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.text },
  activityDate: { fontSize: FONT_SIZE.xs, color: COLORS.textLight },
  empty: { alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.lg },
  emptyIcon: { fontSize: 40 },
  emptyText: { fontSize: FONT_SIZE.md, color: COLORS.textSecondary, textAlign: 'center' },
});
