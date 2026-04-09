import { Routine, ShareableRoutine } from '../types';
import { generateId } from '../utils/id';

const SHARE_VERSION = 1;

export function encodeRoutine(routine: Routine): string {
  const shareable: ShareableRoutine = {
    version: SHARE_VERSION,
    routine: {
      name: routine.name,
      description: routine.description ?? '',
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
    description: shareable.routine.description ?? '',
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

export function buildRoutineShareText(routine: Routine): string {
  const lines: string[] = [routine.name.trim()];

  if (routine.description?.trim()) {
    lines.push('', 'Description', routine.description.trim());
  }

  lines.push('', 'Etapes');

  const orderedSteps = [...routine.steps].sort((left, right) => left.order - right.order);

  orderedSteps.forEach((step, index) => {
    lines.push(
      '',
      `${index + 1}. ${step.title}`,
      `Temps : ${step.durationMinutes} min`,
      `Consigne : ${step.instruction?.trim() || 'Aucune'}`,
      `Obligatoire : ${step.isRequired ? 'Oui' : 'Non'}`,
    );
  });

  return lines.join('\n');
}
