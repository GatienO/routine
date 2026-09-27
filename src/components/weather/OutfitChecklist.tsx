import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Check } from 'phosphor-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import {
  StructuredOutfit,
  getOutfitVisualItem,
} from '../../constants/weatherOutfits';
import { COLORS, FONT_SIZE, RADIUS, SPACING } from '../../constants/theme';
import { ClothingIcon } from './ClothingIcon';

interface OutfitChecklistProps {
  outfit: StructuredOutfit;
  onComplete?: () => void;
  childName: string;
}

interface ChecklistItem {
  key: string;
  id: string;
  label: string;
  variant: number;
}

function getChecklistItems(outfit: StructuredOutfit): ChecklistItem[] {
  const zones = outfit.sleepMode
    ? outfit.zones.filter((zone) => zone.zone === 'body' || zone.zone === 'accessories')
    : outfit.zones;
  let variant = 0;

  return zones.flatMap((zone) =>
    zone.items.map((id, index) => {
      const item = getOutfitVisualItem(id);
      const itemVariant = variant;
      variant += 1;

      return {
        key: `${zone.zone}-${id}-${index}`,
        id,
        label: item?.label ?? id,
        variant: itemVariant,
      };
    }),
  );
}

export function OutfitChecklist({ outfit, onComplete, childName }: OutfitChecklistProps) {
  const items = useMemo(() => getChecklistItems(outfit), [outfit]);
  const [checkedKeys, setCheckedKeys] = useState<Set<string>>(() => new Set());
  const completedRef = useRef(false);

  useEffect(() => {
    setCheckedKeys(new Set());
    completedRef.current = false;
  }, [items]);

  useEffect(() => {
    if (items.length === 0) return;

    const complete = checkedKeys.size === items.length;
    if (complete && !completedRef.current) {
      completedRef.current = true;
      onComplete?.();
    }

    if (!complete) {
      completedRef.current = false;
    }
  }, [checkedKeys, items.length, onComplete]);

  if (items.length === 0) return null;

  const toggleItem = (key: string) => {
    setCheckedKeys((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  return (
    <Animated.View entering={FadeInUp.delay(120).duration(300)} style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Je valide ma tenue</Text>
        <Text style={styles.subtitle}>{childName}, coche quand c'est prêt.</Text>
      </View>

      <View style={styles.list}>
        {items.map((item) => {
          const checked = checkedKeys.has(item.key);

          return (
            <TouchableOpacity aria-checked={checked}
              key={item.key}
              style={[styles.row, checked && styles.rowChecked]}
              activeOpacity={0.82}
              onPress={() => toggleItem(item.key)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked }}
              accessibilityLabel={`${item.label} ${checked ? 'validé' : 'à valider'}`}
            >
              <View style={[styles.checkCircle, checked && styles.checkCircleActive]}>
                {checked ? <Check size={14} weight="bold" color="#FFFFFF" /> : null}
              </View>
              <ClothingIcon code={item.id} size={32} variant={item.variant} />
              <Text style={[styles.itemText, checked && styles.itemTextChecked]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: SPACING.lg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#CFE5C8',
    backgroundColor: '#F4FBF1',
    padding: SPACING.md,
    gap: SPACING.md,
  },
  header: {
    gap: 2,
  },
  title: {
    color: COLORS.primaryDark,
    fontSize: FONT_SIZE.md,
    fontWeight: '900',
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
  },
  list: {
    gap: SPACING.xs,
  },
  row: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    borderRadius: RADIUS.lg,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(207,229,200,0.9)',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  rowChecked: {
    backgroundColor: '#E1F5DA',
    borderColor: '#AED6A4',
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#AFCBA9',
    backgroundColor: '#FFFFFF',
  },
  checkCircleActive: {
    borderColor: COLORS.primaryDark,
    backgroundColor: COLORS.primaryDark,
  },
  itemText: {
    flex: 1,
    color: COLORS.text,
    fontSize: FONT_SIZE.sm,
    fontWeight: '900',
  },
  itemTextChecked: {
    color: COLORS.textSecondary,
    textDecorationLine: 'line-through',
  },
});
