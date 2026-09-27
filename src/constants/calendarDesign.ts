import { COLORS } from './theme';
import { CalendarEventKind } from '../types/calendar';

export const CALENDAR_COLORS = {
  ink: COLORS.text,
  muted: COLORS.textSecondary,
  softMuted: COLORS.textLight,
  page: COLORS.background,
  card: COLORS.surface,
  mint: COLORS.primary,
  mintSoft: COLORS.primarySoft,
  lavender: COLORS.secondary,
  lavenderDark: COLORS.secondaryDark,
  coral: COLORS.error,
  peach: COLORS.accent,
  sky: '#C7DDBF',
  rose: '#F3D9D5',
  moon: '#756FB0',
  yellow: COLORS.warning,
  lilac: COLORS.secondaryLight,
} as const;

export const CALENDAR_GRADIENTS = {
  today: ['#A8C79D', '#C7DDBF'] as [string, string],
  week: ['#F3D6C4', '#F1E7D1'] as [string, string],
  dodos: ['#756FB0', '#B8AEDF'] as [string, string],
  tomorrow: ['#F3D9D5', '#F3D6C4'] as [string, string],
  page: ['#FAF6EE', '#FFFDF8', '#F1E8D9'] as [string, string, string],
  calmNight: ['#756FB0', '#6F6A93'] as [string, string],
} as const;

export const CALENDAR_EVENT_KIND_CONFIG: Record<
  CalendarEventKind,
  { label: string; icon: string; color: string; soft: string }
> = {
  special: { label: 'Special', icon: '\u2B50', color: COLORS.warning, soft: COLORS.warningSoft },
  birthday: { label: 'Anniversaire', icon: '\u{1F382}', color: COLORS.error, soft: COLORS.errorSoft },
  holiday: { label: 'Vacances', icon: '\u{1F3D6}\uFE0F', color: COLORS.secondary, soft: COLORS.secondarySoft },
  school: { label: 'Ecole', icon: '\u{1F392}', color: COLORS.primary, soft: COLORS.primarySoft },
  home: { label: 'Maison', icon: '\u{1F3E0}', color: '#C7DDBF', soft: '#EFF6EC' },
  health: { label: 'Docteur', icon: '\u{1FA7A}', color: COLORS.error, soft: COLORS.errorSoft },
  routine: { label: 'Routine', icon: '\u{1F9E9}', color: COLORS.secondary, soft: COLORS.secondarySoft },
  activity: { label: 'Activite', icon: '\u{1F3A8}', color: COLORS.accent, soft: COLORS.accentSoft },
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
