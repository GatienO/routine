import { OutfitPlan, OutfitVisualId, buildOutfitExtras, buildOutfitTiles } from '../constants/weatherOutfits';
import { DayForecastSummary, WeatherCondition, WeatherData } from './weather';

export type Season = 'winter' | 'spring' | 'summer' | 'autumn';
export type DayMoment = 'morning' | 'midday' | 'afternoon' | 'evening';

export type ClothingRecommendationItem =
  | 'tshirt'
  | 'pull'
  | 'vesteLegere'
  | 'manteau'
  | 'impermeable'
  | 'casquette'
  | 'lunettes'
  | 'chaussures'
  | 'bottes'
  | 'tenueMatin'
  | 'pantalon'
  | 'short'
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
  outfitPlan: OutfitPlan;
  items: ClothingRecommendationItem[];
  isLayered: boolean;
  reasons: string[];
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
    return ['tshirt', 'pull', 'manteau', 'pantalon', 'bonnet', 'gants', 'echarpe', 'bottes'];
  }

  if (isFreshStartWarmerLater(ctx)) {
    return ['tshirt', 'vesteLegere', 'tenueMatin', ctx.effectiveMax >= 25 ? 'short' : 'pantalon', 'chaussures'];
  }

  if (
    ctx.effectiveMin <= 7 ||
    ctx.effectiveCurrent <= 8 ||
    (ctx.season === 'winter' && ctx.effectiveMax <= 15)
  ) {
    return ['tshirt', 'pull', 'manteau', 'pantalon', 'chaussures'];
  }

  if (ctx.effectiveCurrent <= 15 || ctx.effectiveMin <= 11) {
    const outerLayer: ClothingRecommendationItem =
      ctx.season === 'summer' || ctx.effectiveMax >= 21 ? 'vesteLegere' : 'pull';
    return ['tshirt', outerLayer, 'pantalon', 'chaussures'];
  }

  if (ctx.effectiveMax >= 29) {
    return ['tshirt', 'short', 'chaussures', 'casquette', 'eau'];
  }

  if (ctx.effectiveMax >= 24) {
    return ['tshirt', 'short', 'chaussures'];
  }

  return ['tshirt', ctx.season === 'winter' ? 'pull' : 'vesteLegere', 'pantalon', 'chaussures'];
}

function withWeatherItems(
  items: ClothingRecommendationItem[],
  ctx: WeatherClothingContext,
): ClothingRecommendationItem[] {
  const next = [...items];

  if (hasRainRisk(ctx)) {
    next.push('impermeable');
    if (ctx.effectiveMax <= 20 || ctx.effectiveMin <= 12) next.push('bottes');
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
    case 'casquette':
      return 'casquette';
    case 'lunettes':
      return 'lunettes';
    case 'chaussures':
      return 'chaussures';
    case 'bottes':
      return 'bottes';
    case 'pantalon':
      return 'pantalon';
    case 'short':
      return 'short';
    case 'bonnet':
      return 'bonnet';
    case 'gants':
      return 'gants';
    case 'echarpe':
      return 'echarpe';
    case 'eau':
      return 'bouteille_eau';
    default:
      return null;
  }
}

function buildHeadline(ctx: WeatherClothingContext, items: ClothingRecommendationItem[]): string {
  if (isFreshStartWarmerLater(ctx)) return 'Tenue facile a enlever';
  if (ctx.forecast.hasSnow || ctx.effectiveMin <= 1) return 'On se couvre bien';
  if (items.includes('manteau')) return 'On prend une tenue chaude';
  if (ctx.effectiveMax >= 29) return 'On s habille leger pour la chaleur';
  if (hasRainRisk(ctx)) return 'On prevoit la pluie';
  if (hasStrongWind(ctx)) return 'On garde une couche contre le vent';
  return 'On choisit une tenue confortable';
}

function buildChildMessage(ctx: WeatherClothingContext, items: ClothingRecommendationItem[]): string {
  if (isFreshStartWarmerLater(ctx)) {
    return 'Ce matin il fait frais, mais il fera chaud plus tard. Mets une veste legere que tu pourras enlever.';
  }

  if (hasRainRisk(ctx)) {
    return 'Il risque de pleuvoir, prends ton impermeable.';
  }

  if (hasStrongWind(ctx)) {
    return 'Il y a du vent aujourd hui, garde une veste avec toi.';
  }

  if (ctx.effectiveMax >= 29) {
    return 'Il va faire chaud aujourd hui, pense a une casquette et a boire de l eau.';
  }

  if (items.includes('manteau')) {
    return 'Il fait froid aujourd hui, mets ton manteau pour rester bien au chaud.';
  }

  if (ctx.effectiveCurrent <= 15 || ctx.effectiveMin <= 11) {
    return ctx.season === 'summer'
      ? 'Il fait frais pour le moment, prends une petite veste.'
      : 'Il fait frais aujourd hui, prends un pull ou une veste.';
  }

  return 'La meteo est douce aujourd hui, choisis une tenue confortable.';
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
    return `Le debut de journee est frais (${ctx.effectiveCurrent} deg ressentis) mais la journee monte jusqu a ${ctx.effectiveMax} deg. Une couche amovible evite le manteau trop chaud.`;
  }

  if (hasRainRisk(ctx)) {
    return ctx.precipitationProbability > 0
      ? `Risque de pluie eleve (${ctx.precipitationProbability}%), protection pluie recommandee.`
      : 'Pluie detectee dans la prevision de la journee.';
  }

  if (hasStrongWind(ctx)) {
    return `Vent fort prevu (${ctx.windSpeed} km/h), une couche coupe-vent est utile.`;
  }

  if (ctx.effectiveMax >= 29) {
    return `Maximum prevu a ${ctx.effectiveMax} deg, protection soleil et hydratation recommandees.`;
  }

  if (ctx.season === 'winter' && ctx.effectiveMax <= 15) {
    return 'En hiver, cette temperature reste fraiche sur la journee, surtout avec le ressenti.';
  }

  return 'La recommandation utilise la plage min/max de la journee, le ressenti, la saison et le moment actuel.';
}

function buildPlan(ctx: WeatherClothingContext, items: ClothingRecommendationItem[]): OutfitPlan {
  const mainVisuals = items
    .filter((entry) => !['impermeable', 'casquette', 'lunettes', 'eau', 'tenueMatin'].includes(entry))
    .map(itemToVisualId)
    .filter((entry): entry is OutfitVisualId => entry !== null);
  const extraVisuals = items
    .filter((entry) => ['impermeable', 'casquette', 'lunettes', 'eau'].includes(entry))
    .map(itemToVisualId)
    .filter((entry): entry is OutfitVisualId => entry !== null);

  return {
    headline: buildHeadline(ctx, items),
    tiles: buildOutfitTiles(uniq(mainVisuals)),
    extras: buildOutfitExtras(uniq(extraVisuals)),
  };
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
    outfitPlan: buildPlan(ctx, items),
    items,
    isLayered: isFreshStartWarmerLater(ctx),
    reasons: buildReasons(ctx),
  };
}
