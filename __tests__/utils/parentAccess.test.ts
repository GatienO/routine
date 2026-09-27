import { parentAccess } from '../../src/utils/parentAccess';

describe('Parent access on home and child routes', () => {
  it.each([false, true])('waits for persisted stores even when unlocked=%s', (unlocked) => {
    expect(parentAccess(false, unlocked, null, 0)).toBe('loading');
  });
  it('allows the initial family setup without a PIN', () => {
    expect(parentAccess(true, false, null, 0)).toBe('allowed');
  });
  it('requires PIN setup once a child exists', () => {
    expect(parentAccess(true, false, null, 1)).toBe('locked');
  });
  it.each([0, 1, 3])('protects a configured PIN with %s children', (count) => {
    expect(parentAccess(true, false, '1234', count)).toBe('locked');
    expect(parentAccess(true, true, '1234', count)).toBe('allowed');
  });
});
