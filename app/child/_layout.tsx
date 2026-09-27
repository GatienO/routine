import React from 'react';
import { Stack } from 'expo-router';
import { useAppTheme } from '../../src/hooks/useAppTheme';

export default function ChildLayout() {
  const { colors } = useAppTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    />
  );
}
