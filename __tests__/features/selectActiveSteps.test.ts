import { selectActiveSteps } from '../../src/features/routines/select-active-steps';
import type { RoutineStep } from '../../src/types';
const steps: RoutineStep[] = Array.from({ length: 6 }, (_, index) => ({
  id: String(index), title: `Étape ${index}`, icon: '⭐', color: '#fff',
  durationMinutes: 1, instruction: '', isRequired: index < 4, order: index,
}));
it('includes all six steps, including optional steps', () => {
  expect(selectActiveSteps(steps)).toEqual(steps);
  expect(selectActiveSteps(steps)).toHaveLength(6);
});
it('uses the explicit selection and order without changing the routine', () => {
  const prepared = [steps[5], steps[1], steps[0]];
  expect(selectActiveSteps(steps, prepared)).toEqual(prepared);
  expect(steps).toHaveLength(6);
  expect(selectActiveSteps(steps)).toHaveLength(6);
});
