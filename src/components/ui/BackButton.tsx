import React from 'react';
import { StyleProp, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { ArrowLeft } from 'phosphor-react-native';
import { COLORS, RADIUS, SHADOWS } from '../../constants/theme';

interface BackButtonProps {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  iconColor?: string;
}

export function BackButton({ onPress, style, iconColor = COLORS.textSecondary }: BackButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.button, style]} activeOpacity={0.8}>
      <ArrowLeft size={26} weight="bold" color={iconColor} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
});
