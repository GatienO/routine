import { RoutineCategory } from '../types';

export interface RoutineStepTemplate {
  title: string;
  icon: string;
  durationMinutes: number;
  minimumDurationMinutes?: number;
  instruction: string;
  isRequired: boolean;
}

export interface RoutineTemplate {
  id: string;
  name: string;
  description: string;
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

const sec = (value: number) => value / 60;

function step(
  title: string,
  icon: string,
  durationMinutes: number,
  minimumDurationMinutes: number,
  isRequired: boolean,
  instruction = '',
): RoutineStepTemplate {
  return {
    title,
    icon,
    durationMinutes,
    minimumDurationMinutes,
    instruction,
    isRequired,
  };
}

function template(
  id: string,
  name: string,
  description: string,
  icon: string,
  category: RoutineCategory,
  color: string,
  ageRange: [number, number],
  steps: RoutineStepTemplate[],
): RoutineTemplate {
  return {
    id,
    name,
    description,
    icon,
    category,
    color,
    ageRange,
    steps,
  };
}

const reveilEnDouceur = template(
  'tpl-reveil-douceur',
  'Réveil en douceur',
  'Démarrer la journée calmement',
  '🌤️',
  'morning',
  '#FBBF24',
  [2, 5],
  [
    step('Je me réveille doucement', '👀', 1, sec(30), true, 'Je m’étire dans mon lit'),
    step('Je vais aux toilettes', '🚽', 2, 1, true),
    step('Je me lave le visage', '💦', 2, 1, true, 'Je mouille, je frotte, j’essuie'),
    step('Je m’habille', '👕', 5, 3, true),
    step('Je fais un câlin', '🤗', 1, sec(30), false),
  ],
);

const superMatin = template(
  'tpl-super-matin',
  'Super matin',
  'Routine complète avant de partir',
  '☀️',
  'morning',
  '#F59E0B',
  [3, 7],
  [
    step('Je me lève', '👣', 1, sec(30), true),
    step('Je vais aux toilettes', '🚽', 2, 1, true),
    step('Je me lave le visage', '💦', 2, 1, true),
    step('Je m’habille', '👕', 5, 3, true),
    step(
      'Je me brosse les dents',
      '🪥',
      2,
      1,
      true,
      'Je brosse devant, derrière, en haut et en bas',
    ),
    step('Je prends mon petit-déjeuner', '🥣', 10, 5, true),
    step('Je mets mes chaussures', '👟', 2, 1, true),
    step('Je prends mon sac', '🎒', sec(30), sec(10), true),
  ],
);

const pretPourEcole = template(
  'tpl-pret-pour-ecole',
  'Prêt pour l’école',
  'Se préparer pour partir à l’école ou à la crèche',
  '🎒',
  'school',
  '#60A5FA',
  [3, 7],
  [
    step('Je m’habille', '👕', 5, 3, true),
    step('Je déjeune', '🥣', 10, 5, true),
    step('Je me brosse les dents', '🪥', 2, 1, true),
    step('Je mets mes chaussures', '👟', 2, 1, true),
    step('Je prends mon manteau', '🧥', 1, sec(30), true),
    step('Je prends mon sac', '🎒', sec(30), sec(10), true),
    step('Je dis au revoir', '👋', sec(30), sec(10), false),
  ],
);

const dodoTranquilleEssentiels = template(
  'tpl-dodo-tranquille-essentiels',
  'Dodo tranquille',
  'Routine du coucher apaisante',
  '🌙',
  'evening',
  '#818CF8',
  [2, 6],
  [
    step('Je range mes jouets', '🧸', 5, 2, true),
    step('Je mets mon pyjama', '👕', 3, 2, true),
    step('Je vais aux toilettes', '🚽', 2, 1, true),
    step('Je me brosse les dents', '🪥', 2, 1, true),
    step('Je lis une histoire', '📖', 5, 3, false),
    step('Je fais un câlin', '🤗', 1, sec(30), false),
    step('J’éteins la lumière', '💡', sec(10), sec(5), true),
  ],
);

const missionRangement = template(
  'tpl-mission-rangement',
  'Mission rangement',
  'Ranger sa chambre simplement',
  '🧹',
  'home',
  '#34D399',
  [2, 6],
  [
    step('Je ramasse les peluches', '🧸', 2, 1, true),
    step('Je range les voitures', '🚗', 2, 1, true),
    step('Je range les livres', '📚', 2, 1, true),
    step('Je range les cubes', '🧱', 2, 1, true),
    step('Ma chambre est rangée', '✅', sec(10), sec(5), true),
  ],
);

const aTable = template(
  'tpl-a-table',
  'À table',
  'Bien commencer le repas',
  '🍽️',
  'home',
  '#FB923C',
  [2, 5],
  [
    step('Je me lave les mains', '🧼', 2, 1, true),
    step('Je m’assois à table', '🪑', sec(30), sec(10), true),
    step('Je mets ma serviette', '🧻', sec(30), sec(10), true),
    step('Je suis prêt à manger', '🍽️', sec(10), sec(5), true),
  ],
);

const finDuRepas = template(
  'tpl-fin-du-repas',
  'Fin du repas',
  'Terminer le repas proprement',
  '🍴',
  'home',
  '#F97316',
  [2, 6],
  [
    step('J’apporte mon assiette', '🍽️', 1, sec(30), false),
    step('J’essuie ma bouche', '🧻', sec(30), sec(10), true),
    step('Je me lave les mains', '🧼', 2, 1, true),
    step('Je retourne jouer calmement', '🧸', 1, sec(30), false),
  ],
);

const onSort = template(
  'tpl-on-sort',
  'On sort',
  'Se préparer pour sortir',
  '🚪',
  'weekend',
  '#38BDF8',
  [2, 7],
  [
    step('Je vais aux toilettes', '🚽', 2, 1, true),
    step('Je m’habille', '👕', 5, 3, true),
    step('Je mets mes chaussures', '👟', 2, 1, true),
    step('Je prends mon manteau', '🧥', 1, sec(30), true),
    step('Je prends ma gourde', '🧴', sec(30), sec(10), false),
  ],
);

const retourMaison = template(
  'tpl-retour-maison',
  'Retour à la maison',
  'Se poser en rentrant',
  '🏠',
  'home',
  '#4ADE80',
  [2, 7],
  [
    step('J’enlève mes chaussures', '👟', 1, sec(30), true),
    step('J’enlève mon manteau', '🧥', 1, sec(30), true),
    step('Je pose mes affaires', '🎒', 1, sec(30), true),
    step('Je me lave les mains', '🧼', 2, 1, true),
  ],
);

const matinExpress = template(
  'tpl-matin-express',
  'Matin express',
  'Version rapide du matin',
  '⚡',
  'morning',
  '#FACC15',
  [3, 7],
  [
    step('Je m’habille', '👕', 3, 2, true),
    step('Je me brosse les dents', '🪥', 2, 1, true),
    step('Je mets mes chaussures', '👟', 1, sec(30), true),
    step('Je prends mon sac', '🎒', sec(30), sec(10), true),
  ],
);

const dodoExpress = template(
  'tpl-dodo-express',
  'Dodo express',
  'Routine rapide du coucher',
  '😴',
  'evening',
  '#A78BFA',
  [3, 7],
  [
    step('Pyjama', '👕', 2, 1, true),
    step('Toilettes', '🚽', 2, 1, true),
    step('Brossage de dents', '🪥', 2, 1, true),
    step('Au lit', '🛏️', sec(30), sec(10), true),
  ],
);

const habilleChaudement = template(
  'tpl-habille-chaudement',
  'Je m’habille chaudement',
  'S’habiller selon la météo',
  '🧣',
  'school',
  '#22C55E',
  [2, 7],
  [
    step('Je mets mon manteau', '🧥', 1, sec(30), true),
    step('Je mets mon bonnet', '🧢', sec(30), sec(10), false),
    step('Je mets mon écharpe', '🧣', 1, sec(30), false),
    step('Je mets mes gants', '🧤', 1, sec(30), false),
  ],
);

const preparerSonSac = template(
  'tpl-preparer-son-sac',
  'Préparer son sac',
  'Vérifier ses affaires',
  '🎒',
  'school',
  '#3B82F6',
  [3, 7],
  [
    step('Je prends mon sac', '🎒', sec(30), sec(10), true),
    step('Je vérifie mon doudou', '🧸', sec(30), sec(10), false),
    step('Je vérifie ma gourde', '🧴', sec(30), sec(10), true),
    step('Je vérifie mes affaires', '📦', 1, sec(30), true),
  ],
);

const pauseToilette = template(
  'tpl-pause-toilette',
  'Pause toilette',
  'Routine hygiène simple',
  '🚽',
  'home',
  '#06B6D4',
  [2, 6],
  [
    step('Je vais aux toilettes', '🚽', 2, 1, true),
    step('Je m’essuie', '🧻', 1, sec(30), true),
    step('Je tire la chasse', '🚿', sec(10), sec(5), true),
    step('Je me lave les mains', '🧼', 2, 1, true),
  ],
);

const tempsCalme = template(
  'tpl-temps-calme',
  'Temps calme',
  'Faire une pause',
  '🧘',
  'home',
  '#A78BFA',
  [2, 7],
  [
    step('Je m’assois calmement', '🪑', 1, sec(30), true),
    step('Je respire doucement', '🌬️', 1, sec(30), false),
    step('Je regarde un livre', '📖', 5, 2, false),
  ],
);

const jeMhabilleSeul = template(
  'tpl-je-mhabille-seul',
  'Je m’habille seul',
  'Apprendre à s’habiller étape par étape',
  '👕',
  'home',
  '#2DD4BF',
  [3, 6],
  [
    step('Je mets mon sous-vêtement', '🩲', 2, 1, true, 'Je mets dans le bon sens'),
    step('Je mets mon pantalon', '👖', 3, 2, true, 'Je cherche le devant'),
    step('Je mets mon t-shirt', '👕', 3, 2, true, 'Je passe la tête puis les bras'),
    step('Je mets mon pull', '🧥', 3, 2, false),
    step('Je mets mes chaussettes', '🧦', 2, 1, true),
  ],
);

const chaussuresSeul = template(
  'tpl-chaussures-seul',
  'Je mets mes chaussures seul',
  'Apprendre à mettre ses chaussures correctement',
  '👟',
  'school',
  '#60A5FA',
  [3, 6],
  [
    step('Je reconnais gauche et droite', '↔️', 1, sec(30), false, 'Je regarde les dessins ou formes'),
    step('Je mets mes chaussures', '👟', 2, 1, true),
    step('Je ferme mes chaussures', '🔒', 2, 1, true, 'Scratch ou fermeture'),
  ],
);

const dentsPropres = template(
  'tpl-dents-propres',
  'Dents propres',
  'Se brosser les dents correctement',
  '🪥',
  'home',
  '#22C55E',
  [2, 7],
  [
    step('Je prends ma brosse à dents', '🪥', sec(30), sec(10), true),
    step('Je mets le dentifrice', '🧴', sec(30), sec(10), true, 'Petite quantité'),
    step('Je brosse en haut', '⬆️', 1, sec(30), true),
    step('Je brosse en bas', '⬇️', 1, sec(30), true),
    step('Je rince ma bouche', '💧', sec(30), sec(10), true),
    step('Je range ma brosse', '🧼', sec(30), sec(10), true),
  ],
);

const mainsPropres = template(
  'tpl-mains-propres',
  'Mains toutes propres',
  'Se laver les mains correctement',
  '🧼',
  'home',
  '#06B6D4',
  [2, 6],
  [
    step('J’ouvre l’eau', '🚿', sec(10), sec(5), true),
    step('Je mets du savon', '🧴', sec(10), sec(5), true),
    step('Je frotte mes mains', '👐', sec(20), sec(10), true, 'Entre les doigts aussi'),
    step('Je rince', '💧', sec(10), sec(5), true),
    step('J’essuie mes mains', '🧻', sec(20), sec(10), true),
    step('Je ferme l’eau', '🚰', sec(5), sec(2), true),
  ],
);

const prepareMesAffaires = template(
  'tpl-je-prepare-mes-affaires',
  'Je prépare mes affaires',
  'Être responsable de ses objets',
  '🎒',
  'school',
  '#34D399',
  [4, 7],
  [
    step('Je prends mon sac', '🎒', sec(30), sec(10), true),
    step('Je mets mon doudou si besoin', '🧸', sec(30), sec(10), false),
    step('Je vérifie ma gourde', '🧴', sec(30), sec(10), true),
    step('Je prends mon manteau', '🧥', sec(30), sec(10), true),
    step('Tout est prêt', '✅', sec(10), sec(5), true),
  ],
);

const jeMangeSeul = template(
  'tpl-je-mange-seul',
  'Je mange seul',
  'Développer l’autonomie à table',
  '🍽️',
  'home',
  '#F59E0B',
  [2, 5],
  [
    step('Je tiens ma cuillère', '🥄', 2, 1, true),
    step('Je mange doucement', '🍽️', 10, 5, true, 'Je prends mon temps'),
    step('Je bois tout seul', '🥤', 2, 1, true),
    step('J’essaie de ne pas renverser', '⚖️', 5, 2, false),
  ],
);

const jeRangeApresMoi = template(
  'tpl-je-range-apres-moi',
  'Je range après moi',
  'Prendre l’habitude de ranger seul',
  '🧹',
  'home',
  '#10B981',
  [3, 7],
  [
    step('Je regarde ce qui est à ranger', '👀', sec(30), sec(10), true),
    step('Je ramasse les objets', '🧸', 2, 1, true),
    step('Je remets à leur place', '📦', 3, 2, true),
    step('J’ai fini', '✅', sec(10), sec(5), true),
  ],
);

const dodoTranquilleSommeil = template(
  'tpl-dodo-tranquille-sommeil',
  'Dodo tranquille',
  'Routine du coucher apaisante et complète',
  '🌙',
  'evening',
  '#818CF8',
  [2, 6],
  [
    step('Je range mes jouets', '🧸', 5, 2, true, 'Chaque chose à sa place'),
    step('Je mets mon pyjama', '👕', 3, 2, true),
    step('Je vais aux toilettes', '🚽', 2, 1, true),
    step('Je me brosse les dents', '🪥', 2, 1, true),
    step('Je lis une histoire', '📖', 5, 3, false),
    step('Je fais un câlin', '🤗', 1, sec(30), false),
    step('J’éteins la lumière', '💡', sec(10), sec(5), true),
  ],
);

const bonneNuitZen = template(
  'tpl-bonne-nuit-zen',
  'Bonne nuit zen',
  'Routine complète avec détente',
  '💤',
  'evening',
  '#A78BFA',
  [3, 7],
  [
    step('Je range ma chambre', '🧹', 5, 2, true),
    step('Je prends mon bain', '🛁', 10, 5, false),
    step('Je mets mon pyjama', '👕', 3, 2, true),
    step('Je me brosse les dents', '🪥', 2, 1, true),
    step('Je bois un peu d’eau', '🥤', sec(30), sec(10), false),
    step('Je respire calmement', '🌬️', 1, sec(30), false),
    step('J’écoute une histoire', '📖', 5, 3, false),
    step('Je vais au lit', '🛏️', sec(30), sec(10), true),
  ],
);

const deconnexionDouce = template(
  'tpl-deconnexion-douce',
  'Déconnexion douce',
  'Se préparer au sommeil sans écrans',
  '🌆',
  'evening',
  '#94A3B8',
  [3, 8],
  [
    step('J’éteins les écrans', '📵', sec(10), sec(5), true),
    step('Je baisse la lumière', '💡', sec(10), sec(5), true),
    step('Je parle doucement', '🤫', 2, 1, false),
  ],
);

const momentDoudou = template(
  'tpl-moment-doudou',
  'Moment doudou',
  'Se rassurer avant de dormir',
  '🧸',
  'evening',
  '#FDBA74',
  [2, 6],
  [
    step('Je prends mon doudou', '🧸', sec(30), sec(10), true),
    step('Je le serre contre moi', '🤗', 1, sec(30), false),
    step('Je me couche avec lui', '🛏️', sec(30), sec(10), true),
  ],
);

const respirationGuidee = template(
  'tpl-respiration-guidee',
  'Respiration guidée',
  'Apaiser le corps avec la respiration',
  '🌬️',
  'evening',
  '#7DD3FC',
  [3, 8],
  [
    step('Je pose mes mains sur mon ventre', '🤲', sec(30), sec(10), false),
    step('J’inspire lentement', '⬆️', sec(5), sec(5), false),
    step('J’expire lentement', '⬇️', sec(5), sec(5), false),
    step('Je recommence plusieurs fois', '🔁', 1, sec(30), false),
  ],
);

const scanCorporel = template(
  'tpl-scan-corporel',
  'Scan corporel',
  'Détendre chaque partie du corps',
  '🧘',
  'evening',
  '#A7F3D0',
  [4, 8],
  [
    step('Je ferme les yeux', '😴', sec(30), sec(10), false),
    step('Je sens mes pieds', '🦶', sec(30), sec(10), false),
    step('Je sens mon ventre', '🤲', sec(30), sec(10), false),
    step('Je relâche mes épaules', '🧍', sec(30), sec(10), false),
    step('Je sens ma tête calme', '🧠', sec(30), sec(10), false),
  ],
);

const visualisationCalme = template(
  'tpl-visualisation-calme',
  'Visualisation calme',
  'Imaginer un endroit rassurant',
  '🌈',
  'evening',
  '#C4B5FD',
  [3, 8],
  [
    step('Je ferme les yeux', '😴', sec(30), sec(10), false),
    step('J’imagine un nuage doux', '☁️', 1, sec(30), false),
    step('Je pense à un endroit calme', '🌳', 1, sec(30), false),
    step('Je garde cette image', '💭', 1, sec(30), false),
  ],
);

const miniHistoireSoir = template(
  'tpl-mini-histoire-soir',
  'Mini histoire du soir',
  'Se détendre avec une histoire courte',
  '📖',
  'evening',
  '#F9A8D4',
  [2, 7],
  [
    step('Je m’installe calmement', '🛏️', 1, sec(30), false),
    step('J’écoute une histoire', '📖', 5, 3, false),
    step('Je respire à la fin', '🌬️', sec(30), sec(10), false),
  ],
);

const gratitudeSoir = template(
  'tpl-merci-pour-aujourdhui',
  'Merci pour aujourd’hui',
  'Terminer la journée positivement',
  '💛',
  'evening',
  '#FDE68A',
  [3, 8],
  [
    step('Je pense à un bon moment', '💭', 1, sec(30), false),
    step('Je dis merci', '🙏', sec(30), sec(10), false),
    step('Je garde ce souvenir', '💛', sec(30), sec(10), false),
  ],
);

const reveilNuit = template(
  'tpl-si-je-me-reveille-la-nuit',
  'Si je me réveille la nuit',
  'Se rendormir calmement',
  '🌌',
  'evening',
  '#2563EB',
  [3, 8],
  [
    step('Je reste dans mon lit', '🛏️', 1, sec(30), false),
    step('Je prends mon doudou', '🧸', sec(30), sec(10), false),
    step('Je respire doucement', '🌬️', 1, sec(30), false),
    step('J’appelle doucement si besoin', '🗣️', sec(30), sec(10), false),
  ],
);

const jeSuisTriste = template(
  'tpl-je-suis-triste',
  'Je suis triste',
  'Accueillir la tristesse et se réconforter',
  '🌧️',
  'emotion',
  '#60A5FA',
  [3, 8],
  [
    step('Je dis “je suis triste”', '🗣️', 1, sec(30), false),
    step('Je peux pleurer', '😢', 2, sec(30), false, 'C’est normal de pleurer'),
    step('Je fais un câlin', '🤗', 2, 1, false),
    step('Je respire doucement', '🌬️', 1, sec(30), false),
  ],
);

const jeSuisEnColere = template(
  'tpl-je-suis-en-colere',
  'Je suis en colère',
  'Exprimer la colère sans faire mal',
  '🔥',
  'emotion',
  '#F97316',
  [3, 8],
  [
    step('Je dis “je suis en colère”', '🗣️', sec(30), sec(10), false),
    step('Je m’éloigne un peu', '🚶', 1, sec(30), false, 'Je prends de la place'),
    step('Je tape dans un coussin', '🛏️', 1, sec(30), false, 'Pas sur les personnes'),
    step('Je respire fort', '🌬️', 1, sec(30), false),
  ],
);

const jaiPeur = template(
  'tpl-jai-peur',
  'J’ai peur',
  'Se rassurer face à une peur',
  '😰',
  'emotion',
  '#8B5CF6',
  [3, 8],
  [
    step('Je dis ce qui me fait peur', '🗣️', 1, sec(30), false),
    step('Je prends mon doudou', '🧸', 1, sec(30), false),
    step('Je me rapproche d’un adulte', '🤝', 2, 1, false),
    step('Je respire doucement', '🌬️', 1, sec(30), false),
  ],
);

const jeSuisFrustre = template(
  'tpl-je-suis-frustre',
  'Je suis frustré',
  'Gérer une situation difficile',
  '😤',
  'emotion',
  '#EF4444',
  [3, 8],
  [
    step('Je dis “c’est difficile”', '🗣️', sec(30), sec(10), false),
    step('Je fais une pause', '✋', 1, sec(30), false),
    step('Je respire', '🌬️', 1, sec(30), false),
    step('Je réessaie doucement', '🔁', 2, 1, false),
  ],
);

const jeMeCalmeToutSeul = template(
  'tpl-je-me-calme-tout-seul',
  'Je me calme tout seul',
  'Apprendre à se réguler',
  '🌈',
  'emotion',
  '#38BDF8',
  [3, 8],
  [
    step('Je m’arrête', '✋', sec(10), sec(5), false),
    step('Je respire 5 fois', '🌬️', 1, sec(30), false, 'Inspire et expire lentement'),
    step('Je pose mes mains sur mon ventre', '🤲', sec(30), sec(10), false),
    step('Je me sens plus calme', '🙂', sec(30), sec(10), false),
  ],
);

const jeSuisContent = template(
  'tpl-je-suis-content',
  'Je suis content',
  'Accueillir la joie',
  '😄',
  'emotion',
  '#FACC15',
  [2, 8],
  [
    step('Je dis “je suis content”', '🗣️', sec(30), sec(10), false),
    step('Je souris', '😄', sec(30), sec(10), false),
    step('Je partage avec quelqu’un', '🤝', 1, sec(30), false),
  ],
);

const jeSuisFier = template(
  'tpl-je-suis-fier-de-moi',
  'Je suis fier de moi',
  'Valoriser ses réussites',
  '🌟',
  'emotion',
  '#F59E0B',
  [3, 8],
  [
    step('Je dis ce que j’ai réussi', '🗣️', 1, sec(30), false),
    step('Je me félicite', '👏', sec(30), sec(10), false),
    step('Je souris', '😊', sec(30), sec(10), false),
  ],
);

const jeDemandeAide = template(
  'tpl-je-demande-de-laide',
  'Je demande de l’aide',
  'Apprendre à ne pas rester seul',
  '🙋',
  'emotion',
  '#14B8A6',
  [3, 8],
  [
    step('Je dis “aide-moi”', '🗣️', sec(30), sec(10), false),
    step('J’explique mon problème', '💬', 1, sec(30), false),
    step('J’écoute la réponse', '👂', 1, sec(30), false),
  ],
);

const jeMeReconcilie = template(
  'tpl-je-me-reconcilie',
  'Je me réconcilie',
  'Réparer après un conflit',
  '💛',
  'emotion',
  '#FB7185',
  [3, 8],
  [
    step('Je me calme', '🌬️', 1, sec(30), false),
    step('Je dis pardon', '🙏', sec(30), sec(10), false),
    step('Je fais un geste gentil', '🤝', 1, sec(30), false),
  ],
);

const directionCreche = template(
  'tpl-direction-creche',
  'Direction la crèche',
  'Se préparer sereinement au départ',
  '🏫',
  'school',
  '#34D399',
  [2, 3],
  [
    step('Je m’habille', '👕', 5, 3, true),
    step('Je mets ma couche / mes sous-vêtements', '🩲', 2, 1, true),
    step('Je prends mon doudou', '🧸', sec(30), sec(10), false),
    step('Je mets mes chaussures', '👟', 2, 1, true),
    step('Je prends mon sac', '🎒', sec(30), sec(10), true),
    step('Je dis au revoir', '👋', sec(30), sec(10), false),
  ],
);

const chambreEnOrdre = template(
  'tpl-chambre-en-ordre',
  'Chambre en ordre',
  'Garder un espace propre',
  '🛏️',
  'home',
  '#C084FC',
  [4, 7],
  [
    step('Je fais mon lit', '🛏️', 3, 1, false),
    step('Je mets le linge sale au panier', '🧺', 1, sec(30), true),
    step('Je range mes jouets', '🧸', 5, 2, true),
    step('Je replace mes livres', '📚', 2, 1, true),
    step('Je vérifie que tout est propre', '✅', sec(30), sec(10), false),
  ],
);

const preparationSortieLongue = template(
  'tpl-preparation-sortie-longue',
  'Préparation sortie longue',
  'Se préparer pour une longue sortie',
  '🎒',
  'weekend',
  '#0EA5E9',
  [2, 7],
  [
    step('Je prends mon sac', '🎒', sec(30), sec(10), true),
    step('Je prends ma gourde', '🧴', sec(30), sec(10), true),
    step('Je prends un goûter', '🍎', 1, sec(30), false),
    step('Je prends mon doudou', '🧸', sec(30), sec(10), false),
    step('Je suis prêt', '✅', sec(10), sec(5), true),
  ],
);

const retourDuParc = template(
  'tpl-retour-du-parc',
  'Retour du parc',
  'Se réorganiser après une sortie',
  '🌳',
  'weekend',
  '#22C55E',
  [2, 7],
  [
    step('J’enlève mes chaussures', '👟', 1, sec(30), true),
    step('Je me lave les mains', '🧼', 2, 1, true),
    step('Je bois de l’eau', '🥤', 1, sec(30), false),
    step('Je me repose un peu', '🪑', 3, 1, false),
  ],
);

const avantActiviteCalme = template(
  'tpl-avant-activite-calme',
  'Avant activité calme',
  'Se préparer à se concentrer',
  '🎨',
  'home',
  '#A78BFA',
  [3, 7],
  [
    step('Je m’installe', '🪑', 1, sec(30), true),
    step('Je prépare mon matériel', '✏️', 2, 1, true),
    step('Je respire doucement', '🌬️', sec(30), sec(10), false),
  ],
);

const apresActivite = template(
  'tpl-apres-activite',
  'Après activité',
  'Ranger après une activité',
  '🧩',
  'home',
  '#10B981',
  [3, 7],
  [
    step('Je regarde ce que j’ai utilisé', '👀', sec(30), sec(10), true),
    step('Je range le matériel', '📦', 3, 2, true),
    step('Je nettoie si besoin', '🧽', 2, 1, false),
  ],
);

const sePreparerPourRecevoir = template(
  'tpl-se-preparer-pour-recevoir',
  'Se préparer pour recevoir',
  'Préparer l’arrivée d’invités',
  '🏠',
  'home',
  '#F97316',
  [3, 7],
  [
    step('Je range mes jouets', '🧸', 5, 2, true),
    step('Je prépare un jeu', '🎲', 2, 1, false),
    step('Je me lave les mains', '🧼', 2, 1, true),
  ],
);

const direBonjourAuRevoir = template(
  'tpl-dire-bonjour-au-revoir',
  'Dire bonjour / au revoir',
  'Apprendre la politesse',
  '👋',
  'custom',
  '#38BDF8',
  [2, 7],
  [
    step('Je dis bonjour', '👋', sec(10), sec(5), false),
    step('Je regarde la personne', '👀', sec(10), sec(5), false),
    step('Je dis au revoir', '👋', sec(10), sec(5), false),
  ],
);

const petitBobo = template(
  'tpl-petit-bobo',
  'Petit bobo',
  'Réagir calmement à une petite blessure',
  '🩹',
  'custom',
  '#FB7185',
  [2, 7],
  [
    step('Je montre mon bobo', '🗣️', sec(30), sec(10), false),
    step('Je me calme', '🌬️', 1, sec(30), false),
    step('Je me fais soigner', '🩹', 2, 1, true),
  ],
);

const attendreSonTour = template(
  'tpl-attendre-son-tour',
  'Attendre son tour',
  'Apprendre la patience',
  '⏳',
  'custom',
  '#FBBF24',
  [3, 8],
  [
    step('J’attends', '⏳', 1, sec(30), false),
    step('Je regarde', '👀', 1, sec(30), false),
    step('C’est mon tour', '🎯', sec(10), sec(5), false),
  ],
);

export const ROUTINE_PACKS: RoutinePack[] = [
  {
    id: 'pack-essentiels',
    name: 'Essentiels',
    icon: '🧩',
    description: 'Les routines du quotidien les plus utiles pour bien démarrer.',
    templates: [
      reveilEnDouceur,
      superMatin,
      pretPourEcole,
      dodoTranquilleEssentiels,
      missionRangement,
      aTable,
      finDuRepas,
      onSort,
      retourMaison,
      matinExpress,
      dodoExpress,
      habilleChaudement,
      preparerSonSac,
      pauseToilette,
      tempsCalme,
    ],
  },
  {
    id: 'pack-autonomie',
    name: 'Autonomie',
    icon: '🧠',
    description: 'Des routines pour faire seul, progresser et prendre confiance.',
    templates: [
      jeMhabilleSeul,
      chaussuresSeul,
      dentsPropres,
      mainsPropres,
      prepareMesAffaires,
      jeMangeSeul,
      jeRangeApresMoi,
    ],
  },
  {
    id: 'pack-sommeil',
    name: 'Sommeil',
    icon: '🌙',
    description: 'Des routines apaisantes pour le coucher, la détente et le rendormissement.',
    templates: [
      dodoTranquilleSommeil,
      bonneNuitZen,
      deconnexionDouce,
      momentDoudou,
      respirationGuidee,
      scanCorporel,
      visualisationCalme,
      miniHistoireSoir,
      gratitudeSoir,
      reveilNuit,
    ],
  },
  {
    id: 'pack-emotions',
    name: 'Émotions',
    icon: '❤️',
    description: 'Des routines pour nommer, accueillir et réguler les émotions.',
    templates: [
      jeSuisTriste,
      jeSuisEnColere,
      jaiPeur,
      jeSuisFrustre,
      jeMeCalmeToutSeul,
      jeSuisContent,
      jeSuisFier,
      jeDemandeAide,
      jeMeReconcilie,
    ],
  },
  {
    id: 'pack-idees-plus',
    name: 'Idées en plus',
    icon: '✨',
    description: 'Des routines complémentaires pour les sorties, la politesse et les petits imprévus.',
    templates: [
      directionCreche,
      chambreEnOrdre,
      preparationSortieLongue,
      retourDuParc,
      avantActiviteCalme,
      apresActivite,
      sePreparerPourRecevoir,
      direBonjourAuRevoir,
      petitBobo,
      attendreSonTour,
    ],
  },
];

export const ALL_TEMPLATES: RoutineTemplate[] = ROUTINE_PACKS.flatMap((pack) => pack.templates);
