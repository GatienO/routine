import React from 'react';
import { Redirect, useLocalSearchParams } from 'expo-router';

export default function LegacyParticipantsRoute() {
  const params = useLocalSearchParams<{ routineIds?: string; childIds?: string }>();
  return <Redirect href={{ pathname: '/child/summary', params: { ...params, stage: 'prepare' } }} />;
}
