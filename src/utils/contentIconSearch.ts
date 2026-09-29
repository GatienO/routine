import { ICON_PICKER_EMOJIS, ICON_PICKER_GROUPS } from '../constants/icons';

// Les noms suivent l'ordre des pictogrammes dans chaque groupe.
const GROUP_NAMES: Record<string, string> = {
  hygiene: 'brosse à dents|douche|bain|savon|flacon|papier toilette|rasoir|peigne|éponge|miroir|seau|robinet|panier à linge|épingle|ventouse|piège|balai|extincteur|tube|molécule|bulles|mains|soin|baignoire|chaise',
  clothing: 't-shirt|pantalon|robe|chemise|manteau|chaussettes|short|sous-vêtement|cravate|maillot de bain|kimono|sari|écharpe|gants|casquette|chapeau|haut-de-forme|chaussure|basket|chausson|botte de marche|ballerine|botte|tong|sac à main',
  meals: 'pomme|banane|fraise|raisin|kiwi|pêche|cerises|pastèque|carotte|brocoli|maïs|pain|croissant|baguette|fromage|œuf|œuf au plat|bol|lait|assiette et couverts|pâtes|pizza|riz|sandwich|salade|soupe|boisson|eau|bubble tea',
  school: 'sac à dos|livres|livre ouvert|écriture|crayon|crayon de couleur|règle|équerre|boulier|cerveau|microscope|télescope|dossiers|trombone|épingle|calendrier|école|professeur|cahier|feuille|carnet|livre rouge|livre vert|livre bleu|livre orange|pinceau|palette|tableau|artiste|ordinateur',
  play: 'nounours|puzzle|dé|yoyo|cible|football|basket|football américain|tennis|volley|cerf-volant|voiture|vélo|trottinette|jeu vidéo|bowling|jus|cirque|baguette magique|théâtre|toboggan|poupée|échecs|ping-pong|badminton|pêche|patins à roulettes|skateboard|briques',
  relax: 'lune|nuage|arc-en-ciel|étoile|étincelles|fleur|marguerite|feuilles|plante|bougie|lit|casque audio|lecture|bain|yoga|détente|bulles|vague|lotus|massage|panier|lit|peluche|lune souriante|croissant de lune',
  home: 'maison|canapé|chaise|lit|porte|fenêtre|plante|ampoule|télévision|radio|balai|panier à linge|éponge|poubelle|clé|outils|échelle|aimant|lampe torche|horloge',
  outdoors: 'arbre|sapin|tournesol|tulipe|hibiscus|feuille automne|feuilles|soleil|soleil|pluie|parapluie|bonhomme de neige|neige|plage|camping|plante|rocher|coquillage|papillon|coccinelle|scarabée|abeille|escargot|fourmi|araignée',
  animals: 'chien|chat|lapin|ours|panda|renard|lion|tigre|koala|singe|grenouille|pingouin|hibou|abeille|papillon|tortue|pieuvre|dauphin|requin|dinosaure|éléphant|girafe|cheval|licorne|oiseau',
  travel: 'marche|course|vélo|trottinette|voiture|bus|train|métro|avion|voilier|bateau|feu de circulation|stop|carte|boussole|sac à dos|billet|grande roue|montagnes russes|stade|musée|parc|courses|hôpital|lieu',
  feelings: 'joie|sourire|rire|amour|calme|sommeil|tristesse|pleurs|colère|fâché|peur|gêne|réflexion|perplexe|fatigue|câlin|cool|ange|fête|cœur rose|deux cœurs|cœur violet|cœur jaune|cœur vert|cœur bleu',
  health: 'médecin consultation|médicament|pansement|thermomètre|fièvre|rhume|masque|dent|oreille|œil|yeux|cœur|cerveau|force|jambe|pied|mains|yoga|repos|eau',
  music: 'musique|notes de musique|micro|casque audio|piano|guitare|batterie|trompette|violon|banjo|maracas|cloche|radio|boule disco|danse|danse|théâtre|cinéma|appareil photo|photo',
  rewards: 'étoile|trophée|médaille or|médaille argent|médaille bronze|médaille|récompense|fête|confettis|cadeau|bonbon|sucette|chocolat|biscuit|cupcake|glace|donut|ballon|bravo|cœur|gâteau anniversaire',
  misc: 'lever de soleil|maison|famille|fusée|étoiles|tournesol|ours|papillon|château|force|musique|médicament|chien|chat|réveil|course|vélo|soleil|médecin consultation',
};

const names = new Map<string, string>();
for (const group of ICON_PICKER_GROUPS) {
  const labels = GROUP_NAMES[group.key]?.split('|') ?? [];
  group.emojis.forEach((emoji, index) => {
    if (!names.has(emoji)) names.set(emoji, labels[index] ?? group.label);
  });
}

const normalize = (value: string) => value.toLocaleLowerCase('fr').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

export function getIconSearchLabel(emoji: string): string {
  return names.get(emoji) ?? `Icône ${emoji}`;
}

export function searchContentIcons(query: string, groupKey = 'all'): string[] {
  const group = ICON_PICKER_GROUPS.find((item) => item.key === groupKey);
  const candidates: readonly string[] = group ? group.emojis : ICON_PICKER_EMOJIS;
  const term = normalize(query);
  if (!term) return [...candidates];
  return candidates.filter((emoji) => {
    const categories = ICON_PICKER_GROUPS.filter((item) => item.emojis.some((entry) => entry === emoji)).map((item) => item.label).join(' ');
    return normalize(`${getIconSearchLabel(emoji)} ${categories} ${emoji}`).includes(term);
  });
}
