import { useEffect, useState } from 'react';
import { CaretDown, CaretUp } from 'phosphor-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { FONT_SIZE, SPACING } from '../../../constants/theme';
import { PrimaryButton } from './PrimaryButton';
import type { Activity } from '../types';
import { activityTypeLabel, energyLabel, independenceLabel, messLabel, noiseLabel, weatherLabel } from '../labels';
import { formatActivityText } from '../format-activity-text';

type Props = { activity: Activity; favorite: boolean; onToggleFavorite: () => void; onClose: () => void; onComplete?: () => void; closeLabel?: string };

export function ActivityDetailBody({ activity, favorite, onToggleFavorite, onClose, onComplete, closeLabel = 'Retour' }: Props) {
  const { colors } = useAppTheme();
  const [expanded, setExpanded] = useState(false);
  useEffect(() => setExpanded(false), [activity.id]);
  const badges = [
    `${activity.duration} min`, `${activity.ageMin}–${activity.ageMax} ans`, activity.groupActivity ? 'Groupe' : 'Petit comité',
    `${activity.playerCountMin}–${activity.playerCountMax} participants`, activityTypeLabel(activity.activityType), energyLabel(activity.parentEnergy),
    `Rangement ${messLabel(activity.messLevel).toLocaleLowerCase('fr')}`, weatherLabel(activity.weather), `${activity.setupTime} min de préparation`,
    independenceLabel(activity.independenceLevel), noiseLabel(activity.noiseLevel), activity.requiresSupervision ? 'Adulte très présent' : 'Adulte à proximité', activity.screenFree ? 'Sans écran' : 'Avec écran',
  ];

  return <>
    <Text style={{ color: colors.textSecondary, fontSize: 14 }}>{activity.duration} min · {activity.ageMin}–{activity.ageMax} ans · {activity.materials.length ? 'Matériel à prévoir' : 'Sans matériel'}</Text>
    <DetailBlock title="Matériel" items={(activity.materials.length ? activity.materials : ['Rien de spécial']).map(formatActivityText)} colors={colors} />
    <DetailBlock title="Étapes" items={activity.steps.map(formatActivityText)} ordered colors={colors} />
    <Pressable aria-expanded={expanded} accessibilityRole="button" accessibilityState={{ expanded }} onPress={() => setExpanded(value => !value)} style={{ minHeight: 48, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }}><Text style={{ flex: 1, color: colors.text, fontWeight: '600' }}>Repères et variantes</Text>{expanded ? <CaretUp color={colors.text} /> : <CaretDown color={colors.text} />}</Pressable>
    {expanded ? <><View style={styles.badges}>{badges.slice(2).map(label => <View key={label} style={[styles.badge, { backgroundColor: colors.surfaceSecondary }]}><Text style={[styles.badgeText, { color: colors.textSecondary }]}>{label}</Text></View>)}</View>
    {activity.skills.length ? <DetailBlock title="Ce que l’activité encourage" items={activity.skills.map(formatActivityText)} colors={colors} /> : null}
    <Variant title="Quand le parent a peu d’énergie" value={formatActivityText(activity.koVariant)} colors={colors} />
    <Variant title="Pour aller un peu plus loin" value={formatActivityText(activity.harderVariant)} colors={colors} />
    </> : null}
    <View style={styles.actions}>{onComplete ? <PrimaryButton title="Activité terminée ensemble" onPress={onComplete} /> : null}<PrimaryButton title={favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'} variant={favorite ? 'danger' : 'secondary'} onPress={onToggleFavorite} /><PrimaryButton title={closeLabel} variant="secondary" onPress={onClose} /></View>
  </>;
}

function DetailBlock({ title, items, ordered = false, colors }: { title: string; items: string[]; ordered?: boolean; colors: ReturnType<typeof useAppTheme>['colors'] }) {
  return <View style={[styles.block, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.blockTitle, { color: colors.text }]}>{title}</Text>{items.map((item, index) => <View key={`${item}-${index}`} style={styles.itemRow}>{ordered ? <View style={[styles.number, { backgroundColor: colors.actionSoft }]}><Text style={[styles.numberText, { color: colors.action }]}>{index + 1}</Text></View> : null}<Text style={[styles.itemText, { color: colors.textSecondary }]}>{item}</Text></View>)}</View>;
}
function Variant({ title, value, colors }: { title: string; value: string; colors: ReturnType<typeof useAppTheme>['colors'] }) { return <View style={[styles.variant, { backgroundColor: colors.transitionSoft }]}><Text style={[styles.variantTitle, { color: colors.text }]}>{title}</Text><Text style={[styles.itemText, { color: colors.textSecondary }]}>{value}</Text></View>; }

const styles = StyleSheet.create({
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs }, badge: { minHeight: 34, borderRadius: 12, paddingHorizontal: SPACING.sm, alignItems: 'center', justifyContent: 'center' }, badgeText: { fontSize: FONT_SIZE.xs, fontWeight: '700' }, block: { borderRadius: 20, borderWidth: 1, padding: SPACING.md, gap: SPACING.sm }, blockTitle: { fontSize: FONT_SIZE.lg, fontWeight: '800' }, itemRow: { minHeight: 30, flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm }, number: { width: 28, height: 28, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }, numberText: { fontSize: FONT_SIZE.xs, fontWeight: '800' }, itemText: { flex: 1, minWidth: 0, fontSize: FONT_SIZE.sm, lineHeight: 21 }, variant: { borderRadius: 20, padding: SPACING.md, gap: 5 }, variantTitle: { fontSize: FONT_SIZE.md, fontWeight: '800' }, actions: { gap: SPACING.sm },
});
