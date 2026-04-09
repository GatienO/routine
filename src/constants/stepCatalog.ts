export type StepCatalogCategoryId =
  | 'hygiene'
  | 'habillage'
  | 'repas'
  | 'ecole'
  | 'maison'
  | 'calme';

export interface StepCatalogCategory {
  id: StepCatalogCategoryId;
  label: string;
  icon: string;
}

export interface StepCatalogItem {
  id: string;
  title: string;
  icon: string;
  durationMinutes: number;
  instruction: string;
  isRequired: boolean;
  categoryId: StepCatalogCategoryId;
}

export const STEP_CATALOG_CATEGORIES: StepCatalogCategory[] = [
  { id: 'hygiene', label: 'Hygiene', icon: '🪥' },
  { id: 'habillage', label: 'Habillage', icon: '👕' },
  { id: 'repas', label: 'Repas', icon: '🍽️' },
  { id: 'ecole', label: 'Ecole', icon: '🎒' },
  { id: 'maison', label: 'Maison', icon: '🧹' },
  { id: 'calme', label: 'Calme', icon: '🌙' },
];

export const STEP_CATALOG_ITEMS: StepCatalogItem[] = [
  {
    id: 'step-toilettes',
    title: 'Je vais aux toilettes',
    icon: '🚿',
    durationMinutes: 2,
    instruction: 'Je commence par passer aux toilettes.',
    isRequired: true,
    categoryId: 'hygiene',
  },
  {
    id: 'step-dents',
    title: 'Je me brosse les dents',
    icon: '🪥',
    durationMinutes: 2,
    instruction: 'Je brosse bien toutes mes dents sans oublier le fond.',
    isRequired: true,
    categoryId: 'hygiene',
  },
  {
    id: 'step-mains',
    title: 'Je me lave les mains',
    icon: '🧼',
    durationMinutes: 1,
    instruction: 'Je frotte avec du savon puis je rince.',
    isRequired: true,
    categoryId: 'hygiene',
  },
  {
    id: 'step-visage',
    title: 'Je me lave le visage',
    icon: '💧',
    durationMinutes: 1,
    instruction: 'Je passe un peu d eau sur mon visage pour me rafraichir.',
    isRequired: true,
    categoryId: 'hygiene',
  },
  {
    id: 'step-bain',
    title: 'Je prends mon bain',
    icon: '🛁',
    durationMinutes: 10,
    instruction: 'Je profite d un bain calme avant la suite de la routine.',
    isRequired: true,
    categoryId: 'hygiene',
  },
  {
    id: 'step-habille',
    title: 'Je m habille',
    icon: '👕',
    durationMinutes: 5,
    instruction: 'Je mets mes vetements dans le bon ordre.',
    isRequired: true,
    categoryId: 'habillage',
  },
  {
    id: 'step-pyjama',
    title: 'Je mets mon pyjama',
    icon: '👘',
    durationMinutes: 3,
    instruction: 'Je mets mon pyjama avant d aller au lit.',
    isRequired: true,
    categoryId: 'habillage',
  },
  {
    id: 'step-chaussettes',
    title: 'Je mets mes chaussettes',
    icon: '🧦',
    durationMinutes: 1,
    instruction: 'Je mets mes chaussettes sans me tromper de pied.',
    isRequired: true,
    categoryId: 'habillage',
  },
  {
    id: 'step-chaussures',
    title: 'Je mets mes chaussures',
    icon: '👟',
    durationMinutes: 2,
    instruction: 'Je mets mes chaussures et je ferme bien.',
    isRequired: true,
    categoryId: 'habillage',
  },
  {
    id: 'step-manteau',
    title: 'Je prends mon manteau',
    icon: '🧥',
    durationMinutes: 1,
    instruction: 'Je prends mon manteau avant de sortir.',
    isRequired: true,
    categoryId: 'habillage',
  },
  {
    id: 'step-petitdej',
    title: 'Je prends mon petit dejeuner',
    icon: '🥣',
    durationMinutes: 10,
    instruction: 'Je prends le temps de bien manger avant de partir.',
    isRequired: true,
    categoryId: 'repas',
  },
  {
    id: 'step-table',
    title: 'Je m installe a table',
    icon: '🍽️',
    durationMinutes: 1,
    instruction: 'Je m assois calmement et je me prepare a manger.',
    isRequired: true,
    categoryId: 'repas',
  },
  {
    id: 'step-eau',
    title: 'Je bois un peu d eau',
    icon: '💧',
    durationMinutes: 1,
    instruction: 'Je bois quelques gorgees d eau.',
    isRequired: false,
    categoryId: 'repas',
  },
  {
    id: 'step-sac',
    title: 'Je prends mon sac',
    icon: '🎒',
    durationMinutes: 1,
    instruction: 'Je verifie mon sac avant de partir.',
    isRequired: true,
    categoryId: 'ecole',
  },
  {
    id: 'step-gourde',
    title: 'Je prends ma gourde',
    icon: '🥤',
    durationMinutes: 1,
    instruction: 'Je prends ma gourde pour la journee.',
    isRequired: false,
    categoryId: 'ecole',
  },
  {
    id: 'step-au-revoir',
    title: 'Je dis au revoir',
    icon: '👋',
    durationMinutes: 1,
    instruction: 'Je dis au revoir avant de partir.',
    isRequired: true,
    categoryId: 'ecole',
  },
  {
    id: 'step-rangement',
    title: 'Je range ma chambre',
    icon: '🧹',
    durationMinutes: 5,
    instruction: 'Je remets ma chambre en ordre avant la suite.',
    isRequired: true,
    categoryId: 'maison',
  },
  {
    id: 'step-jouets',
    title: 'Je range mes jouets',
    icon: '🧸',
    durationMinutes: 4,
    instruction: 'Chaque jouet retourne a sa place.',
    isRequired: true,
    categoryId: 'maison',
  },
  {
    id: 'step-livres',
    title: 'Je range les livres',
    icon: '📚',
    durationMinutes: 3,
    instruction: 'Je replace les livres sur leur etagere.',
    isRequired: false,
    categoryId: 'maison',
  },
  {
    id: 'step-histoire',
    title: 'J ecoute une histoire',
    icon: '📚',
    durationMinutes: 10,
    instruction: 'Je choisis une histoire calme pour finir la routine.',
    isRequired: true,
    categoryId: 'calme',
  },
  {
    id: 'step-respire',
    title: 'Je respire calmement',
    icon: '🌬️',
    durationMinutes: 2,
    instruction: 'J inspire doucement puis je souffle lentement.',
    isRequired: true,
    categoryId: 'calme',
  },
  {
    id: 'step-doudou',
    title: 'Je prends mon doudou',
    icon: '🧸',
    durationMinutes: 1,
    instruction: 'Je prends mon doudou pour me rassurer.',
    isRequired: false,
    categoryId: 'calme',
  },
  {
    id: 'step-au-lit',
    title: 'Je vais au lit',
    icon: '🛏️',
    durationMinutes: 1,
    instruction: 'Je me mets au lit calmement.',
    isRequired: true,
    categoryId: 'calme',
  },
];
