import { DayForecastSummary, WeatherCondition } from '../services/weather';

export type OutfitVisualId =
  | 'bonnet'
  | 'bottes'
  | 'bouteille'
  | 'bouteille_eau'
  | 'casquette'
  | 'chaussettes'
  | 'chaussures'
  | 'echarpe'
  | 'gants'
  | 'impermeable'
  | 'lunettes'
  | 'manteau'
  | 'pantalon'
  | 'parapluie'
  | 'pull'
  | 'robe'
  | 'sandales'
  | 'short'
  | 'tshirt'
  | 'tshirtML'
  | 'vent'
  | 'vesteLegere'
  | 'maillot'
  | 'pyjamaEte'
  | 'pyjamaHiver'
  | 'doudou'
  | 'pluie'
  | 'neige';

export type TempLevel = 'very_cold' | 'cold' | 'mild' | 'warm' | 'very_hot';

export interface WeatherLevel {
  level: TempLevel;
  maxTemp: number;
  label: string;
  sublabel: string;
  colorKey: string;
}

export const WEATHER_LEVELS: WeatherLevel[] = [
  { level: 'very_cold', maxTemp: 5, label: 'Brr ! Très froid !', sublabel: 'Manteau obligatoire', colorKey: 'blue' },
  { level: 'cold', maxTemp: 14, label: 'Froid ce matin', sublabel: 'Pense à ta veste', colorKey: 'purple' },
  { level: 'mild', maxTemp: 20, label: 'Doux, presque bien', sublabel: 'Une petite couche peut-être', colorKey: 'green' },
  { level: 'warm', maxTemp: 27, label: 'Super journée !', sublabel: 'T-shirt suffit', colorKey: 'amber' },
  { level: 'very_hot', maxTemp: 99, label: 'Attention, très chaud !', sublabel: 'Short ou robe légère', colorKey: 'coral' },
];

export function getTempLevel(temp: number): WeatherLevel {
  return WEATHER_LEVELS.find((level) => temp <= level.maxTemp) ?? WEATHER_LEVELS[WEATHER_LEVELS.length - 1];
}

export type OutfitZoneId = 'head' | 'body' | 'legs' | 'feet' | 'accessories';

export interface OutfitZone {
  zone: OutfitZoneId;
  label: string;
  items: string[];
  layerOrder: number;
}

export interface StructuredOutfit {
  zones: OutfitZone[];
  sleepMode: boolean;
}

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

const ZONE_LABELS: Record<OutfitZoneId, string> = {
  head: 'Tête',
  body: 'Corps',
  legs: 'Jambes',
  feet: 'Pieds',
  accessories: 'Accessoires',
};

const ZONE_LAYER_ORDER: Record<OutfitZoneId, number> = {
  feet: 1,
  legs: 2,
  body: 3,
  head: 4,
  accessories: 5,
};

const BODY_LAYER_ORDER: Partial<Record<OutfitVisualId, number>> = {
  tshirt: 1,
  tshirtML: 1,
  pull: 2,
  vesteLegere: 3,
  impermeable: 4,
  manteau: 5,
  pyjamaEte: 1,
  pyjamaHiver: 1,
};

const FEET_LAYER_ORDER: Partial<Record<OutfitVisualId, number>> = {
  chaussettes: 1,
  chaussures: 2,
  bottes: 2,
  sandales: 2,
};

const ITEM_ZONE: Partial<Record<OutfitVisualId, OutfitZoneId>> = {
  bonnet: 'head',
  casquette: 'head',
  lunettes: 'head',
  tshirt: 'body',
  tshirtML: 'body',
  pull: 'body',
  manteau: 'body',
  vesteLegere: 'body',
  impermeable: 'body',
  pyjamaEte: 'body',
  pyjamaHiver: 'body',
  maillot: 'body',
  pantalon: 'legs',
  short: 'legs',
  robe: 'legs',
  chaussures: 'feet',
  bottes: 'feet',
  chaussettes: 'feet',
  sandales: 'feet',
  gants: 'accessories',
  echarpe: 'accessories',
  doudou: 'accessories',
  bouteille: 'accessories',
  bouteille_eau: 'accessories',
  parapluie: 'accessories',
};

const ITEM_CATALOG: Record<OutfitVisualId, OutfitVisualItem> = {
  bonnet: { id: 'bonnet', label: 'Bonnet', render: 'asset' },
  bottes: { id: 'bottes', label: 'Bottes', render: 'asset' },
  bouteille: { id: 'bouteille', label: 'Bouteille', render: 'asset' },
  bouteille_eau: { id: 'bouteille_eau', label: 'Eau', render: 'asset' },
  casquette: { id: 'casquette', label: 'Casquette', render: 'asset' },
  chaussettes: { id: 'chaussettes', label: 'Chaussettes', render: 'asset' },
  chaussures: { id: 'chaussures', label: 'Chaussures', render: 'asset' },
  echarpe: { id: 'echarpe', label: '\u00C9charpe', render: 'asset' },
  gants: { id: 'gants', label: 'Gants', render: 'asset' },
  impermeable: { id: 'impermeable', label: 'Imperm\u00E9able', render: 'asset' },
  lunettes: { id: 'lunettes', label: 'Lunettes', render: 'asset' },
  maillot: { id: 'maillot', label: 'Maillot', render: 'asset' },
  manteau: { id: 'manteau', label: 'Manteau', render: 'asset' },
  pantalon: { id: 'pantalon', label: 'Pantalon', render: 'asset' },
  parapluie: { id: 'parapluie', label: 'Parapluie', render: 'asset' },
  pull: { id: 'pull', label: 'Pull', render: 'asset' },
  robe: { id: 'robe', label: 'Robe', render: 'asset' },
  sandales: { id: 'sandales', label: 'Sandales', render: 'asset' },
  short: { id: 'short', label: 'Short', render: 'asset' },
  tshirt: { id: 'tshirt', label: 'T-shirt', render: 'asset' },
  tshirtML: { id: 'tshirtML', label: 'T-shirt ML', render: 'asset' },
  vent: { id: 'vent', label: 'Vent', render: 'emoji', emoji: '\u{1F32C}\uFE0F' },
  vesteLegere: { id: 'vesteLegere', label: 'Veste l\u00E9g\u00E8re', render: 'asset' },
  pyjamaEte: { id: 'pyjamaEte', label: 'Pyjama', render: 'asset' },
  pyjamaHiver: { id: 'pyjamaHiver', label: 'Pyjama', render: 'asset' },
  doudou: { id: 'doudou', label: 'Doudou', render: 'asset' },
  pluie: { id: 'pluie', label: 'Pluie', render: 'emoji', emoji: '\u{1F327}\uFE0F' },
  neige: { id: 'neige', label: 'Neige', render: 'emoji', emoji: '\u2744\uFE0F' },
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

function itemSortValue(id: OutfitVisualId): number {
  return BODY_LAYER_ORDER[id] ?? FEET_LAYER_ORDER[id] ?? 10;
}

export function getOutfitVisualItem(id: string): OutfitVisualItem | undefined {
  return ITEM_CATALOG[id as OutfitVisualId];
}

/** Complete wardrobe, without weather symbols or duplicate water aliases. */
export const SELECTABLE_OUTFIT_IDS: readonly OutfitVisualId[] = [
  'tshirt', 'tshirtML', 'pull', 'vesteLegere', 'manteau', 'impermeable',
  'pantalon', 'short', 'robe', 'maillot', 'chaussettes', 'chaussures',
  'bottes', 'sandales', 'bonnet', 'casquette', 'echarpe', 'gants',
  'lunettes', 'parapluie', 'pyjamaEte', 'pyjamaHiver', 'bouteille', 'doudou',
];

export function normalizeOutfitSelection(ids: readonly OutfitVisualId[]): OutfitVisualId[] {
  return [...new Set(ids.map(id => id === 'bouteille_eau' ? 'bouteille' : id))]
    .filter(id => SELECTABLE_OUTFIT_IDS.includes(id));
}

export function buildOutfitTile(ids: OutfitVisualId[]): OutfitTile {
  return { items: ids.map(item) };
}

export function buildOutfitTiles(ids: OutfitVisualId[]): OutfitTile[] {
  return ids.map(single);
}

export function buildOutfitExtras(ids: OutfitVisualId[]): OutfitVisualItem[] {
  return uniqueItems(ids);
}

export function buildStructuredOutfit(ids: OutfitVisualId[], sleepMode = false): StructuredOutfit {
  const uniqueIds = [...new Set(ids)];
  const zones = (Object.keys(ZONE_LABELS) as OutfitZoneId[])
    .map((zone) => {
      const zoneItems = uniqueIds
        .filter((id) => ITEM_ZONE[id] === zone)
        .sort((left, right) => itemSortValue(left) - itemSortValue(right));

      return {
        zone,
        label: ZONE_LABELS[zone],
        items: zoneItems,
        layerOrder: ZONE_LAYER_ORDER[zone],
      };
    })
    .filter((zone) => zone.items.length > 0)
    .sort((left, right) => left.layerOrder - right.layerOrder);

  return { zones, sleepMode };
}

export function structuredOutfitToPlan(outfit: StructuredOutfit, headline: string): OutfitPlan {
  const activeZones = outfit.sleepMode
    ? outfit.zones.filter((zone) => zone.zone === 'body' || zone.zone === 'accessories')
    : outfit.zones;
  const mainIds = activeZones.flatMap((zone) => zone.items) as OutfitVisualId[];
  const extraIds = activeZones
    .filter((zone) => zone.zone === 'head' || zone.zone === 'accessories')
    .flatMap((zone) => zone.items) as OutfitVisualId[];

  return {
    headline,
    tiles: buildOutfitTiles(mainIds),
    extras: buildOutfitExtras(extraIds),
  };
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
      headline: 'Bien couvert',
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
      headline: 'Au chaud',
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
      headline: 'Mi-saison',
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
      headline: 'Tenue l\u00E9g\u00E8re',
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
      headline: 'Tr\u00E8s l\u00E9ger',
      tiles: [single('tshirt'), single('chaussures'), single('short')],
    };
  }

  return {
    headline: 'Grosse chaleur',
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
    headline: warmNight ? 'Pyjama chaud' : 'Pyjama l\u00E9ger',
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
