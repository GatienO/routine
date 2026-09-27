import { useState } from 'react';
import { Platform, type ViewStyle } from 'react-native';
import { useAppTheme } from './useAppTheme';

/** A visible keyboard focus in both themes, without changing layout. */
export function useFocusRing() {
  const [focused, setFocused] = useState(false);
  const { colors } = useAppTheme();
  const focusStyle: ViewStyle | undefined = focused && Platform.OS === 'web'
    ? { outlineStyle: 'solid', outlineWidth: 2, outlineOffset: 2, outlineColor: colors.action }
    : undefined;
  return { onFocus: () => setFocused(true), onBlur: () => setFocused(false), focusStyle };
}
