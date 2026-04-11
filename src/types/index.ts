export type RoutineCategory = 'morning' | 'evening' | 'school' | 'home' | 'weekend' | 'custom';

export type ChildMoodType = 'playful' | 'happy' | 'motivated' | 'sad' | 'angry' | 'grumpy';

export interface AvatarConfig {
  skinColor: string;
  hair: string;
  hairColor: string;
  hat: string;
  hatColor: string;
  face: string;
  top: string;
  topColor: string;
  bottom: string;
  bottomColor: string;
  shoes: string;
  shoesColor: string;
  doudou?: string;
}

export interface Child {
  id: string;
  name: string;
  avatar: string;
  avatarConfig?: AvatarConfig;
  color: string;
  age: number;
  companion?: string;
  passions?: string[];
  createdAt: string;
}

export interface ChildMood {
  childId: string;
  mood: ChildMoodType;
  selectedAt: string;
}

export interface RoutineStep {
  id: string;
  title: string;
  icon: string;
  color: string;
  durationMinutes: number;
  instruction: string;
  isRequired: boolean;
  order: number;
  mediaUri?: string;
}

export interface Routine {
  id: string;
  childId: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  category: RoutineCategory;
  steps: RoutineStep[];
  isActive: boolean;
  isFavorite?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TrashedRoutine extends Routine {
  deletedAt: string;
  expiresAt: string;
}

export interface RoutineExecution {
  id: string;
  routineId: string;
  childId: string;
  participantChildIds?: string[];
  customStepOrder?: RoutineStep[];
  startedAt: string;
  completedAt?: string;
  stepsCompleted: string[];
  earnedStars: number;
  mood?: ChildMoodType;
  stepDurations?: Record<string, number>;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  requirement: number;
  requirementType: 'routines' | 'streak' | 'stars';
}

export interface ChildRewards {
  childId: string;
  totalStars: number;
  currentStreak: number;
  longestStreak: number;
  completedRoutines: number;
  unlockedBadges: string[];
  lastCompletionDate?: string;
}

export interface CompletionRewardSummary {
  childId: string;
  starsEarned: number;
  unlockedBadgeIds: string[];
}

export type RealRewardCooldownUnit = 'minute' | 'hour' | 'day' | 'week';

export interface RealReward {
  id: string;
  childId: string;
  description: string;
  requiredStars: number;
  cooldownValue: number;
  cooldownUnit: RealRewardCooldownUnit;
  isClaimed: boolean;
  createdAt: string;
  claimedAt?: string;
  claimedChildIds?: string[];
  claimedByChild?: Record<string, string>;
  lastClaimedAt?: string;
  availableAt?: string;
  remainingCooldownMs?: number;
  isCoolingDown?: boolean;
}

export interface ShareableRoutine {
  version: number;
  routine: Omit<Routine, 'id' | 'childId' | 'createdAt' | 'updatedAt'>;
}
