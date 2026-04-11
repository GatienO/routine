import React, { useEffect, useMemo, useState } from 'react';
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
import { CheckCircle, Gift, PlusCircle, Star, XCircle } from 'phosphor-react-native';
import { useChildrenStore } from '../../src/stores/childrenStore';
import { useRewardStore } from '../../src/stores/rewardStore';
import { useRealRewardStore } from '../../src/stores/realRewardStore';
import { Avatar } from '../../src/components/ui/Avatar';
import { Button } from '../../src/components/ui/Button';
import { BackButton } from '../../src/components/ui/BackButton';
import { Card } from '../../src/components/ui/Card';
import { COLORS, SPACING, FONT_SIZE, RADIUS, SHADOWS } from '../../src/constants/theme';
import { Child, RealRewardCooldownUnit } from '../../src/types';
import { backOrReplace } from '../../src/utils/navigation';
import { getGridItemWidth, getResponsiveColumns } from '../../src/utils/responsive';
import {
  formatRemainingCooldown,
  formatRewardCooldownLabel,
  getRewardAvailabilityForChild,
} from '../../src/utils/realRewardAvailability';

const COOLDOWN_OPTIONS: Array<{ value: RealRewardCooldownUnit; label: string }> = [
  { value: 'minute', label: 'Minute(s)' },
  { value: 'hour', label: 'Heure(s)' },
  { value: 'day', label: 'Jour(s)' },
  { value: 'week', label: 'Semaine(s)' },
];

export default function ParentRewardsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const children = useChildrenStore((state) => state.children);
  const rewardsState = useRewardStore((state) => state.rewards);
  const getRewards = useRewardStore((state) => state.getRewards);
  const spendStars = useRewardStore((state) => state.spendStars);
  const {
    realRewards: realRewardsState,
    addRealReward,
    removeRealReward,
    claimReward,
  } = useRealRewardStore();

  const [showForm, setShowForm] = useState(false);
  const [description, setDescription] = useState('');
  const [requiredStars, setRequiredStars] = useState('10');
  const [cooldownValue, setCooldownValue] = useState('1');
  const [cooldownUnit, setCooldownUnit] = useState<RealRewardCooldownUnit>('week');
  const [nowTick, setNowTick] = useState(Date.now());
  const [isConfirmingClaim, setIsConfirmingClaim] = useState(false);
  const [pendingClaim, setPendingClaim] = useState<{
    rewardId: string;
    rewardDescription: string;
    childId: string;
    childName: string;
    childAvatar: string;
    childColor: string;
    childAvatarConfig: Child['avatarConfig'];
    totalStars: number;
    requiredStars: number;
  } | null>(null);

  const childSummaries = useMemo(
    () =>
      children.map((child) => ({
        child,
        totalStars: getRewards(child.id).totalStars,
      })),
    [children, getRewards, rewardsState],
  );

  const realRewards = useMemo(
    () =>
      [...realRewardsState].sort((a, b) => {
        if (a.createdAt > b.createdAt) return -1;
        if (a.createdAt < b.createdAt) return 1;
        return 0;
      }),
    [realRewardsState],
  );
  const contentWidth = Math.min(width - SPACING.lg * 2, 1240);
  const summaryColumns = getResponsiveColumns(width, { phone: 1, tablet: 2, desktop: 3, wide: 5 });
  const summaryCardWidth = getGridItemWidth(contentWidth - SPACING.md * 2, summaryColumns, SPACING.md);
  const rewardColumns = getResponsiveColumns(width, { phone: 1, tablet: 2, desktop: 4, wide: 5 });
  const rewardChildCardWidth = getGridItemWidth(contentWidth - SPACING.md * 2, rewardColumns, SPACING.sm);

  useEffect(() => {
    const interval = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleAdd = () => {
    if (!description.trim()) return;
    const stars = parseInt(requiredStars, 10);
    const cooldown = parseInt(cooldownValue, 10);
    if (!stars || stars < 1) return;
    if (!cooldown || cooldown < 1) return;

    addRealReward(description, stars, cooldown, cooldownUnit);
    setDescription('');
    setRequiredStars('10');
    setCooldownValue('1');
    setCooldownUnit('week');
    setShowForm(false);
  };

  const handleDelete = (id: string, desc: string) => {
    Alert.alert('Supprimer', `Supprimer "${desc}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => removeRealReward(id) },
    ]);
  };

  const handleClaim = (
    rewardId: string,
    rewardDescription: string,
    childName: string,
    childId: string,
    childAvatar: string,
    childColor: string,
    childAvatarConfig: Child['avatarConfig'],
    totalStars: number,
    rewardRequiredStars: number,
  ) => {
    setPendingClaim({
      rewardId,
      rewardDescription,
      childId,
      childName,
      childAvatar,
      childColor,
      childAvatarConfig,
      totalStars,
      requiredStars: rewardRequiredStars,
    });
  };

  const handleConfirmClaim = () => {
    if (!pendingClaim || isConfirmingClaim) return;
    setIsConfirmingClaim(true);

    const reward = realRewardsState.find((entry) => entry.id === pendingClaim.rewardId);
    const availability = reward
      ? getRewardAvailabilityForChild(reward, pendingClaim.childId)
      : null;
    const isCoolingDown = availability?.isCoolingDown ?? false;

    if (isCoolingDown) {
      setPendingClaim(null);
      setIsConfirmingClaim(false);
      return;
    }

    const didSpend = spendStars(pendingClaim.childId, pendingClaim.requiredStars);
    if (!didSpend) {
      setPendingClaim(null);
      setIsConfirmingClaim(false);
      Alert.alert(
        'Etoiles insuffisantes',
        "Cet enfant n'a plus assez d'etoiles pour recevoir cette recompense.",
      );
      return;
    }

    claimReward(pendingClaim.rewardId, pendingClaim.childId);
    setPendingClaim(null);
    setIsConfirmingClaim(false);
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

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Recompenses en cours ({realRewards.length})
          </Text>
          <TouchableOpacity
            onPress={() => setShowForm((current) => !current)}
            style={styles.createRewardButton}
            activeOpacity={0.88}
          >
            {showForm ? (
              <XCircle size={18} weight="bold" color={COLORS.secondary} />
            ) : (
              <PlusCircle size={18} weight="bold" color={COLORS.secondary} />
            )}
            <Text style={styles.createRewardButtonText}>
              {showForm ? 'Fermer' : 'Creer une recompense'}
            </Text>
          </TouchableOpacity>
        </View>

        {realRewards.length === 0 && !showForm ? (
          <Card>
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🎁</Text>
              <Text style={styles.emptyText}>Aucune recompense configuree</Text>
            </View>
          </Card>
        ) : (
          realRewards.map((reward) => {
            const cooldownLabel = formatRewardCooldownLabel(reward);

            return (
              <Card key={reward.id} style={styles.rewardCard}>
                <View style={styles.rewardHeader}>
                  <View style={styles.rewardHeaderText}>
                    <Text style={styles.rewardDesc}>{reward.description}</Text>
                    <Text style={styles.rewardCooldownText}>{cooldownLabel}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleDelete(reward.id, reward.description)}>
                    <Text style={styles.deleteBtn}>✕</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.rewardChildrenList}>
                  {childSummaries.map(({ child, totalStars }) => {
                    const progress = Math.min(1, totalStars / reward.requiredStars);
                    const availability = getRewardAvailabilityForChild(reward, child.id, nowTick);
                    const isCoolingDown = availability.isCoolingDown;
                    const canClaim = totalStars >= reward.requiredStars && !isCoolingDown;
                    const countdownLabel = formatRemainingCooldown(availability.remainingCooldownMs ?? 0);

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
                                    backgroundColor: isCoolingDown ? COLORS.success : COLORS.secondary,
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
                          {isCoolingDown ? (
                            <View style={styles.claimedBadge}>
                              <CheckCircle size={14} weight="fill" color={COLORS.success} />
                              <Text style={styles.claimedBadgeText}>{countdownLabel}</Text>
                            </View>
                          ) : canClaim ? (
                            <TouchableOpacity
                              onPress={() =>
                                handleClaim(
                                  reward.id,
                                  reward.description,
                                  child.name,
                                  child.id,
                                  child.avatar,
                                  child.color,
                                  child.avatarConfig,
                                  totalStars,
                                  reward.requiredStars,
                                )
                              }
                              activeOpacity={0.85}
                              style={[styles.offerButton, styles.offerButtonTouch]}
                            >
                              <Text style={styles.offerButtonText}>Offrir</Text>
                            </TouchableOpacity>
                          ) : (
                            <View style={styles.lockedBadge}>
                              <Text style={styles.lockedBadgeText}>
                                Encore {Math.max(0, reward.requiredStars - totalStars)} etoiles
                              </Text>
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

        </View>
      </ScrollView>

      {showForm ? (
        <View style={styles.formOverlay}>
          <TouchableOpacity
            style={styles.claimBackdrop}
            activeOpacity={1}
            onPress={() => setShowForm(false)}
          />
          <View style={styles.formModalWrap}>
            <Card style={styles.formModalCard}>
              <View style={styles.formModalHeader}>
                <View style={styles.formTitleWrap}>
                  <View style={styles.formIconWrap}>
                    <Gift size={24} weight="fill" color={COLORS.secondary} />
                  </View>
                  <View style={styles.formTitleText}>
                    <Text style={styles.formTitle}>Nouvelle recompense</Text>
                    <Text style={styles.formSubtitle}>
                      Renseigne la recompense puis valide pour l'ajouter.
                    </Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => setShowForm(false)} style={styles.formCloseButton}>
                  <XCircle size={24} weight="fill" color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

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

              <Text style={styles.formLabel}>Recharge de disponibilite</Text>
              <View style={styles.cooldownRow}>
                <TextInput
                  style={[styles.input, styles.inputSmall]}
                  value={cooldownValue}
                  onChangeText={(text) => setCooldownValue(text.replace(/[^0-9]/g, ''))}
                  keyboardType="number-pad"
                  maxLength={3}
                />
                <View style={styles.cooldownUnits}>
                  {COOLDOWN_OPTIONS.map((option) => {
                    const selected = option.value === cooldownUnit;

                    return (
                      <TouchableOpacity
                        key={option.value}
                        onPress={() => setCooldownUnit(option.value)}
                        style={[styles.cooldownChip, selected && styles.cooldownChipActive]}
                        activeOpacity={0.85}
                      >
                        <Text
                          style={[styles.cooldownChipText, selected && styles.cooldownChipTextActive]}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
              <Text style={styles.cooldownHelper}>
                Exemple : Bluey 20 min, {formatRewardCooldownLabel({
                  cooldownValue: Math.max(1, parseInt(cooldownValue || '1', 10) || 1),
                  cooldownUnit,
                }).toLowerCase()}
              </Text>

              <View style={styles.formActions}>
                <Button title="Annuler" onPress={() => setShowForm(false)} variant="ghost" size="sm" />
                <Button
                  title="Ajouter"
                  onPress={handleAdd}
                  variant="primary"
                  size="sm"
                  disabled={!description.trim() || !requiredStars || !cooldownValue}
                />
              </View>
            </Card>
          </View>
        </View>
      ) : null}

      {pendingClaim ? (
        <View style={styles.claimOverlay}>
          <TouchableOpacity
            style={styles.claimBackdrop}
            activeOpacity={1}
            onPress={() => setPendingClaim(null)}
          />
          <View
            style={[
              styles.claimSheetWrap,
            ]}
          >
            <Card style={styles.claimSheet}>
                <View style={styles.claimIconWrap}>
                  <Gift size={28} weight="fill" color={COLORS.success} />
                </View>
                <Text style={styles.claimTitle}>Valider la recompense</Text>
                <Text style={styles.claimSubtitle}>
                  Verifie avec l'adulte que la recompense a bien ete offerte.
                </Text>

                <View style={styles.claimChildRow}>
                  <Avatar
                    emoji={pendingClaim.childAvatar}
                    color={pendingClaim.childColor}
                    size={54}
                    avatarConfig={pendingClaim.childAvatarConfig}
                  />
                  <View style={styles.claimChildText}>
                    <Text style={styles.claimChildName}>{pendingClaim.childName}</Text>
                    <Text style={styles.claimRewardName}>{pendingClaim.rewardDescription}</Text>
                  </View>
                </View>

                <View style={styles.claimStatsRow}>
                  <View style={styles.claimStatPill}>
                    <Star size={15} weight="fill" color={COLORS.star} />
                    <Text style={styles.claimStatText}>
                      {pendingClaim.totalStars}/{pendingClaim.requiredStars}
                    </Text>
                  </View>
                  <View style={styles.claimStatPill}>
                    <CheckCircle size={15} weight="fill" color={COLORS.success} />
                    <Text style={styles.claimStatText}>Pret a offrir</Text>
                  </View>
                </View>

                <View style={styles.claimActions}>
                  <Button
                    title="Annuler"
                    onPress={() => {
                      setPendingClaim(null);
                      setIsConfirmingClaim(false);
                    }}
                    variant="ghost"
                    size="sm"
                    color={COLORS.textSecondary}
                    style={styles.claimActionButton}
                  />
                  <Button
                    title="Confirmer l'offre"
                    onPress={handleConfirmClaim}
                    variant="primary"
                    size="sm"
                    color={COLORS.success}
                    loading={isConfirmingClaim}
                    disabled={isConfirmingClaim}
                    style={styles.claimActionButton}
                  />
                </View>
            </Card>
          </View>
        </View>
      ) : null}
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
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  createRewardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.secondary + '55',
    backgroundColor: COLORS.secondary + '12',
  },
  createRewardButtonText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  formOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  formModalWrap: {
    width: '100%',
    alignItems: 'center',
  },
  formModalCard: {
    width: '100%',
    maxWidth: 620,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  formModalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  formTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  formIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${COLORS.secondary}18`,
  },
  formTitleText: {
    flex: 1,
    gap: 2,
  },
  formSubtitle: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  formCloseButton: {
    padding: 2,
  },
  claimOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  claimBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20, 24, 40, 0.28)',
  },
  claimSheetWrap: {
    width: '100%',
    alignItems: 'center',
  },
  claimSheet: {
    width: '100%',
    maxWidth: 480,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    gap: SPACING.md,
  },
  claimIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.success + '18',
  },
  claimTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
  },
  claimSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  claimChildRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  claimChildText: {
    flex: 1,
    gap: 4,
  },
  claimChildName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
    color: COLORS.text,
  },
  claimRewardName: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  claimStatsRow: {
    width: '100%',
    flexDirection: 'row',
    gap: SPACING.sm,
    flexWrap: 'wrap',
  },
  claimStatPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.sm,
  },
  claimStatText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
    color: COLORS.text,
  },
  claimActions: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  claimActionButton: {
    minWidth: 150,
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
  rewardHeaderText: {
    flex: 1,
    gap: 4,
  },
  rewardDesc: {
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
    color: COLORS.text,
    flex: 1,
  },
  rewardCooldownText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.textSecondary,
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
  offerButtonTouch: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.success,
    borderRadius: RADIUS.lg,
    ...SHADOWS.md,
  },
  offerButtonText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '800',
    color: '#FFF',
  },
  formTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.text,
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
  cooldownRow: {
    gap: SPACING.sm,
  },
  cooldownUnits: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  cooldownChip: {
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.surfaceSecondary,
  },
  cooldownChipActive: {
    backgroundColor: `${COLORS.secondary}18`,
    borderColor: COLORS.secondary,
  },
  cooldownChipText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  cooldownChipTextActive: {
    color: COLORS.secondaryDark,
  },
  cooldownHelper: {
    marginTop: SPACING.xs,
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
  },
});
