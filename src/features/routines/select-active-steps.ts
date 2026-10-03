import type { RoutineStep } from '../../types';

export function selectActiveSteps(steps: RoutineStep[], preparedSteps?: RoutineStep[]): RoutineStep[] {
  // Only the explicit launch preparation can change the planned steps.
  return preparedSteps ?? steps;
}
