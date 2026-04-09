import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { CheckCircle, Star } from 'phosphor-react-native';
import { useChildrenStore } from '../../src/stores/childrenStore';
import { useRewardStore } from '../../src/stores/rewardStore';
import { useRealRewardStore } from '../../src/stores/realRewardStore';
import { Avatar } from '../../src/components/ui/Avatar';
import { Button } from '../../src/components/ui/Button';
import { BackButton } from '../../src/components/ui/BackButton';
import { Card } from '../../src/components/ui/Card';
import { COLORS, SPACING, FONT_SIZE, RADIUS, SHADOWS } from '../../src/constants/theme';
import { backOrReplace } from '../../src/utils/navigation';
import { getGridItemWidth, getResponsiveColumns } from '../../src/utils/responsive';

function getClaimedChildIds(reward: {
  childId: string;
  isClaimed: boolean;
  claimedChildIds?: string[];
}) {
  if (reward.claimedChildIds?.length) {
    return reward.claimedChildIds;
  }

  if (reward.isClaimed && reward.childId && reward.childId !== 'all') {
    return [reward.childId];
  }

  return [];
}

export default function ParentRewardsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { children } = useChildrenStore();
  const { getRewards } = useRewardStore();
  const {
    getRewards: getRealRewards,
    addRealReward,
    removeRealReward,
    claimReward,
  } = useRealRewardStore();

  const [showForm, setShowForm] = useState(false);
  const [description, setDescription] = useState('');
  const [requiredStars, setRequiredStars] = useState('10');

  const childSummaries = useMemo(
    () =>
      children.map((child) => ({
        child,
        totalStars: getRewards(child.id).totalStars,
      })),
    [children, getRewards],
  );

  const realRewards = useMemo(
    () =>
      [...getRealRewards()].sort((a, b) => {
        if (a.createdAt > b.createdAt) return -1;
        if (a.createdAt < b.createdAt) return 1;
        return 0;
      }),
    [getRealRewards],
  );
  const contentWidth = Math.min(width - SPACING.lg * 2, 1240);
  const summaryColumns = getResponsiveColumns(width, { phone: 1, tablet: 2, desktop: 3, wide: 5 });
  const summaryCardWidth = getGridItemWidth(contentWidth - SPACING.md * 2, summaryColumns, SPACING.md);
  const rewardColumns = getResponsiveColumns(width, { phone: 1, tablet: 2, desktop: 4, wide: 5 });
  const rewardChildCardWidth = getGridItemWidth(contentWidth - SPACING.md * 2, rewardColumns, SPACING.sm);

  const handleAdd = () => {
    if (!description.trim()) return;
    const stars = parseInt(requiredStars, 10);
    if (!stars || stars < 1) return;

    addRealReward(description, stars);
    setDescription('');
    setRequiredStars('10');
    setShowForm(false);
  };

  const handleDelete = (id: string, desc: string) => {
    Alert.alert('Supprimer', `Supprimer "${desc}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => removeRealReward(id) },
    ]);
  };

  const handleClaim = (rewardId: string, rewardDescription: string, childName: string, childId: string) => {
    Alert.alert(
      'Recompense offerte ?',
      `Confirmer que "${rewardDescription}" a ete donnee a ${childName} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Confirmer', onPress: () => claimReward(rewardId, childId) },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={[styles.scroll, styles.scrollCentered]}>
        <View style={[styles.content, { width: contentWidth, maxWidth: '100%' }]}>
          <BackButton style={styles.backButton} onPress={() => backOrReplace(router, '/parent')} />

        <Text style={styles.title}>Recompenses reelles</Text>
        <Text style={styles.subtitle}>
          Motivez votre enfant avec des recompenses concretes !
        </Text>

        {children.length > 0 ? (
          <Card style={styles.childrenPanel}>
            <View style={styles.childrenWrap}>
              {childSummaries.map(({ child, totalStars }) => (
                <View key={child.id} style={[styles.childSummaryCard, { width: summaryCardWidth }]}>
                  <Avatar
                    emoji={child.avatar}
                    color={child.color}
                    size={52}
                    avatarConfig={child.avatarConfig}
                  />
                  <View style={styles.childSummaryText}>
                    <Text style={styles.childSummaryName}>{child.name}</Text>
                    <View style={styles.childStarsRow}>
                      <Star size={16} weight="fill" color={COLORS.star} />
                      <Text style={styles.childSummaryStars}>{totalStars}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </Card>
        ) : null}

        <Text style={styles.sectionTitle}>
          Recompenses en cours ({realRewards.length})
        </Text>

        {realRewards.length === 0 && !showForm ? (
          <Card>
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🎁</Text>
              <Text style={styles.emptyText}>Aucune recompense configuree</Text>
            </View>
          </Card>
        ) : (
          realRewards.map((reward) => {
            const claimedChildIds = getClaimedChildIds(reward);

            return (
              <Card key={reward.id} style={styles.rewardCard}>
                <View style={styles.rewardHeader}>
                  <Text style={styles.rewardDesc}>{reward.description}</Text>
                  <TouchableOpacity onPress={() => handleDelete(reward.id, reward.description)}>
                    <Text style={styles.deleteBtn}>✕</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.rewardChildrenList}>
                  {childSummaries.map(({ child, totalStars }) => {
                    const progress = Math.min(1, totalStars / reward.requiredStars);
                    const isClaimed = claimedChildIds.includes(child.id);
                    const canClaim = totalStars >= reward.requiredStars && !isClaimed;

                    return (
                      <View key={`${reward.id}-${child.id}`} style={[styles.rewardChildCard, { width: rewardChildCardWidth }]}>
                        <View style={styles.rewardChildIdentity}>
                          <Avatar
                            emoji={child.avatar}
                            color={child.color}
                            size={30}
                            avatarConfig={child.avatarConfig}
                          />
                          <Text style={styles.rewardChildName}>{child.name}</Text>
                        </View>

                        <View style={styles.progressRow}>
                          <View style={styles.rewardChildInfo}>
                            <View style={styles.progressTrack}>
                              <View
                                style={[
                                  styles.progressFill,
                                  {
                                    width: `${progress * 100}%`,
                                    backgroundColor: isClaimed ? COLORS.success : COLORS.secondary,
                                  },
                                ]}
                              />
                            </View>
                          </View>

                          <Text style={styles.progressText}>
                            ⭐ {totalStars}/{reward.requiredStars}
                          </Text>
                        </View>

                        <View style={styles.rewardChildAction}>
                          {isClaimed ? (
                            <View style={styles.claimedBadge}>
                              <CheckCircle size={14} weight="fill" color={COLORS.success} />
                              <Text style={styles.claimedBadgeText}>Offerte</Text>
                            </View>
                          ) : canClaim ? (
                            <Button
                              title="Offrir"
                              onPress={() => handleClaim(reward.id, reward.description, child.name, child.id)}
                              variant="primary"
                              size="sm"
                              color={COLORS.success}
                              style={styles.offerButton}
                            />
                          ) : (
                            <View style={styles.lockedBadge}>
                              <Text style={styles.lockedBadgeText}>En cours</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>
              </Card>
            );
          })
        )}

        {showForm ? (
          <Card style={styles.formCard}>
            <Text style={styles.formTitle}>Nouvelle recompense</Text>

            <Text style={styles.formLabel}>Description</Text>
            <TextInput
              style={styles.input}
              value={description}
              onChangeText={setDescription}
              placeholder="Ex: Sortie au parc, glace, film..."
              placeholderTextColor={COLORS.textLight}
              maxLength={60}
              autoFocus
            />

            <Text style={styles.formLabel}>Etoiles necessaires</Text>
            <TextInput
              style={[styles.input, styles.inputSmall]}
              value={requiredStars}
              onChangeText={(text) => setRequiredStars(text.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              maxLength={4}
            />

            <View style={styles.formActions}>
              <Button title="Annuler" onPress={() => setShowForm(false)} variant="ghost" size="sm" />
              <Button
                title="Ajouter"
                onPress={handleAdd}
                variant="primary"
                size="sm"
                disabled={!description.trim() || !requiredStars}
              />
            </View>
          </Card>
        ) : (
          <Button
            title="+ Ajouter une recompense"
            onPress={() => setShowForm(true)}
            variant="outline"
            size="md"
            color={COLORS.secondary}
            style={styles.addButton}
          />
        )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  scrollCentered: { alignItems: 'center' },
  content: { width: '100%' },
  backButton: { marginBottom: SPACING.lg },
  title: { fontSize: FONT_SIZE.xl, fontWeight: '800', color: COLORS.text },
  subtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  childrenPanel: {
    marginBottom: SPACING.xl,
    padding: SPACING.md,
  },
  childrenWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    rowGap: SPACING.md,
    columnGap: SPACING.md,
  },
  childSummaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    ...SHADOWS.sm,
  },
  childSummaryText: {
    flex: 1,
    gap: 4,
  },
  childSummaryName: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    color: COLORS.text,
  },
  childStarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  childSummaryStars: {
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
    color: COLORS.text,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  empty: { alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.lg },
  emptyIcon: { fontSize: 40 },
  emptyText: { fontSize: FONT_SIZE.md, color: COLORS.textSecondary, textAlign: 'center' },
  rewardCard: { marginBottom: SPACING.md },
  rewardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  rewardDesc: {
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
    color: COLORS.text,
    flex: 1,
  },
  deleteBtn: { fontSize: 18, color: COLORS.error, padding: 4 },
  rewardChildrenList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  rewardChildCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    gap: SPACING.xs,
  },
  rewardChildIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  rewardChildName: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.text,
    flexShrink: 1,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    width: '100%',
  },
  rewardChildInfo: {
    flex: 1,
  },
  progressTrack: {
    flex: 1,
    height: 7,
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: 7,
    borderRadius: RADIUS.full,
  },
  progressText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.textSecondary,
    minWidth: 52,
    textAlign: 'right',
  },
  rewardChildAction: {
    width: '100%',
  },
  claimedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.success + '18',
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.sm,
    width: '100%',
    justifyContent: 'center',
  },
  claimedBadgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
    color: COLORS.success,
  },
  lockedBadge: {
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.sm,
    width: '100%',
    alignItems: 'center',
  },
  lockedBadgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  offerButton: {
    width: '100%',
    paddingHorizontal: SPACING.xs,
    minHeight: 38,
  },
  formCard: { marginTop: SPACING.md },
  formTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  formLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    marginTop: SPACING.md,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.surfaceSecondary,
  },
  inputSmall: { width: 100 },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
  },
  addButton: { marginTop: SPACING.md },
});
