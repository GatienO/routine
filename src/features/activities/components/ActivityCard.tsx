import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowRight, Clock, Heart } from 'phosphor-react-native';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { useFocusRing } from '../../../hooks/useFocusRing';
import { formatActivityText } from '../format-activity-text';
import type { Activity } from '../types';

type Props = { activity: Activity; favorite?: boolean; compact?: boolean; onPress?: () => void; onToggleFavorite?: () => void; rightAction?: React.ReactNode };
export function ActivityCard({ activity, favorite = false, onPress, onToggleFavorite, rightAction }: Props) {
  const { colors } = useAppTheme();
  const { focusStyle: openFocus, ...openProps } = useFocusRing();
  const { focusStyle: favoriteFocus, ...favoriteProps } = useFocusRing();
  return <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
    <View style={styles.heading}>
      <View style={[styles.visual, { backgroundColor: colors.timeSoft }]}><Text style={styles.emoji}>{activity.thumbnail}</Text></View>
      <Text accessibilityRole="header" aria-level={2} style={[styles.title, { color: colors.text }]}>{formatActivityText(activity.title)}</Text>
      {onToggleFavorite ? <Pressable aria-pressed={favorite} {...favoriteProps} accessibilityRole="button" accessibilityLabel={`${favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'} : ${activity.title}`} accessibilityState={{ selected: favorite }} onPress={onToggleFavorite} style={[styles.favorite, favoriteFocus, { backgroundColor: favorite ? colors.actionSoft : colors.surfaceSecondary }]}><Heart size={21} weight="regular" color={favorite ? colors.action : colors.textSecondary} /></Pressable> : rightAction}
    </View>
    <Text style={[styles.description, { color: colors.textSecondary }]}>{formatActivityText(activity.description)}</Text>
    <View style={styles.meta}><Clock size={16} color={colors.textSecondary} /><Text style={[styles.metaText, { color: colors.textSecondary }]}>{activity.duration} min · {activity.ageMin}–{activity.ageMax} ans · {formatActivityText(activity.materials[0] ?? 'Sans matériel')}</Text></View>
    {onPress ? <Pressable {...openProps} accessibilityRole="button" accessibilityLabel={`Ouvrir ${activity.title}`} onPress={onPress} style={[styles.open, openFocus, { borderColor: colors.border }]}><Text style={{ color: colors.text }}>Voir l’activité</Text><ArrowRight size={19} color={colors.text} /></Pressable> : null}
  </View>;
}
const styles = StyleSheet.create({
  card: { flex: 1, borderRadius: 21, borderWidth: 1, padding: 18, gap: 12 },
  heading: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  visual: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 28 }, title: { flex: 1, minWidth: 0, fontSize: 20, lineHeight: 25, fontWeight: '700' },
  favorite: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  description: { flexGrow: 1, fontSize: 14, lineHeight: 21 },
  meta: { flexDirection: 'row', alignItems: 'flex-start', gap: 5 }, metaText: { flex: 1, fontSize: 12, lineHeight: 18 },
  open: { minHeight: 44, borderWidth: 1, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 8 },
});
