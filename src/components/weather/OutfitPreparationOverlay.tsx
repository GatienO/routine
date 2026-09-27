import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { ArrowCounterClockwise, Check } from 'phosphor-react-native';
import { ResponsiveOverlay } from '../ui/ResponsiveOverlay';
import { OutfitImage } from './OutfitImage';
import { getOutfitVisualItem, normalizeOutfitSelection, SELECTABLE_OUTFIT_IDS, type OutfitVisualId } from '../../constants/weatherOutfits';
import { FONT_SIZE } from '../../constants/theme';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useFocusRing } from '../../hooks/useFocusRing';
import { type WeatherData } from '../../services/weather';
import { getClothingRecommendation } from '../../services/weatherClothingRecommendation';

type Props = {
  visible: boolean;
  weather: WeatherData | null;
  loading: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
  initialSelection: OutfitVisualId[] | null;
  onApply: (ids: OutfitVisualId[]) => void;
};

function OutfitChoice({ id, selected, width, onPress }: {
  id: OutfitVisualId; selected: boolean; width: number; onPress: () => void;
}) {
  const { isDark } = useAppTheme();
  const focus = useFocusRing();
  const label = id === 'pyjamaEte' ? 'Pyjama léger' : id === 'pyjamaHiver' ? 'Pyjama chaud' : getOutfitVisualItem(id)?.label ?? id;
  const mint = isDark ? '#8DBCA8' : '#B8DFCF';
  return (
    <Pressable accessibilityRole="checkbox" accessibilityLabel={label}
      aria-checked={selected}
      {...(Platform.OS === 'web' ? { onKeyDown: (event: { key: string; preventDefault: () => void }) => {
        if (event.key === ' ' || event.key === 'Spacebar') { event.preventDefault(); onPress(); }
      } } : {})}
      onPress={onPress} onFocus={focus.onFocus} onBlur={focus.onBlur}
      style={({ pressed }) => [styles.item, { width, opacity: pressed ? 0.75 : 1 }, focus.focusStyle]}>
      <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
        style={[styles.picture, { borderColor: selected ? mint : 'transparent' }]}>
        <OutfitImage id={id} size={64} />
        {selected ? <View style={[styles.pin, { backgroundColor: mint }]}><Check size={15} weight="regular" color="#214D3D" /></View> : null}
      </View>
    </Pressable>
  );
}

export function OutfitPreparationOverlay({ visible, weather, onClose, initialSelection, onApply }: Props) {
  const { colors } = useAppTheme();
  const { width: screenWidth } = useWindowDimensions();
  const [gridWidth, setGridWidth] = useState(0);
  const panelWidth = screenWidth >= 760 ? Math.min(520, screenWidth * 0.92) : screenWidth;
  const contentWidth = gridWidth || panelWidth - 14;
  const columns = contentWidth + 12 >= 520 ? 4 : contentWidth + 12 >= 350 ? 3 : 2;
  // Leave one pixel for fractional layout rounding so the last tile does not wrap alone.
  const itemWidth = Math.max(44, Math.floor((contentWidth - (columns - 1) * 4) / columns) - 1);
  const proposedIds = useMemo(() => {
    if (!weather) return [];
    const plan = getClothingRecommendation(weather).outfitPlan;
    return normalizeOutfitSelection([...plan.tiles.flatMap(tile => tile.items.map(item => item.id)), ...plan.extras.map(item => item.id)]);
  }, [weather]);
  const [selectedIds, setSelectedIds] = useState<Set<OutfitVisualId>>(() => new Set());
  const edited = useRef(false);

  useEffect(() => {
    if (!visible) { edited.current = false; return; }
    // Late weather may help an untouched selection, but must not replace manual choices.
    if (!edited.current) setSelectedIds(new Set(initialSelection ?? proposedIds));
  }, [initialSelection, proposedIds, visible]);

  const empty = selectedIds.size === 0;
  const selectedCount = selectedIds.size;
  const selectionLabel = `${selectedCount} article${selectedCount > 1 ? 's' : ''} sélectionné${selectedCount > 1 ? 's' : ''} · ${SELECTABLE_OUTFIT_IDS.length} articles disponibles`;
  const footer = <View style={styles.footer}>
    <Text accessibilityLiveRegion="polite" style={[styles.count, { color: colors.textSecondary }]}>
      {selectionLabel}
    </Text>
    <View style={styles.footerRow}>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Réinitialiser la sélection"
        onPress={() => { edited.current = true; setSelectedIds(new Set(proposedIds)); }}
        style={[styles.resetButton, { borderColor: colors.border }]}>
        <ArrowCounterClockwise size={18} weight="regular" color={colors.text} />
        <Text style={[styles.buttonText, { color: colors.text }]}>Réinitialiser</Text>
      </TouchableOpacity>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Tenue prête" disabled={empty}
        accessibilityState={{ disabled: empty }} aria-disabled={empty}
        onPress={() => { onApply([...selectedIds]); onClose(); }}
        style={[styles.doneButton, { backgroundColor: empty ? colors.surfaceSecondary : colors.actionSoft }]}>
        <Text style={[styles.buttonText, { color: empty ? colors.textSecondary : colors.text }]}>Tenue prête</Text>
      </TouchableOpacity>
    </View>
  </View>;

  return <ResponsiveOverlay visible={visible} title="Préparer la tenue"
    subtitle={weather ? 'Une sélection à ajuster.' : 'Choisissez les vêtements.'}
    onClose={onClose} footer={footer} compact>
    <View style={styles.grid} onLayout={event => setGridWidth(event.nativeEvent.layout.width)}>
      {SELECTABLE_OUTFIT_IDS.map((id) => <OutfitChoice key={id} id={id}
        selected={selectedIds.has(id)} width={itemWidth} onPress={() => {
          edited.current = true;
          setSelectedIds(current => { const next = new Set(current); next.has(id) ? next.delete(id) : next.add(id); return next; });
        }} />)}
    </View>
  </ResponsiveOverlay>;
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  item: { minHeight: 108, alignItems: 'center', justifyContent: 'center', paddingVertical: 6 },
  picture: { width: 82, height: 82, borderWidth: 2, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  pin: { position: 'absolute', right: -5, top: -5, width: 23, height: 23, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  footer: { gap: 8 }, count: { fontSize: FONT_SIZE.xs },
  footerRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  resetButton: { minHeight: 48, borderRadius: 14, borderWidth: 1, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  doneButton: { minHeight: 48, flexGrow: 1, borderRadius: 14, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center' },
  buttonText: { fontSize: FONT_SIZE.sm, fontWeight: '600' },
});
