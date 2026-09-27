import type { Routine } from '../../types';

export type RoutineGroup = {
  sample: Routine;
  childIds: string[];
  isFavorite: boolean;
};

function routineSignature(routine: Routine) {
  return JSON.stringify({
    name: routine.name,
    category: routine.category,
    steps: routine.steps.map((step) => ({
      title: step.title,
      durationMinutes: step.durationMinutes,
      instruction: step.instruction,
      isRequired: step.isRequired,
      order: step.order,
    })),
  });
}

function compareCreation(left: Routine, right: Routine) {
  return left.createdAt.localeCompare(right.createdAt) || left.id.localeCompare(right.id);
}

export function groupActiveRoutines(routines: Routine[]): RoutineGroup[] {
  const groups = new Map<string, RoutineGroup>();

  for (const routine of [...routines].sort(compareCreation)) {
    if (!routine.isActive) continue;
    const signature = routineSignature(routine);
    const existing = groups.get(signature);
    if (existing) {
      if (!existing.childIds.includes(routine.childId)) existing.childIds.push(routine.childId);
      existing.isFavorite ||= Boolean(routine.isFavorite);
    } else {
      groups.set(signature, {
        sample: routine,
        childIds: [routine.childId],
        isFavorite: Boolean(routine.isFavorite),
      });
    }
  }

  return Array.from(groups.values()).sort((left, right) => {
    if (left.isFavorite !== right.isFavorite) return left.isFavorite ? -1 : 1;
    return compareCreation(left.sample, right.sample);
  });
}

export function orderGroupChildIds(childIds: string[], familyChildIds: string[]): string[] {
  const familyOrder = new Map(familyChildIds.map((id, index) => [id, index]));
  return [...childIds].sort((left, right) =>
    (familyOrder.get(left) ?? Number.MAX_SAFE_INTEGER)
      - (familyOrder.get(right) ?? Number.MAX_SAFE_INTEGER)
      || left.localeCompare(right),
  );
}
