import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Routine, RoutineStep, RoutineExecution } from '../types';
import { generateId } from '../utils/id';

interface RoutineState {
  routines: Routine[];
  executions: RoutineExecution[];
  currentExecution: RoutineExecution | null;
  chainQueue: string[];

  addRoutine: (routine: Omit<Routine, 'id' | 'createdAt' | 'updatedAt'>) => Routine;
  updateRoutine: (id: string, updates: Partial<Omit<Routine, 'id' | 'createdAt'>>) => void;
  removeRoutine: (id: string) => void;
  duplicateRoutine: (id: string, childId: string) => Routine | null;
  toggleRoutine: (id: string) => void;
  getRoutinesForChild: (childId: string) => Routine[];
  getRoutine: (id: string) => Routine | undefined;
  reorderRoutines: (childId: string, orderedIds: string[]) => void;
  mergeRoutines: (routineIds: string[], name: string, icon: string, color: string) => Routine | null;

  startExecution: (routineId: string, childId: string) => RoutineExecution;
  startChain: (routineIds: string[], childId: string) => RoutineExecution | null;
  nextInChain: () => RoutineExecution | null;
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
      chainQueue: [],

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

      reorderRoutines: (childId, orderedIds) =>
        set((state) => {
          const childRoutines = state.routines.filter((r) => r.childId === childId);
          const otherRoutines = state.routines.filter((r) => r.childId !== childId);
          const sorted = orderedIds
            .map((id) => childRoutines.find((r) => r.id === id))
            .filter(Boolean) as Routine[];
          // append any that weren't in orderedIds
          const remaining = childRoutines.filter((r) => !orderedIds.includes(r.id));
          return { routines: [...otherRoutines, ...sorted, ...remaining] };
        }),

      mergeRoutines: (routineIds, name, icon, color) => {
        const { routines } = get();
        const sources = routineIds.map((id) => routines.find((r) => r.id === id)).filter(Boolean) as Routine[];
        if (sources.length < 2) return null;
        const childId = sources[0].childId;
        const now = new Date().toISOString();
        let order = 0;
        const mergedSteps: RoutineStep[] = sources.flatMap((r) =>
          r.steps.map((s) => ({ ...s, id: generateId(), order: order++ }))
        );
        const merged: Routine = {
          id: generateId(),
          childId,
          name,
          icon,
          color,
          category: sources[0].category,
          steps: mergedSteps,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ routines: [...state.routines, merged] }));
        return merged;
      },

      startExecution: (routineId, childId) => {
        const execution: RoutineExecution = {
          id: generateId(),
          routineId,
          childId,
          startedAt: new Date().toISOString(),
          stepsCompleted: [],
          earnedStars: 0,
        };
        set({ currentExecution: execution, chainQueue: [] });
        return execution;
      },

      startChain: (routineIds, childId) => {
        if (routineIds.length === 0) return null;
        const [first, ...rest] = routineIds;
        const execution: RoutineExecution = {
          id: generateId(),
          routineId: first,
          childId,
          startedAt: new Date().toISOString(),
          stepsCompleted: [],
          earnedStars: 0,
        };
        set({ currentExecution: execution, chainQueue: rest });
        return execution;
      },

      nextInChain: () => {
        const { chainQueue, currentExecution } = get();
        if (chainQueue.length === 0 || !currentExecution) return null;
        const [next, ...rest] = chainQueue;
        const execution: RoutineExecution = {
          id: generateId(),
          routineId: next,
          childId: currentExecution.childId,
          startedAt: new Date().toISOString(),
          stepsCompleted: [],
          earnedStars: 0,
        };
        set({ currentExecution: execution, chainQueue: rest });
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

      cancelExecution: () => set({ currentExecution: null, chainQueue: [] }),
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
