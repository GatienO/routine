import React from 'react';
import { Stack, useRouter, useFocusEffect, useLocalSearchParams, usePathname } from 'expo-router';
import { useAppStore } from '../../src/stores/appStore';
import { COLORS } from '../../src/constants/theme';

export default function ParentLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useLocalSearchParams<Record<string, string | string[]>>();
  const isParentMode = useAppStore((s) => s.isParentMode);
  const redirectTarget = React.useMemo(
    () => buildRedirectTarget(pathname, searchParams),
    [pathname, searchParams]
  );

  // Redirect to PIN screen if not authenticated
  useFocusEffect(
    React.useCallback(() => {
      if (!isParentMode) {
        router.replace({
          pathname: '/pin',
          params: { redirect: redirectTarget },
        } as any);
      }
    }, [isParentMode, redirectTarget, router])
  );

  if (!isParentMode) return null;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
        animation: 'slide_from_right',
      }}
    />
  );
}

function buildRedirectTarget(pathname: string, params: Record<string, string | string[]>) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    const values = Array.isArray(value) ? value : [value];
    values.forEach((item) => query.append(key, item));
  });

  const queryString = query.toString();
  return queryString ? `${pathname}?${queryString}` : pathname;
}
