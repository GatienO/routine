import { SPACING } from '../constants/theme';

export function getDeviceSize(width: number): 'phone' | 'tablet' | 'desktop' | 'wide' {
  if (width < 600) return 'phone';
  if (width < 960) return 'tablet';
  if (width < 1400) return 'desktop';
  return 'wide';
}

export function getResponsiveColumns(
  width: number,
  config: {
    phone: number;
    tablet: number;
    desktop: number;
    wide?: number;
  },
): number {
  const size = getDeviceSize(width);
  if (size === 'phone') return config.phone;
  if (size === 'tablet') return config.tablet;
  if (size === 'desktop') return config.desktop;
  return config.wide ?? config.desktop;
}

export function getGridItemWidth(containerWidth: number, columns: number, gap: number): number {
  if (columns <= 1) return containerWidth;
  return Math.max(0, (containerWidth - gap * (columns - 1)) / columns);
}

/** Returns responsive content padding based on screen width */
export function getContentPadding(width: number): number {
  const size = getDeviceSize(width);
  if (size === 'phone') return SPACING.md;
  if (size === 'tablet') return SPACING.lg;
  return SPACING.xl;
}

/** Returns a constrained content width with appropriate margins */
export function getContentWidth(screenWidth: number, maxWidth: number): number {
  const padding = getContentPadding(screenWidth);
  return Math.min(screenWidth - padding * 2, maxWidth);
}

/** Returns responsive font scale factor */
export function getFontScale(width: number): number {
  if (width < 360) return 0.9;
  if (width < 600) return 1;
  if (width < 960) return 1.05;
  return 1.1;
}
