const OPENMOJI_CDN = 'https://cdn.jsdelivr.net/npm/openmoji@16.0.0/color/72x72';

/**
 * Convert an emoji string to its Unicode codepoint hex sequence (e.g. "🌟" → "1F31F").
 * Multi-codepoint emojis are joined with hyphens (e.g. "👨‍👩‍👧" → "1F468-200D-1F469-200D-1F467").
 */
export function emojiToCodepoint(emoji: string): string {
  const codepoints: string[] = [];
  for (const char of emoji) {
    const cp = char.codePointAt(0);
    if (cp !== undefined) {
      codepoints.push(cp.toString(16).toUpperCase());
    }
  }
  return codepoints.join('-');
}

/**
 * Get the OpenMoji CDN URL for a given emoji character.
 */
export function getOpenMojiUrl(emoji: string): string {
  const codepoint = emojiToCodepoint(emoji);
  return `${OPENMOJI_CDN}/${codepoint}.png`;
}
