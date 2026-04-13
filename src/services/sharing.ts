import { Routine, RoutineCategory, RoutineStep, ShareableRoutine } from '../types';
import { generateId } from '../utils/id';

const SHARE_VERSION = 1;
const SHARE_TYPE = 'routine-share';
const ROUTINE_CATEGORIES: RoutineCategory[] = [
  'morning',
  'evening',
  'school',
  'home',
  'weekend',
  'emotion',
  'custom',
];

function roundToNearestSecond(minutes: number): number {
  return Math.round(minutes * 60) / 60;
}

export const MAX_PRACTICAL_SHARE_LINK_LENGTH = 1800;

export interface RoutineShareArtifacts {
  shareable: ShareableRoutine;
  code: string;
  link: string;
  qrPayload: string;
  json: string;
  fileName: string;
  isLinkPractical: boolean;
  shareMessage: string;
}

export interface ParsedRoutineImport {
  source: 'deep-link' | 'code' | 'json' | 'unknown';
  normalizedCode: string | null;
  shareable: ShareableRoutine | null;
  errors: string[];
}

function encodeUtf8Base64Url(value: string): string {
  const base64 = btoa(unescape(encodeURIComponent(value)));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function decodeUtf8Base64Url(value: string): string {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const paddingLength = (4 - (normalized.length % 4 || 4)) % 4;
  const padded = `${normalized}${'='.repeat(paddingLength)}`;
  return decodeURIComponent(escape(atob(padded)));
}

function sanitizeFileName(value: string): string {
  const base = value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return base || 'routine';
}

function stripCodeFences(value: string): string {
  return value
    .trim()
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/i, '')
    .trim();
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeString(value: unknown, { trim = true } = {}): string | null {
  if (typeof value !== 'string') return null;
  return trim ? value.trim() : value;
}

function normalizeStep(step: unknown, index: number): RoutineStep | null {
  if (!isObject(step)) return null;

  const title = normalizeString(step.title);
  const icon = normalizeString(step.icon, { trim: false });
  const color = normalizeString(step.color, { trim: false });
  const instruction = typeof step.instruction === 'string' ? step.instruction.trim() : '';
  const mediaUri =
    typeof step.mediaUri === 'string' && step.mediaUri.trim().length > 0
      ? step.mediaUri.trim()
      : undefined;

  if (!title || !icon || !color) return null;
  if (typeof step.durationMinutes !== 'number' || !Number.isFinite(step.durationMinutes)) return null;
  if (step.durationMinutes < 0) return null;
  if (
    step.minimumDurationMinutes !== undefined &&
    (typeof step.minimumDurationMinutes !== 'number' ||
      !Number.isFinite(step.minimumDurationMinutes) ||
      step.minimumDurationMinutes < 0)
  ) {
    return null;
  }
  if (typeof step.isRequired !== 'boolean') return null;

  const providedOrder =
    typeof step.order === 'number' && Number.isFinite(step.order) ? step.order : index;

  return {
    id: typeof step.id === 'string' ? step.id : '',
    title,
    icon,
    color,
    durationMinutes: roundToNearestSecond(step.durationMinutes),
    minimumDurationMinutes:
      typeof step.minimumDurationMinutes === 'number'
        ? roundToNearestSecond(step.minimumDurationMinutes)
        : 0,
    instruction,
    isRequired: step.isRequired,
    order: providedOrder,
    mediaUri,
  };
}

function normalizeShareableRoutine(input: unknown): ShareableRoutine | null {
  if (!isObject(input)) return null;

  const payloadType = normalizeString(input.type);
  const version = input.version;
  const exportedAt =
    typeof input.exportedAt === 'string' && input.exportedAt.trim().length > 0
      ? input.exportedAt
      : new Date(0).toISOString();

  if (version !== SHARE_VERSION) return null;
  if (payloadType && payloadType !== SHARE_TYPE) return null;
  if (!isObject(input.routine)) return null;

  const routine = input.routine;
  const name = normalizeString(routine.name);
  const icon = normalizeString(routine.icon, { trim: false });
  const color = normalizeString(routine.color, { trim: false });
  const description = typeof routine.description === 'string' ? routine.description.trim() : '';
  const category = normalizeString(routine.category);
  const isActive = typeof routine.isActive === 'boolean' ? routine.isActive : true;
  const isFavorite = typeof routine.isFavorite === 'boolean' ? routine.isFavorite : undefined;

  if (!name || !icon || !color || !category) return null;
  if (!ROUTINE_CATEGORIES.includes(category as RoutineCategory)) return null;
  if (!Array.isArray(routine.steps) || routine.steps.length === 0) return null;

  const normalizedSteps = routine.steps
    .map((step, index) => normalizeStep(step, index))
    .filter(Boolean) as RoutineStep[];

  if (normalizedSteps.length !== routine.steps.length) return null;

  return {
    type: SHARE_TYPE,
    version: SHARE_VERSION,
    exportedAt,
    routine: {
      name,
      description,
      icon,
      color,
      category: category as RoutineCategory,
      steps: [...normalizedSteps]
        .sort((left, right) => left.order - right.order)
        .map((step, index) => ({ ...step, order: index, id: '' })),
      isActive,
      isFavorite,
    },
  };
}

function tryParseJsonPayload(raw: string): ShareableRoutine | null {
  try {
    const parsed = JSON.parse(stripCodeFences(raw));
    return normalizeShareableRoutine(parsed);
  } catch {
    return null;
  }
}

function extractCodeFromInput(raw: string): { code: string | null; source: ParsedRoutineImport['source'] } {
  const deepLinkMatch =
    raw.match(/routine:\/\/import\/([A-Za-z0-9_-]+)/i) ??
    raw.match(/[?&](?:code|payload)=([A-Za-z0-9_-]+)/i);

  if (deepLinkMatch?.[1]) {
    return { code: decodeURIComponent(deepLinkMatch[1]), source: 'deep-link' };
  }

  const labeledCodeMatch =
    raw.match(/Code import\s*:?\s*([A-Za-z0-9_-]+)/i) ??
    raw.match(/Payload QR\s*:?\s*([A-Za-z0-9_-]+)/i);

  if (labeledCodeMatch?.[1]) {
    return { code: labeledCodeMatch[1].trim(), source: 'code' };
  }

  const trimmed = raw.trim();
  if (/^[A-Za-z0-9_-]+$/.test(trimmed)) {
    return { code: trimmed, source: 'code' };
  }

  return { code: null, source: 'unknown' };
}

export function createShareableRoutine(routine: Routine): ShareableRoutine {
  return {
    type: SHARE_TYPE,
    version: SHARE_VERSION,
    exportedAt: new Date().toISOString(),
    routine: {
      name: routine.name.trim(),
      description: routine.description?.trim() ?? '',
      icon: routine.icon,
      color: routine.color,
      category: routine.category,
      steps: [...routine.steps]
        .sort((left, right) => left.order - right.order)
        .map((step, index) => ({
          ...step,
          id: '',
          order: index,
          instruction: step.instruction?.trim() ?? '',
          minimumDurationMinutes: step.minimumDurationMinutes ?? 0,
        })),
      isActive: routine.isActive,
      isFavorite: routine.isFavorite,
    },
  };
}

export function encodeShareableRoutine(shareable: ShareableRoutine): string {
  return encodeUtf8Base64Url(JSON.stringify(shareable));
}

export function encodeRoutine(routine: Routine): string {
  return encodeShareableRoutine(createShareableRoutine(routine));
}

export function decodeRoutine(encoded: string): ShareableRoutine | null {
  try {
    const json = decodeUtf8Base64Url(encoded.trim());
    return normalizeShareableRoutine(JSON.parse(json));
  } catch {
    return null;
  }
}

export function parseRoutineImportInput(raw: string): ParsedRoutineImport {
  const cleaned = stripCodeFences(raw);
  if (!cleaned) {
    return {
      source: 'unknown',
      normalizedCode: null,
      shareable: null,
      errors: ['Aucune donnee a importer.'],
    };
  }

  const jsonPayload = tryParseJsonPayload(cleaned);
  if (jsonPayload) {
    return {
      source: 'json',
      normalizedCode: encodeShareableRoutine(jsonPayload),
      shareable: jsonPayload,
      errors: [],
    };
  }

  const { code, source } = extractCodeFromInput(cleaned);
  if (!code) {
    return {
      source: 'unknown',
      normalizedCode: null,
      shareable: null,
      errors: ['Format non reconnu. Collez un lien, un code ou un JSON valide.'],
    };
  }

  const decoded = decodeRoutine(code);
  if (!decoded) {
    return {
      source,
      normalizedCode: code,
      shareable: null,
      errors: ['Le payload est invalide ou incomplet.'],
    };
  }

  return {
    source,
    normalizedCode: code,
    shareable: decoded,
    errors: [],
  };
}

export function importRoutine(
  shareable: ShareableRoutine,
  childId: string,
): Omit<Routine, 'id' | 'createdAt' | 'updatedAt'> {
  const normalized = normalizeShareableRoutine(shareable);
  if (!normalized) {
    throw new Error('Routine share payload is invalid.');
  }

  return {
    ...normalized.routine,
    childId,
    steps: normalized.routine.steps.map((step, index) => ({
      ...step,
      id: generateId(),
      order: index,
    })),
    isActive: normalized.routine.isActive ?? true,
  };
}

export function generateShareLink(encoded: string): string {
  return `routine://import/${encoded}`;
}

export function isShareLinkPractical(link: string): boolean {
  return link.length <= MAX_PRACTICAL_SHARE_LINK_LENGTH;
}

export function createRoutineShareArtifacts(routine: Routine): RoutineShareArtifacts {
  const shareable = createShareableRoutine(routine);
  const code = encodeShareableRoutine(shareable);
  const link = generateShareLink(code);
  const isLinkPractical = isShareLinkPractical(link);
  const qrPayload = isLinkPractical ? link : code;
  const json = JSON.stringify(shareable, null, 2);
  const fileName = `${sanitizeFileName(routine.name)}-routine-share.json`;
  const shareMessage = [
    routine.name.trim(),
    '',
    'Lien app',
    link,
    '',
    'Code import',
    code,
    '',
    'Payload QR',
    qrPayload,
    ...(isLinkPractical
      ? []
      : ['', 'Le lien est volumineux : privilegiez le code, le QR ou le fichier JSON.']),
  ].join('\n');

  return {
    shareable,
    code,
    link,
    qrPayload,
    json,
    fileName,
    isLinkPractical,
    shareMessage,
  };
}

export function buildRoutineShareText(routine: Routine): string {
  return createRoutineShareArtifacts(routine).shareMessage;
}
