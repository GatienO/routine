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
    trashedRoutines: [],
    executions: [],
    currentExecution: null,
    chainQueue: [],
    pendingStepOrders: {},
  });
});

describe('routineStore', () => {
  test.each(['finish', 'cancel'] as const)('temporary selection is isolated and resets after %s', (end) => {
    const routine = useRoutineStore.getState().addRoutine({
      childId: 'child', name: 'Six étapes', icon: '⭐', color: '#fff', category: 'morning', isActive: true,
      steps: Array.from({ length: 6 }, (_, index) => ({ id: String(index), title: `Étape ${index}`, icon: '⭐', color: '#fff', durationMinutes: 1, instruction: '', isRequired: index < 4, order: index })),
    });
    const selected = [routine.steps[5], routine.steps[1], routine.steps[0]];
    const execution = useRoutineStore.getState().startExecution(routine.id, ['child'], { [routine.id]: selected });
    expect(execution?.customStepOrder?.map((step) => step.id)).toEqual(['5', '1', '0']);
    expect(execution?.customStepOrder?.[0]).not.toBe(selected[0]);
    const partialize = useRoutineStore.persist.getOptions().partialize!;
    const persisted = partialize(useRoutineStore.getState()) as ReturnType<typeof useRoutineStore.getState>;
    expect(persisted.currentExecution?.customStepOrder).toEqual(selected);
    expect(persisted.routines[0].steps).toHaveLength(6);
    if (end === 'finish') useRoutineStore.getState().finishExecution();
    else useRoutineStore.getState().cancelExecution();
    expect(useRoutineStore.getState().startExecution(routine.id)?.customStepOrder).toEqual(routine.steps);
    expect(useRoutineStore.getState().getRoutine(routine.id)).toEqual(routine);
  });

  test('each routine in a chain uses its own temporary selection', () => {
    const add = (name: string) => useRoutineStore.getState().addRoutine({ childId: 'child', name, icon: '⭐', color: '#fff', category: 'morning', isActive: true, steps: Array.from({ length: 3 }, (_, index) => ({ id: `${name}-${index}`, title: 'Étape', icon: '⭐', color: '#fff', durationMinutes: 1, instruction: '', isRequired: true, order: index })) });
    const first = add('first'); const second = add('second');
    useRoutineStore.getState().startChain([first.id, second.id], ['child'], { [first.id]: [first.steps[2]], [second.id]: [second.steps[1]] });
    expect(useRoutineStore.getState().currentExecution?.customStepOrder).toEqual([first.steps[2]]);
    useRoutineStore.getState().finishExecution();
    expect(useRoutineStore.getState().nextInChain()?.customStepOrder).toEqual([second.steps[1]]);
    useRoutineStore.getState().finishExecution();
    expect(useRoutineStore.getState().pendingStepOrders).toEqual({});
    expect(useRoutineStore.getState().startExecution(second.id)?.customStepOrder).toHaveLength(3);
  });
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

  test('trashRoutine can be restored or permanently deleted', () => {
    const routine = useRoutineStore.getState().addRoutine({
      childId: 'child-1',
      name: 'To trash',
      icon: '🗑️',
      color: '#FF6B6B',
      category: 'morning',
      steps: [],
      isActive: true,
    });

    useRoutineStore.getState().trashRoutine(routine.id);
    expect(useRoutineStore.getState().routines).toHaveLength(0);
    expect(useRoutineStore.getState().trashedRoutines).toHaveLength(1);

    useRoutineStore.getState().restoreRoutine(routine.id);
    expect(useRoutineStore.getState().routines).toHaveLength(1);
    expect(useRoutineStore.getState().trashedRoutines).toHaveLength(0);

    useRoutineStore.getState().trashRoutine(routine.id);
    useRoutineStore.getState().deleteTrashedRoutine(routine.id);
    expect(useRoutineStore.getState().routines).toHaveLength(0);
    expect(useRoutineStore.getState().trashedRoutines).toHaveLength(0);
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

  test('startChain advances to the second routine after finishing the first', () => {
    const firstRoutine = useRoutineStore.getState().addRoutine({
      childId: 'child-1',
      name: 'First routine',
      icon: '1',
      color: '#FF6B6B',
      category: 'morning',
      steps: [
        { id: 'first-step', title: 'S1', icon: '1', color: '#FF6B6B', durationMinutes: 1, instruction: '', isRequired: true, order: 0 },
      ],
      isActive: true,
    });
    const secondRoutine = useRoutineStore.getState().addRoutine({
      childId: 'child-2',
      name: 'Second routine',
      icon: '2',
      color: '#A29BFE',
      category: 'evening',
      steps: [
        { id: 'second-step', title: 'S2', icon: '2', color: '#A29BFE', durationMinutes: 1, instruction: '', isRequired: true, order: 0 },
      ],
      isActive: true,
    });

    const firstExecution = useRoutineStore
      .getState()
      .startChain([firstRoutine.id, secondRoutine.id], ['child-1', 'child-2']);

    expect(firstExecution?.routineId).toBe(firstRoutine.id);
    expect(useRoutineStore.getState().chainQueue).toEqual([secondRoutine.id]);

    useRoutineStore.getState().completeStep('first-step');
    const completed = useRoutineStore.getState().finishExecution();
    const nextExecution = useRoutineStore.getState().nextInChain();

    expect(completed?.routineId).toBe(firstRoutine.id);
    expect(nextExecution?.routineId).toBe(secondRoutine.id);
    expect(nextExecution?.participantChildIds).toEqual(['child-1', 'child-2']);
    expect(useRoutineStore.getState().currentExecution?.routineId).toBe(secondRoutine.id);
    expect(useRoutineStore.getState().chainQueue).toEqual([]);
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
    useRoutineStore.setState({
      chainQueue: ['queued-routine'],
      pendingStepOrders: { [routine.id]: routine.steps },
    });
    expect(useRoutineStore.getState().currentExecution).not.toBeNull();

    useRoutineStore.getState().cancelExecution();
    expect(useRoutineStore.getState().currentExecution).toBeNull();
    expect(useRoutineStore.getState().executions).toHaveLength(0);
    expect(useRoutineStore.getState().chainQueue).toEqual([]);
    expect(useRoutineStore.getState().pendingStepOrders).toEqual({});
  });

  test('completeStep is idempotent when the same validation is received twice', () => {
    const routine = useRoutineStore.getState().addRoutine({
      childId: 'child-1',
      name: 'Double tap test',
      icon: '✅',
      color: '#397862',
      category: 'morning',
      steps: [
        { id: 'step-1', title: 'S1', icon: '1', color: '#397862', durationMinutes: 1, instruction: '', isRequired: true, order: 0 },
      ],
      isActive: true,
    });

    useRoutineStore.getState().startExecution(routine.id, ['child-1']);
    useRoutineStore.getState().completeStep('step-1');
    useRoutineStore.getState().completeStep('step-1');

    expect(useRoutineStore.getState().currentExecution?.stepsCompleted).toEqual(['step-1']);
    expect(useRoutineStore.getState().currentExecution?.earnedStars).toBe(1);
  });

  test('persists an unfinished execution so it can resume after a restart', () => {
    const routine = useRoutineStore.getState().addRoutine({
      childId: 'child-1',
      name: 'Routine à reprendre',
      icon: '▶️',
      color: '#397862',
      category: 'morning',
      steps: [
        { id: 'step-1', title: 'S1', icon: '1', color: '#397862', durationMinutes: 1, instruction: '', isRequired: true, order: 0 },
        { id: 'step-2', title: 'S2', icon: '2', color: '#397862', durationMinutes: 1, instruction: '', isRequired: true, order: 1 },
      ],
      isActive: true,
    });

    useRoutineStore.getState().startExecution(routine.id, ['child-1']);
    useRoutineStore.getState().completeStep('step-1');
    useRoutineStore.getState().ensureStepTimer('step-2', 60);
    useRoutineStore.getState().pauseCurrentStepTimer();

    const partialize = useRoutineStore.persist.getOptions().partialize;
    const persisted = partialize?.(useRoutineStore.getState()) as ReturnType<typeof useRoutineStore.getState>;

    expect(persisted.currentExecution).toMatchObject({
      routineId: routine.id,
      participantChildIds: ['child-1'],
      stepsCompleted: ['step-1'],
      earnedStars: 1,
      stepTimer: {
        stepId: 'step-2',
        durationSeconds: 60,
        isPaused: true,
        deadlineAt: null,
      },
    });
    expect(persisted).toHaveProperty('chainQueue');
    expect(persisted).toHaveProperty('pendingStepOrders');
  });
});
