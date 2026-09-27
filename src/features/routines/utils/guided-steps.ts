import type { RoutineStep } from '../../../types';

export type GuidedStepKind = NonNullable<RoutineStep['guidedKind']>;

export function getGuidedStepKind(step: RoutineStep): GuidedStepKind | undefined {
  if (step.guidedKind) return step.guidedKind;

  const text = `${step.title} ${step.instruction}`
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  if (/regarde.*(meteo|temps)|meteo.*regarde/.test(text)) return 'weather-look';
  if (/m'habille|m’habille|choisi.*tenue|choisi.*vetement/.test(text)) return 'outfit-choice';
  return undefined;
}
