export function isSameDay(d1: string, d2: string): boolean {
  return d1.slice(0, 10) === d2.slice(0, 10);
}

export function isYesterday(dateStr: string): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return dateStr.slice(0, 10) === yesterday.toISOString().slice(0, 10);
}

export function isToday(dateStr: string): boolean {
  return dateStr.slice(0, 10) === new Date().toISOString().slice(0, 10);
}

export function formatDuration(minutes: number): string {
  const totalSeconds = Math.round(Math.max(0, minutes) * 60);

  if (totalSeconds === 0) return '0 sec';
  if (totalSeconds < 60) return `${totalSeconds} sec`;

  const wholeMinutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (seconds === 0) {
    return wholeMinutes === 1 ? '1 min' : `${wholeMinutes} min`;
  }

  return `${wholeMinutes} min ${seconds.toString().padStart(2, '0')}`;
}
