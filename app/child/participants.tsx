import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function ChildParticipantsRedirect() {
  const router = useRouter();
  const params = useLocalSearchParams<{ routineIds?: string; childIds?: string; routineId?: string }>();

  React.useEffect(() => {
    router.replace({
      pathname: '/child/summary',
      params: {
        routineIds: params.routineIds,
        childIds: params.childIds,
        routineId: params.routineId,
      },
    });
  }, [params.childIds, params.routineId, params.routineIds, router]);

  return null;
}
