// @ts-nocheck
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
jest.mock('@react-native-async-storage/async-storage', () => ({ getItem: jest.fn(() => Promise.resolve(null)), setItem: jest.fn(() => Promise.resolve()), removeItem: jest.fn(() => Promise.resolve()) }));
jest.mock('expo-router', () => ({ useRouter: () => ({ replace: jest.fn(), push: jest.fn() }), useLocalSearchParams: () => ({ routineId: 'routine', childId: 'child' }) }));
jest.mock('../src/components/ui/OpenMoji', () => ({ OpenMoji: () => null }));
jest.mock('../src/components/ui/Avatar', () => ({ Avatar: () => null }));
import { LaunchFlowScreen } from '../src/features/routines/screens/launch-flow-screen';
import { useRoutineStore } from '../src/stores/routineStore';
import { useChildrenStore } from '../src/stores/childrenStore';

beforeEach(() => {
  jest.spyOn(useRoutineStore.persist, 'hasHydrated').mockReturnValue(true);
  useChildrenStore.setState({ hasHydrated: true, children: [{ id: 'child', name: 'Test', avatar: '🦊', color: '#fff' }] });
  useRoutineStore.setState({ currentExecution: null, pendingStepOrders: { routine: [] }, routines: [{ id: 'routine', childId: 'child', name: 'Six étapes', steps: Array.from({ length: 6 }, (_, index) => ({ id: String(index), title: `Action ${index}`, icon: '⭐', color: '#fff', durationMinutes: 1, instruction: '', isRequired: index < 4, order: index })) }] });
});
afterEach(() => jest.restoreAllMocks());

it('starts with all steps, allows explicit exclusions and reorder, and resets a new preparation', () => {
  let screen = render(<LaunchFlowScreen />);
  for (let i = 0; i < 6; i++) expect(screen.getByLabelText(`Inclure Action ${i} pour cette fois`).props['aria-checked']).toBe(true);
  fireEvent.press(screen.getByLabelText('Inclure Action 1 pour cette fois'));
  fireEvent.press(screen.getByLabelText('Inclure Action 4 pour cette fois'));
  fireEvent.press(screen.getByLabelText('Descendre Action 0'));
  fireEvent.press(screen.getByLabelText('Descendre Action 0'));
  fireEvent.press(screen.getByLabelText('Confirmer les participants'));
  fireEvent.press(screen.getByLabelText('Confirmer la présence de Test'));
  fireEvent.press(screen.getByLabelText('Choisir les humeurs'));
  fireEvent.press(screen.getByLabelText('Fatigue'));
  fireEvent.press(screen.getByLabelText('Commencer la routine'));
  expect(useRoutineStore.getState().currentExecution?.customStepOrder.map((step) => step.id)).toEqual(['2', '0', '3', '5']);
  expect(useRoutineStore.getState().routines[0].steps).toHaveLength(6);
  screen.unmount();
  screen = render(<LaunchFlowScreen />);
  for (let i = 0; i < 6; i++) expect(screen.getByLabelText(`Inclure Action ${i} pour cette fois`).props['aria-checked']).toBe(true);
});

it('blocks an empty selection and restores the original plan', () => {
  const screen = render(<LaunchFlowScreen />);
  for (let i = 0; i < 6; i++) fireEvent.press(screen.getByLabelText(`Inclure Action ${i} pour cette fois`));
  fireEvent.press(screen.getByLabelText('Confirmer les participants')); expect(screen.queryByLabelText('Confirmer la présence de Test')).toBeNull();
  fireEvent.press(screen.getByLabelText('Tout rétablir'));
  for (let i = 0; i < 6; i++) expect(screen.getByLabelText(`Inclure Action ${i} pour cette fois`).props['aria-checked']).toBe(true);
});
