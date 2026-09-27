import { selectActiveSteps } from '../../src/features/routines/select-active-steps';
import type { RoutineStep } from '../../src/types';

const step = (id: string, isRequired?: boolean): RoutineStep => ({
  id,
  title: id,
  icon: '⭐',
  color: '#fff',
  durationMinutes: 1,
  instruction: '',
  isRequired: isRequired as boolean,
  order: 0,
});

describe('selectActiveSteps', () => {
  it('keeps required steps during a difficult mood', () => {
    const required = step('required', true);
    expect(selectActiveSteps([step('optional', false), required], true)).toEqual([required]);
  });

  it('keeps an all-optional routine runnable', () => {
    const optional = step('optional', false);
    expect(selectActiveSteps([optional], true)).toEqual([optional]);
  });

  it('treats a saved step without isRequired as required', () => {
    const legacy = step('legacy');
    expect(selectActiveSteps([legacy, step('optional', false)], true)).toEqual([legacy]);
  });
});
