import { Platform } from 'react-native';

export const COLORS = {
  primary: '#D96B6B',
  primaryLight: '#E79595',
  primaryDark: '#C85C5C',
  secondary: '#86C8B1',
  secondaryLight: '#B7E3D3',
  secondaryDark: '#5F9F8A',
  accent: '#F2D7A6',
  accentDark: '#DEBE83',
  background: '#F4F8F5',
  surface: '#FFFFFF',
  surfaceSecondary: '#EDF5F1',
  text: '#55727E',
  textSecondary: '#6C8791',
  textLight: '#A6B8BE',
  success: '#53B78B',
  successLight: '#98DEC0',
  warning: '#E0B874',
  error: '#E28383',
  star: '#E6C26C',
  shadow: '#86A89A22',
  primarySoft: '#F7E0E0',
  secondarySoft: '#E2F3EC',
  accentSoft: '#F8F0DE',
  successSoft: '#E2F5EA',
  warningSoft: '#F9F0DB',
  errorSoft: '#F8E1E1',
  border: '#DCEAE3',
  divider: '#E6F0EB',
  overlay: 'rgba(95, 123, 134, 0.28)',
  cardHighlight: '#F9FCFA',
} as const;

export const CHILD_COLORS = [
  '#D96B6B', '#86C8B1', '#7CB8C7', '#A8D5BF',
  '#F1D79E', '#E8B89C', '#F0A78F', '#9DC9D7',
  '#B1DDD1', '#E6C26C', '#C5D8A8', '#8BC9A5',
] as const;

export const CATEGORY_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  morning: { label: 'Matin', icon: '🌤️', color: '#F2D7A6' },
  evening: { label: 'Soir', icon: '🌙', color: '#9EC6D5' },
  school: { label: 'Ecole', icon: '🎒', color: '#88BDD4' },
  home: { label: 'Maison', icon: '🏠', color: '#9FD6B9' },
  weekend: { label: 'Week-end', icon: '🎉', color: '#E8B89C' },
  emotion: { label: 'Emotions', icon: '❤️', color: '#E59A9A' },
  custom: { label: 'Personnalise', icon: '✨', color: '#D7C48E' },
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
    boxShadow: '0px 8px 18px rgba(134, 168, 154, 0.12)',
    elevation: 2,
    shadowColor: '#86A89A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  }),
  md: createShadow({
    boxShadow: '0px 12px 24px rgba(134, 168, 154, 0.16)',
    elevation: 4,
    shadowColor: '#86A89A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
  }),
  lg: createShadow({
    boxShadow: '0px 18px 34px rgba(134, 168, 154, 0.18)',
    elevation: 8,
    shadowColor: '#86A89A',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
  }),
  glow: (color: string) => createShadow({
    boxShadow: `0px 8px 22px ${color}40`,
    elevation: 6,
    shadowColor: color,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
  }),
} as const;

export const TOUCH = {
  minHeight: 48,
  childMinHeight: 56,
  childMinWidth: 56,
} as const;

export const GRADIENTS = {
  warmBackground: ['#A9CDD6', '#C6E9C2', '#F6ECE2'] as const,
  coolBackground: ['#D8EEF0', '#E5F6ED', '#F4EFE7'] as const,
  childHeader: ['#B8DADF', '#D3EFCB'] as const,
  celebration: ['#B8DADF', '#D4EDC6', '#F4E8DE'] as const,
  wellness: ['#D6ECE8', '#E4F4EB', '#F2ECE5'] as const,
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
