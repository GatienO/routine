import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useChildrenStore } from '../../src/stores/childrenStore';
import { useRewardStore } from '../../src/stores/rewardStore';
import { useRealRewardStore } from '../../src/stores/realRewardStore';
import { Avatar } from '../../src/components/ui/Avatar';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { StarCounter } from '../../src/components/rewards/Counters';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '../../src/constants/theme';
import { OpenMoji } from '../../src/components/ui/OpenMoji';

export default function ParentRewardsScreen() {
  const router = useRouter();
  const { children } = useChildrenStore();
  const { getRewards } = useRewardStore();
  const { getRewardsForChild, addRealReward, removeRealReward, claimReward } = useRealRewardStore();

  const [selectedChildId, setSelectedChildId] = useState(children[0]?.id ?? '');
  const [showForm, setShowForm] = useState(false);
  const [description, setDescription] = useState('');
  const [requiredStars, setRequiredStars] = useState('10');

  const child = children.find((c) => c.id === selectedChildId);
  const childRewards = child ? getRewards(child.id) : null;
  const realRewards = getRewardsForChild(selectedChildId);
  const pending = realRewards.filter((r) => !r.isClaimed);
  const claimed = realRewards.filter((r) => r.isClaimed);

  const handleAdd = () => {
    if (!description.trim() || !selectedChildId) return;
    const stars = parseInt(requiredStars, 10);
    if (!stars || stars < 1) return;
    addRealReward(selectedChildId, description, stars);
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

  const handleClaim = (id: string, desc: string) => {
    Alert.alert(
      'Récompense offerte ?',
      `Confirmer que "${desc}" a été donnée à l'enfant ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Confirmer', onPress: () => claimReward(id) },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🎁 Récompenses réelles</Text>
        <Text style={styles.subtitle}>
          Motivez votre enfant avec des récompenses concrètes !
        </Text>

        {/* Child selector */}
        {children.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.childScroll}>
            <View style={styles.childRow}>
              {children.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={[
                    styles.childChip,
                    selectedChildId === c.id && { backgroundColor: c.color + '30', borderColor: c.color },
                  ]}
                  onPress={() => setSelectedChildId(c.id)}
                >
                  <OpenMoji emoji={c.avatar} size={18} />
                  <Text style={styles.childChipText}>{c.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        )}

        {/* Current stars */}
        {child && childRewards && (
          <Card style={styles.starsCard}>
            <View style={styles.starsRow}>
              <Avatar emoji={child.avatar} color={child.color} size={40} avatarConfig={child.avatarConfig} />
              <View style={{ flex: 1 }}>
                <Text style={styles.starsName}>{child.name}</Text>
                <StarCounter count={childRewards.totalStars} size="sm" />
              </View>
            </View>
          </Card>
        )}

        {/* Pending rewards */}
        <Text style={styles.sectionTitle}>
          Récompenses en cours ({pending.length})
        </Text>

        {pending.length === 0 && !showForm ? (
          <Card>
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🎁</Text>
              <Text style={styles.emptyText}>
                Aucune récompense configurée
              </Text>
            </View>
          </Card>
        ) : (
          pending.map((reward) => {
            const progress = childRewards
              ? Math.min(1, childRewards.totalStars / reward.requiredStars)
              : 0;
            const canClaim = childRewards
              ? childRewards.totalStars >= reward.requiredStars
              : false;
            return (
              <Card key={reward.id} style={styles.rewardCard}>
                <View style={styles.rewardHeader}>
                  <Text style={styles.rewardDesc}>{reward.description}</Text>
                  <TouchableOpacity onPress={() => handleDelete(reward.id, reward.description)}>
                    <Text style={styles.deleteBtn}>✕</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.progressRow}>
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${progress * 100}%`,
                          backgroundColor: canClaim ? COLORS.success : COLORS.star,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    ⭐ {childRewards?.totalStars ?? 0}/{reward.requiredStars}
                  </Text>
                </View>
                {canClaim && (
                  <Button
                    title="✅ Marquer comme offerte"
                    onPress={() => handleClaim(reward.id, reward.description)}
                    variant="primary"
                    size="sm"
                    color={COLORS.success}
                    style={{ marginTop: SPACING.sm }}
                  />
                )}
              </Card>
            );
          })
        )}

        {/* Add form */}
        {showForm ? (
          <Card style={styles.formCard}>
            <Text style={styles.formTitle}>Nouvelle récompense</Text>
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
            <Text style={styles.formLabel}>Étoiles nécessaires</Text>
            <TextInput
              style={[styles.input, styles.inputSmall]}
              value={requiredStars}
              onChangeText={(t) => setRequiredStars(t.replace(/[^0-9]/g, ''))}
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
            title="+ Ajouter une récompense"
            onPress={() => setShowForm(true)}
            variant="outline"
            size="md"
            color={COLORS.secondary}
            style={{ marginTop: SPACING.md }}
          />
        )}

        {/* Claimed rewards */}
        {claimed.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: SPACING.xl }]}>
              Déjà offertes ({claimed.length})
            </Text>
            {claimed.map((reward) => (
              <Card key={reward.id} style={[styles.rewardCard, styles.claimedCard]}>
                <View style={styles.rewardHeader}>
                  <Text style={styles.claimedDesc}>✅ {reward.description}</Text>
                  <Text style={styles.claimedStars}>⭐ {reward.requiredStars}</Text>
                </View>
              </Card>
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
  title: { fontSize: FONT_SIZE.xl, fontWeight: '800', color: COLORS.text },
  subtitle: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, marginTop: SPACING.xs, marginBottom: SPACING.lg },
  childScroll: { marginBottom: SPACING.md },
  childRow: { flexDirection: 'row', gap: SPACING.sm },
  childChip: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.xs,
    paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full, borderWidth: 2, borderColor: COLORS.surfaceSecondary,
    backgroundColor: COLORS.surface,
  },
  childChipEmoji: { fontSize: 20 },
  childChipText: { fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.text },
  starsCard: { marginBottom: SPACING.lg },
  starsRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  starsName: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  sectionTitle: {
    fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md,
  },
  empty: { alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.lg },
  emptyIcon: { fontSize: 40 },
  emptyText: { fontSize: FONT_SIZE.md, color: COLORS.textSecondary, textAlign: 'center' },
  rewardCard: { marginBottom: SPACING.sm },
  rewardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  rewardDesc: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.text, flex: 1 },
  deleteBtn: { fontSize: 16, color: COLORS.error, padding: 4 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  progressTrack: {
    flex: 1, height: 10, backgroundColor: COLORS.surfaceSecondary,
    borderRadius: RADIUS.full, overflow: 'hidden',
  },
  progressFill: { height: 10, borderRadius: RADIUS.full },
  progressText: { fontSize: FONT_SIZE.xs, fontWeight: '700', color: COLORS.textSecondary, minWidth: 70 },
  claimedCard: { opacity: 0.6 },
  claimedDesc: { fontSize: FONT_SIZE.md, color: COLORS.textSecondary },
  claimedStars: { fontSize: FONT_SIZE.sm, color: COLORS.textLight },
  formCard: { marginTop: SPACING.md },
  formTitle: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  formLabel: { fontSize: FONT_SIZE.xs, fontWeight: '600', color: COLORS.textSecondary, marginBottom: SPACING.xs, marginTop: SPACING.md },
  input: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md,
    fontSize: FONT_SIZE.md, color: COLORS.text, borderWidth: 1, borderColor: COLORS.surfaceSecondary,
  },
  inputSmall: { width: 100 },
  formActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: SPACING.sm, marginTop: SPACING.lg },
});
