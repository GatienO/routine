import { Platform } from 'react-native';

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
} as const;
