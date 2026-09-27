import React from 'react';
import { Stack } from 'expo-router';
import { useAppTheme } from '../../src/hooks/useAppTheme';
import { useParentAccess } from '../../src/hooks/useParentAccess';

export default function ParentLayout() {
  const allowed = useParentAccess();
  const { colors } = useAppTheme();
  if (!allowed) return null;
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background }, animation: 'slide_from_right' }} />;
}