import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../src/stores/appStore';
import { useChildrenStore } from '../../src/stores/childrenStore';
import { useRewardStore } from '../../src/stores/rewardStore';
import { useRealRewardStore } from '../../src/stores/realRewardStore';
import { StarCounter, StreakCounter } from '../../src/components/rewards/Counters';
import { BadgeCard } from '../../src/components/rewards/BadgeCard';
import { Card } from '../../src/components/ui/Card';
import { Avatar } from '../../src/components/ui/Avatar';
import { BADGES } from '../../src/constants/badges';
import { ArrowLeft, Trophy, Star, Gift, CheckCircle } from 'phosphor-react-native';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '../../src/constants/theme';

export default function RewardsScreen() {
  const router = useRouter();
  const { selectedChildId } = useAppStore();
  const { getChild } = useChildrenStore();
  const { getRewards, getUnlockedBadges, getLockedBadges } = useRewardStore();

  const child = selectedChildId ? getChild(selectedChildId) : undefined;
  if (!child) {
    router.replace('/child');
    return null;
  }

  const rewards = getRewards(child.id);
  const unlocked = getUnlockedBadges(child.id);
  const locked = getLockedBadges(child.id);
  const realRewards = useRealRewardStore().getRewardsForChild(child.id);
  const pendingRewards = realRewards.filter((r) => !r.isClaimed);
  const claimedRewards = realRewards.filter((r) => r.isClaimed);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: SPACING.lg }}>
          <ArrowLeft size={20} weight="bold" color={COLORS.secondary} />
          <Text style={styles.back}>Retour</Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <Avatar emoji={child.avatar} color={child.color} size={64} />
          <Text style={styles.title}>{child.name}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <View style={styles.statContent}>
              <StarCounter count={rewards.totalStars} size="lg" />
              <Text style={styles.statLabel}>Étoiles</Text>
            </View>
          </Card>
          <Card style={styles.statCard}>
            <View style={styles.statContent}>
              <StreakCounter count={rewards.currentStreak} />
              <Text style={styles.statLabel}>Série actuelle</Text>
            </View>
          </Card>
          <Card style={styles.statCard}>
            <View style={styles.statContent}>
              <Text style={styles.statNumber}>{rewards.completedRoutines}</Text>
              <Text style={styles.statLabel}>Routines{'\n'}complétées</Text>
            </View>
          </Card>
        </View>

        {/* Record */}
        {rewards.longestStreak > 0 && (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: SPACING.xl }}>
            <Trophy size={18} weight="fill" color={COLORS.star} />
            <Text style={styles.record}>
              Record de série : {rewards.longestStreak} jour{rewards.longestStreak > 1 ? 's' : ''}
            </Text>
          </View>
        )}

        {/* Badges */}
        <Text style={styles.sectionTitle}>
          Mes badges ({unlocked.length}/{BADGES.length})
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.badgesRow}>
            {unlocked.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} unlocked />
            ))}
            {locked.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} unlocked={false} />
            ))}
          </View>
        </ScrollView>

        {unlocked.length === 0 && (
          <Text style={styles.encouragement}>
            Complete des routines pour gagner des badges !
          </Text>
        )}

        {/* Real Rewards */}
        {realRewards.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: SPACING.xl }]}>
              Mes récompenses
            </Text>
            {pendingRewards.map((rr) => {
              const progress = Math.min(rewards.totalStars / rr.requiredStars, 1);
              return (
                <View key={rr.id} style={styles.rewardRow}>
                  <View style={styles.rewardInfo}>
                    <Text style={styles.rewardDesc}>{rr.description}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                      <Star size={14} weight="fill" color={COLORS.star} />
                      <Text style={styles.rewardStars}>
                        {rewards.totalStars} / {rr.requiredStars}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.rewardBarBg}>
                    <View style={[styles.rewardBarFill, { width: `${Math.round(progress * 100)}%` }]} />
                  </View>
                </View>
              );
            })}
            {claimedRewards.map((rr) => (
              <View key={rr.id} style={[styles.rewardRow, { opacity: 0.6 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <CheckCircle size={18} weight="fill" color={COLORS.success} />
                  <Text style={styles.rewardDesc}>{rr.description}</Text>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  back: { fontSize: FONT_SIZE.md, color: COLORS.secondary, fontWeight: '600', marginBottom: SPACING.lg },
  header: { alignItems: 'center', marginBottom: SPACING.xl },
  title: { fontSize: FONT_SIZE.xl, fontWeight: '800', color: COLORS.text, marginTop: SPACING.sm },
  statsRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg },
  statCard: { flex: 1 },
  statContent: { alignItems: 'center', gap: SPACING.xs },
  statLabel: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary, textAlign: 'center' },
  statNumber: { fontSize: FONT_SIZE.xxl, fontWeight: '900', color: COLORS.text },
  record: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  badgesRow: { flexDirection: 'row', gap: SPACING.md },
  encouragement: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.lg,
  },
  rewardRow: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  rewardInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  rewardDesc: { fontSize: FONT_SIZE.md, fontWeight: '600', color: COLORS.text, flex: 1 },
  rewardStars: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary },
  rewardBarBg: {
    height: 8,
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 4,
    overflow: 'hidden',
  },
  rewardBarFill: {
    height: 8,
    backgroundColor: COLORS.secondary,
    borderRadius: 4,
  },
});
