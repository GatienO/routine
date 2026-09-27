import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Check } from 'phosphor-react-native';
import { ResponsiveOverlay } from '../../../components/ui/ResponsiveOverlay';
import { Avatar } from '../../../components/ui/Avatar';
import { showAppToast } from '../../../components/feedback/AppFeedbackProvider';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { FONT_SIZE, SPACING } from '../../../constants/theme';
import { useChildrenStore } from '../../../stores/childrenStore';
import { useRewardStore } from '../../../stores/rewardStore';
import { formatChildName } from '../../../utils/children';
import { ActivityDetailBody } from './ActivityDetailBody';
import { useActivityStore } from '../activity-store';
import type { Activity } from '../types';
import { formatActivityText } from '../format-activity-text';

type Props = { activity: Activity | null; visible: boolean; onClose: () => void };

export function ActivityDetailOverlay({ activity, visible, onClose }: Props) {
  const { colors } = useAppTheme();
  const favoriteIds = useActivityStore((state) => state.favoriteIds);
  const toggleFavorite = useActivityStore((state) => state.toggleFavorite);
  const saveToHistory = useActivityStore((state) => state.saveToHistory);
  const children = useChildrenStore((state) => state.children);
  const recordActivityCompletion = useRewardStore((state) => state.recordActivityCompletion);
  const [completionOpen, setCompletionOpen] = useState(false);
  const [selectedChildIds, setSelectedChildIds] = useState<string[]>([]);

  useEffect(() => {
    if (visible && activity) saveToHistory(activity);
  }, [activity, saveToHistory, visible]);
  useEffect(() => {
    if (visible) {
      setCompletionOpen(false);
      setSelectedChildIds(children.map((child) => child.id));
    }
  }, [activity?.id, children, visible]);

  if (!activity) return null;
  const favorite = favoriteIds.includes(activity.id);
  const complete = () => {
    if (!selectedChildIds.length) return;
    const summaries = recordActivityCompletion(selectedChildIds, activity.independenceLevel === 'high');
    const badgeCount = summaries.reduce((sum, summary) => sum + summary.unlockedBadgeIds.length, 0);
    showAppToast({
      title: 'Activité terminée ensemble',
      message: `+1 étoile pour ${selectedChildIds.length > 1 ? 'chaque enfant' : formatChildName(children.find((child) => child.id === selectedChildIds[0])?.name ?? 'l’enfant')}${badgeCount ? ` · ${badgeCount} nouveau${badgeCount > 1 ? 'x' : ''} badge${badgeCount > 1 ? 's' : ''}` : ''}`,
      tone: 'success',
      icon: '⭐',
    });
    onClose();
  };

  return (
    <ResponsiveOverlay visible={visible} title={formatActivityText(activity.title)} subtitle={formatActivityText(activity.description)} onClose={onClose}>
      {completionOpen ? <View style={styles.completion}><Text style={[styles.completionTitle, { color: colors.text }]}>Qui a participé ?</Text><Text style={[styles.completionHelp, { color: colors.textSecondary }]}>Le parent confirme. Chaque enfant choisi gagne une étoile.</Text>{children.length ? <View style={styles.children}>{children.map((child) => { const selected = selectedChildIds.includes(child.id); return <Pressable aria-checked={selected} key={child.id} accessibilityRole="checkbox" accessibilityState={{ checked: selected }} onPress={() => setSelectedChildIds((current) => selected ? current.filter((id) => id !== child.id) : [...current, child.id])} style={[styles.child, { backgroundColor: selected ? colors.actionSoft : colors.surface, borderColor: selected ? colors.action : colors.border }]}><Avatar emoji={child.avatar} color={child.color} size={38} avatarConfig={child.avatarConfig} /><Text style={[styles.childName, { color: colors.text }]}>{formatChildName(child.name)}</Text><View style={[styles.check, { backgroundColor: selected ? colors.action : colors.surfaceSecondary }]}>{selected ? <Check size={16} weight="bold" color={colors.surface} /> : null}</View></Pressable>; })}</View> : <View style={[styles.noChild, { backgroundColor: colors.surfaceSecondary }]}><Text style={[styles.completionHelp, { color: colors.textSecondary }]}>Ajoutez d’abord un enfant dans Famille.</Text></View>}<Pressable accessibilityRole="button" disabled={!selectedChildIds.length} onPress={complete} style={[styles.confirm, { backgroundColor: colors.action, opacity: selectedChildIds.length ? 1 : 0.45 }]}><Text style={[styles.confirmText, { color: colors.background }]}>Confirmer · +1 ⭐</Text></Pressable><Pressable accessibilityRole="button" onPress={() => setCompletionOpen(false)} style={styles.back}><Text style={[styles.backText, { color: colors.textSecondary }]}>Retour au détail</Text></Pressable></View> : <ActivityDetailBody activity={activity} favorite={favorite} onClose={onClose} closeLabel="Fermer" onComplete={() => setCompletionOpen(true)} onToggleFavorite={() => toggleFavorite(activity.id)} />}
    </ResponsiveOverlay>
  );
}

const styles = StyleSheet.create({
  identity: { borderRadius: 20, padding: SPACING.md, flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  emoji: { fontSize: 42 },
  identityCopy: { flex: 1, minWidth: 0 },
  identityTitle: { fontSize: FONT_SIZE.md, fontWeight: '800' },
  identityMeta: { marginTop: 4, fontSize: FONT_SIZE.xs },
  completion: { gap: SPACING.md },
  completionTitle: { fontSize: FONT_SIZE.xl, fontWeight: '800' },
  completionHelp: { fontSize: FONT_SIZE.sm, lineHeight: 21 },
  children: { gap: SPACING.sm },
  child: { minHeight: 62, borderRadius: 18, borderWidth: 1, padding: SPACING.sm, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  childName: { flex: 1, minWidth: 0, fontSize: FONT_SIZE.sm, fontWeight: '800' },
  check: { width: 30, height: 30, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  noChild: { minHeight: 90, borderRadius: 18, padding: SPACING.md, alignItems: 'center', justifyContent: 'center' },
  confirm: { minHeight: 52, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  confirmText: { fontSize: FONT_SIZE.sm, fontWeight: '800' },
  back: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: FONT_SIZE.sm, fontWeight: '700' },
});
