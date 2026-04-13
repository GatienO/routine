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

// ─── Pack 1 : Essentiels ───────────────────────────────────────

const reveilEnDouceur: RoutineTemplate = {
  id: 'tpl-reveil-douceur',
  name: 'Réveil en douceur',
  description: 'Un lever calme et rassurant pour les tout-petits avec des gestes simples dès le réveil.',
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
  description: 'La routine complète du matin pour être prêt avant l’école ou la crèche.',
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
  description: 'Un enchaînement doux pour ralentir, se préparer et aller au lit sereinement.',
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
  description: 'Toutes les étapes essentielles pour partir de la maison sans rien oublier.',
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
  description: 'Une routine courte et motivante pour remettre la chambre en ordre en plusieurs mini-missions.',
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
  description: 'Pour apprendre à s’habiller étape par étape et gagner en autonomie.',
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
  description: 'Un petit parcours guidé pour bien se brosser les dents du début à la fin.',
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
  description: 'Une routine d’hygiène simple pour apprendre le lavage des mains correctement.',
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
  description: 'Idéal pour vérifier sac, manteau et gourde avant une sortie ou l’école.',
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

const routineCalme: RoutineTemplate = {
  id: 'tpl-routine-calme',
  name: 'Routine calme',
  description: 'Une routine du soir complète pour ralentir, respirer, se rassurer et glisser doucement vers le sommeil.',
  icon: '🌙',
  category: 'evening',
  color: '#9B8CFF',
  ageRange: [3, 8],
  steps: [
    { title: 'Je respire doucement', icon: '🫁', durationMinutes: 3, instruction: 'On inspire lentement puis on souffle doucement.', isRequired: true },
    { title: 'Je scanne mon corps', icon: '🧘', durationMinutes: 3, instruction: 'On relâche les pieds, les jambes, le ventre puis les épaules.', isRequired: true },
    { title: 'J’imagine un endroit calme', icon: '🧠', durationMinutes: 3, instruction: 'Pense à un nuage doux, une plage calme ou un coin rassurant.', isRequired: true },
    { title: 'Je serre mon doudou', icon: '🧸', durationMinutes: 2, instruction: 'Le doudou aide à se sentir en sécurité.', isRequired: false },
    { title: 'J’écoute une mini-histoire', icon: '📖', durationMinutes: 5, instruction: 'Une histoire courte avec une voix calme et lente.', isRequired: true },
    { title: 'Je dis merci pour ma journée', icon: '💛', durationMinutes: 1, instruction: 'On pense à une chose agréable vécue aujourd’hui.', isRequired: false },
  ],
};

const respirationGuidee: RoutineTemplate = {
  id: 'tpl-respiration-guidee',
  name: 'Respiration guidée',
  description: 'Une routine courte pour respirer lentement, apaiser le stress et préparer le coucher.',
  icon: '🫁',
  category: 'evening',
  color: '#7DD3FC',
  ageRange: [3, 8],
  steps: [
    { title: 'Je pose mes mains', icon: '🤲', durationMinutes: 1, instruction: 'Une main sur le ventre, une main sur la poitrine.', isRequired: true },
    { title: 'J’inspire 5 secondes', icon: '⬆️', durationMinutes: 2, instruction: 'On gonfle doucement le ventre.', isRequired: true },
    { title: 'J’expire 5 secondes', icon: '⬇️', durationMinutes: 2, instruction: 'On souffle lentement comme sur une bougie.', isRequired: true },
    { title: 'Je refais 5 cycles', icon: '🔁', durationMinutes: 2, instruction: 'Toujours calmement et sans forcer.', isRequired: true },
  ],
};

const scanCorporel: RoutineTemplate = {
  id: 'tpl-scan-corporel',
  name: 'Scan corporel',
  description: 'L’enfant observe son corps des pieds à la tête pour relâcher les tensions.',
  icon: '🧘',
  category: 'evening',
  color: '#A7F3D0',
  ageRange: [4, 8],
  steps: [
    { title: 'Je ferme les yeux', icon: '😌', durationMinutes: 1, instruction: 'On s’installe confortablement.', isRequired: true },
    { title: 'Je sens mes pieds', icon: '🦶', durationMinutes: 1, instruction: 'Je relâche mes pieds et mes jambes.', isRequired: true },
    { title: 'Je sens mon ventre', icon: '🌿', durationMinutes: 1, instruction: 'Je laisse mon ventre devenir tout calme.', isRequired: true },
    { title: 'Je relâche mes épaules', icon: '💆', durationMinutes: 1, instruction: 'Mes épaules deviennent toutes légères.', isRequired: true },
    { title: 'Je sens ma tête calme', icon: '☁️', durationMinutes: 1, instruction: 'Tout mon corps peut se reposer.', isRequired: true },
  ],
};

const visualisationCalme: RoutineTemplate = {
  id: 'tpl-visualisation-calme',
  name: 'Visualisation calme',
  description: 'Une petite routine d’imagination pour calmer les pensées et se sentir rassuré.',
  icon: '🧠',
  category: 'evening',
  color: '#C4B5FD',
  ageRange: [3, 8],
  steps: [
    { title: 'Je ferme les yeux', icon: '🌙', durationMinutes: 1, instruction: 'Je prends une position confortable.', isRequired: true },
    { title: 'J’imagine un nuage doux', icon: '☁️', durationMinutes: 2, instruction: 'Le nuage me porte doucement.', isRequired: true },
    { title: 'Je pense à un lieu calme', icon: '🏖️', durationMinutes: 2, instruction: 'Une plage, une cabane ou un jardin paisible.', isRequired: true },
    { title: 'Je garde cette image', icon: '✨', durationMinutes: 1, instruction: 'Je laisse mon corps se détendre.', isRequired: true },
  ],
};

const miniHistoireSoir: RoutineTemplate = {
  id: 'tpl-mini-histoire-soir',
  name: 'Mini histoire du soir',
  description: 'Une histoire courte et répétitive pour installer un repère apaisant avant le sommeil.',
  icon: '📖',
  category: 'evening',
  color: '#F9A8D4',
  ageRange: [2, 7],
  steps: [
    { title: 'Je m’installe dans le calme', icon: '🛏️', durationMinutes: 1, instruction: 'On s’allonge ou on s’assoit confortablement.', isRequired: true },
    { title: 'J’écoute une histoire courte', icon: '📚', durationMinutes: 4, instruction: 'Une histoire douce avec un rythme lent.', isRequired: true },
    { title: 'Je respire à la fin', icon: '🌬️', durationMinutes: 1, instruction: 'On termine avec deux grandes respirations.', isRequired: false },
  ],
};

const gratitudeSoir: RoutineTemplate = {
  id: 'tpl-gratitude-soir',
  name: 'Merci pour aujourd’hui',
  description: 'Une mini-routine émotionnelle pour finir la journée sur une pensée positive.',
  icon: '💛',
  category: 'evening',
  color: '#FDE68A',
  ageRange: [3, 8],
  steps: [
    { title: 'Je pense à un bon moment', icon: '😊', durationMinutes: 1, instruction: 'Quel moment j’ai aimé aujourd’hui ?', isRequired: true },
    { title: 'Je dis merci', icon: '🙏', durationMinutes: 1, instruction: 'Merci pour une personne, un jeu ou un câlin.', isRequired: true },
    { title: 'Je garde ce souvenir', icon: '⭐', durationMinutes: 1, instruction: 'Je m’endors avec cette pensée douce.', isRequired: false },
  ],
};

const momentDoudou: RoutineTemplate = {
  id: 'tpl-moment-doudou',
  name: 'Moment doudou',
  description: 'Une routine toute simple avec l’objet rassurant pour favoriser l’auto-apaisement.',
  icon: '🧸',
  category: 'evening',
  color: '#FDBA74',
  ageRange: [2, 6],
  steps: [
    { title: 'Je prends mon doudou', icon: '🧸', durationMinutes: 1, instruction: 'Je choisis mon objet rassurant.', isRequired: true },
    { title: 'Je le serre contre moi', icon: '🤗', durationMinutes: 2, instruction: 'Je respire doucement avec lui.', isRequired: true },
    { title: 'Je me couche avec lui', icon: '🛌', durationMinutes: 1, instruction: 'Mon doudou reste avec moi pour la nuit.', isRequired: true },
  ],
};

const deconnexionDouce: RoutineTemplate = {
  id: 'tpl-deconnexion-douce',
  name: 'Déconnexion douce',
  description: 'Une routine pour baisser la lumière, couper les écrans et annoncer le calme du soir.',
  icon: '📴',
  category: 'evening',
  color: '#94A3B8',
  ageRange: [3, 8],
  steps: [
    { title: 'J’éteins les écrans', icon: '📺', durationMinutes: 1, instruction: 'La télé et la tablette se reposent aussi.', isRequired: true },
    { title: 'Je baisse la lumière', icon: '🕯️', durationMinutes: 1, instruction: 'On garde une ambiance douce et calme.', isRequired: true },
    { title: 'Je parle doucement', icon: '🤫', durationMinutes: 1, instruction: 'On passe en mode calme.', isRequired: true },
  ],
};

const sonsApaisants: RoutineTemplate = {
  id: 'tpl-sons-apaisants',
  name: 'Sons apaisants',
  description: 'Des sons doux ou un bruit blanc pour stabiliser l’ambiance et faciliter l’endormissement.',
  icon: '🎵',
  category: 'evening',
  color: '#86EFAC',
  ageRange: [2, 8],
  steps: [
    { title: 'Je m’installe', icon: '🛏️', durationMinutes: 1, instruction: 'Je me mets bien dans mon lit.', isRequired: true },
    { title: 'J’écoute un son doux', icon: '🎶', durationMinutes: 3, instruction: 'Une musique lente ou un bruit blanc.', isRequired: true },
    { title: 'Je respire tranquillement', icon: '🌬️', durationMinutes: 2, instruction: 'Le son m’aide à rester calme.', isRequired: false },
  ],
};

const matinTranquille: RoutineTemplate = {
  id: 'tpl-matin-tranquille',
  name: 'Matin tranquille',
  description: 'Une version plus souple du matin, parfaite pour les week-ends ou les jours sans pression.',
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
  description: 'Une routine du soir plus complète avec bain, respiration et histoire avant de dormir.',
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
  description: 'Pensée pour les plus petits afin de préparer le départ du matin avec des repères clairs.',
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
  description: 'Une mini-routine pour s’installer calmement et être prêt au moment du repas.',
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
  description: 'Pour terminer le repas proprement et enchaîner vers la suite sans agitation.',
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
  description: 'Une routine plus complète pour apprendre à entretenir sa chambre au quotidien.',
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
  description: 'La checklist rapide avant une sortie en famille pour partir sans oubli.',
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
  description: 'Une routine condensée pour les matins pressés avec seulement l’essentiel.',
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
  description: 'La version courte du coucher pour les soirs où il faut aller vite mais rester cadré.',
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
    name: 'Calme & sommeil',
    icon: '🌙',
    description: 'Des routines apaisantes pour ralentir, se rassurer et mieux s’endormir',
    templates: [
      routineCalme,
      respirationGuidee,
      scanCorporel,
      visualisationCalme,
      miniHistoireSoir,
      gratitudeSoir,
      momentDoudou,
      deconnexionDouce,
      sonsApaisants,
      matinTranquille,
    ],
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
