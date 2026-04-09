import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PlusCircle } from 'phosphor-react-native';
import {
  STEP_CATALOG_CATEGORIES,
  STEP_CATALOG_ITEMS,
  StepCatalogItem,
} from '../../constants/stepCatalog';
import { COLORS, FONT_SIZE, RADIUS, SHADOWS, SPACING } from '../../constants/theme';
import { OpenMoji } from '../ui/OpenMoji';

interface StepCatalogPickerProps {
  accentColor: string;
  onSelect: (item: StepCatalogItem) => void;
}

export function StepCatalogPicker({ accentColor, onSelect }: StepCatalogPickerProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState(STEP_CATALOG_CATEGORIES[0].id);

  const visibleItems = useMemo(
    () => STEP_CATALOG_ITEMS.filter((item) => item.categoryId === selectedCategoryId),
    [selectedCategoryId],
  );

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.title}>Catalogue d etapes</Text>
        <Text style={styles.subtitle}>Ajoute une etape type puis personnalise-la si besoin.</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryRow}
      >
        {STEP_CATALOG_CATEGORIES.map((category) => {
          const isActive = category.id === selectedCategoryId;

          return (
            <TouchableOpacity
              key={category.id}
              onPress={() => setSelectedCategoryId(category.id)}
              style={[
                styles.categoryChip,
                isActive && {
                  borderColor: accentColor,
                  backgroundColor: `${accentColor}22`,
                },
              ]}
            >
              <OpenMoji emoji={category.icon} size={18} />
              <Text style={[styles.categoryText, isActive && { color: COLORS.text }]}>
                {category.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.grid}>
        {visibleItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => onSelect(item)}
            activeOpacity={0.9}
            style={styles.itemCard}
          >
            <View style={[styles.itemIconWrap, { backgroundColor: `${accentColor}16` }]}>
              <OpenMoji emoji={item.icon} size={28} />
            </View>
            <View style={styles.itemContent}>
              <Text style={styles.itemTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.itemMeta}>
                {item.durationMinutes} min · {item.isRequired ? 'Obligatoire' : 'Facultatif'}
              </Text>
            </View>
            <PlusCircle size={20} weight="fill" color={accentColor} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  header: {
    gap: 2,
  },
  title: {
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  categoryRow: {
    gap: SPACING.sm,
    paddingRight: SPACING.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.surfaceSecondary,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  categoryText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  itemCard: {
    minWidth: 220,
    flexGrow: 1,
    flexBasis: 220,
    maxWidth: 320,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceSecondary,
    ...SHADOWS.sm,
  },
  itemIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemContent: {
    flex: 1,
    gap: 2,
  },
  itemTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '800',
    color: COLORS.text,
  },
  itemMeta: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
});
