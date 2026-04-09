import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { CheckCircle, Gift, Lock, Medal, Sparkle, Star, Trophy } from 'phosphor-react-native';
import { useAppStore } from '../../src/stores/appStore';
import { useChildrenStore } from '../../src/stores/childrenStore';
import { useRewardStore } from '../../src/stores/rewardStore';
import { useRealRewardStore } from '../../src/stores/realRewardStore';
import { Avatar } from '../../src/components/ui/Avatar';
import { BackButton } from '../../src/components/ui/BackButton';
import { Card } from '../../src/components/ui/Card';
import { BADGES } from '../../src/constants/badges';
import { COLORS, SPACING, FONT_SIZE, RADIUS, SHADOWS } from '../../src/constants/theme';
import { backOrReplace } from '../../src/utils/navigation';
import { getGridItemWidth, getResponsiveColumns } from '../../src/utils/responsive';

const BADGE_TABS: Array<{
  key: 'routines' | 'streak' | 'stars';
  label: string;
}> = [
  { key: 'routines', label: 'Routines' },
  { key: 'streak', label: 'Serie' },
  { key: 'stars', label: 'Etoiles' },
];

export default function ChildRewardsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { selectedChildId } = useAppStore();
  const { children, getChild } = useChildrenStore();
  const { getRewards } = useRewardStore();
  const { getRewardsForChild } = useRealRewardStore();
  const [showLockedBadges, setShowLockedBadges] = useState(false);
  const [showClaimedRewards, setShowClaimedRewards] = useState(false);
  const [selectedBadgeTab, setSelectedBadgeTab] = useState<'routines' | 'streak' | 'stars'>('routines');
  const [currentChildId, setCurrentChildId] = useState<string | null>(selectedChildId ?? children[0]?.id ?? null);

  const child = currentChildId ? getChild(currentChildId) : undefined;
  const contentWidth = Math.min(width - SPACING.lg * 2, 1120);
  const childColumns = getResponsiveColumns(width, { phone: 2, tablet: 3, desktop: 4, wide: 5 });
  const childCardWidth = getGridItemWidth(contentWidth, childColumns, SPACING.sm);
  const badgeColumns = getResponsiveColumns(width, { phone: 1, tablet: 2, desktop: 3, wide: 4 });
  const badgeCardWidth = getGridItemWidth(contentWidth, badgeColumns, SPACING.sm);
  const rewardColumns = getResponsiveColumns(width, { phone: 1, tablet: 2, desktop: 3, wide: 4 });
  const rewardCardWidth = getGridItemWidth(contentWidth, rewardColumns, SPACING.sm);

  if (!child) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.emptyState}>
          <BackButton onPress={() => backOrReplace(router, '/child')} />
          <Text style={styles.emptyTitle}>Aucun enfant disponible</Text>
        </View>
      </SafeAreaView>
    );
  }

  const rewards = getRewards(child.id);
  const realRewards = getRewardsForChild(child.id);
  const unlockedBadges = BADGES.filter((badge) => rewards.unlockedBadges.includes(badge.id));
  const lockedBadges = BADGES.filter((badge) => !rewards.unlockedBadges.includes(badge.id));
  const badgesInCategory = BADGES.filter((badge) => badge.requirementType === selectedBadgeTab);
  const unlockedBadgesInCategory = badgesInCategory.filter((badge) => rewards.unlockedBadges.includes(badge.id));
  const visibleBadges = (showLockedBadges ? badgesInCategory : unlockedBadgesInCategory);

  const availableRewards = realRewards.filter((reward) => !reward.isClaimed && rewards.totalStars >= reward.requiredStars);
  const progressRewards = realRewards.filter((reward) => !reward.isClaimed && rewards.totalStars < reward.requiredStars);
  const claimedRewards = realRewards.filter((reward) => reward.isClaimed);
  const visibleRewards = showClaimedRewards
    ? [...availableRewards, ...progressRewards, ...claimedRewards]
    : [...availableRewards, ...progressRewards];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={[styles.scroll, styles.scrollCentered]} showsVerticalScrollIndicator={false}>
        <View style={[styles.content, { width: contentWidth, maxWidth: '100%' }]}>
          <BackButton onPress={() => backOrReplace(router, '/child')} style={styles.back} />

          <View style={styles.hero}>
            <Text style={styles.title}>Badges et recompenses</Text>
            <Text style={styles.subtitle}>Choisis un enfant pour voir ses progres et ses cadeaux.</Text>
          </View>

          <View style={styles.childPickerRow}>
            {children.map((item) => {
              const selected = item.id === child.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => setCurrentChildId(item.id)}
                  style={[
                    styles.childPickerCard,
                    { width: childCardWidth },
                    selected && { borderColor: item.color, backgroundColor: `${item.color}20` },
                  ]}
                  activeOpacity={0.8}
                >
                  <Avatar
                    emoji={item.avatar}
                    color={item.color}
                    size={50}
                    avatarConfig={item.avatarConfig}
                  />
                  <Text style={styles.childPickerName} numberOfLines={1}>{item.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Card style={styles.statsCard}>
            <View style={styles.statsRow}>
              <StatItem icon={<Star size={20} weight="fill" color={COLORS.star} />} value={rewards.totalStars.toString()} label="Etoiles" />
              <StatItem icon={<Sparkle size={20} weight="fill" color="#FF6B6B" />} value={rewards.currentStreak.toString()} label="Serie" />
              <StatItem icon={<Trophy size={20} weight="fill" color={COLORS.secondary} />} value={rewards.completedRoutines.toString()} label="Routines" />
              <StatItem icon={<Medal size={20} weight="fill" color="#F59E0B" />} value={unlockedBadges.length.toString()} label="Badges" />
            </View>
          </Card>

          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Badges</Text>
              <Text style={styles.sectionSubtitle}>
                {unlockedBadgesInCategory.length} obtenu{unlockedBadgesInCategory.length > 1 ? 's' : ''} dans {BADGE_TABS.find((tab) => tab.key === selectedBadgeTab)?.label.toLowerCase()}
              </Text>
            </View>
            <ToggleChip
              label={showLockedBadges ? 'Masquer non obtenus' : 'Afficher non obtenus'}
              active={showLockedBadges}
              onPress={() => setShowLockedBadges((prev) => !prev)}
            />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.badgeTabsRow}
          >
            {BADGE_TABS.map((tab) => {
              const selected = tab.key === selectedBadgeTab;
              const count = BADGES.filter((badge) => badge.requirementType === tab.key && rewards.unlockedBadges.includes(badge.id)).length;

              return (
                <TouchableOpacity
                  key={tab.key}
                  onPress={() => setSelectedBadgeTab(tab.key)}
                  style={[styles.badgeTab, selected && styles.badgeTabActive]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.badgeTabText, selected && styles.badgeTabTextActive]}>
                    {tab.label}
                  </Text>
                  <View style={[styles.badgeTabCount, selected && styles.badgeTabCountActive]}>
                    <Text style={[styles.badgeTabCountText, selected && styles.badgeTabCountTextActive]}>
                      {count}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.badgesGrid}>
            {visibleBadges.map((badge) => {
              const unlocked = rewards.unlockedBadges.includes(badge.id);

              return (
                <Card
                  key={badge.id}
                  style={[
                    styles.badgeCard,
                    { width: badgeCardWidth },
                    !unlocked && styles.badgeCardLocked,
                  ]}
                >
                  <View style={styles.badgeCardTop}>
                    <Text style={styles.badgeIcon}>{badge.icon}</Text>
                    {!unlocked ? <Lock size={16} weight="fill" color={COLORS.textLight} /> : null}
                  </View>
                  <Text style={styles.badgeName}>{badge.name}</Text>
                  <Text style={styles.badgeDescription}>{badge.description}</Text>
                  <Text style={styles.badgeProgress}>
                    {unlocked
                      ? 'Badge obtenu'
                      : `${getBadgeProgressValue(badge.requirementType, rewards)}/${badge.requirement}`}
                  </Text>
                </Card>
              );
            })}
          </View>
          {visibleBadges.length === 0 ? (
            <Card style={styles.emptyBadgeCard}>
              <Text style={styles.emptyBlockText}>Aucun badge affiche dans cette categorie pour le moment.</Text>
            </Card>
          ) : null}

          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Recompenses</Text>
              <Text style={styles.sectionSubtitle}>
                {availableRewards.length} disponible{availableRewards.length > 1 ? 's' : ''} · {progressRewards.length} en cours
              </Text>
            </View>
            <ToggleChip
              label={showClaimedRewards ? 'Masquer offertes' : 'Afficher offertes'}
              active={showClaimedRewards}
              onPress={() => setShowClaimedRewards((prev) => !prev)}
            />
          </View>

          {visibleRewards.length > 0 ? (
            <View style={styles.rewardsGrid}>
              {visibleRewards.map((reward) => {
                const isClaimed = reward.isClaimed;
                const isAvailable = !isClaimed && rewards.totalStars >= reward.requiredStars;
                const progress = Math.min(1, rewards.totalStars / reward.requiredStars);

                return (
                  <Card key={reward.id} style={[styles.rewardCard, { width: rewardCardWidth }]}>
                    <View style={styles.rewardCardHeader}>
                      <Gift size={18} weight="fill" color={isClaimed ? COLORS.success : COLORS.secondary} />
                      <Text style={styles.rewardStatus}>
                        {isClaimed ? 'Offerte' : isAvailable ? 'Disponible' : 'En cours'}
                      </Text>
                    </View>
                    <Text style={styles.rewardName}>{reward.description}</Text>
                    <View style={styles.rewardStarsRow}>
                      <Star size={14} weight="fill" color={COLORS.star} />
                      <Text style={styles.rewardStarsText}>
                        {rewards.totalStars}/{reward.requiredStars}
                      </Text>
                    </View>
                    <View style={styles.progressTrack}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${Math.max(8, Math.round(progress * 100))}%`,
                            backgroundColor: isClaimed ? COLORS.success : COLORS.secondary,
                          },
                        ]}
                      />
                    </View>
                    {isClaimed ? (
                      <View style={styles.rewardFootBadge}>
                        <CheckCircle size={14} weight="fill" color={COLORS.success} />
                        <Text style={styles.rewardFootBadgeText}>Deja offerte</Text>
                      </View>
                    ) : isAvailable ? (
                      <View style={[styles.rewardFootBadge, styles.rewardFootBadgeAvailable]}>
                        <Gift size={14} weight="fill" color={COLORS.secondaryDark} />
                        <Text style={[styles.rewardFootBadgeText, styles.rewardFootBadgeTextAvailable]}>Tu peux la demander</Text>
                      </View>
                    ) : (
                      <Text style={styles.rewardHint}>Continue tes routines pour la debloquer.</Text>
                    )}
                  </Card>
                );
              })}
            </View>
          ) : (
            <Card>
              <View style={styles.emptyBlock}>
                <Text style={styles.emptyBlockText}>Aucune recompense a afficher pour le moment.</Text>
              </View>
            </Card>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatItem({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <View style={styles.statItem}>
      {icon}
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ToggleChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.toggleChip, active && styles.toggleChipActive]}
      activeOpacity={0.8}
    >
      <Text style={[styles.toggleChipText, active && styles.toggleChipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function getBadgeProgressValue(
  requirementType: 'routines' | 'streak' | 'stars',
  rewards: {
    completedRoutines: number;
    currentStreak: number;
    totalStars: number;
  },
) {
  if (requirementType === 'routines') return rewards.completedRoutines;
  if (requirementType === 'streak') return rewards.currentStreak;
  return rewards.totalStars;
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
  scrollCentered: {
    alignItems: 'center',
  },
  content: {
    width: '100%',
  },
  back: {
    marginBottom: SPACING.lg,
  },
  hero: {
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZE.xl + 2,
    fontWeight: '900',
    color: COLORS.text,
  },
  subtitle: {
    marginTop: SPACING.xs,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  childPickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  childPickerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderWidth: 1.5,
    borderColor: COLORS.surfaceSecondary,
    ...SHADOWS.sm,
  },
  childPickerName: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
    color: COLORS.text,
  },
  statsCard: {
    marginBottom: SPACING.lg,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  statItem: {
    flexGrow: 1,
    flexBasis: 120,
    alignItems: 'center',
    gap: 4,
    paddingVertical: SPACING.sm,
  },
  statValue: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '900',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    color: COLORS.text,
  },
  sectionSubtitle: {
    marginTop: 2,
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  toggleChip: {
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.surfaceSecondary,
  },
  toggleChipActive: {
    backgroundColor: `${COLORS.secondary}20`,
    borderColor: COLORS.secondary,
  },
  toggleChipText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  toggleChipTextActive: {
    color: COLORS.secondaryDark,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  badgeTabsRow: {
    gap: SPACING.sm,
    paddingBottom: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  badgeTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.xs + 4,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.surfaceSecondary,
  },
  badgeTabActive: {
    backgroundColor: `${COLORS.secondary}20`,
    borderColor: COLORS.secondary,
  },
  badgeTabText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },
  badgeTabTextActive: {
    color: COLORS.secondaryDark,
  },
  badgeTabCount: {
    minWidth: 24,
    borderRadius: RADIUS.full,
    paddingVertical: 2,
    paddingHorizontal: 6,
    backgroundColor: COLORS.surfaceSecondary,
    alignItems: 'center',
  },
  badgeTabCountActive: {
    backgroundColor: COLORS.secondary,
  },
  badgeTabCountText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },
  badgeTabCountTextActive: {
    color: '#FFF',
  },
  badgeCard: {
    gap: SPACING.xs,
    minHeight: 170,
  },
  emptyBadgeCard: {
    marginBottom: SPACING.lg,
  },
  badgeCardLocked: {
    opacity: 0.55,
  },
  badgeCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeIcon: {
    fontSize: 30,
  },
  badgeName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
    color: COLORS.text,
  },
  badgeDescription: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  badgeProgress: {
    marginTop: 'auto',
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.secondaryDark,
  },
  rewardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  rewardCard: {
    gap: SPACING.sm,
    minHeight: 160,
  },
  rewardCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  rewardStatus: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },
  rewardName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
    color: COLORS.text,
  },
  rewardStarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rewardStarsText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  progressTrack: {
    height: 9,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceSecondary,
    overflow: 'hidden',
  },
  progressFill: {
    height: 9,
    borderRadius: RADIUS.full,
  },
  rewardFootBadge: {
    marginTop: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: RADIUS.full,
    backgroundColor: `${COLORS.success}18`,
    paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.md,
  },
  rewardFootBadgeAvailable: {
    backgroundColor: `${COLORS.secondary}18`,
  },
  rewardFootBadgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
    color: COLORS.success,
  },
  rewardFootBadgeTextAvailable: {
    color: COLORS.secondaryDark,
  },
  rewardHint: {
    marginTop: 'auto',
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  emptyBlock: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  emptyBlockText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    padding: SPACING.lg,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    color: COLORS.text,
  },
});
