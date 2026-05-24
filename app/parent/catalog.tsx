import React from 'react';
import { Redirect } from 'expo-router';

export default function CatalogRoute() {
  return <Redirect href="/parent/add-routine?catalog=1" />;
}
