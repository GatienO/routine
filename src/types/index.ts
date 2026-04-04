export type RoutineCategory = 'morning' | 'evening' | 'school' | 'home' | 'weekend' | 'custom';

export type ChildMoodType = 'playful' | 'happy' | 'motivated' | 'sad' | 'angry' | 'grumpy';

export interface Child {
  id: string;
  name: string;
  avatar: string;
  color: string;
  age: number;
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
  icon: string;
  color: string;
  category: RoutineCategory;
  steps: RoutineStep[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RoutineExecution {
  id: string;
  routineId: string;
  childId: string;
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

export interface RealReward {
  id: string;
  childId: string;
  description: string;
  requiredStars: number;
  isClaimed: boolean;
  createdAt: string;
  claimedAt?: string;
}

export interface ShareableRoutine {
  version: number;
  routine: Omit<Routine, 'id' | 'childId' | 'createdAt' | 'updatedAt'>;
}
