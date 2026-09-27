export type AppDestinationKey = 'routines' | 'activities' | 'parent';

export interface AppDestination {
  key: AppDestinationKey;
  label: string;
  href: '/routines' | '/activities' | '/parent';
  matchPrefixes: readonly string[];
}

export const APP_DESTINATIONS: readonly AppDestination[] = [
  {
    key: 'routines',
    label: 'Routines',
    href: '/routines',
    matchPrefixes: ['/routines', '/today'],
  },
  {
    key: 'activities',
    label: 'Activités',
    href: '/activities',
    matchPrefixes: ['/activities', '/explore'],
  },
  {
    key: 'parent',
    label: 'Parent',
    href: '/parent',
    matchPrefixes: ['/parent'],
  },
] as const;

export const LEGACY_ROUTE_REDIRECTS = {
  '/today': '/routines',
  '/explore': '/activities',
  '/parent/catalog': '/parent/add-routine?catalog=1',
} as const;

const NAVIGATION_HIDDEN_PREFIXES = [
  '/pin',
  '/child',
  '/parent/add-child',
  '/parent/add-routine',
  '/parent/edit-routine',
  '/parent/import',
] as const;

export function normalizePathname(pathname: string) {
  if (!pathname || pathname === '/') return '/';
  const withoutQuery = pathname.split(/[?#]/, 1)[0];
  return withoutQuery.length > 1 ? withoutQuery.replace(/\/+$/, '') : withoutQuery;
}

export function getActiveDestination(pathname: string): AppDestinationKey | null {
  const normalized = normalizePathname(pathname);
  if (normalized === '/') return 'routines';

  return (
    APP_DESTINATIONS.find((destination) =>
      destination.matchPrefixes.some(
        (prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`),
      ),
    )?.key ?? null
  );
}

export function shouldShowBottomNavigation(pathname: string) {
  const normalized = normalizePathname(pathname);
  return !NAVIGATION_HIDDEN_PREFIXES.some(
    (prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`),
  );
}
