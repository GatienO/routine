// Only local app paths are accepted; encoded separators and dot segments are
// rejected before the router can normalize them to a different destination.
function localPath(value: unknown): string | null {
  if (typeof value !== 'string' || /[\\\u0000-\u0020]/.test(value)) return null;
  const path = value.split(/[?#]/, 1)[0];
  if (!/^\/[a-zA-Z0-9/_-]+$/.test(path) || path.includes('//')) return null;
  return path.replace(/\/+$/, '');
}

export function parentPinDestination(value: unknown): string {
  const path = localPath(value);
  return path && (path === '/parent' || path.startsWith('/parent/')) ? value as string : '/parent';
}

export function pinReturnDestination(value: unknown, parentUnlocked = false): string {
  const path = localPath(value);
  if (parentUnlocked && path && (path === '/parent' || path.startsWith('/parent/'))) return value as string;
  return path && ['/routines', '/today', '/activities', '/explore', '/child'].some(
    (root) => path === root || path.startsWith(`${root}/`),
  ) ? value as string : '/routines';
}

export function routeWithParams(pathname: string, params: Record<string, string | string[] | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (['screen', 'params', 'initial', 'state'].includes(key) || value === undefined) return;
    (Array.isArray(value) ? value : [value]).forEach((item) => {
      if (typeof item === 'string') query.append(key, item);
    });
  });
  return query.size ? `${pathname}?${query.toString()}` : pathname;
}

// Not persisted: a reloaded/direct PIN URL must use its validated fallback,
// never an unrelated browser history entry.
let pendingOrigin: string | null = null;
export function beginPinNavigation(origin: string, parentUnlocked = false) {
  pendingOrigin = pinReturnDestination(origin, parentUnlocked);
  return pendingOrigin;
}
export function consumePinOrigin() {
  const origin = pendingOrigin;
  pendingOrigin = null;
  return origin;
}
