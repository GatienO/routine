import { Platform, Dimensions } from 'react-native';

export const COLORS = {
  primary: '#FF6B6B',
  primaryLight: '#FF8E8E',
  primaryDark: '#E85555',
  secondary: '#4ECDC4',
  secondaryLight: '#6ED9D2',
  secondaryDark: '#3BB8B0',
  accent: '#FFE66D',
  accentDark: '#FFD93D',
  background: '#FFF8F0',
  surface: '#FFFFFF',
  surfaceSecondary: '#F5F0EB',
  text: '#2D3436',
  textSecondary: '#636E72',
  textLight: '#B2BEC3',
  success: '#00B894',
  successLight: '#55EFC4',
  warning: '#FDCB6E',
  error: '#FF7675',
  star: '#FDCB6E',
  shadow: '#00000015',
  // Extended palette for richer UI
  primarySoft: '#FFE0E0',
  secondarySoft: '#D4F5F2',
  accentSoft: '#FFF5D0',
  successSoft: '#D0F5EB',
  warningSoft: '#FFF3D0',
  errorSoft: '#FFE0E0',
  border: '#EDE8E3',
  divider: '#F0EBE6',
  overlay: 'rgba(33, 39, 48, 0.4)',
  cardHighlight: '#FFFDFB',
} as const;

export const CHILD_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#FF8C69', '#87CEEB',
  '#98D8C8', '#F7DC6F', '#BB8FCE', '#82E0AA',
] as const;

export const CATEGORY_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  morning: { label: 'Matin', icon: '🌅', color: '#FFE66D' },
  evening: { label: 'Soir', icon: '🌙', color: '#A29BFE' },
  school: { label: 'École', icon: '🎒', color: '#74B9FF' },
  home: { label: 'Maison', icon: '🏠', color: '#55EFC4' },
  weekend: { label: 'Week-end', icon: '🎉', color: '#FD79A8' },
  emotion: { label: 'Émotions', icon: '❤️', color: '#FB7185' },
  custom: { label: 'Personnalisé', icon: '✨', color: '#FDCB6E' },
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
    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  }),
  md: createShadow({
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.12)',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  }),
  lg: createShadow({
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  }),
  glow: (color: string) => createShadow({
    boxShadow: `0px 4px 16px ${color}40`,
    elevation: 6,
    shadowColor: color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
  }),
} as const;

// Child-friendly touch target sizes
export const TOUCH = {
  minHeight: 48,
  childMinHeight: 56,
  childMinWidth: 56,
} as const;

// Shared gradient presets
export const GRADIENTS = {
  warmBackground: ['#FFF8F0', '#FFE8D6', '#FFDCC8'] as const,
  coolBackground: ['#F0F8FF', '#E8F0FE', '#D6E8FF'] as const,
  childHeader: ['#FFF8F0', '#FFE8D6'] as const,
  celebration: ['#FFF8F0', '#FFE8D6', '#FFDCC8'] as const,
  wellness: ['#E8E0F0', '#D0C4E8', '#B8A9D9'] as const,
} as const;

// Section divider style helper
export const SECTION_DIVIDER = {
  height: 1,
  backgroundColor: COLORS.divider,
  marginVertical: SPACING.lg,
} as const;

// Consistent content container widths
export const CONTENT_MAX_WIDTH = {
  sm: 480,
  md: 720,
  lg: 1100,
  xl: 1320,
} as const;
