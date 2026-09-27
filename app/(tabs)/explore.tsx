import { Redirect } from 'expo-router';
import { LEGACY_ROUTE_REDIRECTS } from '../../src/constants/navigation';

export default function ExploreRoute() {
  return <Redirect href={LEGACY_ROUTE_REDIRECTS['/explore']} />;
}
