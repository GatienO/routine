import {
  createDefaultWeeklyTimeConfig,
  generateTimeSlots,
  getDayTimeConfig,
  isNightTime,
  resolveWeeklyTimeConfig,
} from '../../src/utils/weatherTimeConfig';
import { getWeatherAsset } from '../../src/constants/weatherThemes';

describe('weatherTimeConfig', () => {
  it('passe en nuit a 17:00 par defaut', () => {
    expect(isNightTime(new Date('2026-05-25T16:59:00'))).toBe(false);
    expect(isNightTime(new Date('2026-05-25T17:00:00'))).toBe(true);
  });

  it('fournit les valeurs par defaut sans configuration', () => {
    const config = resolveWeeklyTimeConfig([], 'child-1');
    const monday = getDayTimeConfig(config, new Date('2026-05-25T09:00:00'));
    const sunday = getDayTimeConfig(config, new Date('2026-05-31T09:00:00'));

    expect(monday.napTime).toBe('13:00');
    expect(monday.bedtime).toBe('20:00');
    expect(monday.nightStartTime).toBe('17:00');
    expect(sunday.napTime).toBe('13:30');
    expect(sunday.bedtime).toBe('20:30');
  });

  it('recupere la configuration du bon jour', () => {
    const config = createDefaultWeeklyTimeConfig('child-1');
    const wednesday = getDayTimeConfig(config, new Date('2026-05-27T09:00:00'));

    expect(wednesday.dayOfWeek).toBe(3);
  });

  it('genere des creneaux par pas de 15 minutes', () => {
    expect(generateTimeSlots('12:00', '13:00')).toEqual(['12:00', '12:15', '12:30', '12:45', '13:00']);
  });

  it('mappe un asset meteo different entre jour et nuit', () => {
    expect(getWeatherAsset('clear', 'day')).toBe('☀️');
    expect(getWeatherAsset('clear', 'night')).toBe('🌙');
  });
});
