import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { COLORS, RADIUS, SPACING, FONT_SIZE, SHADOWS } from '../../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  disabled?: boolean;
  loading?: boolean;
  color?: string;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  disabled = false,
  loading = false,
  color,
  style,
}: ButtonProps) {
  const bgColor = color || COLORS.primary;

  const containerStyle: ViewStyle[] = [
    styles.base,
    sizes[size],
    variant === 'primary' && { backgroundColor: bgColor, ...SHADOWS.md },
    variant === 'secondary' && { backgroundColor: COLORS.surfaceSecondary },
    variant === 'outline' && { borderWidth: 2, borderColor: bgColor, backgroundColor: 'transparent' },
    variant === 'ghost' && { backgroundColor: 'transparent' },
    disabled && styles.disabled,
    style as ViewStyle,
  ].filter(Boolean) as ViewStyle[];

  const textStyle: TextStyle[] = [
    styles.text,
    textSizes[size],
    variant === 'primary' && { color: '#FFF' },
    variant === 'secondary' && { color: COLORS.text },
    variant === 'outline' && { color: bgColor },
    variant === 'ghost' && { color: bgColor },
  ].filter(Boolean) as TextStyle[];

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#FFF' : bgColor} />
      ) : (
        <>
          {icon ? <Text style={styles.icon}>{icon}</Text> : null}
          <Text style={textStyle}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const sizes: Record<string, ViewStyle> = {
  sm: { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md, minHeight: 40 },
  md: { paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg, minHeight: 52 },
  lg: { paddingVertical: SPACING.lg, paddingHorizontal: SPACING.xl, minHeight: 64 },
};

const textSizes: Record<string, TextStyle> = {
  sm: { fontSize: FONT_SIZE.sm },
  md: { fontSize: FONT_SIZE.md },
  lg: { fontSize: FONT_SIZE.lg },
};

const styles = StyleSheet.create({
  base: {
    borderRadius: RADIUS.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  text: {
    fontWeight: '700',
  },
  icon: {
    fontSize: FONT_SIZE.lg,
  },
  disabled: {
    opacity: 0.5,
  },
});
