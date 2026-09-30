import { useCallback, useRef, useSyncExternalStore } from 'react';
import { useFocusEffect, useLocalSearchParams, usePathname, useRouter } from 'expo-router';
import { Platform } from 'react-native';
import { useAppStore } from '../stores/appStore';
import { useChildrenStore } from '../stores/childrenStore';
import { routeWithParams } from '../utils/pinNavigation';
import { parentAccess } from '../utils/parentAccess';

const subscribe = (notify: () => void) => useAppStore.persist.onFinishHydration(notify);
const hydratedSnapshot = () => useAppStore.persist.hasHydrated();

export function useParentAccess() {
  const hydrated = useSyncExternalStore(subscribe, hydratedSnapshot, () => false);
  const unlocked = useAppStore((state) => state.isParentMode);
  const pin = useAppStore((state) => state.parentPin);
  const childrenHydrated = useChildrenStore((state) => state.hasHydrated);
  const childCount = useChildrenStore((state) => state.children.length);
  const router = useRouter();
  const pathname = usePathname();
  const params = useLocalSearchParams<Record<string, string | string[]>>();
  const destination = useRef('/parent');
  const route = routeWithParams(pathname, params);
  const browserQuery = Platform.OS === 'web' && typeof window !== 'undefined' && window.location.pathname === pathname
    ? window.location.search
    : '';
  destination.current = pin ? browserQuery && !route.includes('?') ? `${pathname}${browserQuery}` : route : '/parent';
  const access = parentAccess(hydrated && childrenHydrated, unlocked, pin, childCount);
  useFocusEffect(useCallback(() => {
    if (access === 'locked') router.replace({ pathname: '/pin', params: { redirect: destination.current } });
  }, [access, router]));
  return access === 'allowed';
}
