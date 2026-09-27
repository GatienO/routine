import { groupActiveRoutines, orderGroupChildIds } from '../../src/features/routines/group-routines';
import type { Routine } from '../../src/types';

const step: Routine['steps'][number] = {
  id: 'step-1',
  title: 'Se préparer',
  icon: '✓',
  color: '#abc',
  durationMinutes: 5,
  instruction: '',
  isRequired: true,
  order: 0,
};

function routine(id: string, createdAt: string, changes: Partial<Routine> = {}): Routine {
  return {
    id,
    childId: id,
    name: id,
    icon: '✓',
    color: '#abc',
    category: 'morning',
    steps: [step],
    isActive: true,
    isFavorite: false,
    createdAt,
    updatedAt: createdAt,
    ...changes,
  };
}

describe('groupActiveRoutines', () => {
  const old = '2026-01-01T08:00:00.000Z';
  const newer = '2026-01-02T08:00:00.000Z';

  test('uses a favorite on any child copy and keeps the oldest copy as a stable sample', () => {
    const first = routine('first', old, { name: 'Matin', childId: 'child-a' });
    const second = routine('second', newer, { name: 'Matin', childId: 'child-b', isFavorite: true });
    const other = routine('other', old, { isFavorite: true });

    const groups = groupActiveRoutines([second, other, first]);
    expect(groups.map((group) => group.sample.id)).toEqual(['first', 'other']);
    expect(groups[0]).toMatchObject({ isFavorite: true, childIds: ['child-a', 'child-b'] });
  });

  test('editing does not promote a routine; disabling or deleting a favorite changes priority', () => {
    const first = routine('first', old, { updatedAt: '2026-09-26T10:00:00.000Z' });
    const second = routine('second', newer);
    expect(groupActiveRoutines([second, first]).map((group) => group.sample.id)).toEqual(['first', 'second']);
    expect(groupActiveRoutines([first, { ...second, isFavorite: true }])[0].sample.id).toBe('second');
    expect(groupActiveRoutines([first, { ...second, isFavorite: true, isActive: false }])[0].sample.id).toBe('first');
    expect(groupActiveRoutines([first])[0].sample.id).toBe('first');
  });

  test('ties use routine ids and favorites remain ordered by creation', () => {
    const favoriteNew = routine('z', newer, { isFavorite: true });
    const favoriteOld = routine('b', old, { isFavorite: true });
    const tie = routine('a', old, { isFavorite: true });
    expect(groupActiveRoutines([favoriteNew, favoriteOld, tie]).map((group) => group.sample.id)).toEqual(['a', 'b', 'z']);
  });

  test('participants follow family order without changing the stored group', () => {
    const groupIds = ['noe', 'lina'];
    expect(orderGroupChildIds(groupIds, ['lina', 'noe'])).toEqual(['lina', 'noe']);
    expect(groupIds).toEqual(['noe', 'lina']);
  });
});
