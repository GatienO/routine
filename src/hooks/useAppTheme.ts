import { useColorScheme } from 'react-native';
import { COLOR_SCHEMES, ResolvedThemeMode } from '../constants/theme';
import { useAppStore } from '../stores/appStore';

export function useAppTheme() {
  const systemScheme = useColorScheme();
  const themeMode = useAppStore((state) => state.themeMode);
  const resolvedMode: ResolvedThemeMode =
    themeMode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : themeMode;

  return {
    colors: COLOR_SCHEMES[resolvedMode],
    isDark: resolvedMode === 'dark',
    mode: resolvedMode,
    preference: themeMode,
  };
}
