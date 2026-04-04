import React from 'react';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { useAppStore } from '../../src/stores/appStore';
import { COLORS } from '../../src/constants/theme';

export default function ParentLayout() {
  const router = useRouter();
  const isParentMode = useAppStore((s) => s.isParentMode);

  // Redirect to PIN screen if not authenticated
  useFocusEffect(
    React.useCallback(() => {
      if (!isParentMode) {
        router.replace('/pin');
      }
    }, [isParentMode])
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
