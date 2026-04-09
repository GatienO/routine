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
