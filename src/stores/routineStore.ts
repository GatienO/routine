import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Routine, RoutineStep, RoutineExecution } from '../types';
import { generateId } from '../utils/id';

interface RoutineState {
  routines: Routine[];
  executions: RoutineExecution[];
  currentExecution: RoutineExecution | null;

  addRoutine: (routine: Omit<Routine, 'id' | 'createdAt' | 'updatedAt'>) => Routine;
  updateRoutine: (id: string, updates: Partial<Omit<Routine, 'id' | 'createdAt'>>) => void;
  removeRoutine: (id: string) => void;
  duplicateRoutine: (id: string, childId: string) => Routine | null;
  toggleRoutine: (id: string) => void;
  getRoutinesForChild: (childId: string) => Routine[];
  getRoutine: (id: string) => Routine | undefined;

  startExecution: (routineId: string, childId: string) => RoutineExecution;
  completeStep: (stepId: string) => void;
  finishExecution: () => RoutineExecution | null;
  cancelExecution: () => void;
}

export const useRoutineStore = create<RoutineState>()(
  persist(
    (set, get) => ({
      routines: [],
      executions: [],
      currentExecution: null,

      addRoutine: (data) => {
        const now = new Date().toISOString();
        const routine: Routine = {
          ...data,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ routines: [...state.routines, routine] }));
        return routine;
      },

      updateRoutine: (id, updates) =>
        set((state) => ({
          routines: state.routines.map((r) =>
            r.id === id
              ? { ...r, ...updates, updatedAt: new Date().toISOString() }
              : r
          ),
        })),

      removeRoutine: (id) =>
        set((state) => ({
          routines: state.routines.filter((r) => r.id !== id),
        })),

      duplicateRoutine: (id, childId) => {
        const source = get().routines.find((r) => r.id === id);
        if (!source) return null;
        const now = new Date().toISOString();
        const newRoutine: Routine = {
          ...source,
          id: generateId(),
          childId,
          name: `${source.name} (copie)`,
          steps: source.steps.map((s) => ({ ...s, id: generateId() })),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ routines: [...state.routines, newRoutine] }));
        return newRoutine;
      },

      toggleRoutine: (id) =>
        set((state) => ({
          routines: state.routines.map((r) =>
            r.id === id ? { ...r, isActive: !r.isActive } : r
          ),
        })),

      getRoutinesForChild: (childId) =>
        get().routines.filter((r) => r.childId === childId),

      getRoutine: (id) => get().routines.find((r) => r.id === id),

      startExecution: (routineId, childId) => {
        const execution: RoutineExecution = {
          id: generateId(),
          routineId,
          childId,
          startedAt: new Date().toISOString(),
          stepsCompleted: [],
          earnedStars: 0,
        };
        set({ currentExecution: execution });
        return execution;
      },

      completeStep: (stepId) =>
        set((state) => {
          if (!state.currentExecution) return state;
          const routine = state.routines.find(
            (r) => r.id === state.currentExecution!.routineId
          );
          const step = routine?.steps.find((s) => s.id === stepId);
          const starEarned = step?.isRequired ? 1 : 0;
          return {
            currentExecution: {
              ...state.currentExecution,
              stepsCompleted: [...state.currentExecution.stepsCompleted, stepId],
              earnedStars: state.currentExecution.earnedStars + starEarned,
            },
          };
        }),

      finishExecution: () => {
        const { currentExecution, routines } = get();
        if (!currentExecution) return null;
        const routine = routines.find((r) => r.id === currentExecution.routineId);
        const bonusStars = routine ? 2 : 0;
        const completed: RoutineExecution = {
          ...currentExecution,
          completedAt: new Date().toISOString(),
          earnedStars: currentExecution.earnedStars + bonusStars,
        };
        set((state) => ({
          executions: [...state.executions, completed],
          currentExecution: null,
        }));
        return completed;
      },

      cancelExecution: () => set({ currentExecution: null }),
    }),
    {
      name: 'routine-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        routines: state.routines,
        executions: state.executions,
      }),
    }
  )
);
