export function parentAccess(hydrated: boolean, unlocked: boolean, pin: string | null, childCount: number) {
  if (!hydrated) return 'loading';
  return unlocked || (!pin && childCount === 0) ? 'allowed' : 'locked';
}
