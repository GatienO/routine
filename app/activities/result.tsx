import { Redirect } from 'expo-router';
import { useActivityStore } from '../../src/features/activities/activity-store';
export default function ResultAlias() { const id = useActivityStore((state) => state.currentActivityId); return <Redirect href={id ? `/activities?activity=${id}` : '/activities'} />; }
