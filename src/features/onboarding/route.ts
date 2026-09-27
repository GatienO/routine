export function onboardingDestination({
  pathname,
  profileName,
  onboardingActive,
  parentPin,
  childCount,
}: {
  pathname: string;
  profileName: string;
  onboardingActive: boolean;
  parentPin: string | null;
  childCount: number;
}): string | null {
  if (!profileName) return pathname === '/onboarding/family' ? null : '/onboarding/family';
  if (!onboardingActive) return pathname.startsWith('/onboarding/') ? '/routines' : null;

  if (!parentPin) {
    return pathname === '/pin' || pathname === '/onboarding/family'
      ? null
      : '/pin';
  }
  if (childCount === 0) {
    return pathname === '/onboarding/child' || pathname === '/onboarding/family'
      ? null
      : '/onboarding/child';
  }
  return pathname === '/onboarding/complete' ? null : '/onboarding/complete';
}
