import { CalendarEventKind } from '../types/calendar';

export const CALENDAR_COLORS = {
  ink: '#314755',
  muted: '#7A8E98',
  softMuted: '#A9BAC2',
  page: '#EDF7E8',
  card: '#FFFFFF',
  mint: '#A8E6CF',
  mintSoft: '#EAF8E8',
  lavender: '#9B7FE8',
  lavenderDark: '#6C63FF',
  coral: '#FF8B6A',
  peach: '#FFCCAA',
  sky: '#74B9FF',
  rose: '#FF9FB2',
  moon: '#4834C7',
  yellow: '#FFD166',
  lilac: '#C5A3FF',
} as const;

export const CALENDAR_GRADIENTS = {
  today: ['#9B7FE8', '#6C63FF'] as [string, string],
  week: ['#FF8B6A', '#FFD166'] as [string, string],
  dodos: ['#1A1040', '#4834C7'] as [string, string],
  tomorrow: ['#FF9FB2', '#FF6B9D'] as [string, string],
  page: ['#DFF5D9', '#F7F2E8', '#FFF8EF'] as [string, string, string],
  calmNight: ['#2D1B69', '#1A1040'] as [string, string],
} as const;

export const CALENDAR_EVENT_KIND_CONFIG: Record<
  CalendarEventKind,
  { label: string; icon: string; color: string; soft: string }
> = {
  special: { label: 'Special', icon: '⭐', color: '#FFD166', soft: '#FFF5D6' },
  birthday: { label: 'Anniversaire', icon: '🎂', color: '#FF9FB2', soft: '#FFE9EF' },
  holiday: { label: 'Vacances', icon: '🏖️', color: '#74B9FF', soft: '#E8F4FF' },
  school: { label: 'Ecole', icon: '🎒', color: '#74B9FF', soft: '#E8F4FF' },
  home: { label: 'Maison', icon: '🏠', color: '#A8E6CF', soft: '#EAF8E8' },
  health: { label: 'Docteur', icon: '🩺', color: '#FF8B6A', soft: '#FFEDE7' },
  routine: { label: 'Routine', icon: '🧩', color: '#C5A3FF', soft: '#F0E9FF' },
};

export const CALENDAR_SPACING = {
  page: 16,
  card: 16,
  cluster: 12,
  item: 8,
} as const;

export const CALENDAR_RADIUS = {
  sm: 16,
  md: 22,
  lg: 28,
  xl: 34,
  pill: 999,
} as const;
