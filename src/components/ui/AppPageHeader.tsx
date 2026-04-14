import React from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { House } from 'phosphor-react-native';
import { BackButton } from './BackButton';
import { COLORS, FONT_SIZE, RADIUS, SHADOWS, TOUCH } from '../../constants/theme';

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
        <TouchableOpacity onPress={onHome} style={styles.homeButton} activeOpacity={0.75}>
          <House size={22} weight="bold" color={COLORS.textSecondary} />
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
    minHeight: 60,
    gap: 8,
  },
  side: {
    width: TOUCH.childMinHeight,
    height: TOUCH.childMinHeight,
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
    letterSpacing: -0.3,
  },
  homeButton: {
    width: TOUCH.childMinHeight,
    height: TOUCH.childMinHeight,
    borderRadius: TOUCH.childMinHeight / 2,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
});
