import React from 'react';
import { Stack } from 'expo-router';
import { useParentAccess } from '../../src/hooks/useParentAccess';

export default function ParentLayout() {
  const allowed = useParentAccess();
  if (!allowed) return null;
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' }, animation: 'slide_from_right' }} />;
}
