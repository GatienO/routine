import { activities } from '../../src/features/activities/activities';
import { findMatchingActivities } from '../../src/features/activities/activity-filter';

describe('activity filters', () => {
  test('finds short calm activities for young children', () => {
    const matches = findMatchingActivities({
      ageRange: '3-4',
      duration: 15,
      need: 'calme',
    });

    expect(matches.length).toBeGreaterThan(0);
    expect(matches.every((activity) => activity.duration <= 15)).toBe(true);
    expect(matches.some((activity) => activity.noiseLevel === 'low')).toBe(true);
  });

  test('the imported activity catalog is available', () => {
    expect(activities.length).toBeGreaterThan(20);
    expect(activities.every((activity) => activity.title.length > 0)).toBe(true);
  });
});
