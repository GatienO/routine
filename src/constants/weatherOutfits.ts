import { DayForecastSummary, WeatherCondition } from '../services/weather';

export type OutfitVisualId =
  | 'bonnet'
  | 'bottes'
  | 'casquette'
  | 'chaussettes'
  | 'chaussures'
  | 'echarpe'
  | 'gants'
  | 'lunettes'
  | 'manteau'
  | 'pantalon'
  | 'parapluie'
  | 'pull'
  | 'robe'
  | 'short'
  | 'tshirt'
  | 'tshirtML'
  | 'pyjamaEte'
  | 'pyjamaHiver'
  | 'doudou'
  | 'bouteille_eau'
  | 'pluie'
  | 'neige';

export interface OutfitVisualItem {
  id: OutfitVisualId;
  label: string;
  render: 'asset' | 'emoji';
  emoji?: string;
}

export interface OutfitTile {
  items: OutfitVisualItem[];
}

export interface OutfitPlan {
  headline: string;
  tiles: OutfitTile[];
  extras: OutfitVisualItem[];
}

const ITEM_CATALOG: Record<OutfitVisualId, OutfitVisualItem> = {
  bonnet: { id: 'bonnet', label: 'Bonnet', render: 'asset' },
  bottes: { id: 'bottes', label: 'Bottes', render: 'asset' },
  casquette: { id: 'casquette', label: 'Casquette', render: 'asset' },
  chaussettes: { id: 'chaussettes', label: 'Chaussettes', render: 'asset' },
  chaussures: { id: 'chaussures', label: 'Chaussures', render: 'asset' },
  echarpe: { id: 'echarpe', label: 'Echarpe', render: 'asset' },
  gants: { id: 'gants', label: 'Gants', render: 'asset' },
  lunettes: { id: 'lunettes', label: 'Lunettes', render: 'asset' },
  manteau: { id: 'manteau', label: 'Manteau', render: 'asset' },
  pantalon: { id: 'pantalon', label: 'Pantalon', render: 'asset' },
  parapluie: { id: 'parapluie', label: 'Parapluie', render: 'asset' },
  pull: { id: 'pull', label: 'Pull', render: 'asset' },
  robe: { id: 'robe', label: 'Robe', render: 'asset' },
  short: { id: 'short', label: 'Short', render: 'asset' },
  tshirt: { id: 'tshirt', label: 'T-shirt', render: 'asset' },
  tshirtML: { id: 'tshirtML', label: 'T-shirt ML', render: 'asset' },
  pyjamaEte: { id: 'pyjamaEte', label: 'Pyjama', render: 'asset' },
  pyjamaHiver: { id: 'pyjamaHiver', label: 'Pyjama', render: 'asset' },
  doudou: { id: 'doudou', label: 'Doudou', render: 'asset' },
  bouteille_eau: { id: 'bouteille_eau', label: 'Eau', render: 'emoji', emoji: '💧' },
  pluie: { id: 'pluie', label: 'Pluie', render: 'emoji', emoji: '🌧️' },
  neige: { id: 'neige', label: 'Neige', render: 'emoji', emoji: '❄️' },
};

function item(id: OutfitVisualId): OutfitVisualItem {
  return ITEM_CATALOG[id];
}

function single(id: OutfitVisualId): OutfitTile {
  return { items: [item(id)] };
}

function uniqueItems(ids: OutfitVisualId[]): OutfitVisualItem[] {
  return [...new Set(ids)].map(item);
}

function chooseTop(temp: number, forecast: DayForecastSummary): OutfitVisualId {
  if (temp <= 10 || forecast.minTemperature <= 8) return 'tshirtML';
  if (temp <= 14 && forecast.maxTemperature <= 18) return 'tshirtML';
  return 'tshirt';
}

function chooseShoes(temp: number, forecast: DayForecastSummary): OutfitVisualId {
  if (forecast.hasSnow) return 'bottes';
  if (forecast.hasRain && (temp <= 18 || forecast.minTemperature <= 12)) return 'bottes';
  return 'chaussures';
}

function chooseBottom(
  temp: number,
  condition: WeatherCondition,
  forecast: DayForecastSummary,
): OutfitVisualId {
  if (forecast.hasRain || forecast.hasSnow) return 'pantalon';
  if (forecast.maxTemperature <= 21 || condition === 'cloudy' || condition === 'fog') return 'pantalon';
  if (forecast.maxTemperature >= 25 && condition === 'clear') return 'short';
  return temp >= 23 ? 'short' : 'pantalon';
}

function buildBaseTiles(
  temp: number,
  condition: WeatherCondition,
  forecast: DayForecastSummary,
): { headline: string; tiles: OutfitTile[] } {
  if (temp <= 0 || forecast.minTemperature <= 0) {
    return {
      headline: 'On se couvre bien',
      tiles: [
        single('gants'),
        single('echarpe'),
        single('bonnet'),
        single('pantalon'),
        single('pull'),
        single('manteau'),
        single('chaussettes'),
        single('tshirtML'),
        single('bottes'),
      ],
    };
  }

  if (temp <= 10 || forecast.minTemperature <= 6) {
    return {
      headline: 'On reste bien au chaud',
      tiles: [
        single('bonnet'),
        single('echarpe'),
        single('pantalon'),
        single('pull'),
        single('manteau'),
        single('chaussettes'),
        single('tshirtML'),
        single(chooseShoes(temp, forecast)),
      ],
    };
  }

  if (temp <= 18 || forecast.maxTemperature <= 19) {
    return {
      headline: 'On met des habits de mi-saison',
      tiles: [
        single('pantalon'),
        single('pull'),
        single('manteau'),
        single('chaussettes'),
        single(chooseTop(temp, forecast)),
        single(chooseShoes(temp, forecast)),
      ],
    };
  }

  if (temp <= 25 || forecast.maxTemperature <= 26) {
    return {
      headline: 'On choisit une tenue legere',
      tiles: [
        single(chooseBottom(temp, condition, forecast)),
        single('chaussettes'),
        single(chooseTop(temp, forecast)),
        single(chooseShoes(temp, forecast)),
      ],
    };
  }

  if (temp < 32 && forecast.maxTemperature < 32) {
    return {
      headline: 'On met des habits tres legers',
      tiles: [single('tshirt'), single('chaussures'), single('short')],
    };
  }

  return {
    headline: 'On s habille pour la grosse chaleur',
    tiles: [
      single('tshirt'),
      single('chaussures'),
      single('short'),
      single('casquette'),
      single('bouteille_eau'),
    ],
  };
}

function buildNightTiles(forecast: DayForecastSummary): { headline: string; tiles: OutfitTile[] } {
  const warmNight =
    forecast.minTemperature <= 16 ||
    forecast.hasSnow ||
    forecast.hasThunderstorm ||
    (forecast.hasRain && forecast.minTemperature <= 18);

  const pyjamaId: OutfitVisualId = warmNight ? 'pyjamaHiver' : 'pyjamaEte';
  const tiles: OutfitTile[] = [single(pyjamaId), single('doudou')];

  if (forecast.minTemperature <= 17) {
    tiles.push(single('chaussettes'));
  }

  return {
    headline: warmNight ? 'On met le pyjama bien chaud' : 'On met le pyjama leger',
    tiles,
  };
}

function buildWeatherExtras(
  temp: number,
  condition: WeatherCondition,
  isDay: boolean,
  forecast: DayForecastSummary,
  existingIds: Set<OutfitVisualId>,
): OutfitVisualItem[] {
  const extras: OutfitVisualId[] = [];

  if (forecast.hasRain || condition === 'rain') {
    extras.push('parapluie');
  }

  if (forecast.hasSnow || condition === 'snow') {
    extras.push('bonnet', 'gants');
  }

  if (forecast.hasThunderstorm || condition === 'thunderstorm') {
    extras.push('parapluie');
  }

  if (isDay && forecast.maxTemperature >= 19 && (condition === 'clear' || condition === 'partly_cloudy')) {
    extras.push('lunettes');
  }

  if (isDay && forecast.maxTemperature >= 26) {
    extras.push('casquette');
  }

  if (temp >= 32 || forecast.maxTemperature >= 32) {
    extras.push('bouteille_eau');
  }

  return uniqueItems(extras.filter((id) => !existingIds.has(id)));
}

export function buildOutfitPlan(
  temp: number,
  condition: WeatherCondition,
  isDay: boolean,
  forecast?: DayForecastSummary,
  displayMode: 'day' | 'night' = isDay ? 'day' : 'night',
): OutfitPlan {
  const resolvedForecast: DayForecastSummary = forecast ?? {
    minTemperature: temp,
    maxTemperature: temp,
    hasRain: condition === 'rain',
    hasSnow: condition === 'snow',
    hasThunderstorm: condition === 'thunderstorm',
    dominantCondition: condition,
  };

  const base =
    displayMode === 'night'
      ? buildNightTiles(resolvedForecast)
      : buildBaseTiles(temp, condition, resolvedForecast);
  const existingIds = new Set(base.tiles.flatMap((tile) => tile.items.map((entry) => entry.id)));
  const extras =
    displayMode === 'night'
      ? []
      : buildWeatherExtras(temp, condition, isDay, resolvedForecast, existingIds);

  return {
    headline: base.headline,
    tiles: base.tiles,
    extras,
  };
}
