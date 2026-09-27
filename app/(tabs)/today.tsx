import { Redirect } from 'expo-router';
import { LEGACY_ROUTE_REDIRECTS } from '../../src/constants/navigation';

export default function TodayRoute() {
  return <Redirect href={LEGACY_ROUTE_REDIRECTS['/today']} />;
}
