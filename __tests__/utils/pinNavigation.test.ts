import { beginPinNavigation, consumePinOrigin, parentPinDestination, pinReturnDestination, routeWithParams } from '../../src/utils/pinNavigation';

describe('PIN navigation', () => {
  it.each(['/parent', '/parent/add-routine?catalog=1', '/parent/import?code=a%2Fb'])('preserves parent destination %s', (value) => {
    expect(parentPinDestination(value)).toBe(value);
  });
  it.each([undefined, ['parent'], 'https://example.com', '//example.com', '/parent-other', '/parent/../activities', '/parent/%2e%2e/activities', '/parent/\\example.com', '/parent//import', '/parent\n/import'])('rejects unsafe parent destination %s', (value) => {
    expect(parentPinDestination(value)).toBe('/parent');
  });
  it.each(['/activities?view=favorites', '/activities?activity=a%2Fb', '/routines', '/child/calendar'])('keeps cancellation context %s', (value) => {
    expect(pinReturnDestination(value)).toBe(value);
  });
  it.each(['/pin', '/parent', '/parent/import', '//example.com', '/activities/../parent', '/activities/%2fparent', undefined])('uses safe cancellation fallback for %s', (value) => {
    expect(pinReturnDestination(value)).toBe('/routines');
  });
  it('encodes and preserves query values including collections and multiple values', () => {
    expect(routeWithParams('/activities', { view: 'favorites', q: 'calme & dehors', tag: ['a', 'b'], absent: undefined }))
      .toBe('/activities?view=favorites&q=calme+%26+dehors&tag=a&tag=b');
  });
  it('omits internal navigation params from a protected route', () => {
    expect(routeWithParams('/parent/children', { screen: 'children', params: '[object Object]', catalog: '1' }))
      .toBe('/parent/children?catalog=1');
  });
  it('consumes the in-memory origin once and never persists an unrelated history entry', () => {
    expect(beginPinNavigation('/activities?view=recent')).toBe('/activities?view=recent');
    expect(consumePinOrigin()).toBe('/activities?view=recent');
    expect(consumePinOrigin()).toBeNull();
  });
  it('allows cancellation to Parent only while the session is already unlocked', () => {
    expect(pinReturnDestination('/parent?settings=1', true)).toBe('/parent?settings=1');
    expect(pinReturnDestination('/parent?settings=1', false)).toBe('/routines');
    expect(beginPinNavigation('/parent', true)).toBe('/parent');
    expect(consumePinOrigin()).toBe('/parent');
  });
});
