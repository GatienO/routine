import React from 'react';
import { ParentHomeScreen } from '../../src/screens/ParentHomeScreen';
import { useParentAccess } from '../../src/hooks/useParentAccess';

export default function ParentRoute() {
  const allowed = useParentAccess();
  return allowed ? <ParentHomeScreen /> : null;
}
