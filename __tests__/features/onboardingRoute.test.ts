import { onboardingDestination } from '../../src/features/onboarding/route';

const state = { profileName: '', onboardingActive: false, parentPin: null, childCount: 0 };

describe('first-run routing', () => {
  test('a fresh installation starts with family information', () => {
    expect(onboardingDestination({ ...state, pathname: '/routines' })).toBe('/onboarding/family');
    expect(onboardingDestination({ ...state, pathname: '/onboarding/family' })).toBeNull();
  });

  test('resumes at the first unfinished step', () => {
    const family = { ...state, profileName: 'Famille Test', onboardingActive: true };
    expect(onboardingDestination({ ...family, pathname: '/routines' })).toBe('/pin');
    expect(onboardingDestination({ ...family, parentPin: '0000', pathname: '/routines' })).toBe('/onboarding/child');
    expect(onboardingDestination({ ...family, parentPin: '0000', childCount: 1, pathname: '/routines' })).toBe('/onboarding/complete');
  });

  test('keeps a finished or existing family outside onboarding', () => {
    const existing = { ...state, profileName: 'Famille Test' };
    expect(onboardingDestination({ ...existing, pathname: '/routines' })).toBeNull();
    expect(onboardingDestination({ ...existing, pathname: '/onboarding/child' })).toBe('/routines');
  });
});
