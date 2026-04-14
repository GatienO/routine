import React from 'react';
import { StyleProp, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { ArrowLeft } from 'phosphor-react-native';
import { COLORS, RADIUS, SHADOWS, TOUCH } from '../../constants/theme';

interface BackButtonProps {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  iconColor?: string;
}

export function BackButton({ onPress, style, iconColor = COLORS.textSecondary }: BackButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.button, style]} activeOpacity={0.75}>
      <ArrowLeft size={24} weight="bold" color={iconColor} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
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
