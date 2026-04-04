import { encodeRoutine, decodeRoutine, importRoutine } from '../../src/services/sharing';
import { Routine } from '../../src/types';

const mockRoutine: Routine = {
  id: 'test-id',
  childId: 'child-1',
  name: 'Routine test',
  icon: '🌅',
  color: '#FF6B6B',
  category: 'morning',
  steps: [
    {
      id: 'step-1',
      title: 'Étape 1',
      icon: '☀️',
      color: '#FFE66D',
      durationMinutes: 2,
      instruction: 'Fais ceci',
      isRequired: true,
      order: 0,
    },
    {
      id: 'step-2',
      title: 'Étape 2',
      icon: '🪥',
      color: '#74B9FF',
      durationMinutes: 3,
      instruction: '',
      isRequired: false,
      order: 1,
    },
  ],
  isActive: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('sharing service', () => {
  test('encodeRoutine returns a non-empty string', () => {
    const encoded = encodeRoutine(mockRoutine);
    expect(encoded).toBeTruthy();
    expect(typeof encoded).toBe('string');
    expect(encoded.length).toBeGreaterThan(0);
  });

  test('decodeRoutine can decode an encoded routine', () => {
    const encoded = encodeRoutine(mockRoutine);
    const decoded = decodeRoutine(encoded);
    expect(decoded).not.toBeNull();
    expect(decoded!.version).toBe(1);
    expect(decoded!.routine.name).toBe('Routine test');
    expect(decoded!.routine.steps).toHaveLength(2);
  });

  test('decodeRoutine returns null for invalid input', () => {
    expect(decodeRoutine('')).toBeNull();
    expect(decodeRoutine('not-base64!!')).toBeNull();
    expect(decodeRoutine(btoa('{"invalid": true}'))).toBeNull();
  });

  test('roundtrip preserves routine data', () => {
    const encoded = encodeRoutine(mockRoutine);
    const decoded = decodeRoutine(encoded);
    expect(decoded!.routine.name).toBe(mockRoutine.name);
    expect(decoded!.routine.icon).toBe(mockRoutine.icon);
    expect(decoded!.routine.color).toBe(mockRoutine.color);
    expect(decoded!.routine.category).toBe(mockRoutine.category);
    expect(decoded!.routine.steps).toHaveLength(mockRoutine.steps.length);
    expect(decoded!.routine.steps[0].title).toBe('Étape 1');
    expect(decoded!.routine.steps[1].title).toBe('Étape 2');
  });

  test('encoded routine does not contain personal data', () => {
    const encoded = encodeRoutine(mockRoutine);
    const decoded = decodeRoutine(encoded);
    // Should not contain child ID or internal IDs
    const json = JSON.stringify(decoded);
    expect(json).not.toContain('child-1');
    expect(json).not.toContain('test-id');
  });

  test('importRoutine creates a valid routine for a new child', () => {
    const encoded = encodeRoutine(mockRoutine);
    const decoded = decodeRoutine(encoded)!;
    const imported = importRoutine(decoded, 'new-child-id');
    expect(imported.childId).toBe('new-child-id');
    expect(imported.name).toBe('Routine test');
    expect(imported.steps).toHaveLength(2);
    // Steps should have new IDs
    expect(imported.steps[0].id).toBeTruthy();
    expect(imported.steps[0].id).not.toBe('');
  });
});
