import { Platform } from 'react-native';

export const LIGHT_COLORS = {
  // Semantic identity roles.
  action: '#397862',
  actionSoft: '#B8DFCF',
  time: '#756FB0',
  timeSoft: '#D8D0F2',
  information: '#4F7889',
  informationSoft: '#BFE1EF',
  transition: '#9B6845',
  transitionSoft: '#FFD8AE',
  attention: '#984D49',
  attentionSoft: '#F4B5AE',
  background: '#F7F5EF',
  surface: '#FFFFFF',
  surfaceSecondary: '#EFEEE9',
  text: '#303743',
  textSecondary: '#68707B',
  textLight: '#8A929D',
  border: '#DEDFDC',
  divider: '#E7E7E3',
  overlay: 'rgba(48, 55, 67, 0.28)',
  cardHighlight: '#FBFAF6',
  navigationBackdrop: 'rgba(247, 245, 239, 0.92)',
  // Compatibility aliases while screens migrate to semantic roles.
  primary: '#B8DFCF',
  primaryLight: '#E6F3ED',
  primaryDark: '#397862',
  secondary: '#D8D0F2',
  secondaryLight: '#EEEAF9',
  secondaryDark: '#756FB0',
  accent: '#FFD8AE',
  accentDark: '#9B6845',
  success: '#397862',
  successLight: '#E6F3ED',
  warning: '#C08A4F',
  error: '#984D49',
  star: '#C08A4F',
  shadow: 'rgba(52, 58, 65, 0.10)',
  primarySoft: '#E6F3ED',
  secondarySoft: '#EEEAF9',
  accentSoft: '#FFF0DF',
  successSoft: '#E6F3ED',
  warningSoft: '#FFF0DF',
  errorSoft: '#FBE8E5',
} as const;

export const DARK_COLORS = {
  action: '#A9DDC8',
  actionSoft: '#31594C',
  time: '#C9BFF0',
  timeSoft: '#453E60',
  information: '#AED8E9',
  informationSoft: '#304F5E',
  transition: '#F1C394',
  transitionSoft: '#5B4633',
  attention: '#F0ABA5',
  attentionSoft: '#5B373B',
  background: '#171B23',
  surface: '#222834',
  surfaceSecondary: '#2C3340',
  text: '#F5F3ED',
  textSecondary: '#B5BDC8',
  textLight: '#929CAA',
  border: '#394351',
  divider: '#343D4A',
  overlay: 'rgba(5, 7, 10, 0.58)',
  cardHighlight: '#272E3A',
  navigationBackdrop: 'rgba(23, 27, 35, 0.94)',
  primary: '#31594C',
  primaryLight: '#263F38',
  primaryDark: '#A9DDC8',
  secondary: '#453E60',
  secondaryLight: '#373249',
  secondaryDark: '#C9BFF0',
  accent: '#5B4633',
  accentDark: '#F1C394',
  success: '#A9DDC8',
  successLight: '#263F38',
  warning: '#F1C394',
  error: '#F0ABA5',
  star: '#F1C394',
  shadow: 'rgba(0, 0, 0, 0.28)',
  primarySoft: '#263F38',
  secondarySoft: '#373249',
  accentSoft: '#493A2D',
  successSoft: '#263F38',
  warningSoft: '#493A2D',
  errorSoft: '#4B3033',
} as const;

export type ThemeMode = 'system' | 'light' | 'dark';
export type ResolvedThemeMode = Exclude<ThemeMode, 'system'>;
export type ThemeColors = { [Key in keyof typeof LIGHT_COLORS]: string };

export const COLOR_SCHEMES: Record<ResolvedThemeMode, ThemeColors> = {
  light: LIGHT_COLORS,
  dark: DARK_COLORS,
};

// Kept as the light palette until each legacy screen is migrated to useAppTheme().
export const COLORS = LIGHT_COLORS;

export const CHILD_COLORS = [
  '#A8C79D', '#B8AEDF', '#F3D9D5', '#F3D6C4',
  '#D5B985', '#C7DDBF', '#D8D1F1', '#E8C2B8',
  '#98B58E', '#A49BD3', '#DDAEA3', '#E6D4B8',
] as const;

export const CATEGORY_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  morning: { label: 'Matin', icon: '\u2600\uFE0F', color: '#D5B985' },
  evening: { label: 'Soir', icon: '\u{1F319}', color: '#B8AEDF' },
  school: { label: 'Ecole', icon: '\u{1F392}', color: '#A8C79D' },
  home: { label: 'Maison', icon: '\u{1F3E0}', color: '#C7DDBF' },
  weekend: { label: 'Week-end', icon: '\u{1F389}', color: '#F3D6C4' },
  emotion: { label: 'Emotions', icon: '\u2764\uFE0F', color: '#F3D9D5' },
  custom: { label: 'Personnalise', icon: '\u2728', color: '#D8D1F1' },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

export const FONT_SIZE = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  hero: 48,
} as const;

function createShadow({
  boxShadow,
  elevation,
  shadowColor,
  shadowOffset,
  shadowOpacity,
  shadowRadius,
}: {
  boxShadow: string;
  elevation: number;
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
}) {
  if (Platform.OS === 'web') {
    return {
      boxShadow,
      elevation,
    };
  }

  return {
    shadowColor,
    shadowOffset,
    shadowOpacity,
    shadowRadius,
    elevation,
  };
}

export const SHADOWS = {
  sm: createShadow({
    boxShadow: '0px 8px 18px rgba(74, 63, 50, 0.06)',
    elevation: 1,
    shadowColor: '#4A3F32',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
  }),
  md: createShadow({
    boxShadow: '0px 12px 28px rgba(74, 63, 50, 0.09)',
    elevation: 3,
    shadowColor: '#4A3F32',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.09,
    shadowRadius: 18,
  }),
  lg: createShadow({
    boxShadow: '0px 18px 38px rgba(74, 63, 50, 0.11)',
    elevation: 6,
    shadowColor: '#4A3F32',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.11,
    shadowRadius: 24,
  }),
  glow: (color: string) => createShadow({
    boxShadow: `0px 10px 26px ${color}33`,
    elevation: 4,
    shadowColor: color,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
  }),
} as const;

export const TOUCH = {
  minHeight: 48,
  childMinHeight: 56,
  childMinWidth: 56,
} as const;

export const GRADIENTS = {
  warmBackground: ['#FAF6EE', '#FFFDF8', '#F1E8D9'] as const,
  coolBackground: ['#FAF6EE', '#EAF3E8', '#E6E1F7'] as const,
  childHeader: ['#EAF3E8', '#FAF6EE'] as const,
  celebration: ['#FAF6EE', '#F3D9D5', '#EAF3E8'] as const,
  wellness: ['#FAF6EE', '#EAF3E8', '#E6E1F7'] as const,
} as const;

export const SECTION_DIVIDER = {
  height: 1,
  backgroundColor: COLORS.divider,
  marginVertical: SPACING.lg,
} as const;

export const CONTENT_MAX_WIDTH = {
  sm: 480,
  md: 720,
  lg: 1100,
  xl: 1320,
} as const;
