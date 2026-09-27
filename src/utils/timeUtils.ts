export function getEstimatedEndTime(durationMinutes: number): string {
  const endTime = new Date();
  endTime.setMinutes(endTime.getMinutes() + durationMinutes);

  return endTime
    .toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
    .replace(':', 'h');
}
