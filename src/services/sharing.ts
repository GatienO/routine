import { Routine, ShareableRoutine } from '../types';
import { generateId } from '../utils/id';

const SHARE_VERSION = 1;

export function encodeRoutine(routine: Routine): string {
  const shareable: ShareableRoutine = {
    version: SHARE_VERSION,
    routine: {
      name: routine.name,
      icon: routine.icon,
      color: routine.color,
      category: routine.category,
      steps: routine.steps.map((s) => ({
        ...s,
        id: '', // Strip IDs for sharing
      })),
      isActive: true,
    },
  };
  const json = JSON.stringify(shareable);
  // Use a URL-safe base64 encoding
  const encoded = btoa(unescape(encodeURIComponent(json)));
  return encoded;
}

export function decodeRoutine(encoded: string): ShareableRoutine | null {
  try {
    const json = decodeURIComponent(escape(atob(encoded)));
    const parsed = JSON.parse(json);
    if (!parsed.version || !parsed.routine || !parsed.routine.name) {
      return null;
    }
    return parsed as ShareableRoutine;
  } catch {
    return null;
  }
}

export function importRoutine(
  shareable: ShareableRoutine,
  childId: string
): Omit<Routine, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    ...shareable.routine,
    childId,
    steps: shareable.routine.steps.map((s, i) => ({
      ...s,
      id: generateId(),
      order: i,
    })),
  };
}

export function generateShareLink(encoded: string): string {
  return `routine://import/${encoded}`;
}
