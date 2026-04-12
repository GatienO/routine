import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, SafeAreaView, Pressable } from 'react-native';
import { X } from 'phosphor-react-native';
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOWS } from '../../constants/theme';
import { OpenMoji } from './OpenMoji';

interface EmojiPickerProps {
  emojis: readonly string[];
  selected: string;
  onSelect: (emoji: string) => void;
  size?: number;
}

export function EmojiPicker({ emojis, selected, onSelect, size = 48 }: EmojiPickerProps) {
  return (
    <ScrollView horizontal={false} style={styles.container}>
      <View style={styles.grid}>
        {emojis.map((emoji) => (
          <TouchableOpacity
            key={emoji}
            style={[
              styles.item,
              { width: size, height: size },
              selected === emoji && styles.selected,
            ]}
            onPress={() => onSelect(emoji)}
            activeOpacity={0.7}
          >
            <OpenMoji emoji={emoji} size={size * 0.62} />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

interface IconSelectionFieldProps {
  emojis: readonly string[];
  groups?: ReadonlyArray<{
    key: string;
    label: string;
    emojis: readonly string[];
  }>;
  selected?: string;
  onSelect: (emoji: string) => void;
  title: string;
  subtitle?: string;
  previewSize?: number;
}

export function IconSelectionField({
  emojis,
  groups,
  selected,
  onSelect,
  title,
  subtitle = 'Modifier',
  previewSize = 72,
}: IconSelectionFieldProps) {
  const [visible, setVisible] = React.useState(false);
  const currentIcon = selected || emojis[0] || '⭐';
  const resolvedGroups = React.useMemo(
    () => (groups && groups.length > 0 ? groups : [{ key: 'all', label: 'Toutes', emojis }]),
    [emojis, groups],
  );
  const findGroupKey = React.useCallback(
    (emoji: string) => resolvedGroups.find((group) => group.emojis.includes(emoji))?.key ?? resolvedGroups[0]?.key ?? 'all',
    [resolvedGroups],
  );
  const [activeGroupKey, setActiveGroupKey] = React.useState(() => findGroupKey(currentIcon));

  React.useEffect(() => {
    if (visible) {
      setActiveGroupKey(findGroupKey(currentIcon));
    }
  }, [currentIcon, findGroupKey, visible]);

  const activeGroup =
    resolvedGroups.find((group) => group.key === activeGroupKey) ??
    resolvedGroups[0] ?? { key: 'all', label: 'Toutes', emojis };

  return (
    <>
      <TouchableOpacity style={styles.iconField} onPress={() => setVisible(true)} activeOpacity={0.8}>
        <View style={styles.fieldPreviewBox}>
          <View style={[styles.iconFieldPreview, { width: previewSize, height: previewSize, borderRadius: previewSize / 2.4 }]}>
          <OpenMoji emoji={currentIcon} size={previewSize * 0.62} />
          </View>
        </View>
        <Text style={styles.iconFieldText}>{subtitle}</Text>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <SafeAreaView style={styles.overlaySafe}>
            <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>{title}</Text>
                <TouchableOpacity onPress={() => setVisible(false)} style={styles.closeButton} activeOpacity={0.85}>
                  <X size={18} weight="bold" color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.tabsRow}
                style={styles.tabsScroller}
              >
                {resolvedGroups.map((group) => {
                  const isActive = group.key === activeGroup.key;
                  return (
                    <TouchableOpacity
                      key={group.key}
                      style={[styles.tabChip, isActive && styles.tabChipActive]}
                      onPress={() => setActiveGroupKey(group.key)}
                      activeOpacity={0.85}
                    >
                      <Text style={[styles.tabChipText, isActive && styles.tabChipTextActive]}>{group.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              <EmojiPicker
                emojis={activeGroup.emojis}
                selected={currentIcon}
                onSelect={(emoji) => {
                  onSelect(emoji);
                  setVisible(false);
                }}
                size={64}
              />
              </Pressable>
            </SafeAreaView>
        </Pressable>
      </Modal>
    </>
  );
}

interface CategorySelectionFieldProps {
  options: ReadonlyArray<{
    key: string;
    label: string;
    icon: string;
    color: string;
  }>;
  selected: string;
  onSelect: (key: string) => void;
  title: string;
  subtitle?: string;
}

export function CategorySelectionField({
  options,
  selected,
  onSelect,
  title,
  subtitle = 'Modifier',
}: CategorySelectionFieldProps) {
  const [visible, setVisible] = React.useState(false);
  const currentOption = options.find((option) => option.key === selected) ?? options[0];

  if (!currentOption) {
    return null;
  }

  return (
    <>
      <TouchableOpacity style={styles.iconField} onPress={() => setVisible(true)} activeOpacity={0.8}>
        <View style={styles.fieldPreviewBox}>
          <View
            style={[
              styles.categoryPreview,
              {
                backgroundColor: `${currentOption.color}26`,
                borderColor: currentOption.color,
              },
            ]}
          >
            <OpenMoji emoji={currentOption.icon} size={24} />
            <Text style={styles.categoryPreviewText} numberOfLines={1}>
              {currentOption.label}
            </Text>
          </View>
        </View>
        <Text style={styles.iconFieldText}>{subtitle}</Text>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <SafeAreaView style={styles.overlaySafe}>
            <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>{title}</Text>
                <TouchableOpacity onPress={() => setVisible(false)} style={styles.closeButton} activeOpacity={0.85}>
                  <X size={18} weight="bold" color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>
              <View style={styles.grid}>
                {options.map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    style={[
                      styles.categoryOption,
                      {
                        backgroundColor: selected === option.key ? `${option.color}26` : COLORS.surface,
                        borderColor: selected === option.key ? option.color : COLORS.surfaceSecondary,
                      },
                    ]}
                    onPress={() => {
                      onSelect(option.key);
                      setVisible(false);
                    }}
                    activeOpacity={0.8}
                  >
                    <OpenMoji emoji={option.icon} size={24} />
                    <Text style={styles.categoryPreviewText}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Pressable>
          </SafeAreaView>
        </Pressable>
      </Modal>
    </>
  );
}

interface ColorPickerProps {
  colors: readonly string[];
  selected: string;
  onSelect: (color: string) => void;
  size?: number;
}

export function ColorPicker({ colors, selected, onSelect, size = 40 }: ColorPickerProps) {
  return (
    <View style={styles.grid}>
      {colors.map((color) => (
        <TouchableOpacity
          key={color}
          style={[
            styles.colorItem,
            {
              width: size,
              height: size,
              backgroundColor: color,
              borderRadius: size / 2,
            },
            selected === color && { borderWidth: 3, borderColor: COLORS.text },
          ]}
          onPress={() => onSelect(color)}
          activeOpacity={0.7}
        />
      ))}
    </View>
  );
}

interface ColorSelectionFieldProps {
  colors: readonly string[];
  selected: string;
  onSelect: (color: string) => void;
  title: string;
  subtitle?: string;
}

export function ColorSelectionField({
  colors,
  selected,
  onSelect,
  title,
  subtitle = 'Modifier',
}: ColorSelectionFieldProps) {
  const [visible, setVisible] = React.useState(false);
  const currentColor = selected || colors[0] || COLORS.primary;

  return (
    <>
      <TouchableOpacity style={styles.iconField} onPress={() => setVisible(true)} activeOpacity={0.8}>
        <View style={styles.fieldPreviewBox}>
          <View style={[styles.colorPreview, { backgroundColor: currentColor }]} />
        </View>
        <Text style={styles.iconFieldText}>{subtitle}</Text>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <SafeAreaView style={styles.overlaySafe}>
            <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>{title}</Text>
                <TouchableOpacity onPress={() => setVisible(false)} style={styles.closeButton} activeOpacity={0.85}>
                  <X size={18} weight="bold" color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>
              <ColorPicker
                colors={colors}
                selected={currentColor}
                onSelect={(color) => {
                  onSelect(color);
                  setVisible(false);
                }}
                size={54}
              />
            </Pressable>
          </SafeAreaView>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    maxHeight: 420,
  },
  tabsScroller: {
    marginBottom: SPACING.lg,
    flexGrow: 0,
  },
  tabsRow: {
    gap: SPACING.sm,
    paddingRight: SPACING.md,
  },
  tabChip: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.surfaceSecondary,
  },
  tabChipActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accentDark,
  },
  tabChipText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  tabChipTextActive: {
    color: COLORS.text,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surfaceSecondary,
  },
  selected: {
    backgroundColor: COLORS.accent,
    borderWidth: 2,
    borderColor: COLORS.accentDark,
  },
  colorItem: {
    borderWidth: 2,
    borderColor: 'transparent',
  },
  iconField: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: SPACING.xs,
    width: 118,
  },
  fieldPreviewBox: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconFieldPreview: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1,
    borderColor: COLORS.surfaceSecondary,
  },
  iconFieldText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  categoryPreview: {
    width: 84,
    height: 84,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    borderRadius: 22,
    borderWidth: 2,
  },
  categoryPreviewText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    minHeight: 64,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.full,
    borderWidth: 2,
    backgroundColor: COLORS.surface,
  },
  colorPreview: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: COLORS.surfaceSecondary,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(20, 24, 38, 0.42)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
  },
  overlaySafe: {
    flex: 1,
  },
  sheet: {
    marginTop: SPACING.lg,
    maxHeight: '88%',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    ...SHADOWS.lg,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  sheetTitle: {
    flex: 1,
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    color: COLORS.text,
  },
  closeButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.surfaceSecondary,
  },
});
