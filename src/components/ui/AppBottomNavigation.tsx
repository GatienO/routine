import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useGlobalSearchParams, usePathname, useRouter } from 'expo-router';
import { Check, GearSix, LockSimple, Sparkle } from 'phosphor-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { APP_DESTINATIONS, getActiveDestination, shouldShowBottomNavigation } from '../../constants/navigation';
import { FONT_SIZE, RADIUS, SPACING } from '../../constants/theme';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useAppStore } from '../../stores/appStore';
import { useChildrenStore } from '../../stores/childrenStore';
import { useLocalProfileStore } from '../../stores/localProfileStore';

import { beginPinNavigation, routeWithParams } from '../../utils/pinNavigation';

export const APP_BOTTOM_NAV_HEIGHT = 76;
const subscribeAppHydration = (notify: () => void) => useAppStore.persist.onFinishHydration(notify);
const appHydratedSnapshot = () => useAppStore.persist.hasHydrated();

const DESTINATION_ICONS = {
  routines: Check,
  activities: Sparkle,
  parent: GearSix,
} as const;

export function useShouldShowBottomNavigation() {
  const pathname = usePathname();
  const profileName = useLocalProfileStore((state) => state.profileName);
  const onboardingActive = useLocalProfileStore((state) => state.onboardingActive);
  return Boolean(profileName) && !onboardingActive && shouldShowBottomNavigation(pathname);
}

export function useBottomNavigationOffset() {
  const insets = useSafeAreaInsets();
  const visible = useShouldShowBottomNavigation();
  return visible ? APP_BOTTOM_NAV_HEIGHT + insets.bottom : 0;
}

export function AppBottomNavigation({ onHeightChange }: { onHeightChange?: (height: number) => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const visible = useShouldShowBottomNavigation();
  const params = useGlobalSearchParams<Record<string, string | string[]>>();
  const { colors } = useAppTheme();
  const appHydrated = useSyncExternalStore(subscribeAppHydration, appHydratedSnapshot, () => false);
  const parentPinEnabled = useAppStore((state) => Boolean(state.parentPin));
  const isParentMode = useAppStore((state) => state.isParentMode);
  const childrenHydrated = useChildrenStore((state) => state.hasHydrated);
  const childCount = useChildrenStore((state) => state.children.length);
  const parentLocked = !appHydrated || !childrenHydrated || (!isParentMode && (parentPinEnabled || childCount > 0));
  const parentButton = useRef<React.ElementRef<typeof TouchableOpacity>>(null);
  const [focusedKey, setFocusedKey] = useState<string | null>(null);
  const previousPath = useRef(pathname);
  useEffect(() => {
    if (previousPath.current === '/pin' && visible) parentButton.current?.focus();
    previousPath.current = pathname;
  }, [pathname, visible]);
  const setParentMode = useAppStore((state) => state.setParentMode);
  const activeDestination = getActiveDestination(pathname);

  if (!visible) return null;

  return (
    <View
      nativeID="app-bottom-navigation"
      onLayout={(event) => onHeightChange?.(event.nativeEvent.layout.height)}
      style={[
        styles.wrap,
        {
          paddingBottom: insets.bottom,
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
      ]}
    >
      <View style={[styles.bar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {APP_DESTINATIONS.map(({ key, label, href }) => {
          const Icon = DESTINATION_ICONS[key];
          const active = activeDestination === key;
          const color = active ? colors.action : colors.textSecondary;
          const showLock = key === 'parent' && parentLocked;
          const isParentTab = key === 'parent';

          const handlePress = () => {
            if (isParentTab && parentLocked) {
              setParentMode(false);
              router.push({
                pathname: '/pin',
                params: { redirect: '/parent', returnTo: beginPinNavigation(routeWithParams(pathname, params)) },
              } as any);
              return;
            }

            router.replace(href as any);

          };

          return (
            <TouchableOpacity aria-current={active ? 'page' : undefined}
              key={href}
              ref={isParentTab ? parentButton : undefined}
              onFocus={() => setFocusedKey(key)}
              onBlur={() => setFocusedKey(null)}
              onPress={handlePress}
              activeOpacity={0.82}
              accessibilityRole="button"
              accessibilityLabel={isParentTab ? `${label}, ${showLock ? 'verrouillé' : 'déverrouillé'}` : label}
              accessibilityState={{ selected: active }}
              style={[
                styles.item,
                focusedKey === key && Platform.OS === 'web' && { outlineStyle: 'solid', outlineWidth: 2, outlineOffset: -2, outlineColor: colors.action },
                active && styles.itemActive,
                active && { backgroundColor: colors.actionSoft },
              ]}
            >
              <View style={styles.iconWrap}>
                <Icon size={22} weight="regular" color={color} />
                {showLock ? (
                  <View
                    style={[
                      styles.lockBadge,
                      { backgroundColor: colors.surface, borderColor: colors.surface },
                    ]}
                  >
                    <LockSimple size={12} weight="regular" color={colors.textSecondary} />
                  </View>
                ) : null}
              </View>
              <Text
                style={[
                  styles.label,
                  { color: colors.textSecondary },
                  active && styles.labelActive,
                  active && { color: colors.action },
                ]}
              >
                {label}
              </Text>
              <View style={[styles.activeLine, { backgroundColor: active ? colors.action : 'transparent' }]} />
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
    zIndex: 1000,
    elevation: 1000,
    borderTopWidth: 1,
  },
  bar: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    minHeight: APP_BOTTOM_NAV_HEIGHT - 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.xs,

    padding: SPACING.xs,

  },
  item: {
    flex: 1,
    minHeight: 64,
    paddingVertical: 5,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: RADIUS.lg,
  },
  activeLine: { width: 22, height: 3, borderRadius: 2 },
  itemActive: {
    backgroundColor: 'transparent',
  },
  iconWrap: {
    position: 'relative',
    width: 28,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockBadge: {
    position: 'absolute',
    top: -3,
    right: 0,
    width: 15,
    height: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  label: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
  },
  labelActive: {
    fontWeight: '700',
  },
});
