import { ChildMoodType } from '../types';

export type MoodPolarity = 'positive' | 'negative';

export interface MoodConfig {
  emoji: string;
  label: string;
  color: string;
  polarity: MoodPolarity;
  encouragements: string[];
  animationIntensity: 'calm' | 'normal' | 'energetic';
  skipOptional: boolean;
  gradientColors: [string, string];
}

export const MOOD_CONFIG: Record<ChildMoodType, MoodConfig> = {
  playful: {
    emoji: '🥰',
    label: 'Amour',
    color: '#FF7AA2',
    polarity: 'positive',
    encouragements: [
      'On avance avec douceur.',
      'Je suis avec toi.',
      'On fait ca ensemble.',
      'Tu es bien entoure.',
      'On prend soin de toi.',
      'Tout va bien se passer.',
      'On continue calmement.',
      'Tu peux y arriver.',
    ],
    animationIntensity: 'calm',
    skipOptional: false,
    gradientColors: ['#FFF5F8', '#FFD6E6'],
  },
  happy: {
    emoji: '😄',
    label: 'Joie',
    color: '#FFD93D',
    polarity: 'positive',
    encouragements: [
      'Quelle belle energie !',
      'On y va avec le sourire !',
      'Tu es pret pour la suite !',
      'On avance facilement.',
      'C est un bon moment.',
      'On continue comme ca !',
      'Tu rayonnes aujourd hui.',
      'Tout roule !',
    ],
    animationIntensity: 'energetic',
    skipOptional: false,
    gradientColors: ['#FFF9D9', '#FFEAA7'],
  },
  motivated: {
    emoji: '🦚',
    label: 'Fierte',
    color: '#00B894',
    polarity: 'positive',
    encouragements: [
      'Tu peux etre fier de toi.',
      'Tu avances super bien.',
      'Tu assures.',
      'On continue avec confiance.',
      'Tu as deja bien commence.',
      'Bravo pour tes efforts.',
      'Tu progresses vraiment bien.',
      'On garde ce bel elan.',
    ],
    animationIntensity: 'energetic',
    skipOptional: false,
    gradientColors: ['#F0FFF8', '#CFF5E7'],
  },
  sad: {
    emoji: '😢',
    label: 'Tristesse',
    color: '#74B9FF',
    polarity: 'negative',
    encouragements: [
      'On y va doucement.',
      'Tu peux prendre ton temps.',
      'Je reste avec toi.',
      'On fait juste une petite etape.',
      'C est ok de ne pas aller vite.',
      'On avance petit a petit.',
      'Tu n es pas seul.',
      'On commence quand tu veux.',
    ],
    animationIntensity: 'calm',
    skipOptional: true,
    gradientColors: ['#F0F6FF', '#D6E8FF'],
  },
  angry: {
    emoji: '😠',
    label: 'Colere',
    color: '#FF6B6B',
    polarity: 'negative',
    encouragements: [
      'On respire un instant.',
      'On commence doucement.',
      'Une seule etape suffit.',
      'On garde le calme.',
      'Pas besoin de se presser.',
      'On fait simple.',
      'On avance sans pression.',
      'On reprend tranquillement.',
    ],
    animationIntensity: 'normal',
    skipOptional: true,
    gradientColors: ['#FFF1F1', '#FFD6D6'],
  },
  grumpy: {
    emoji: '🥱',
    label: 'Fatigue',
    color: '#A29BFE',
    polarity: 'negative',
    encouragements: [
      'On fait le minimum ensemble.',
      'Prends ton temps.',
      'Juste une petite action.',
      'On y va tranquille.',
      'Pas besoin de forcer.',
      'On avance doucement.',
      'Tu peux faire simple.',
      'Un petit pas suffit.',
    ],
    animationIntensity: 'calm',
    skipOptional: true,
    gradientColors: ['#F5F0FF', '#E0D8FF'],
  },
};

export const POSITIVE_MOODS: ChildMoodType[] = ['playful', 'happy', 'motivated'];
export const NEGATIVE_MOODS: ChildMoodType[] = ['sad', 'grumpy', 'angry'];
export const MOOD_TYPES: ChildMoodType[] = [...POSITIVE_MOODS, ...NEGATIVE_MOODS];

export function isNegativeMood(mood: ChildMoodType): boolean {
  return MOOD_CONFIG[mood].polarity === 'negative';
}
