import {
  APP_DESTINATIONS,
  getActiveDestination,
  LEGACY_ROUTE_REDIRECTS,
  normalizePathname,
  shouldShowBottomNavigation,
} from '../../src/constants/navigation';

describe('application navigation contract', () => {
  it('exposes exactly the three product destinations', () => {
    expect(APP_DESTINATIONS.map(({ key, label, href }) => ({ key, label, href }))).toEqual([
      { key: 'routines', label: 'Routines', href: '/routines' },
      { key: 'activities', label: 'Activités', href: '/activities' },
      { key: 'parent', label: 'Parent', href: '/parent' },
    ]);
  });

  it('keeps the historical route redirects stable', () => {
    expect(LEGACY_ROUTE_REDIRECTS).toEqual({
      '/today': '/routines',
      '/explore': '/activities',
      '/parent/catalog': '/parent/add-routine?catalog=1',
    });
  });

  it.each([
    ['/', 'routines'],
    ['/routines', 'routines'],
    ['/today', 'routines'],
    ['/activities/favorites', 'activities'],
    ['/explore', 'activities'],
    ['/parent/calendar', 'parent'],
    ['/pin', null],
  ])('maps %s to its active destination', (pathname, destination) => {
    expect(getActiveDestination(pathname)).toBe(destination);
  });

  it.each([
    '/pin',
    '/child',
    '/child/run',
    '/child/calendar',
    '/parent/add-child',
    '/parent/add-routine?catalog=1',
    '/parent/edit-routine',
    '/parent/import',
  ])('hides global navigation on %s', (pathname) => {
    expect(shouldShowBottomNavigation(pathname)).toBe(false);
  });

  it.each(['/routines', '/activities', '/activities/favorites', '/parent', '/parent/calendar']) (
    'keeps global navigation on %s',
    (pathname) => {
      expect(shouldShowBottomNavigation(pathname)).toBe(true);
    },
  );

  it('normalizes query strings, hashes and trailing slashes', () => {
    expect(normalizePathname('/parent/add-routine/?catalog=1')).toBe('/parent/add-routine');
    expect(normalizePathname('/activities/#recent')).toBe('/activities');
  });
});
