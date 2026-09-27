const MAX_CONTINUOUS_ROUTINE_MINUTES = 6 * 60;

export function completionDurationMinutes(startedAt: string, completedAt: string) {
  const elapsed = new Date(completedAt).getTime() - new Date(startedAt).getTime();
  if (!Number.isFinite(elapsed) || elapsed < 0) return 0;
  const minutes = Math.round(elapsed / 60000);
  // A routine can be resumed after the app was closed. In that case wall-clock
  // time would misleadingly count the whole interruption as activity time.
  return minutes > MAX_CONTINUOUS_ROUTINE_MINUTES ? 0 : minutes;
}
