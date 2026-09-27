export type ParentingTip = {
  id: string;
  icon: string;
  title: string;
  body: string;
};

export const PARENTING_TIPS: ParentingTip[] = [
  {
    id: 'soft-transition',
    icon: '🌿',
    title: "Quand l'enfant refuse de démarrer",
    body: 'Annonce la transition 5 minutes avant, puis propose un tout petit premier pas.',
  },
  {
    id: 'praise-effort',
    icon: '⭐',
    title: "Féliciter l'effort",
    body: "Nomme ce que tu observes : tu as essayé, tu es revenu, tu as continué.",
  },
  {
    id: 'short-routine',
    icon: '🧩',
    title: 'Routine raccourcie les jours difficiles',
    body: 'Garde une version courte prête : trois étapes peuvent suffire quand la journée est lourde.',
  },
  {
    id: 'choose-order',
    icon: '👐',
    title: "Laisser choisir l'ordre",
    body: "L'enfant garde de l'autonomie dans un cadre clair : les étapes restent, l'ordre peut bouger.",
  },
  {
    id: 'regularity',
    icon: '📅',
    title: 'La régularité bat la perfection',
    body: "Quatre jours sur sept, c'est déjà une base solide. On vise le retour, pas le sans-faute.",
  },
  {
    id: 'name-emotions',
    icon: '💬',
    title: "Nommer l'émotion avant d'agir",
    body: 'Essaie : tu sembles fatigué, on commence doucement ? Le corps se sent compris.',
  },
  {
    id: 'co-create',
    icon: '✏️',
    title: "Impliquer l'enfant dans la création",
    body: 'Montre ses étapes, demande son avis, puis garde les choix les plus simples.',
  },
  {
    id: 'end-ritual',
    icon: '🎉',
    title: 'Célébrer la fin',
    body: 'Le rituel de fin compte autant que le badge : tape dans la main, sourire, phrase courte.',
  },
];
