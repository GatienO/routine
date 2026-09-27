import type { RoutineStep } from '../../types';

export function selectActiveSteps(steps: RoutineStep[], skipOptional: boolean): RoutineStep[] {
  if (!skipOptional) return steps;
  // Older saved steps may not have isRequired. Only an explicit false is optional.
  const required = steps.filter((step) => step.isRequired !== false);
  // A routine made entirely of optional steps must still have something to run.
  return required.length > 0 ? required : steps;
}
