export const ICON_PICKER_GROUPS = [
  {
    key: 'hygiene',
    label: 'Hygiène',
    emojis: ['🪥', '🚿', '🛁', '🧼', '🧴', '🧻', '🪒', '🪮', '🧽', '🪞', '🪣', '🚰', '🧺', '🧷', '🪠', '🪤', '🧹', '🧯', '🧫', '🧬'],
  },
  {
    key: 'clothing',
    label: 'Habillage',
    emojis: ['👕', '👖', '👗', '👚', '🧥', '🧦', '🩳', '🩲', '👔', '👙', '👘', '🥻', '🧣', '🧤', '🧢', '👒', '🎩', '👞', '👟', '🩰'],
  },
  {
    key: 'meals',
    label: 'Repas',
    emojis: ['🍎', '🍌', '🍓', '🍇', '🥝', '🍑', '🍒', '🍉', '🥕', '🥦', '🌽', '🍞', '🥐', '🥖', '🧀', '🥚', '🍳', '🥣', '🥛', '🍽️'],
  },
  {
    key: 'school',
    label: 'École',
    emojis: ['🎒', '📚', '📖', '📝', '✏️', '🖍️', '📏', '📐', '🧮', '🧠', '🔬', '🔭', '🗂️', '📎', '📌', '📅', '🏫', '🧑‍🏫', '📓', '🧾'],
  },
  {
    key: 'play',
    label: 'Jeu',
    emojis: ['🧸', '🧩', '🎲', '🪀', '🎯', '⚽', '🏀', '🏈', '🎾', '🏐', '🪁', '🚗', '🚲', '🛴', '🎮', '🎳', '🧃', '🎪', '🪄', '🎭'],
  },
  {
    key: 'relax',
    label: 'Détente',
    emojis: ['🌙', '☁️', '🌈', '⭐', '✨', '🌸', '🌼', '🍃', '🌿', '🕯️', '🛌', '🎧', '📖', '🛁', '🧘', '😌', '🫧', '🌊', '🪷', '💆'],
  },
  {
    key: 'rewards',
    label: 'Récompenses',
    emojis: ['⭐', '🏆', '🥇', '🥈', '🥉', '🎖️', '🏅', '🎉', '🎊', '🎁', '🍬', '🍭', '🍫', '🍪', '🧁', '🍦', '🍩', '🎈', '👏', '❤️'],
  },
  {
    key: 'misc',
    label: 'Divers',
    emojis: ['🌅', '🏠', '👨‍👩‍👧', '🚀', '💫', '🌻', '🐻', '🦋', '🏰', '💪', '🎵', '💊', '🐶', '🐱', '⏰', '🏃', '🚴', '☀️'],
  },
] as const;

const flattenUnique = (groups: readonly { emojis: readonly string[] }[]) =>
  [...new Set(groups.flatMap((group) => group.emojis))] as string[];

export const ICON_PICKER_EMOJIS = flattenUnique(ICON_PICKER_GROUPS);

export const STEP_ICONS = ICON_PICKER_EMOJIS;

export const ROUTINE_ICONS = ICON_PICKER_EMOJIS;

export const AVATAR_ICONS = [
  '🦁', '🐰', '🦊', '🐼', '🐨', '🦄',
  '🐸', '🐱', '🐶', '🐯', '🦋', '🐧',
  '🦉', '🐵', '🦈', '🐙', '🦕', '🐝',
  '🐞', '🦜', '🐬', '🦩', '🐢', '🐘',
] as const;
