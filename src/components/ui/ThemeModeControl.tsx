import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Moon, Sun } from 'phosphor-react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useAppStore } from '../../stores/appStore';
import { useFocusRing } from '../../hooks/useFocusRing';

export function ThemeModeControl() {
  const { focusStyle, ...focusProps } = useFocusRing();
  const { colors, mode } = useAppTheme();
  const setThemeMode = useAppStore((state) => state.setThemeMode);
  const isDark = mode === 'dark';
  const Icon = isDark ? Sun : Moon;

  return (
    <Pressable
      {...focusProps}
      accessibilityRole="button"
      accessibilityLabel={isDark ? 'Passer au mode clair' : 'Passer au mode sombre'}
      onPress={() => setThemeMode(isDark ? 'light' : 'dark')}
      style={({ pressed }) => [
        styles.button,
        focusStyle,
        { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.72 : 1 },
      ]}
    >
      <Icon size={19} weight="regular" color={colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});
