import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';

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
            <Text style={{ fontSize: size * 0.5 }}>{emoji}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
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

const styles = StyleSheet.create({
  container: {
    maxHeight: 200,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.md,
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
});
