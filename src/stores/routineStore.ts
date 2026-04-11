import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Routine, RoutineStep, RoutineExecution, TrashedRoutine } from '../types';
import { generateId } from '../utils/id';

interface RoutineState {
  routines: Routine[];
  trashedRoutines: TrashedRoutine[];
  executions: RoutineExecution[];
  currentExecution: RoutineExecution | null;
  chainQueue: string[];
  pendingStepOrders: Record<string, RoutineStep[]>;

  addRoutine: (routine: Omit<Routine, 'id' | 'createdAt' | 'updatedAt'>) => Routine;
  updateRoutine: (id: string, updates: Partial<Omit<Routine, 'id' | 'createdAt'>>) => void;
  removeRoutine: (id: string) => void;
  trashRoutine: (id: string) => void;
  restoreRoutine: (id: string) => void;
  cleanupExpiredTrash: () => void;
  duplicateRoutine: (id: string, childId: string) => Routine | null;
  toggleRoutine: (id: string) => void;
  toggleFavorite: (id: string) => void;
  getRoutinesForChild: (childId: string) => Routine[];
  getRoutine: (id: string) => Routine | undefined;
  reorderRoutines: (childId: string, orderedIds: string[]) => void;
  mergeRoutines: (routineIds: string[], name: string, icon: string, color: string) => Routine | null;
  setPendingStepOrders: (orders: Record<string, RoutineStep[]>) => void;
  clearPendingStepOrders: () => void;

  startExecution: (routineId: string, participantChildIds?: string[], stepOrders?: Record<string, RoutineStep[]>) => RoutineExecution | null;
  startChain: (routineIds: string[], participantChildIds?: string[], stepOrders?: Record<string, RoutineStep[]>) => RoutineExecution | null;
  nextInChain: () => RoutineExecution | null;
  completeStep: (stepId: string) => void;
  finishExecution: () => RoutineExecution | null;
  cancelExecution: () => void;
}

export const useRoutineStore = create<RoutineState>()(
  persist(
    (set, get) => ({
      routines: [],
      trashedRoutines: [],
      executions: [],
      currentExecution: null,
      chainQueue: [],
      pendingStepOrders: {},

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

      trashRoutine: (id) =>
        set((state) => {
          const routine = state.routines.find((item) => item.id === id);
          if (!routine) return state;

          const deletedAt = new Date().toISOString();
          const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
          const trashedRoutine: TrashedRoutine = {
            ...routine,
            deletedAt,
            expiresAt,
          };

          return {
            routines: state.routines.filter((item) => item.id !== id),
            trashedRoutines: [
              trashedRoutine,
              ...state.trashedRoutines.filter((item) => item.id !== id),
            ],
          };
        }),

      restoreRoutine: (id) =>
        set((state) => {
          const trashedRoutine = state.trashedRoutines.find((item) => item.id === id);
          if (!trashedRoutine) return state;

          const { deletedAt, expiresAt, ...restoredRoutine } = trashedRoutine;

          return {
            routines: [
              ...state.routines,
              {
                ...restoredRoutine,
                updatedAt: new Date().toISOString(),
              },
            ],
            trashedRoutines: state.trashedRoutines.filter((item) => item.id !== id),
          };
        }),

      cleanupExpiredTrash: () =>
        set((state) => {
          const now = Date.now();
          return {
            trashedRoutines: state.trashedRoutines.filter(
              (item) => new Date(item.expiresAt).getTime() > now,
            ),
          };
        }),

      duplicateRoutine: (id, childId) => {
        const source = get().routines.find((r) => r.id === id);
        if (!source) return null;
        const now = new Date().toISOString();
        const siblingNames = get()
          .routines.filter((routine) => routine.childId === childId)
          .map((routine) => routine.name);
        const baseCopyName = `${source.name} (copie)`;
        let nextName = baseCopyName;
        let copyIndex = 2;

        while (siblingNames.includes(nextName)) {
          nextName = `${source.name} (copie ${copyIndex})`;
          copyIndex += 1;
        }

        const newRoutine: Routine = {
          ...source,
          id: generateId(),
          childId,
          name: nextName,
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

      toggleFavorite: (id) =>
        set((state) => ({
          routines: state.routines.map((r) =>
            r.id === id ? { ...r, isFavorite: !r.isFavorite } : r
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

      setPendingStepOrders: (orders) => set({ pendingStepOrders: orders }),

      clearPendingStepOrders: () => set({ pendingStepOrders: {} }),

      startExecution: (routineId, participantChildIds, stepOrders) => {
        const routine = get().routines.find((item) => item.id === routineId);
        if (!routine) return null;
        const resolvedStepOrders = stepOrders ?? {};

        const execution: RoutineExecution = {
          id: generateId(),
          routineId,
          childId: routine.childId,
          participantChildIds: participantChildIds?.length ? participantChildIds : [routine.childId],
          customStepOrder: resolvedStepOrders[routineId],
          startedAt: new Date().toISOString(),
          stepsCompleted: [],
          earnedStars: 0,
        };
        set({ currentExecution: execution, chainQueue: [], pendingStepOrders: {} });
        return execution;
      },

      startChain: (routineIds, participantChildIds, stepOrders) => {
        if (routineIds.length === 0) return null;
        const [first, ...rest] = routineIds;
        const firstRoutine = get().routines.find((item) => item.id === first);
        if (!firstRoutine) return null;
        const resolvedStepOrders = stepOrders ?? {};

        const execution: RoutineExecution = {
          id: generateId(),
          routineId: first,
          childId: firstRoutine.childId,
          participantChildIds: participantChildIds?.length ? participantChildIds : [firstRoutine.childId],
          customStepOrder: resolvedStepOrders[first],
          startedAt: new Date().toISOString(),
          stepsCompleted: [],
          earnedStars: 0,
        };
        set({ currentExecution: execution, chainQueue: rest, pendingStepOrders: resolvedStepOrders });
        return execution;
      },

      nextInChain: () => {
        const { chainQueue, currentExecution, routines, pendingStepOrders } = get();
        if (chainQueue.length === 0 || !currentExecution) return null;
        const [next, ...rest] = chainQueue;
        const nextRoutine = routines.find((item) => item.id === next);
        if (!nextRoutine) {
          const remainingOrders = { ...pendingStepOrders };
          delete remainingOrders[next];
          set({ currentExecution: null, chainQueue: rest, pendingStepOrders: remainingOrders });
          return null;
        }

        const execution: RoutineExecution = {
          id: generateId(),
          routineId: next,
          childId: nextRoutine.childId,
          participantChildIds: currentExecution.participantChildIds,
          customStepOrder: pendingStepOrders[next],
          startedAt: new Date().toISOString(),
          stepsCompleted: [],
          earnedStars: 0,
        };
        const remainingOrders = { ...pendingStepOrders };
        delete remainingOrders[next];
        set({ currentExecution: execution, chainQueue: rest, pendingStepOrders: remainingOrders });
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
        const { currentExecution, routines, chainQueue, pendingStepOrders } = get();
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
          pendingStepOrders: chainQueue.length === 0 ? {} : pendingStepOrders,
        }));
        return completed;
      },

      cancelExecution: () => set({ currentExecution: null, chainQueue: [], pendingStepOrders: {} }),
    }),
    {
      name: 'routine-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        routines: state.routines,
        trashedRoutines: state.trashedRoutines,
        executions: state.executions,
      }),
    }
  )
);
