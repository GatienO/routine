// @ts-nocheck
import React from 'react';
import { render } from '@testing-library/react-native';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));
jest.mock('expo-router', () => ({ useRouter: () => ({ replace: jest.fn() }) }));
jest.mock('expo-haptics', () => ({ notificationAsync: jest.fn(), selectionAsync: jest.fn(), NotificationFeedbackType: { Success: 'success', Warning: 'warning' } }));
jest.mock('react-native-reanimated', () => {
  const animation = { duration: () => animation, delay: () => animation, springify: () => animation };
  const native = require('react-native');
  return { __esModule: true, default: { View: native.View, Text: native.Text }, FadeInRight: animation, FadeOutLeft: animation, FadeInDown: animation, FadeIn: animation, BounceIn: animation };
});
jest.mock('../src/components/ui/OpenMoji', () => ({ OpenMoji: () => null }));
jest.mock('../src/components/ui/Avatar', () => ({ Avatar: () => null }));
jest.mock('../src/components/ui/ProgressBar', () => ({ ProgressBar: () => null }));
jest.mock('../src/components/ui/CircularTimer', () => ({ CircularTimer: ({ label }) => require('react').createElement(require('react-native').Text, null, label) }));
jest.mock('../src/components/ui/AnimatedPressable', () => ({ AnimatedPressable: ({ children }) => require('react').createElement(require('react-native').View, null, children) }));

import RunRoutineScreen from '../app/child/run';
import { useRoutineStore } from '../src/stores/routineStore';
import { useChildrenStore } from '../src/stores/childrenStore';
import { useMoodStore } from '../src/stores/moodStore';

beforeEach(() => {
  useMoodStore.setState({ moods: {} });
  useChildrenStore.setState({ children: [{ id: 'child', name: 'Audit', avatar: '🦊', color: '#95c9b8', age: 6, createdAt: '2026-09-27' }] });
  useRoutineStore.setState({
    routines: [{ id: 'routine', childId: 'child', name: 'Routine test', icon: '☀️', color: '#95c9b8', category: 'morning', isActive: true, createdAt: '2026-09-27', updatedAt: '2026-09-27', steps: [{ id: 'step', title: 'Première étape', icon: '🧸', color: '#95c9b8', durationMinutes: 1, minimumDurationMinutes: 1, instruction: 'Essai', isRequired: true, order: 0 }] }],
    currentExecution: { id: 'execution', routineId: 'routine', childId: 'child', participantChildIds: ['child'], startedAt: '2026-09-27', stepsCompleted: [], earnedStars: 0 },
  });
});

it('shows the active step and timer after a routine starts', () => {
  const result = render(<RunRoutineScreen />);
  const tree = JSON.stringify(result.toJSON());
  expect(tree).toContain('Première étape');
  expect(tree).toContain('1:00');
});

it('keeps an optional step visible when a difficult mood is selected', () => {
  useMoodStore.setState({ moods: { child: { childId: 'child', mood: 'sad', selectedAt: new Date().toISOString() } } });
  useRoutineStore.setState((state) => ({
    routines: state.routines.map((routine) => ({ ...routine, steps: routine.steps.map((step) => ({ ...step, isRequired: false })) })),
  }));
  const tree = JSON.stringify(render(<RunRoutineScreen />).toJSON());
  expect(tree).toContain('Première étape');
  expect(tree).toContain('1:00');
});

it.each(['sad', 'grumpy', 'angry'])('keeps six steps with mood %s, including two optional steps', (mood) => {
  useMoodStore.getState().setMood('child', mood);
  useRoutineStore.setState((state) => ({ routines: state.routines.map((routine) => ({ ...routine, steps: Array.from({ length: 6 }, (_, index) => ({ ...routine.steps[0], id: `step-${index}`, order: index, title: `Action ${index}`, isRequired: index > 1 })) })) }));
  const tree = JSON.stringify(render(<RunRoutineScreen />).toJSON());
  expect(tree).toContain('Action 0');
  expect(tree).toContain('6');
});
