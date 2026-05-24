import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { CalendarCheck, Compass, UserGear } from 'phosphor-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONT_SIZE, RADIUS, SHADOWS, SPACING } from '../../constants/theme';

export const APP_BOTTOM_NAV_HEIGHT = 76;

const ITEMS = [
  {
    label: 'Routines',
    href: '/routines',
    match: (pathname: string) =>
      pathname === '/' ||
      pathname.startsWith('/routines') ||
      pathname.startsWith('/today') ||
      pathname.startsWith('/child'),
    Icon: CalendarCheck,
  },
  {
    label: 'Activites',
    href: '/activities',
    match: (pathname: string) => pathname.startsWith('/activities') || pathname.startsWith('/explore'),
    Icon: Compass,
  },
  {
    label: 'Parent',
    href: '/parent',
    match: (pathname: string) => pathname.startsWith('/parent'),
    Icon: UserGear,
  },
] as const;

export function useShouldShowBottomNavigation() {
  const pathname = usePathname();
  return pathname !== '/pin';
}

export function useBottomNavigationOffset() {
  const insets = useSafeAreaInsets();
  const visible = useShouldShowBottomNavigation();
  return visible ? APP_BOTTOM_NAV_HEIGHT + insets.bottom : 0;
}

export function AppBottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const visible = useShouldShowBottomNavigation();

  if (!visible) return null;

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, SPACING.xs) }]}>
      <View style={styles.bar}>
        {ITEMS.map(({ label, href, match, Icon }) => {
          const active = match(pathname);
          const color = active ? COLORS.secondaryDark : COLORS.textLight;

          return (
            <TouchableOpacity
              key={href}
              onPress={() => router.replace(href as any)}
              activeOpacity={0.82}
              accessibilityRole="button"
              accessibilityLabel={label}
              accessibilityState={{ selected: active }}
              style={[styles.item, active && styles.itemActive]}
            >
              <Icon size={22} weight={active ? 'fill' : 'bold'} color={color} />
              <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xs,
    backgroundColor: 'rgba(244,248,245,0.88)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(220,234,227,0.86)',
  },
  bar: {
    minHeight: APP_BOTTOM_NAV_HEIGHT - SPACING.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.xs,
    borderRadius: RADIUS.xl,
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.xs,
    ...SHADOWS.md,
  },
  item: {
    flex: 1,
    minHeight: 58,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    borderRadius: RADIUS.lg,
  },
  itemActive: {
    backgroundColor: COLORS.secondarySoft,
  },
  label: {
    color: COLORS.textLight,
    fontSize: FONT_SIZE.xs,
    fontWeight: '900',
  },
  labelActive: {
    color: COLORS.secondaryDark,
  },
});
