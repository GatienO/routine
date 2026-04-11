import { RealReward, RealRewardCooldownUnit } from '../types';

const UNIT_TO_MS: Record<RealRewardCooldownUnit, number> = {
  minute: 60 * 1000,
  hour: 60 * 60 * 1000,
  day: 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
};

const UNIT_LABELS: Record<RealRewardCooldownUnit, { singular: string; plural: string }> = {
  minute: { singular: 'minute', plural: 'minutes' },
  hour: { singular: 'heure', plural: 'heures' },
  day: { singular: 'jour', plural: 'jours' },
  week: { singular: 'semaine', plural: 'semaines' },
};

export function getRewardCooldownMs(reward: Pick<RealReward, 'cooldownValue' | 'cooldownUnit'>) {
  const value = Math.max(1, reward.cooldownValue || 1);
  const unit = reward.cooldownUnit || 'week';
  return value * UNIT_TO_MS[unit];
}

export function getRewardAvailabilityForChild(
  reward: RealReward,
  childId: string,
  nowMs = Date.now(),
) {
  const lastClaimedAt = reward.claimedByChild?.[childId];

  if (!lastClaimedAt) {
    return {
      lastClaimedAt: undefined,
      availableAt: undefined,
      remainingCooldownMs: 0,
      isCoolingDown: false,
    };
  }

  const availableAtMs = new Date(lastClaimedAt).getTime() + getRewardCooldownMs(reward);
  const remainingCooldownMs = Math.max(0, availableAtMs - nowMs);

  return {
    lastClaimedAt,
    availableAt: new Date(availableAtMs).toISOString(),
    remainingCooldownMs,
    isCoolingDown: remainingCooldownMs > 0,
  };
}

export function formatRewardCooldownLabel(
  reward: Pick<RealReward, 'cooldownValue' | 'cooldownUnit'>,
) {
  const value = Math.max(1, reward.cooldownValue || 1);
  const unit = reward.cooldownUnit || 'week';
  const label = value > 1 ? UNIT_LABELS[unit].plural : UNIT_LABELS[unit].singular;
  return `Disponible 1 fois tous les ${value} ${label}`;
}

export function formatRemainingCooldown(remainingMs: number) {
  if (remainingMs <= 0) return 'Disponible';

  const totalSeconds = Math.ceil(remainingMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) return `${days}j ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}min`;
  if (minutes > 0) return `${minutes}min ${seconds}s`;
  return `${seconds}s`;
}
