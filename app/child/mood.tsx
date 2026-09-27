import React from 'react';
import { Redirect, useLocalSearchParams } from 'expo-router';

export default function LegacyMoodRoute() {
  const params = useLocalSearchParams<{ routineId?: string; chainIds?: string; childId?: string }>();
  return (
    <Redirect
      href={{
        pathname: '/child/summary',
        params: {
          routineIds: params.chainIds ?? params.routineId ?? '',
          childIds: params.childId ?? '',
          stage: 'mood',
        },
      }}
    />
  );
}
