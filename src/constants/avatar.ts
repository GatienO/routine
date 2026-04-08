import { AvatarConfig } from '../types';

export const SKIN_COLORS = [
  { id: 'fair', color: '#FFDCB5', label: 'Clair' },
  { id: 'light', color: '#F5C7A1', label: 'Pêche' },
  { id: 'medium', color: '#D4A574', label: 'Médium' },
  { id: 'tan', color: '#C68642', label: 'Doré' },
  { id: 'brown', color: '#8D5524', label: 'Brun' },
  { id: 'dark', color: '#5C3A1E', label: 'Foncé' },
];

export const HAIR_STYLES = [
  { id: 'buzz', label: 'Mini', emoji: '🌱' },
  { id: 'short', label: 'Mèche', emoji: '💇' },
  { id: 'long', label: 'Carré', emoji: '💁' },
  { id: 'curly', label: 'Boucles', emoji: '🌀' },
  { id: 'spiky', label: 'Ébouriffé', emoji: '✨' },
  { id: 'ponytail', label: 'Queue', emoji: '🎀' },
  { id: 'pigtails', label: 'Couettes', emoji: '🍭' },
  { id: 'afro', label: 'Frisé', emoji: '🌻' },
];

export const HAIR_COLORS = [
  { id: 'black', color: '#5B4E4A', label: 'Noir doux' },
  { id: 'brown', color: '#8B6B5C', label: 'Brun' },
  { id: 'blonde', color: '#E9D29A', label: 'Blond miel' },
  { id: 'red', color: '#D68A7C', label: 'Roux' },
  { id: 'ginger', color: '#DDA06C', label: 'Cuivré' },
  { id: 'blue', color: '#8CB7D9', label: 'Bleu' },
  { id: 'pink', color: '#E5A7BE', label: 'Rose' },
  { id: 'purple', color: '#B7A0D9', label: 'Violet' },
  { id: 'green', color: '#95C4A5', label: 'Vert sauge' },
];

export const FACE_STYLES = [
  { id: 'happy', label: 'Sourire', emoji: '😊' },
  { id: 'cool', label: 'Stylé', emoji: '😎' },
  { id: 'silly', label: 'Rigolo', emoji: '😜' },
  { id: 'surprised', label: 'Ooooh', emoji: '😮' },
  { id: 'sleepy', label: 'Dodo', emoji: '😴' },
  { id: 'wink', label: 'Clin d\'oeil', emoji: '😉' },
];

export const HAT_STYLES = [
  { id: 'none', label: 'Aucun', emoji: '❌' },
  { id: 'cap', label: 'Casquette', emoji: '🧢' },
  { id: 'beanie', label: 'Fleurs', emoji: '🌸' },
  { id: 'crown', label: 'Couronne', emoji: '👑' },
  { id: 'bow', label: 'Nœud', emoji: '🎀' },
];

export const HAT_COLORS = [
  { id: 'red', color: '#E5A19A', label: 'Rose corail' },
  { id: 'blue', color: '#A8C8E8', label: 'Bleu ciel' },
  { id: 'green', color: '#B9D8B4', label: 'Vert doux' },
  { id: 'yellow', color: '#F1DEA2', label: 'Jaune beurre' },
  { id: 'purple', color: '#CAB7E8', label: 'Lavande' },
  { id: 'pink', color: '#F2BDD2', label: 'Rose' },
  { id: 'white', color: '#FAF7F2', label: 'Crème' },
  { id: 'black', color: '#7A716A', label: 'Gris brun' },
];

export const TOP_STYLES = [
  { id: 'tshirt', label: 'T-shirt', emoji: '👕' },
  { id: 'hoodie', label: 'Pull', emoji: '🧶' },
  { id: 'tank', label: 'Débardeur', emoji: '☀️' },
  { id: 'dress', label: 'Robe', emoji: '👗' },
];

export const CLOTHING_COLORS = [
  { id: 'red', color: '#E6A8A1', label: 'Corail' },
  { id: 'blue', color: '#9FC6E7', label: 'Bleu pastel' },
  { id: 'green', color: '#B9DBBF', label: 'Vert pastel' },
  { id: 'yellow', color: '#F4E3A5', label: 'Jaune pastel' },
  { id: 'orange', color: '#F2C39A', label: 'Pêche' },
  { id: 'purple', color: '#C7B6E8', label: 'Lavande' },
  { id: 'pink', color: '#F0B7CD', label: 'Rose pastel' },
  { id: 'white', color: '#FAF8F4', label: 'Crème' },
  { id: 'gray', color: '#C7CEC9', label: 'Sauge grise' },
  { id: 'black', color: '#807771', label: 'Taupe' },
];

export const BOTTOM_STYLES = [
  { id: 'pants', label: 'Pantalon', emoji: '👖' },
  { id: 'shorts', label: 'Short', emoji: '🩳' },
  { id: 'skirt', label: 'Jupe', emoji: '🩰' },
];

export const SHOE_STYLES = [
  { id: 'sneakers', label: 'Baskets', emoji: '👟' },
  { id: 'boots', label: 'Bottines', emoji: '👢' },
  { id: 'sandals', label: 'Petites sandales', emoji: '🩴' },
];

export const SHOE_COLORS = [
  { id: 'white', color: '#FBF8F2', label: 'Crème' },
  { id: 'black', color: '#7D746E', label: 'Taupe' },
  { id: 'red', color: '#E0A09A', label: 'Rose corail' },
  { id: 'blue', color: '#A5C7E6', label: 'Bleu pastel' },
  { id: 'brown', color: '#B89579', label: 'Camel' },
  { id: 'pink', color: '#EAB6CF', label: 'Rose' },
];

export const DEFAULT_AVATAR_CONFIG: AvatarConfig = {
  skinColor: '#FFDCB5',
  hair: 'pigtails',
  hairColor: '#DDA06C',
  hat: 'none',
  hatColor: '#F2BDD2',
  face: 'happy',
  top: 'dress',
  topColor: '#9FC6E7',
  bottom: 'skirt',
  bottomColor: '#F0B7CD',
  shoes: 'sneakers',
  shoesColor: '#FBF8F2',
};

export const EDITOR_TABS = [
  { id: 'skin', label: 'Teint', emoji: '🎨' },
  { id: 'hair', label: 'Cheveux', emoji: '💇' },
  { id: 'face', label: 'Visage', emoji: '😊' },
  { id: 'hat', label: 'Chapeau', emoji: '🎩' },
  { id: 'top', label: 'Haut', emoji: '👕' },
  { id: 'bottom', label: 'Bas', emoji: '👖' },
  { id: 'shoes', label: 'Chaussures', emoji: '👟' },
] as const;
