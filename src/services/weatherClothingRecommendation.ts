import {
  OutfitPlan,
  StructuredOutfit,
  OutfitTile,
  OutfitVisualId,
  buildStructuredOutfit,
  buildOutfitExtras,
  buildOutfitTile,
  buildOutfitTiles,
  structuredOutfitToPlan,
} from '../constants/weatherOutfits';
import { DayForecastSummary, WeatherCondition, WeatherData } from './weather';

export type Season = 'winter' | 'spring' | 'summer' | 'autumn';
export type DayMoment = 'morning' | 'midday' | 'afternoon' | 'evening';

export type ClothingRecommendationItem =
  | 'tshirt'
  | 'pull'
  | 'vesteLegere'
  | 'manteau'
  | 'impermeable'
  | 'sandales'
  | 'casquette'
  | 'lunettes'
  | 'chaussures'
  | 'bottes'
  | 'chaussettes'
  | 'tenueMatin'
  | 'pantalon'
  | 'short'
  | 'robe'
  | 'bonnet'
  | 'gants'
  | 'echarpe'
  | 'eau';

export interface ParentWeatherSummary {
  currentTemperature: number;
  apparentTemperature?: number;
  minTemperature: number;
  maxTemperature: number;
  precipitationProbability?: number;
  windSpeed?: number;
  dominantCondition: WeatherCondition;
  season: Season;
  dayMoment: DayMoment;
  mainRecommendation: string;
  reason: string;
}

export interface ClothingRecommendation {
  childMessage: string;
  parentSummary: ParentWeatherSummary;
  structuredOutfit: StructuredOutfit;
  outfitPlan: OutfitPlan;
  items: ClothingRecommendationItem[];
  isLayered: boolean;
  reasons: string[];
  outfitReasons: Partial<Record<OutfitVisualId, string>>;
}

interface WeatherClothingContext {
  current: number;
  apparentCurrent?: number;
  effectiveCurrent: number;
  min: number;
  max: number;
  apparentMin?: number;
  apparentMax?: number;
  effectiveMin: number;
  effectiveMax: number;
  precipitationProbability: number;
  windSpeed: number;
  condition: WeatherCondition;
  forecast: DayForecastSummary;
  season: Season;
  moment: DayMoment;
}

const RAIN_RISK_THRESHOLD = 35;
const STRONG_WIND_KMH = 38;

export function getSeason(date: Date): Season {
  const month = date.getMonth();
  if (month === 11 || month <= 1) return 'winter';
  if (month <= 4) return 'spring';
  if (month <= 7) return 'summer';
  return 'autumn';
}

export function getDayMoment(date: Date): DayMoment {
  const hour = date.getHours();
  if (hour < 11) return 'morning';
  if (hour < 14) return 'midday';
  if (hour < 18) return 'afternoon';
  return 'evening';
}

function uniq<T>(items: T[]): T[] {
  return [...new Set(items)];
}

function hasRainRisk(ctx: WeatherClothingContext): boolean {
  return (
    ctx.forecast.hasRain ||
    ctx.forecast.hasThunderstorm ||
    ctx.condition === 'rain' ||
    ctx.condition === 'thunderstorm' ||
    ctx.precipitationProbability >= RAIN_RISK_THRESHOLD
  );
}

function hasStrongWind(ctx: WeatherClothingContext): boolean {
  return ctx.windSpeed >= STRONG_WIND_KMH;
}

function isFreshStartWarmerLater(ctx: WeatherClothingContext): boolean {
  return (
    (ctx.moment === 'morning' || ctx.moment === 'evening') &&
    ctx.effectiveCurrent <= 16 &&
    ctx.effectiveMax >= 22 &&
    ctx.effectiveMax - ctx.effectiveCurrent >= 6
  );
}

function resolveContext(
  weather: WeatherData,
  date: Date,
  season: Season,
  moment: DayMoment,
): WeatherClothingContext {
  const forecast = weather.dayForecast;
  const apparentCurrent = weather.apparentTemperature;
  const apparentMin = forecast.minApparentTemperature;
  const apparentMax = forecast.maxApparentTemperature;

  return {
    current: weather.temperature,
    apparentCurrent,
    effectiveCurrent: apparentCurrent ?? weather.temperature,
    min: forecast.minTemperature,
    max: forecast.maxTemperature,
    apparentMin,
    apparentMax,
    effectiveMin: apparentMin ?? forecast.minTemperature,
    effectiveMax: apparentMax ?? forecast.maxTemperature,
    precipitationProbability: forecast.precipitationProbability ?? 0,
    windSpeed: forecast.maxWindSpeed ?? weather.windSpeed ?? 0,
    condition: forecast.dominantCondition ?? weather.condition,
    forecast,
    season,
    moment,
  };
}

function chooseMainClothes(ctx: WeatherClothingContext): ClothingRecommendationItem[] {
  if (ctx.forecast.hasSnow || ctx.effectiveMin <= 1 || ctx.effectiveCurrent <= 3) {
    return ['tshirt', 'pull', 'manteau', 'pantalon', 'chaussettes', 'bonnet', 'gants', 'echarpe', 'bottes'];
  }

  if (isFreshStartWarmerLater(ctx)) {
    const warmOptions: ClothingRecommendationItem[] =
      ctx.effectiveMax >= 25 ? ['short', 'robe'] : ['pantalon'];
    const shoes: ClothingRecommendationItem[] =
      ctx.effectiveMax > 26 && !hasRainRisk(ctx) ? ['sandales'] : ['chaussettes', 'chaussures'];
    return ['tshirt', 'vesteLegere', 'tenueMatin', ...warmOptions, ...shoes];
  }

  if (
    ctx.effectiveMin <= 7 ||
    ctx.effectiveCurrent <= 8 ||
    (ctx.season === 'winter' && ctx.effectiveMax <= 15)
  ) {
    return ['tshirt', 'pull', 'manteau', 'pantalon', 'chaussettes', 'chaussures'];
  }

  if (ctx.effectiveCurrent <= 15 || ctx.effectiveMin <= 11) {
    const outerLayer: ClothingRecommendationItem =
      ctx.season === 'summer' || ctx.effectiveMax >= 21 ? 'vesteLegere' : 'pull';
    return ['tshirt', outerLayer, 'pantalon', 'chaussettes', 'chaussures'];
  }

  if (ctx.effectiveMax >= 29) {
    return ['tshirt', 'short', 'robe', hasRainRisk(ctx) ? 'chaussures' : 'sandales', 'casquette', 'eau'];
  }

  if (ctx.effectiveMax >= 24) {
    const shoes: ClothingRecommendationItem[] =
      ctx.effectiveMax > 26 && !hasRainRisk(ctx) ? ['sandales'] : ['chaussettes', 'chaussures'];
    return ['tshirt', 'short', 'robe', ...shoes];
  }

  return ['tshirt', ctx.season === 'winter' ? 'pull' : 'vesteLegere', 'pantalon', 'chaussettes', 'chaussures'];
}

function withWeatherItems(
  items: ClothingRecommendationItem[],
  ctx: WeatherClothingContext,
): ClothingRecommendationItem[] {
  const next = [...items];

  if (hasRainRisk(ctx)) {
    next.push('impermeable');
    if (ctx.effectiveMax <= 20 || ctx.effectiveMin <= 12) next.push('bottes');
    const sandalIndex = next.indexOf('sandales');
    if (sandalIndex >= 0) next.splice(sandalIndex, 1, 'chaussures');
  }

  if (hasStrongWind(ctx) && !next.includes('manteau')) {
    next.push(ctx.effectiveCurrent <= 17 || ctx.effectiveMin <= 13 ? 'vesteLegere' : 'pull');
  }

  if (ctx.effectiveMax >= 24 && !next.includes('casquette')) next.push('casquette');
  if (ctx.effectiveMax >= 22 && !next.includes('lunettes')) next.push('lunettes');
  if (ctx.effectiveMax >= 29 && !next.includes('eau')) next.push('eau');

  return uniq(next);
}

function itemToVisualId(item: ClothingRecommendationItem): OutfitVisualId | null {
  switch (item) {
    case 'tshirt':
      return 'tshirt';
    case 'pull':
      return 'pull';
    case 'vesteLegere':
      return 'vesteLegere';
    case 'manteau':
      return 'manteau';
    case 'impermeable':
      return 'impermeable';
    case 'sandales':
      return 'sandales';
    case 'casquette':
      return 'casquette';
    case 'lunettes':
      return 'lunettes';
    case 'chaussures':
      return 'chaussures';
    case 'bottes':
      return 'bottes';
    case 'chaussettes':
      return 'chaussettes';
    case 'pantalon':
      return 'pantalon';
    case 'short':
      return 'short';
    case 'robe':
      return 'robe';
    case 'bonnet':
      return 'bonnet';
    case 'gants':
      return 'gants';
    case 'echarpe':
      return 'echarpe';
    case 'eau':
      return 'bouteille';
    default:
      return null;
  }
}

function buildHeadline(ctx: WeatherClothingContext, items: ClothingRecommendationItem[]): string {
  if (isFreshStartWarmerLater(ctx)) return 'Veste à enlever';
  if (ctx.forecast.hasSnow || ctx.effectiveMin <= 1) return 'Bien couvert';
  if (items.includes('manteau')) return 'Tenue chaude';
  if (ctx.effectiveMax >= 29) return 'Tenue légère';
  if (hasRainRisk(ctx)) return 'Prévoir la pluie';
  if (hasStrongWind(ctx)) return 'Coupe-vent utile';
  return 'Tenue confortable';
}

function buildChildMessage(ctx: WeatherClothingContext, items: ClothingRecommendationItem[]): string {
  if (isFreshStartWarmerLater(ctx)) {
    return 'Frais ce matin. Veste légère.';
  }

  if (hasRainRisk(ctx)) {
    return 'Pluie possible. Imperméable.';
  }

  if (hasStrongWind(ctx)) {
    return 'Vent fort. Veste utile.';
  }

  if (ctx.effectiveMax >= 29) {
    return "Chaud aujourd'hui. Casquette + eau.";
  }

  if (items.includes('manteau')) {
    return "Froid aujourd'hui. Manteau.";
  }

  if (ctx.effectiveCurrent <= 15 || ctx.effectiveMin <= 11) {
    return ctx.season === 'summer'
      ? 'Frais maintenant. Petite veste.'
      : 'Frais. Pull ou veste.';
  }

  return 'Météo douce. Tenue confortable.';
}

function buildReasons(ctx: WeatherClothingContext): string[] {
  const reasons: string[] = [
    `${ctx.current} deg maintenant`,
    `${ctx.min}/${ctx.max} deg sur la journee`,
  ];

  if (typeof ctx.apparentCurrent === 'number' && ctx.apparentCurrent !== ctx.current) {
    reasons.push(`ressenti ${ctx.apparentCurrent} deg`);
  }

  if (ctx.precipitationProbability > 0 || ctx.forecast.hasRain) {
    reasons.push(
      ctx.precipitationProbability > 0
        ? `risque de pluie ${ctx.precipitationProbability}%`
        : 'pluie possible',
    );
  }

  if (ctx.windSpeed > 0) reasons.push(`vent ${ctx.windSpeed} km/h`);
  reasons.push(`saison ${ctx.season}`, `moment ${ctx.moment}`);

  return reasons;
}

function buildParentReason(ctx: WeatherClothingContext): string {
  if (isFreshStartWarmerLater(ctx)) {
    return `Matin frais (${ctx.effectiveCurrent}°). Plus chaud ensuite (${ctx.effectiveMax}°). Veste amovible.`;
  }

  if (hasRainRisk(ctx)) {
    return ctx.precipitationProbability > 0
      ? `Pluie possible (${ctx.precipitationProbability}%). Protection utile.`
      : 'Pluie prévue. Protection utile.';
  }

  if (hasStrongWind(ctx)) {
    return `Vent fort (${ctx.windSpeed} km/h). Veste utile.`;
  }

  if (ctx.effectiveMax >= 29) {
    return `Maximum ${ctx.effectiveMax}°. Soleil et eau.`;
  }

  if (ctx.season === 'winter' && ctx.effectiveMax <= 15) {
    return 'Journée fraîche. Tenue chaude.';
  }

  return 'Tenue adaptée à la journée.';
}

function buildVisualIds(items: ClothingRecommendationItem[]): OutfitVisualId[] {
  return items
    .filter((entry) => entry !== 'tenueMatin')
    .map(itemToVisualId)
    .filter((entry): entry is OutfitVisualId => entry !== null);
}

function buildOutfitReasons(ids: OutfitVisualId[], ctx: WeatherClothingContext) {
  return ids.reduce<Partial<Record<OutfitVisualId, string>>>((reasons, id) => {
    if (['impermeable', 'bottes', 'parapluie'].includes(id)) reasons[id] = 'Pour rester au sec';
    else if (['manteau', 'pull', 'bonnet', 'gants', 'echarpe'].includes(id)) reasons[id] = 'Pour rester bien au chaud';
    else if (id === 'vesteLegere') reasons[id] = hasStrongWind(ctx) ? 'Utile quand le vent souffle' : 'Facile à enlever s’il fait plus chaud';
    else if (['casquette', 'lunettes'].includes(id)) reasons[id] = 'Utile quand le soleil est présent';
    else if (['bouteille', 'bouteille_eau'].includes(id)) reasons[id] = 'Pour penser à boire';
    else reasons[id] = 'Confortable pour cette journée';
    return reasons;
  }, {});
}

function buildPlan(
  ctx: WeatherClothingContext,
  items: ClothingRecommendationItem[],
  structuredOutfit: StructuredOutfit,
): OutfitPlan {
  const legacyPlan = structuredOutfitToPlan(structuredOutfit, buildHeadline(ctx, items));
  const extraVisuals = items
    .filter((entry) => ['casquette', 'lunettes', 'eau'].includes(entry))
    .map(itemToVisualId)
    .filter((entry): entry is OutfitVisualId => entry !== null);

  return {
    headline: buildHeadline(ctx, items),
    tiles: buildMainOutfitTiles(uniq(legacyPlan.tiles.flatMap((tile) => tile.items.map((item) => item.id)))),
    extras: buildOutfitExtras(uniq(extraVisuals)),
  };
}

function buildMainOutfitTiles(ids: OutfitVisualId[]): OutfitTile[] {
  if (!ids.includes('short') || !ids.includes('robe')) {
    return buildOutfitTiles(ids);
  }

  const tiles: OutfitTile[] = [];

  ids.forEach((id) => {
    if (id === 'robe') return;
    if (id === 'short') {
      tiles.push(buildOutfitTile(['short', 'robe']));
      return;
    }
    tiles.push(...buildOutfitTiles([id]));
  });

  return tiles;
}

export function getClothingRecommendation(
  weather: WeatherData,
  date: Date = new Date(),
  season: Season = getSeason(date),
  moment: DayMoment = getDayMoment(date),
): ClothingRecommendation {
  const ctx = resolveContext(weather, date, season, moment);
  const items = withWeatherItems(chooseMainClothes(ctx), ctx);
  const childMessage = buildChildMessage(ctx, items);
  const mainRecommendation = buildHeadline(ctx, items);
  const structuredOutfit = buildStructuredOutfit(uniq(buildVisualIds(items)));
  const visualIds = uniq(buildVisualIds(items));

  return {
    childMessage,
    parentSummary: {
      currentTemperature: ctx.current,
      apparentTemperature: ctx.apparentCurrent,
      minTemperature: ctx.min,
      maxTemperature: ctx.max,
      precipitationProbability: ctx.precipitationProbability || undefined,
      windSpeed: ctx.windSpeed || undefined,
      dominantCondition: ctx.condition,
      season: ctx.season,
      dayMoment: ctx.moment,
      mainRecommendation,
      reason: buildParentReason(ctx),
    },
    structuredOutfit,
    outfitPlan: buildPlan(ctx, items, structuredOutfit),
    items,
    isLayered: isFreshStartWarmerLater(ctx),
    reasons: buildReasons(ctx),
    outfitReasons: buildOutfitReasons(visualIds, ctx),
  };
}
