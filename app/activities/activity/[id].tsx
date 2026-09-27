import { Redirect, useLocalSearchParams } from 'expo-router';
export default function ActivityDetailAlias() { const { id } = useLocalSearchParams<{ id?: string }>(); return <Redirect href={id ? `/activities?activity=${id}` : '/activities'} />; }
