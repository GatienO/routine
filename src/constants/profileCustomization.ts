/** Profile customization tabs & emoji sets for child profiles */

export type ProfileTab = 'avatar' | 'companion' | 'passion';

export interface ProfileTabConfig {
  key: ProfileTab;
  icon: string;
  label: string;
}

export const PROFILE_TABS: ProfileTabConfig[] = [
  { key: 'avatar', icon: '👤', label: 'Avatar' },
  { key: 'companion', icon: '🧸', label: 'Doudou' },
  { key: 'passion', icon: '⭐', label: 'Passion' },
];

// ── Avatar (visages) ──
export const AVATAR_FACES = [
  '👶', '🧒', '👦', '👧',
  '🧑', '👱', '👩', '👨',
  '🧑‍🦱', '🧑‍🦰', '🧑‍🦳', '🧑‍🦲',
] as const;

// ── Companions / Doudous ──

export interface CompanionGroup {
  label: string;
  icon: string;
  emojis: readonly string[];
}

export const COMPANION_GROUPS: CompanionGroup[] = [
  {
    label: 'Animaux',
    icon: '🐾',
    emojis: [
      '🐻', '🐼', '🐨', '🐰', '🐶', '🐱',
      '🦊', '🐯', '🦁', '🐮', '🐷', '🐸',
      '🐵', '🐧', '🐤', '🐣', '🐢', '🦖',
    ],
  },
  {
    label: 'Originaux',
    icon: '🦄',
    emojis: [
      '🦄', '🐲', '🐉', '🦕', '🐙', '🐠',
      '🦜', '🦩', '🐬', '🦈',
    ],
  },
  {
    label: 'Imaginaires',
    icon: '🦸',
    emojis: [
      '🦸', '🦸‍♀️', '🦸‍♂️',
      '🧙', '🧙‍♀️', '🧙‍♂️',
      '👑', '🤴', '👸',
      '🧚', '🧚‍♀️', '🧚‍♂️',
      '🧝', '🧝‍♀️', '🧝‍♂️',
      '🧛', '🧛‍♀️', '🧛‍♂️',
    ],
  },
];

// ── Passions ──

export interface PassionGroup {
  label: string;
  icon: string;
  emojis: readonly string[];
}

export const PASSION_GROUPS: PassionGroup[] = [
  {
    label: 'Calme',
    icon: '😴',
    emojis: ['😴', '🛏️', '🌙', '☁️', '🧸'],
  },
  {
    label: 'Créatif',
    icon: '🎨',
    emojis: ['🎨', '🖍️', '✏️', '🧵', '🎭'],
  },
  {
    label: 'Actif',
    icon: '⚽',
    emojis: ['⚽', '🏃', '🚴', '🏀', '🤸'],
  },
  {
    label: 'Curieux',
    icon: '📚',
    emojis: ['📚', '🔬', '🧩', '🧠', '🧪'],
  },
  {
    label: 'Fun',
    icon: '🎵',
    emojis: ['🎵', '🎤', '🎸', '🥁', '💃'],
  },
];
