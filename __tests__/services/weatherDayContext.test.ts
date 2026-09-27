import { getContextualWeatherModel } from '../../src/services/weatherDayContext';
import { WeatherData } from '../../src/services/weather';
import { CalendarEvent } from '../../src/types/calendar';
import { Routine } from '../../src/types';
import { Activity } from '../../src/features/activities/types';

function makeWeather(overrides: Partial<WeatherData> = {}): WeatherData {
  const dayForecast = {
    minTemperature: 14,
    maxTemperature: 22,
    precipitationProbability: 0,
    maxWindSpeed: 8,
    hasRain: false,
    hasSnow: false,
    hasThunderstorm: false,
    dominantCondition: 'clear' as const,
    ...overrides.dayForecast,
  };

  return {
    condition: 'clear',
    temperature: 18,
    isDay: true,
    city: 'Paris',
    timestamp: 0,
    dayForecast,
    nightForecast: dayForecast,
    ...overrides,
  };
}

function makeEvent(overrides: Partial<CalendarEvent>): CalendarEvent {
  return {
    id: 'event-1',
    title: 'Sortie au parc',
    childIds: ['child-1'],
    color: '#A8C79D',
    icon: '🌿',
    date: '2026-05-25',
    kind: 'special',
    suggestedRoutineIds: [],
    createdAt: '2026-05-25T06:00:00.000Z',
    updatedAt: '2026-05-25T06:00:00.000Z',
    ...overrides,
  };
}

function makeRoutine(overrides: Partial<Routine>): Routine {
  return {
    id: 'routine-1',
    childId: 'child-1',
    name: 'Routine école',
    icon: '🎒',
    color: '#A8C79D',
    category: 'school',
    steps: [],
    isActive: true,
    createdAt: '2026-05-25T06:00:00.000Z',
    updatedAt: '2026-05-25T06:00:00.000Z',
    ...overrides,
  };
}

function makeActivity(overrides: Partial<Activity>): Activity {
  return {
    id: 'activity-1',
    title: 'Jeu dehors',
    thumbnail: '🌿',
    ageMin: 3,
    ageMax: 8,
    duration: 15,
    setupTime: 1,
    cleanupTime: 0,
    parentEnergy: 'ko',
    parentMood: ['besoin-calme'],
    weather: 'outdoor',
    messLevel: 'low',
    noiseLevel: 'low',
    independenceLevel: 'medium',
    requiresSupervision: false,
    screenFree: true,
    groupActivity: false,
    playerCountMin: 1,
    playerCountMax: 2,
    activityType: 'outdoor',
    season: ['all-season'],
    materials: [],
    skills: [],
    developmentGoals: [],
    description: 'Une activité dehors.',
    steps: [],
    koVariant: 'Version courte.',
    harderVariant: 'Version longue.',
    ...overrides,
  };
}

describe('getContextualWeatherModel', () => {
  it('priorise la pluie quand une sortie dehors est prévue', () => {
    const model = getContextualWeatherModel(
      makeWeather({
        condition: 'rain',
        dayForecast: {
          minTemperature: 12,
          maxTemperature: 18,
          precipitationProbability: 80,
          hasRain: true,
          hasSnow: false,
          hasThunderstorm: false,
          dominantCondition: 'rain',
        },
      }),
      {
        events: [makeEvent({ title: 'Sortie dehors au parc' })],
        childId: 'child-1',
        date: new Date('2026-05-25T09:00:00'),
      },
    );

    expect(model.message).toBe('Sortie dehors. Bottes + imperméable.');
    expect(model.palette.tone).toBe('rain');
    expect(model.outfitPlan.tiles.some((tile) => tile.items.some((item) => item.id === 'bottes'))).toBe(true);
  });

  it('adapte le conseil pour une routine école', () => {
    const model = getContextualWeatherModel(
      makeWeather({ temperature: 11, dayForecast: { ...makeWeather().dayForecast, minTemperature: 9 } }),
      {
        routines: [makeRoutine({ category: 'school' })],
        childId: 'child-1',
        date: new Date('2026-05-25T08:00:00'),
      },
    );

    expect(model.message).toBe('Routine école. Chaussures + veste.');
    expect(model.contextLabel).toBe('Routine');
  });

  it('bascule vers un affichage dodo le soir', () => {
    const model = getContextualWeatherModel(
      makeWeather({ isDay: false }),
      {
        routines: [makeRoutine({ category: 'evening', name: 'Soir dodo' })],
        childId: 'child-1',
        date: new Date('2026-05-25T20:30:00'),
      },
    );

    expect(model.message).toBe('Soirée calme. Pyjama + doudou.');
    expect(model.palette.tone).toBe('night');
  });

  it('utilise le mode nuit configurable des 17h', () => {
    const model = getContextualWeatherModel(
      makeWeather({ condition: 'rain' }),
      {
        date: new Date('2026-05-25T17:00:00'),
      },
    );

    expect(model.timeMode).toBe('night');
    expect(model.palette.tone).toBe('nightRain');
    expect(
      model.outfitPlan.tiles.some((tile) =>
        tile.items.some((item) => item.id === 'pyjamaEte' || item.id === 'pyjamaHiver'),
      ),
    ).toBe(true);
  });

  it('annonce la sieste quand elle approche', () => {
    const model = getContextualWeatherModel(
      makeWeather(),
      {
        date: new Date('2026-05-25T12:30:00'),
      },
    );

    expect(model.message).toBe('Sieste bient\u00F4t. On ralentit.');
    expect(model.contextLabel).toBe('Sieste');
  });

  it('tient compte de l’activité extérieure courante', () => {
    const model = getContextualWeatherModel(
      makeWeather({ temperature: 30, dayForecast: { ...makeWeather().dayForecast, maxTemperature: 33 } }),
      {
        currentActivity: makeActivity({ weather: 'sunny' }),
        childId: 'child-1',
        date: new Date('2026-05-25T15:00:00'),
      },
    );

    expect(model.message).toBe('Sortie dehors. Casquette + eau.');
    expect(model.palette.tone).toBe('heat');
  });

  it('explique qu’une activité intérieure reste adaptée quand il pleut', () => {
    const model = getContextualWeatherModel(
      makeWeather({
        condition: 'rain',
        dayForecast: {
          ...makeWeather().dayForecast,
          precipitationProbability: 80,
          hasRain: true,
          dominantCondition: 'rain',
        },
      }),
      {
        currentActivity: makeActivity({ weather: 'indoor', activityType: 'creative' }),
        childId: 'child-1',
        date: new Date('2026-05-25T15:00:00'),
      },
    );

    expect(model.message).toBe('Pluie dehors. Activité dedans.');
    expect(model.contextLabel).toBe('Activité');
  });
});
