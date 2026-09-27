import React from 'react';
import { Redirect } from 'expo-router';
import { LEGACY_ROUTE_REDIRECTS } from '../../src/constants/navigation';

export default function CatalogRoute() {
  return <Redirect href={LEGACY_ROUTE_REDIRECTS['/parent/catalog']} />;
}
