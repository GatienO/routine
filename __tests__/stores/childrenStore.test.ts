jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

import { useChildrenStore } from '../../src/stores/childrenStore';

beforeEach(() => {
  useChildrenStore.setState({ children: [] });
});

describe('childrenStore', () => {
  test('addChild creates a child with generated id and createdAt', () => {
    const child = useChildrenStore.getState().addChild({
      name: 'Alice',
      avatar: '🦊',
      color: '#FF6B6B',
      age: 5,
    });

    expect(child.id).toBeTruthy();
    expect(child.name).toBe('Alice');
    expect(child.createdAt).toBeTruthy();
    expect(useChildrenStore.getState().children).toHaveLength(1);
  });

  test('updateChild modifies fields', () => {
    const child = useChildrenStore.getState().addChild({
      name: 'Bob',
      avatar: '🐻',
      color: '#4ECDC4',
      age: 7,
    });

    useChildrenStore.getState().updateChild(child.id, { name: 'Bobby', age: 8 });
    const updated = useChildrenStore.getState().getChild(child.id);
    expect(updated?.name).toBe('Bobby');
    expect(updated?.age).toBe(8);
    expect(updated?.avatar).toBe('🐻'); // unchanged
  });

  test('removeChild deletes a child', () => {
    const child = useChildrenStore.getState().addChild({
      name: 'Charlie',
      avatar: '🐱',
      color: '#45B7D1',
      age: 4,
    });

    useChildrenStore.getState().removeChild(child.id);
    expect(useChildrenStore.getState().children).toHaveLength(0);
    expect(useChildrenStore.getState().getChild(child.id)).toBeUndefined();
  });

  test('getChild returns undefined for unknown id', () => {
    expect(useChildrenStore.getState().getChild('nope')).toBeUndefined();
  });

  test('multiple children managed independently', () => {
    useChildrenStore.getState().addChild({ name: 'A', avatar: '🐶', color: '#FF6B6B', age: 3 });
    useChildrenStore.getState().addChild({ name: 'B', avatar: '🐱', color: '#4ECDC4', age: 6 });
    useChildrenStore.getState().addChild({ name: 'C', avatar: '🐰', color: '#45B7D1', age: 9 });

    expect(useChildrenStore.getState().children).toHaveLength(3);

    const b = useChildrenStore.getState().children.find((c) => c.name === 'B');
    useChildrenStore.getState().removeChild(b!.id);
    expect(useChildrenStore.getState().children).toHaveLength(2);
    expect(useChildrenStore.getState().children.map((c) => c.name)).toEqual(['A', 'C']);
  });
});
