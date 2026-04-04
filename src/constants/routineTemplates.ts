import { RoutineCategory } from '../types';

export interface RoutineStepTemplate {
  title: string;
  icon: string;
  durationMinutes: number;
  instruction: string;
  isRequired: boolean;
}

export interface RoutineTemplate {
  id: string;
  name: string;
  icon: string;
  category: RoutineCategory;
  color: string;
  ageRange: [number, number];
  steps: RoutineStepTemplate[];
}

export interface RoutinePack {
  id: string;
  name: string;
  icon: string;
  description: string;
  templates: RoutineTemplate[];
}

// ─── Pack 1 : Essentiels ───────────────────────────────────────

const reveilEnDouceur: RoutineTemplate = {
  id: 'tpl-reveil-douceur',
  name: 'Réveil en douceur',
  icon: '🌞',
  category: 'morning',
  color: '#FDBA74',
  ageRange: [2, 5],
  steps: [
    { title: 'Je me réveille', icon: '🌤️', durationMinutes: 2, instruction: 'On ouvre les yeux et on se lève doucement.', isRequired: true },
    { title: 'Je vais aux toilettes', icon: '🚽', durationMinutes: 3, instruction: 'On commence par aller aux toilettes.', isRequired: true },
    { title: 'Je me lave le visage', icon: '💦', durationMinutes: 2, instruction: 'Un petit coup d\'eau pour se réveiller.', isRequired: true },
    { title: 'Je m\'habille', icon: '👕', durationMinutes: 5, instruction: 'On met ses vêtements du jour.', isRequired: true },
    { title: 'Je mets mes chaussettes', icon: '🧦', durationMinutes: 2, instruction: 'N\'oublie pas les chaussettes.', isRequired: true },
    { title: 'Je fais un câlin', icon: '🤗', durationMinutes: 1, instruction: 'Un câlin pour bien commencer la journée.', isRequired: false },
  ],
};

const superMatin: RoutineTemplate = {
  id: 'tpl-super-matin',
  name: 'Super matin',
  icon: '🌈',
  category: 'morning',
  color: '#FCD34D',
  ageRange: [3, 7],
  steps: [
    { title: 'Je me lève', icon: '🛏️', durationMinutes: 2, instruction: '', isRequired: true },
    { title: 'Je vais aux toilettes', icon: '🚽', durationMinutes: 3, instruction: '', isRequired: true },
    { title: 'Je me lave le visage', icon: '💦', durationMinutes: 2, instruction: '', isRequired: true },
    { title: 'Je m\'habille', icon: '👕', durationMinutes: 5, instruction: '', isRequired: true },
    { title: 'Je me brosse les dents', icon: '🪥', durationMinutes: 2, instruction: '', isRequired: true },
    { title: 'Je prends mon petit-déjeuner', icon: '🥣', durationMinutes: 10, instruction: '', isRequired: true },
    { title: 'Je mets mes chaussures', icon: '👟', durationMinutes: 2, instruction: '', isRequired: true },
    { title: 'Je prends mon sac', icon: '🎒', durationMinutes: 1, instruction: '', isRequired: true },
  ],
};

const dodoTranquille: RoutineTemplate = {
  id: 'tpl-dodo-tranquille',
  name: 'Dodo tranquille',
  icon: '🌙',
  category: 'evening',
  color: '#818CF8',
  ageRange: [2, 5],
  steps: [
    { title: 'Je range mes jouets', icon: '🧸', durationMinutes: 5, instruction: '', isRequired: true },
    { title: 'Je mets mon pyjama', icon: '🩳', durationMinutes: 3, instruction: '', isRequired: true },
    { title: 'Je vais aux toilettes', icon: '🚽', durationMinutes: 2, instruction: '', isRequired: true },
    { title: 'Je me brosse les dents', icon: '🪥', durationMinutes: 2, instruction: '', isRequired: true },
    { title: 'Je lis une histoire', icon: '📖', durationMinutes: 10, instruction: '', isRequired: true },
    { title: 'Je fais un câlin', icon: '🤍', durationMinutes: 1, instruction: '', isRequired: false },
    { title: 'J\'éteins la lumière', icon: '💡', durationMinutes: 1, instruction: '', isRequired: true },
  ],
};

const pretPourEcole: RoutineTemplate = {
  id: 'tpl-pret-ecole',
  name: 'Prêt pour l\'école',
  icon: '🎒',
  category: 'school',
  color: '#60A5FA',
  ageRange: [3, 7],
  steps: [
    { title: 'Je m\'habille', icon: '👕', durationMinutes: 5, instruction: '', isRequired: true },
    { title: 'Je déjeune', icon: '🍞', durationMinutes: 10, instruction: '', isRequired: true },
    { title: 'Je me brosse les dents', icon: '🪥', durationMinutes: 2, instruction: '', isRequired: true },
    { title: 'Je mets mes chaussures', icon: '👟', durationMinutes: 2, instruction: '', isRequired: true },
    { title: 'Je prends mon manteau', icon: '🧥', durationMinutes: 1, instruction: '', isRequired: true },
    { title: 'Je prends mon sac', icon: '🎒', durationMinutes: 1, instruction: '', isRequired: true },
    { title: 'Je suis prêt à partir', icon: '🚪', durationMinutes: 1, instruction: '', isRequired: true },
  ],
};

const missionRangement: RoutineTemplate = {
  id: 'tpl-mission-rangement',
  name: 'Mission rangement',
  icon: '🧺',
  category: 'home',
  color: '#F59E0B',
  ageRange: [2, 6],
  steps: [
    { title: 'Je ramasse les peluches', icon: '🧸', durationMinutes: 3, instruction: '', isRequired: true },
    { title: 'Je range les voitures', icon: '🚗', durationMinutes: 3, instruction: '', isRequired: true },
    { title: 'Je range les livres', icon: '📚', durationMinutes: 3, instruction: '', isRequired: true },
    { title: 'Je range les cubes', icon: '🧱', durationMinutes: 3, instruction: '', isRequired: true },
    { title: 'Ma chambre est rangée', icon: '✨', durationMinutes: 1, instruction: '', isRequired: true },
  ],
};

// ─── Pack 2 : Autonomie ────────────────────────────────────────

const jeMhabilleSeul: RoutineTemplate = {
  id: 'tpl-habille-seul',
  name: 'Je m\'habille seul',
  icon: '👚',
  category: 'home',
  color: '#2DD4BF',
  ageRange: [3, 6],
  steps: [
    { title: 'Je mets mon sous-vêtement', icon: '🩲', durationMinutes: 2, instruction: '', isRequired: true },
    { title: 'Je mets mon pantalon', icon: '👖', durationMinutes: 2, instruction: '', isRequired: true },
    { title: 'Je mets mon t-shirt', icon: '👕', durationMinutes: 2, instruction: '', isRequired: true },
    { title: 'Je mets mon pull', icon: '🧥', durationMinutes: 2, instruction: '', isRequired: true },
    { title: 'Je mets mes chaussettes', icon: '🧦', durationMinutes: 2, instruction: '', isRequired: true },
  ],
};

const dentsPropres: RoutineTemplate = {
  id: 'tpl-dents-propres',
  name: 'Dents propres',
  icon: '🪥',
  category: 'home',
  color: '#22C55E',
  ageRange: [2, 7],
  steps: [
    { title: 'Je prends ma brosse à dents', icon: '🪥', durationMinutes: 1, instruction: '', isRequired: true },
    { title: 'Je mets le dentifrice', icon: '✨', durationMinutes: 1, instruction: '', isRequired: true },
    { title: 'Je brosse en haut', icon: '😁', durationMinutes: 1, instruction: '', isRequired: true },
    { title: 'Je brosse en bas', icon: '😬', durationMinutes: 1, instruction: '', isRequired: true },
    { title: 'Je rince ma bouche', icon: '💦', durationMinutes: 1, instruction: '', isRequired: true },
    { title: 'Je range ma brosse', icon: '🫧', durationMinutes: 1, instruction: '', isRequired: true },
  ],
};

const mainsPropres: RoutineTemplate = {
  id: 'tpl-mains-propres',
  name: 'Mains toutes propres',
  icon: '🫧',
  category: 'home',
  color: '#38BDF8',
  ageRange: [2, 5],
  steps: [
    { title: 'J\'ouvre l\'eau', icon: '🚰', durationMinutes: 1, instruction: '', isRequired: true },
    { title: 'Je mets du savon', icon: '🧼', durationMinutes: 1, instruction: '', isRequired: true },
    { title: 'Je frotte mes mains', icon: '🙌', durationMinutes: 1, instruction: '', isRequired: true },
    { title: 'Je rince', icon: '💦', durationMinutes: 1, instruction: '', isRequired: true },
    { title: 'J\'essuie', icon: '🧻', durationMinutes: 1, instruction: '', isRequired: true },
    { title: 'Je ferme l\'eau', icon: '✅', durationMinutes: 1, instruction: '', isRequired: true },
  ],
};

const prepareMesAffaires: RoutineTemplate = {
  id: 'tpl-prepare-affaires',
  name: 'Je prépare mes affaires',
  icon: '🎒',
  category: 'school',
  color: '#4ADE80',
  ageRange: [4, 7],
  steps: [
    { title: 'Je prends mon sac', icon: '🎒', durationMinutes: 1, instruction: '', isRequired: true },
    { title: 'Je mets mon doudou si besoin', icon: '🧸', durationMinutes: 1, instruction: '', isRequired: false },
    { title: 'Je vérifie ma gourde', icon: '🥤', durationMinutes: 1, instruction: '', isRequired: true },
    { title: 'Je prends mon manteau', icon: '🧥', durationMinutes: 1, instruction: '', isRequired: true },
    { title: 'Tout est prêt', icon: '✅', durationMinutes: 1, instruction: '', isRequired: true },
  ],
};

// ─── Pack 3 : Bien-être ────────────────────────────────────────

const jeMeCalme: RoutineTemplate = {
  id: 'tpl-je-me-calme',
  name: 'Je me calme',
  icon: '🌿',
  category: 'custom',
  color: '#86EFAC',
  ageRange: [2, 7],
  steps: [
    { title: 'Je m\'assois calmement', icon: '🪑', durationMinutes: 1, instruction: '', isRequired: true },
    { title: 'Je respire doucement', icon: '🌬️', durationMinutes: 2, instruction: '', isRequired: true },
    { title: 'Je serre mon doudou', icon: '🧸', durationMinutes: 1, instruction: '', isRequired: false },
    { title: 'J\'écoute un son doux', icon: '🎧', durationMinutes: 2, instruction: '', isRequired: false },
    { title: 'Je suis prêt', icon: '😊', durationMinutes: 1, instruction: '', isRequired: true },
  ],
};

const calmeAvantDodo: RoutineTemplate = {
  id: 'tpl-calme-avant-dodo',
  name: 'Calme avant dodo',
  icon: '⭐',
  category: 'evening',
  color: '#93C5FD',
  ageRange: [3, 7],
  steps: [
    { title: 'Je baisse le volume', icon: '🔉', durationMinutes: 1, instruction: '', isRequired: true },
    { title: 'Je range tranquillement', icon: '🧺', durationMinutes: 3, instruction: '', isRequired: true },
    { title: 'Je respire 3 fois', icon: '🌬️', durationMinutes: 2, instruction: '', isRequired: true },
    { title: 'J\'écoute une histoire', icon: '📖', durationMinutes: 10, instruction: '', isRequired: true },
    { title: 'Je vais au lit sereinement', icon: '🛏️', durationMinutes: 1, instruction: '', isRequired: true },
  ],
};

const matinTranquille: RoutineTemplate = {
  id: 'tpl-matin-tranquille',
  name: 'Matin tranquille',
  icon: '🐥',
  category: 'weekend',
  color: '#FDE68A',
  ageRange: [2, 7],
  steps: [
    { title: 'Je me lève doucement', icon: '🌞', durationMinutes: 2, instruction: '', isRequired: true },
    { title: 'Je vais aux toilettes', icon: '🚽', durationMinutes: 3, instruction: '', isRequired: true },
    { title: 'Je m\'habille', icon: '👕', durationMinutes: 5, instruction: '', isRequired: true },
    { title: 'Je déjeune', icon: '🥣', durationMinutes: 10, instruction: '', isRequired: true },
    { title: 'Je choisis une activité', icon: '🎨', durationMinutes: 2, instruction: '', isRequired: false },
  ],
};

// ─── Bonus templates (hors packs) ──────────────────────────────

const bonneNuitZen: RoutineTemplate = {
  id: 'tpl-bonne-nuit-zen',
  name: 'Bonne nuit zen',
  icon: '😴',
  category: 'evening',
  color: '#A78BFA',
  ageRange: [3, 7],
  steps: [
    { title: 'Je range ma chambre', icon: '🧺', durationMinutes: 5, instruction: '', isRequired: true },
    { title: 'Je prends mon bain', icon: '🛁', durationMinutes: 10, instruction: '', isRequired: true },
    { title: 'Je mets mon pyjama', icon: '👘', durationMinutes: 3, instruction: '', isRequired: true },
    { title: 'Je me brosse les dents', icon: '🪥', durationMinutes: 2, instruction: '', isRequired: true },
    { title: 'Je bois un peu d\'eau', icon: '💧', durationMinutes: 1, instruction: '', isRequired: false },
    { title: 'Je respire calmement', icon: '🌬️', durationMinutes: 2, instruction: '', isRequired: true },
    { title: 'J\'écoute une histoire', icon: '📚', durationMinutes: 10, instruction: '', isRequired: true },
    { title: 'Je vais au lit', icon: '🛏️', durationMinutes: 1, instruction: '', isRequired: true },
  ],
};

const directionCreche: RoutineTemplate = {
  id: 'tpl-direction-creche',
  name: 'Direction la crèche',
  icon: '🐣',
  category: 'school',
  color: '#34D399',
  ageRange: [2, 3],
  steps: [
    { title: 'Je m\'habille', icon: '👕', durationMinutes: 5, instruction: '', isRequired: true },
    { title: 'Je mets ma couche / mes sous-vêtements', icon: '👶', durationMinutes: 2, instruction: '', isRequired: true },
    { title: 'Je prends mon doudou', icon: '🧸', durationMinutes: 1, instruction: '', isRequired: true },
    { title: 'Je mets mes chaussures', icon: '👟', durationMinutes: 2, instruction: '', isRequired: true },
    { title: 'Je prends mon sac', icon: '🎒', durationMinutes: 1, instruction: '', isRequired: true },
    { title: 'Je dis au revoir', icon: '👋', durationMinutes: 1, instruction: '', isRequired: true },
  ],
};

const aTable: RoutineTemplate = {
  id: 'tpl-a-table',
  name: 'À table',
  icon: '🍽️',
  category: 'home',
  color: '#F97316',
  ageRange: [2, 5],
  steps: [
    { title: 'Je me lave les mains', icon: '🫧', durationMinutes: 2, instruction: '', isRequired: true },
    { title: 'Je m\'assois à table', icon: '🪑', durationMinutes: 1, instruction: '', isRequired: true },
    { title: 'Je mets ma serviette', icon: '🧻', durationMinutes: 1, instruction: '', isRequired: true },
    { title: 'Je suis prêt à manger', icon: '🍽️', durationMinutes: 1, instruction: '', isRequired: true },
  ],
};

const finDuRepas: RoutineTemplate = {
  id: 'tpl-fin-repas',
  name: 'Fin du repas',
  icon: '🍎',
  category: 'home',
  color: '#FB7185',
  ageRange: [3, 7],
  steps: [
    { title: 'J\'apporte mon assiette', icon: '🍽️', durationMinutes: 1, instruction: '', isRequired: true },
    { title: 'J\'essuie ma bouche', icon: '😋', durationMinutes: 1, instruction: '', isRequired: true },
    { title: 'Je me lave les mains', icon: '🫧', durationMinutes: 2, instruction: '', isRequired: true },
    { title: 'Je retourne jouer calmement', icon: '🎨', durationMinutes: 1, instruction: '', isRequired: true },
  ],
};

const chambreEnOrdre: RoutineTemplate = {
  id: 'tpl-chambre-ordre',
  name: 'Chambre en ordre',
  icon: '🛏️',
  category: 'home',
  color: '#C084FC',
  ageRange: [4, 7],
  steps: [
    { title: 'Je fais mon lit', icon: '🛏️', durationMinutes: 3, instruction: '', isRequired: true },
    { title: 'Je mets le linge sale au panier', icon: '🧺', durationMinutes: 2, instruction: '', isRequired: true },
    { title: 'Je range mes jouets', icon: '🧸', durationMinutes: 5, instruction: '', isRequired: true },
    { title: 'Je replace mes livres', icon: '📚', durationMinutes: 3, instruction: '', isRequired: true },
    { title: 'Je vérifie que tout est propre', icon: '👀', durationMinutes: 1, instruction: '', isRequired: true },
  ],
};

const sortieFamille: RoutineTemplate = {
  id: 'tpl-sortie-famille',
  name: 'On sort',
  icon: '🚗',
  category: 'weekend',
  color: '#67E8F9',
  ageRange: [2, 7],
  steps: [
    { title: 'Je m\'habille', icon: '👕', durationMinutes: 5, instruction: '', isRequired: true },
    { title: 'Je vais aux toilettes', icon: '🚽', durationMinutes: 3, instruction: '', isRequired: true },
    { title: 'Je mets mes chaussures', icon: '👟', durationMinutes: 2, instruction: '', isRequired: true },
    { title: 'Je prends mon manteau', icon: '🧥', durationMinutes: 1, instruction: '', isRequired: true },
    { title: 'Je prends ma gourde', icon: '🥤', durationMinutes: 1, instruction: '', isRequired: true },
    { title: 'Je suis prêt pour sortir', icon: '🚪', durationMinutes: 1, instruction: '', isRequired: true },
  ],
};

const matinExpress: RoutineTemplate = {
  id: 'tpl-matin-express',
  name: 'Matin express',
  icon: '⚡',
  category: 'morning',
  color: '#FACC15',
  ageRange: [3, 7],
  steps: [
    { title: 'Je m\'habille', icon: '👕', durationMinutes: 5, instruction: '', isRequired: true },
    { title: 'Je me brosse les dents', icon: '🪥', durationMinutes: 2, instruction: '', isRequired: true },
    { title: 'Je mets mes chaussures', icon: '👟', durationMinutes: 2, instruction: '', isRequired: true },
    { title: 'Je prends mon sac', icon: '🎒', durationMinutes: 1, instruction: '', isRequired: true },
  ],
};

const dodoExpress: RoutineTemplate = {
  id: 'tpl-dodo-express',
  name: 'Dodo express',
  icon: '🌜',
  category: 'evening',
  color: '#7C3AED',
  ageRange: [3, 7],
  steps: [
    { title: 'Pyjama', icon: '👘', durationMinutes: 3, instruction: '', isRequired: true },
    { title: 'Toilettes', icon: '🚽', durationMinutes: 2, instruction: '', isRequired: true },
    { title: 'Brossage de dents', icon: '🪥', durationMinutes: 2, instruction: '', isRequired: true },
    { title: 'Au lit', icon: '🛏️', durationMinutes: 1, instruction: '', isRequired: true },
  ],
};

// ─── Packs ─────────────────────────────────────────────────────

export const ROUTINE_PACKS: RoutinePack[] = [
  {
    id: 'pack-essentiels',
    name: 'Essentiels',
    icon: '⭐',
    description: 'Les routines indispensables du quotidien',
    templates: [reveilEnDouceur, superMatin, dodoTranquille, pretPourEcole, missionRangement],
  },
  {
    id: 'pack-autonomie',
    name: 'Autonomie',
    icon: '💪',
    description: 'Apprendre à faire tout seul',
    templates: [jeMhabilleSeul, dentsPropres, mainsPropres, prepareMesAffaires],
  },
  {
    id: 'pack-bien-etre',
    name: 'Bien-être',
    icon: '🧘',
    description: 'Se calmer et prendre soin de soi',
    templates: [jeMeCalme, calmeAvantDodo, matinTranquille],
  },
  {
    id: 'pack-plus',
    name: 'Encore plus',
    icon: '🎁',
    description: 'Repas, crèche, sorties et express',
    templates: [bonneNuitZen, directionCreche, aTable, finDuRepas, chambreEnOrdre, sortieFamille, matinExpress, dodoExpress],
  },
];

export const ALL_TEMPLATES: RoutineTemplate[] = ROUTINE_PACKS.flatMap((p) => p.templates);
