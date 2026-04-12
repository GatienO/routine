export function formatChildName(name?: string | null): string {
  const value = name?.trim() ?? '';
  if (!value) return '';

  return value.charAt(0).toLocaleUpperCase('fr-FR') + value.slice(1);
}
