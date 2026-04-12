import {
  createRoutineShareArtifacts,
  decodeRoutine,
  encodeRoutine,
  importRoutine,
  parseRoutineImportInput,
} from '../../src/services/sharing';
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
      title: 'Etape 1',
      icon: '☀️',
      color: '#FFE66D',
      durationMinutes: 2,
      instruction: 'Fais ceci',
      isRequired: true,
      order: 0,
    },
    {
      id: 'step-2',
      title: 'Etape 2',
      icon: '🪥',
      color: '#74B9FF',
      durationMinutes: 3,
      instruction: '',
      isRequired: false,
      order: 1,
    },
  ],
  isActive: true,
  isFavorite: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('sharing service', () => {
  test('encodeRoutine returns a url-safe non-empty code', () => {
    const encoded = encodeRoutine(mockRoutine);
    expect(encoded).toBeTruthy();
    expect(typeof encoded).toBe('string');
    expect(encoded.length).toBeGreaterThan(0);
    expect(encoded).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  test('decodeRoutine decodes a valid shared routine', () => {
    const encoded = encodeRoutine(mockRoutine);
    const decoded = decodeRoutine(encoded);

    expect(decoded).not.toBeNull();
    expect(decoded!.type).toBe('routine-share');
    expect(decoded!.version).toBe(1);
    expect(decoded!.exportedAt).toBeTruthy();
    expect(decoded!.routine.name).toBe('Routine test');
    expect(decoded!.routine.steps).toHaveLength(2);
    expect(decoded!.routine.isFavorite).toBe(true);
  });

  test('decodeRoutine rejects invalid input', () => {
    expect(decodeRoutine('')).toBeNull();
    expect(decodeRoutine('not-base64')).toBeNull();
    expect(
      decodeRoutine(
        btoa(JSON.stringify({ type: 'routine-share', version: 1, routine: { name: '' } }))
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/g, ''),
      ),
    ).toBeNull();
  });

  test('roundtrip preserves shareable routine data', () => {
    const encoded = encodeRoutine(mockRoutine);
    const decoded = decodeRoutine(encoded);

    expect(decoded!.routine.name).toBe(mockRoutine.name);
    expect(decoded!.routine.icon).toBe(mockRoutine.icon);
    expect(decoded!.routine.color).toBe(mockRoutine.color);
    expect(decoded!.routine.category).toBe(mockRoutine.category);
    expect(decoded!.routine.steps).toHaveLength(mockRoutine.steps.length);
    expect(decoded!.routine.steps[0].title).toBe('Etape 1');
    expect(decoded!.routine.steps[1].title).toBe('Etape 2');
  });

  test('encoded routine does not contain personal ids', () => {
    const encoded = encodeRoutine(mockRoutine);
    const decoded = decodeRoutine(encoded);
    const json = JSON.stringify(decoded);

    expect(json).not.toContain('child-1');
    expect(json).not.toContain('test-id');
    expect(json).not.toContain('step-1');
  });

  test('importRoutine recreates a routine with fresh ids', () => {
    const encoded = encodeRoutine(mockRoutine);
    const decoded = decodeRoutine(encoded)!;
    const imported = importRoutine(decoded, 'new-child-id');

    expect(imported.childId).toBe('new-child-id');
    expect(imported.name).toBe('Routine test');
    expect(imported.isFavorite).toBe(true);
    expect(imported.steps).toHaveLength(2);
    expect(imported.steps[0].id).toBeTruthy();
    expect(imported.steps[0].id).not.toBe('');
  });

  test('createRoutineShareArtifacts generates link, code, qr payload and json', () => {
    const artifacts = createRoutineShareArtifacts(mockRoutine);

    expect(artifacts.link).toContain('routine://import/');
    expect(artifacts.code).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(artifacts.qrPayload).toBeTruthy();
    expect(artifacts.json).toContain('"type": "routine-share"');
    expect(artifacts.fileName).toContain('routine-test');
    expect(artifacts.shareMessage).toContain('Code import');
  });

  test('parseRoutineImportInput accepts a deep link', () => {
    const artifacts = createRoutineShareArtifacts(mockRoutine);
    const parsed = parseRoutineImportInput(artifacts.link);

    expect(parsed.errors).toEqual([]);
    expect(parsed.source).toBe('deep-link');
    expect(parsed.shareable?.routine.name).toBe(mockRoutine.name);
  });

  test('parseRoutineImportInput accepts a raw code', () => {
    const artifacts = createRoutineShareArtifacts(mockRoutine);
    const parsed = parseRoutineImportInput(artifacts.code);

    expect(parsed.errors).toEqual([]);
    expect(parsed.source).toBe('code');
    expect(parsed.shareable?.routine.name).toBe(mockRoutine.name);
  });

  test('parseRoutineImportInput accepts exported json', () => {
    const artifacts = createRoutineShareArtifacts(mockRoutine);
    const parsed = parseRoutineImportInput(artifacts.json);

    expect(parsed.errors).toEqual([]);
    expect(parsed.source).toBe('json');
    expect(parsed.shareable?.routine.steps).toHaveLength(2);
  });

  test('parseRoutineImportInput rejects malformed payloads', () => {
    const parsed = parseRoutineImportInput('{"type":"routine-share","version":1}');

    expect(parsed.shareable).toBeNull();
    expect(parsed.errors[0]).toBeTruthy();
  });
});
