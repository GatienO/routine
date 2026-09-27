jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

import { useRewardStore } from '../../src/stores/rewardStore';
import { RoutineExecution } from '../../src/types';
import { BADGES } from '../../src/constants/badges';

beforeEach(() => {
  useRewardStore.setState({ rewards: {} });
});

function makeExecution(overrides?: Partial<RoutineExecution>): RoutineExecution {
  return {
    id: 'exec-1',
    routineId: 'routine-1',
    childId: 'child-1',
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    stepsCompleted: ['step-1'],
    earnedStars: 3,
    ...overrides,
  };
}

describe('rewardStore', () => {
  test('getRewards returns defaults for unknown child', () => {
    const rewards = useRewardStore.getState().getRewards('unknown');
    expect(rewards.totalStars).toBe(0);
    expect(rewards.completedRoutines).toBe(0);
    expect(rewards.currentStreak).toBe(0);
    expect(rewards.completedActivities).toBe(0);
    expect(rewards.completedIndependentActivities).toBe(0);
  });

  test('recordCompletion increments stars and routines', () => {
    const exec = makeExecution({ earnedStars: 5 });
    useRewardStore.getState().recordCompletion(exec);

    const rewards = useRewardStore.getState().getRewards('child-1');
    expect(rewards.totalStars).toBe(5);
    expect(rewards.completedRoutines).toBe(1);
    expect(rewards.currentStreak).toBe(1);
  });

  test('recordCompletion accumulates across multiple executions', () => {
    useRewardStore.getState().recordCompletion(makeExecution({ id: 'e1', earnedStars: 3 }));
    useRewardStore.getState().recordCompletion(makeExecution({ id: 'e2', earnedStars: 4 }));

    const rewards = useRewardStore.getState().getRewards('child-1');
    expect(rewards.totalStars).toBe(7);
    expect(rewards.completedRoutines).toBe(2);
  });

  test('recordCompletion unlocks first_star badge', () => {
    const newBadges = useRewardStore.getState().recordCompletion(
      makeExecution({ earnedStars: 1 })
    );

    expect(newBadges[0].unlockedBadgeIds).toContain('stars_1');
    expect(newBadges[0].unlockedBadgeIds).toContain('first_step');
    expect(useRewardStore.getState().getRewards('child-1').unlockedBadges).toContain('stars_1');
  });

  test('recordCompletion tracks streak correctly', () => {
    // First completion today
    useRewardStore.getState().recordCompletion(makeExecution());
    expect(useRewardStore.getState().getRewards('child-1').currentStreak).toBe(1);

    // Simulate yesterday's completion by backdating lastCompletionDate
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    useRewardStore.setState({
      rewards: {
        'child-1': {
          ...useRewardStore.getState().getRewards('child-1'),
          lastCompletionDate: yesterday.toISOString(),
        },
      },
    });

    // Now complete today → streak should increment
    useRewardStore.getState().recordCompletion(makeExecution({ id: 'e2' }));
    expect(useRewardStore.getState().getRewards('child-1').currentStreak).toBe(2);
  });

  test('streak resets after gap', () => {
    // Set last completion to 3 days ago
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    useRewardStore.setState({
      rewards: {
        'child-1': {
          childId: 'child-1',
          totalStars: 10,
          currentStreak: 5,
          longestStreak: 5,
          completedRoutines: 5,
          unlockedBadges: [],
          lastCompletionDate: threeDaysAgo.toISOString(),
        },
      },
    });

    useRewardStore.getState().recordCompletion(makeExecution());
    const rewards = useRewardStore.getState().getRewards('child-1');
    expect(rewards.currentStreak).toBe(1);
    expect(rewards.longestStreak).toBe(5); // longest should be preserved
  });

  test('longestStreak updates when current exceeds it', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    useRewardStore.setState({
      rewards: {
        'child-1': {
          childId: 'child-1',
          totalStars: 0,
          currentStreak: 3,
          longestStreak: 3,
          completedRoutines: 3,
          unlockedBadges: [],
          lastCompletionDate: yesterday.toISOString(),
        },
      },
    });

    useRewardStore.getState().recordCompletion(makeExecution());
    expect(useRewardStore.getState().getRewards('child-1').longestStreak).toBe(4);
  });

  test('getUnlockedBadges and getLockedBadges partition correctly', () => {
    useRewardStore.getState().recordCompletion(makeExecution({ earnedStars: 3 }));

    const unlocked = useRewardStore.getState().getUnlockedBadges('child-1');
    const locked = useRewardStore.getState().getLockedBadges('child-1');

    expect(unlocked.length + locked.length).toBe(BADGES.length);
    expect(unlocked.length).toBeGreaterThan(0);
  });

  test('separate children have independent rewards', () => {
    useRewardStore.getState().recordCompletion(makeExecution({ childId: 'child-1', earnedStars: 10 }));
    useRewardStore.getState().recordCompletion(makeExecution({ childId: 'child-2', earnedStars: 5 }));

    expect(useRewardStore.getState().getRewards('child-1').totalStars).toBe(10);
    expect(useRewardStore.getState().getRewards('child-2').totalStars).toBe(5);
  });

  test('activity completion gives one star and unlocks activity badges only for participants', () => {
    const summaries = useRewardStore.getState().recordActivityCompletion(['child-1', 'child-2', 'child-1']);

    expect(summaries).toHaveLength(2);
    expect(summaries[0].starsEarned).toBe(1);
    expect(summaries[0].unlockedBadgeIds).toContain('activity_1');
    expect(useRewardStore.getState().getRewards('child-1')).toMatchObject({
      totalStars: 1,
      completedActivities: 1,
      completedRoutines: 0,
    });
    expect(useRewardStore.getState().getRewards('child-2').completedActivities).toBe(1);
    expect(useRewardStore.getState().getRewards('child-3').completedActivities).toBe(0);
  });

  test('opening or favoriting an activity cannot award stars because only completion is exposed by rewardStore', () => {
    expect(useRewardStore.getState()).not.toHaveProperty('recordActivityOpen');
    expect(useRewardStore.getState()).not.toHaveProperty('recordActivityFavorite');
    expect(useRewardStore.getState().getRewards('child-1').totalStars).toBe(0);
  });

  test('an accompanied activity marked as highly independent advances autonomy badges', () => {
    const summaries = useRewardStore.getState().recordActivityCompletion(['child-1'], true);

    expect(summaries[0].unlockedBadgeIds).toContain('autonomy_1');
    expect(useRewardStore.getState().getRewards('child-1')).toMatchObject({
      completedActivities: 1,
      completedIndependentActivities: 1,
    });
  });
});
