jest.mock('expo-location', () => ({}));

import { getWeatherFreshness } from '../../src/services/weather';

describe('weather freshness', () => {
  const now = new Date('2026-09-13T12:00:00Z').getTime();

  test('describes recent data without marking it stale', () => {
    expect(getWeatherFreshness({ timestamp: now - 12 * 60000 }, now)).toEqual({
      ageMinutes: 12,
      isStale: false,
      label: 'Mise à jour il y a 12 min',
    });
  });

  test('marks weather older than thirty minutes as stale', () => {
    expect(getWeatherFreshness({ timestamp: now - 95 * 60000 }, now)).toEqual({
      ageMinutes: 95,
      isStale: true,
      label: 'Mise à jour il y a 1 h',
    });
  });
});
