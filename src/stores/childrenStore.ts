import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Child } from '../types';
import { generateId } from '../utils/id';

interface ChildrenState {
  children: Child[];
  addChild: (child: Omit<Child, 'id' | 'createdAt'>) => Child;
  updateChild: (id: string, updates: Partial<Omit<Child, 'id' | 'createdAt'>>) => void;
  removeChild: (id: string) => void;
  getChild: (id: string) => Child | undefined;
}

export const useChildrenStore = create<ChildrenState>()(
  persist(
    (set, get) => ({
      children: [],
      addChild: (data) => {
        const child: Child = {
          ...data,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ children: [...state.children, child] }));
        return child;
      },
      updateChild: (id, updates) =>
        set((state) => ({
          children: state.children.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),
      removeChild: (id) =>
        set((state) => ({
          children: state.children.filter((c) => c.id !== id),
        })),
      getChild: (id) => get().children.find((c) => c.id === id),
    }),
    {
      name: 'children-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
