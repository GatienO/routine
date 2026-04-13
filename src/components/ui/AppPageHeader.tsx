import React from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { House } from 'phosphor-react-native';
import { BackButton } from './BackButton';
import { COLORS, FONT_SIZE, RADIUS, SHADOWS } from '../../constants/theme';

type AppPageHeaderProps = {
  title: string;
  onBack: () => void;
  onHome: () => void;
};

export function AppPageHeader({ title, onBack, onHome }: AppPageHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.side}>
        <BackButton onPress={onBack} />
      </View>

      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      <View style={[styles.side, styles.sideRight]}>
        <TouchableOpacity onPress={onHome} style={styles.homeButton} activeOpacity={0.8}>
          <House size={24} weight="bold" color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 56,
    gap: 8,
  },
  side: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideRight: {
    alignItems: 'flex-end',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: FONT_SIZE.xl,
    fontWeight: '900',
    color: COLORS.text,
  },
  homeButton: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
});
