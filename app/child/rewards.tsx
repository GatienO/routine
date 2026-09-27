import { Redirect } from 'expo-router';

export default function LegacyChildRewardsRoute() {
  return <Redirect href="/parent/stats" />;
}
