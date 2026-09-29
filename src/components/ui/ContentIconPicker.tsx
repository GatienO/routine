import React, { useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { MagnifyingGlass } from 'phosphor-react-native';
import { ICON_PICKER_EMOJIS, ICON_PICKER_GROUPS } from '../../constants/icons';
import { FONT_SIZE, SPACING, type ThemeColors } from '../../constants/theme';
import { OpenMoji } from './OpenMoji';
import { ResponsiveOverlay } from './ResponsiveOverlay';
import { getIconSearchLabel, searchContentIcons } from '../../utils/contentIconSearch';

const RECENT_KEY = 'content-icon-picker-recent-v1';
const MAX_RECENT = 8;
const PAGE_SIZE = 40;
let recentCache: string[] = [];

type Props = {
  value: string;
  onPress: () => void;
  colors: ThemeColors;
  kind: 'routine' | 'étape' | 'repère';
};

export function ContentIconPicker({ value, onPress, colors, kind }: Props) {
  const selectedLabel = getIconSearchLabel(value);
  const kindLabel = kind === 'étape' ? 'de l’étape' : kind === 'repère' ? 'du repère' : 'de la routine';
  return <Pressable accessibilityRole="button" accessibilityLabel={`Choisir le pictogramme ${kindLabel} : ${selectedLabel}`} onPress={onPress} style={[styles.trigger, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
    <View style={[styles.preview, { backgroundColor: colors.actionSoft }]}><OpenMoji emoji={value} size={31} /></View>
    <View style={styles.triggerCopy}><Text style={[styles.triggerTitle, { color: colors.text }]} numberOfLines={1}>{selectedLabel}</Text><Text style={[styles.hint, { color: colors.textSecondary }]}>Chercher ou parcourir les pictogrammes</Text></View>
    <MagnifyingGlass size={20} color={colors.action} />
  </Pressable>;
}

type DialogProps = Omit<Props, 'onPress'> & {
  visible: boolean;
  onClose: () => void;
  onChange: (emoji: string) => void;
};

export function ContentIconPickerDialog({ value, onChange, colors, kind, visible, onClose }: DialogProps) {
  const [query, setQuery] = useState('');
  const [groupKey, setGroupKey] = useState('all');
  const [recent, setRecent] = useState(recentCache);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    AsyncStorage.getItem(RECENT_KEY).then((stored) => {
      if (!stored) return;
      const parsed: unknown = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        recentCache = parsed.filter((item): item is string => typeof item === 'string').slice(0, MAX_RECENT);
        setRecent(recentCache);
      }
    }).catch(() => undefined);
  }, []);

  const results = useMemo(() => searchContentIcons(query, groupKey), [query, groupKey]);
  const visibleResults = results.slice(0, visibleCount);
  const showSelectedSeparately = Boolean(value && !visibleResults.includes(value) && (query || !recent.includes(value)));
  const categories = <><CategoryButton label="Tout" selected={groupKey === 'all'} onPress={() => { setGroupKey('all'); setVisibleCount(PAGE_SIZE); }} colors={colors} />{ICON_PICKER_GROUPS.map((group) => <CategoryButton key={group.key} label={group.label} selected={groupKey === group.key} onPress={() => { setGroupKey(group.key); setVisibleCount(PAGE_SIZE); }} colors={colors} />)}</>;
  const pick = (emoji: string) => {
    onChange(emoji);
    const next = [emoji, ...recentCache.filter((item) => item !== emoji)].slice(0, MAX_RECENT);
    recentCache = next;
    setRecent(next);
    void AsyncStorage.setItem(RECENT_KEY, JSON.stringify(next)).catch(() => undefined);
    onClose();
    setQuery('');
  };
  const close = () => { onClose(); setQuery(''); };

  useEffect(() => {
    if (visible) { setQuery(''); setGroupKey('all'); setRecent(recentCache); setVisibleCount(PAGE_SIZE); }
  }, [visible]);

  return <ResponsiveOverlay visible={visible} centered title="Trouver une icône" subtitle={`${kind === 'étape' ? 'Pour l’étape' : kind === 'repère' ? 'Pour le repère' : 'Pour la routine'} · recherche, récents et catégories`} onClose={close}>
      <TextInput accessibilityLabel="Rechercher une icône" value={query} onChangeText={(text) => { setQuery(text); setVisibleCount(PAGE_SIZE); }} placeholder="Soleil, dent, école…" placeholderTextColor={colors.textLight} style={[styles.search, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]} />
      {!query && recent.length > 0 ? <View style={styles.section}><Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>CHOIX RÉCENTS</Text><View style={styles.grid}>{recent.map((emoji) => <IconButton key={`recent-${emoji}`} emoji={emoji} selected={emoji === value} onPress={() => pick(emoji)} colors={colors} />)}</View></View> : null}
      <View style={styles.section}><Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>TOUTES LES CATÉGORIES</Text><View style={styles.categories}>{categories}</View></View>
      {showSelectedSeparately ? <View style={styles.section}><Text style={[styles.hint, { color: colors.textSecondary }]}>{ICON_PICKER_EMOJIS.includes(value) ? 'Pictogramme choisi' : 'Pictogramme actuel conservé'}</Text><IconButton emoji={value} selected onPress={() => pick(value)} colors={colors} /></View> : null}
      {results.length ? <><Text accessibilityLiveRegion="polite" style={[styles.hint, { color: colors.textSecondary }]}>{visibleResults.length} icône{visibleResults.length > 1 ? 's' : ''} sur {results.length}</Text><View style={styles.grid}>{visibleResults.map((emoji) => <IconButton key={emoji} emoji={emoji} selected={emoji === value} onPress={() => pick(emoji)} colors={colors} />)}</View>{visibleCount < results.length ? <Pressable accessibilityRole="button" accessibilityLabel="Voir plus d’icônes" onPress={() => setVisibleCount((count) => count + PAGE_SIZE)} style={[styles.more, { backgroundColor: colors.actionSoft }]}><Text style={[styles.triggerTitle, { color: colors.action }]}>Voir plus d’icônes</Text></Pressable> : null}</> : <View style={[styles.empty, { backgroundColor: colors.surfaceSecondary }]}><Text style={[styles.triggerTitle, { color: colors.text }]}>Aucune icône trouvée</Text><Text style={[styles.hint, { color: colors.textSecondary }]}>Essayez un autre mot ou choisissez une catégorie.</Text><Pressable accessibilityRole="button" onPress={() => { setQuery(''); setGroupKey('all'); setVisibleCount(PAGE_SIZE); }} style={[styles.reset, { backgroundColor: colors.actionSoft }]}><Text style={[styles.triggerTitle, { color: colors.action }]}>Voir toutes les icônes</Text></Pressable></View>}
    </ResponsiveOverlay>;
}

function IconButton({ emoji, selected, onPress, colors }: { emoji: string; selected: boolean; onPress: () => void; colors: ThemeColors }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={getIconSearchLabel(emoji)} accessibilityState={{ selected }} onPress={onPress} style={[styles.icon, { backgroundColor: selected ? colors.actionSoft : colors.surface, borderColor: selected ? colors.action : colors.border }]}><OpenMoji emoji={emoji} size={29} /></Pressable>;
}

function CategoryButton({ label, selected, onPress, colors }: { label: string; selected: boolean; onPress: () => void; colors: ThemeColors }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={`Catégorie ${label}`} accessibilityState={{ selected }} onPress={onPress} style={[styles.category, { backgroundColor: selected ? colors.actionSoft : colors.surfaceSecondary, borderColor: selected ? colors.action : colors.border }]}><Text style={[styles.categoryText, { color: colors.text }]}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  trigger: { minHeight: 64, borderWidth: 1, borderRadius: 16, padding: SPACING.sm, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  preview: { width: 46, height: 46, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  triggerCopy: { flex: 1, minWidth: 0 }, triggerTitle: { fontSize: FONT_SIZE.sm, fontWeight: '800' }, hint: { fontSize: FONT_SIZE.xs, lineHeight: 18 },
  search: { minHeight: 50, borderWidth: 1, borderRadius: 15, paddingHorizontal: SPACING.md, fontSize: FONT_SIZE.md },
  section: { gap: SPACING.sm }, sectionTitle: { fontSize: FONT_SIZE.xs, fontWeight: '800' },
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs, paddingBottom: 2 }, category: { minHeight: 44, borderWidth: 1, borderRadius: 22, paddingHorizontal: SPACING.md, alignItems: 'center', justifyContent: 'center' }, categoryText: { fontSize: FONT_SIZE.xs, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm }, icon: { width: 54, height: 54, borderWidth: 1, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  empty: { borderRadius: 16, padding: SPACING.lg, gap: SPACING.sm }, reset: { minHeight: 44, borderRadius: 13, alignSelf: 'flex-start', paddingHorizontal: SPACING.md, alignItems: 'center', justifyContent: 'center' },
  more: { minHeight: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.md },
});
