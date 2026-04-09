// Must mock AsyncStorage and expo-crypto before importing stores
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

import { useRoutineStore } from '../../src/stores/routineStore';
import { Routine } from '../../src/types';

// Reset store between tests
beforeEach(() => {
  useRoutineStore.setState({
    routines: [],
    executions: [],
    currentExecution: null,
  });
});

describe('routineStore', () => {
  test('addRoutine creates a routine with generated id', () => {
    const routine = useRoutineStore.getState().addRoutine({
      childId: 'child-1',
      name: 'Routine matin',
      icon: '🌅',
      color: '#FF6B6B',
      category: 'morning',
      steps: [
        {
          id: 'step-1',
          title: 'Se lever',
          icon: '🛏️',
          color: '#FFE66D',
          durationMinutes: 1,
          instruction: '',
          isRequired: true,
          order: 0,
        },
      ],
      isActive: true,
    });

    expect(routine.id).toBeTruthy();
    expect(routine.name).toBe('Routine matin');
    expect(routine.createdAt).toBeTruthy();
    expect(useRoutineStore.getState().routines).toHaveLength(1);
  });

  test('updateRoutine modifies routine fields', () => {
    const routine = useRoutineStore.getState().addRoutine({
      childId: 'child-1',
      name: 'Original',
      icon: '🌅',
      color: '#FF6B6B',
      category: 'morning',
      steps: [],
      isActive: true,
    });

    useRoutineStore.getState().updateRoutine(routine.id, { name: 'Modifiée' });
    const updated = useRoutineStore.getState().getRoutine(routine.id);
    expect(updated?.name).toBe('Modifiée');
  });

  test('removeRoutine deletes a routine', () => {
    const routine = useRoutineStore.getState().addRoutine({
      childId: 'child-1',
      name: 'To remove',
      icon: '🗑️',
      color: '#FF6B6B',
      category: 'morning',
      steps: [],
      isActive: true,
    });

    useRoutineStore.getState().removeRoutine(routine.id);
    expect(useRoutineStore.getState().routines).toHaveLength(0);
  });

  test('toggleRoutine toggles active state', () => {
    const routine = useRoutineStore.getState().addRoutine({
      childId: 'child-1',
      name: 'Toggle test',
      icon: '🔄',
      color: '#FF6B6B',
      category: 'morning',
      steps: [],
      isActive: true,
    });

    useRoutineStore.getState().toggleRoutine(routine.id);
    expect(useRoutineStore.getState().getRoutine(routine.id)?.isActive).toBe(false);

    useRoutineStore.getState().toggleRoutine(routine.id);
    expect(useRoutineStore.getState().getRoutine(routine.id)?.isActive).toBe(true);
  });

  test('duplicateRoutine creates a copy with new IDs', () => {
    const routine = useRoutineStore.getState().addRoutine({
      childId: 'child-1',
      name: 'Original',
      icon: '📋',
      color: '#FF6B6B',
      category: 'morning',
      steps: [
        {
          id: 'step-1',
          title: 'Step',
          icon: '✅',
          color: '#00B894',
          durationMinutes: 1,
          instruction: '',
          isRequired: true,
          order: 0,
        },
      ],
      isActive: true,
    });

    const copy = useRoutineStore.getState().duplicateRoutine(routine.id, 'child-2');
    expect(copy).not.toBeNull();
    expect(copy!.id).not.toBe(routine.id);
    expect(copy!.childId).toBe('child-2');
    expect(copy!.name).toBe('Original (copie)');
    expect(copy!.steps[0].id).not.toBe('step-1');
    expect(useRoutineStore.getState().routines).toHaveLength(2);
  });

  test('getRoutinesForChild filters by childId', () => {
    useRoutineStore.getState().addRoutine({
      childId: 'child-1',
      name: 'R1',
      icon: '🌅',
      color: '#FF6B6B',
      category: 'morning',
      steps: [],
      isActive: true,
    });
    useRoutineStore.getState().addRoutine({
      childId: 'child-2',
      name: 'R2',
      icon: '🌙',
      color: '#A29BFE',
      category: 'evening',
      steps: [],
      isActive: true,
    });

    expect(useRoutineStore.getState().getRoutinesForChild('child-1')).toHaveLength(1);
    expect(useRoutineStore.getState().getRoutinesForChild('child-2')).toHaveLength(1);
    expect(useRoutineStore.getState().getRoutinesForChild('child-3')).toHaveLength(0);
  });

  test('execution lifecycle: start, complete steps, finish', () => {
    const routine = useRoutineStore.getState().addRoutine({
      childId: 'child-1',
      name: 'Execution test',
      icon: '🏃',
      color: '#FF6B6B',
      category: 'morning',
      steps: [
        { id: 'step-1', title: 'S1', icon: '1️⃣', color: '#FF6B6B', durationMinutes: 1, instruction: '', isRequired: true, order: 0 },
        { id: 'step-2', title: 'S2', icon: '2️⃣', color: '#FF6B6B', durationMinutes: 1, instruction: '', isRequired: false, order: 1 },
      ],
      isActive: true,
    });

    // Start
    const exec = useRoutineStore.getState().startExecution(routine.id, ['child-1']);
    expect(exec).not.toBeNull();
    expect(exec!.routineId).toBe(routine.id);
    expect(useRoutineStore.getState().currentExecution).not.toBeNull();

    // Complete required step → 1 star
    useRoutineStore.getState().completeStep('step-1');
    expect(useRoutineStore.getState().currentExecution?.stepsCompleted).toContain('step-1');
    expect(useRoutineStore.getState().currentExecution?.earnedStars).toBe(1);

    // Complete optional step → 0 stars
    useRoutineStore.getState().completeStep('step-2');
    expect(useRoutineStore.getState().currentExecution?.earnedStars).toBe(1);

    // Finish → +2 bonus stars
    const completed = useRoutineStore.getState().finishExecution();
    expect(completed).not.toBeNull();
    expect(completed!.earnedStars).toBe(3); // 1 required + 2 bonus
    expect(completed!.completedAt).toBeTruthy();
    expect(useRoutineStore.getState().currentExecution).toBeNull();
    expect(useRoutineStore.getState().executions).toHaveLength(1);
  });

  test('cancelExecution clears current execution', () => {
    const routine = useRoutineStore.getState().addRoutine({
      childId: 'child-1',
      name: 'Cancel test',
      icon: '❌',
      color: '#FF6B6B',
      category: 'morning',
      steps: [],
      isActive: true,
    });

    useRoutineStore.getState().startExecution(routine.id, ['child-1']);
    expect(useRoutineStore.getState().currentExecution).not.toBeNull();

    useRoutineStore.getState().cancelExecution();
    expect(useRoutineStore.getState().currentExecution).toBeNull();
    expect(useRoutineStore.getState().executions).toHaveLength(0);
  });
});
