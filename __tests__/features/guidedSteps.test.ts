import { getGuidedStepKind } from '../../src/features/routines/utils/guided-steps';
import type { RoutineStep } from '../../src/types';

function step(overrides: Partial<RoutineStep> = {}): RoutineStep {
  return {
    id: 'step-1',
    title: 'Une étape',
    icon: '✨',
    color: '#397862',
    durationMinutes: 1,
    instruction: '',
    isRequired: true,
    order: 0,
    ...overrides,
  };
}

describe('guided routine steps', () => {
  test('uses the explicit guided kind when configured', () => {
    expect(getGuidedStepKind(step({ guidedKind: 'weather-look' }))).toBe('weather-look');
  });

  test('enhances existing dressing steps without migrating stored routines', () => {
    expect(getGuidedStepKind(step({ title: 'Je m’habille' }))).toBe('outfit-choice');
    expect(getGuidedStepKind(step({ title: 'Je choisis mes vêtements' }))).toBe('outfit-choice');
  });

  test('recognizes weather observation but leaves ordinary steps unchanged', () => {
    expect(getGuidedStepKind(step({ title: 'Je regarde la météo' }))).toBe('weather-look');
    expect(getGuidedStepKind(step({ title: 'Je me brosse les dents' }))).toBeUndefined();
  });
});
