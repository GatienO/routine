import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { COLORS, RADIUS, SPACING, FONT_SIZE, SHADOWS, TOUCH } from '../../constants/theme';

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
  fullWidth?: boolean;
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
  fullWidth = false,
}: ButtonProps) {
  const bgColor = color || COLORS.primary;

  const containerStyle: ViewStyle[] = [
    styles.base,
    sizes[size],
    variant === 'primary' && { backgroundColor: bgColor, ...SHADOWS.md },
    variant === 'secondary' && {
      backgroundColor: `${COLORS.textLight}10`,
      borderWidth: 1,
      borderColor: COLORS.border,
    },
    variant === 'outline' && {
      borderWidth: 2,
      borderColor: bgColor,
      backgroundColor: `${bgColor}08`,
    },
    variant === 'ghost' && { backgroundColor: 'transparent' },
    disabled && styles.disabled,
    fullWidth && { width: '100%', alignSelf: 'stretch' } as ViewStyle,
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
  sm: {
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md + 4,
    minHeight: TOUCH.minHeight,
  },
  md: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg + 4,
    minHeight: TOUCH.childMinHeight,
  },
  lg: {
    paddingVertical: SPACING.md + 4,
    paddingHorizontal: SPACING.xl + 4,
    minHeight: 64,
  },
};

const textSizes: Record<string, TextStyle> = {
  sm: { fontSize: FONT_SIZE.sm, letterSpacing: 0.1 },
  md: { fontSize: FONT_SIZE.md, letterSpacing: 0.1 },
  lg: { fontSize: FONT_SIZE.lg, letterSpacing: 0.2 },
};

const styles = StyleSheet.create({
  base: {
    borderRadius: RADIUS.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    maxWidth: '100%',
  },
  text: {
    fontWeight: '700',
    flexShrink: 1,
    textAlign: 'center',
  },
  icon: {
    fontSize: FONT_SIZE.lg,
  },
  disabled: {
    opacity: 0.45,
  },
});
