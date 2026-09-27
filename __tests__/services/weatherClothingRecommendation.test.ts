import { WeatherData } from '../../src/services/weather';
import { getClothingRecommendation } from '../../src/services/weatherClothingRecommendation';

function makeWeather(overrides: Partial<WeatherData> = {}): WeatherData {
  const dayForecast = {
    minTemperature: 12,
    maxTemperature: 20,
    hasRain: false,
    hasSnow: false,
    hasThunderstorm: false,
    dominantCondition: 'clear' as const,
    ...overrides.dayForecast,
  };

  return {
    condition: 'clear',
    temperature: 16,
    isDay: true,
    city: 'Paris',
    timestamp: 0,
    dayForecast,
    nightForecast: dayForecast,
    ...overrides,
  };
}

describe('getClothingRecommendation', () => {
  it('recommande une tenue evolutive quand le matin est frais et l apres-midi chaude', () => {
    const weather = makeWeather({
      temperature: 12,
      apparentTemperature: 12,
      dayForecast: {
        minTemperature: 11,
        maxTemperature: 27,
        minApparentTemperature: 11,
        maxApparentTemperature: 27,
        hasRain: false,
        hasSnow: false,
        hasThunderstorm: false,
        dominantCondition: 'clear',
      },
    });

    const recommendation = getClothingRecommendation(weather, new Date('2026-06-15T08:00:00'));

    expect(recommendation.isLayered).toBe(true);
    expect(recommendation.items).toContain('vesteLegere');
    expect(recommendation.items).not.toContain('manteau');
    expect(recommendation.childMessage).toBe('Frais ce matin. Veste légère.');
  });

  it('recommande une tenue chaude pour une journee froide en hiver', () => {
    const weather = makeWeather({
      temperature: 4,
      apparentTemperature: 2,
      condition: 'cloudy',
      dayForecast: {
        minTemperature: 0,
        maxTemperature: 6,
        minApparentTemperature: -2,
        maxApparentTemperature: 4,
        hasRain: false,
        hasSnow: false,
        hasThunderstorm: false,
        dominantCondition: 'cloudy',
      },
    });

    const recommendation = getClothingRecommendation(weather, new Date('2026-01-10T09:00:00'));

    expect(recommendation.items).toEqual(expect.arrayContaining(['pull', 'manteau', 'pantalon']));
    expect(recommendation.childMessage).toBe("Froid aujourd'hui. Manteau.");
  });

  it('recommande une veste legere pour une journee douce en ete', () => {
    const weather = makeWeather({
      temperature: 15,
      dayForecast: {
        minTemperature: 14,
        maxTemperature: 22,
        hasRain: false,
        hasSnow: false,
        hasThunderstorm: false,
        dominantCondition: 'partly_cloudy',
      },
    });

    const recommendation = getClothingRecommendation(weather, new Date('2026-07-12T12:00:00'));

    expect(recommendation.items).toContain('vesteLegere');
    expect(recommendation.items).not.toContain('manteau');
  });

  it('ajoute un impermeable quand la pluie est prevue', () => {
    const weather = makeWeather({
      temperature: 18,
      condition: 'rain',
      dayForecast: {
        minTemperature: 16,
        maxTemperature: 20,
        precipitationProbability: 70,
        hasRain: true,
        hasSnow: false,
        hasThunderstorm: false,
        dominantCondition: 'rain',
      },
    });

    const recommendation = getClothingRecommendation(weather, new Date('2026-04-08T14:00:00'));

    expect(recommendation.items).toContain('impermeable');
    expect(recommendation.childMessage).toBe('Pluie possible. Imperméable.');
    expect(recommendation.outfitReasons.impermeable).toBe('Pour rester au sec');
  });

  it('tient compte du fort vent', () => {
    const weather = makeWeather({
      temperature: 18,
      windSpeed: 42,
      dayForecast: {
        minTemperature: 16,
        maxTemperature: 21,
        maxWindSpeed: 45,
        hasRain: false,
        hasSnow: false,
        hasThunderstorm: false,
        dominantCondition: 'cloudy',
      },
    });

    const recommendation = getClothingRecommendation(weather, new Date('2026-10-08T15:00:00'));

    expect(recommendation.items).toEqual(expect.arrayContaining(['vesteLegere']));
    expect(recommendation.childMessage).toBe('Vent fort. Veste utile.');
    expect(recommendation.parentSummary.windSpeed).toBe(45);
    expect(recommendation.outfitReasons.vesteLegere).toBe('Utile quand le vent souffle');
  });

  it('recommande soleil et hydratation en forte chaleur', () => {
    const weather = makeWeather({
      temperature: 25,
      dayForecast: {
        minTemperature: 21,
        maxTemperature: 33,
        hasRain: false,
        hasSnow: false,
        hasThunderstorm: false,
        dominantCondition: 'clear',
      },
    });

    const recommendation = getClothingRecommendation(weather, new Date('2026-08-04T11:00:00'));

    expect(recommendation.items).toEqual(expect.arrayContaining(['tshirt', 'short', 'robe', 'casquette', 'eau']));
    expect(
      recommendation.outfitPlan.tiles.some((tile) =>
        tile.items.some((item) => item.id === 'robe'),
      ),
    ).toBe(true);
    expect(recommendation.childMessage).toBe("Chaud aujourd'hui. Casquette + eau.");
  });

  it('ne se laisse pas tromper par une temperature actuelle froide si la journee devient chaude', () => {
    const weather = makeWeather({
      temperature: 8,
      dayForecast: {
        minTemperature: 8,
        maxTemperature: 24,
        hasRain: false,
        hasSnow: false,
        hasThunderstorm: false,
        dominantCondition: 'clear',
      },
    });

    const recommendation = getClothingRecommendation(weather, new Date('2026-04-22T08:30:00'));

    expect(recommendation.isLayered).toBe(true);
    expect(recommendation.items).toContain('vesteLegere');
    expect(recommendation.items).not.toContain('manteau');
  });
});
