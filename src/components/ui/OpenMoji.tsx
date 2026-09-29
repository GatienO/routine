import React, { useState } from 'react';
import { Image, Text, StyleSheet, View } from 'react-native';
import { getOpenMojiUrl } from '../../utils/openmoji';

interface OpenMojiProps {
  emoji: string;
  size: number;
}

const FORCE_NATIVE_EMOJI = new Set(['🪥', '🧹']);

const EMOJI_VISUAL_TWEAKS: Record<string, { scale?: number; offsetX?: number; offsetY?: number }> = {
  '🪥': { scale: 1.08, offsetY: 1, offsetX: 1 },
  '🛏️': { scale: 1.04, offsetY: 1 },
  '🛏': { scale: 1.04, offsetY: 1 },
  '🛁': { scale: 1.06, offsetY: 1 },
  '🧹': { scale: 1.08, offsetY: 1 },
  '🎒': { scale: 0.96, offsetY: -1 },
};

/**
 * Renders an emoji using OpenMoji (open-source emoji set).
 * Falls back to native text emoji if the image fails to load.
 */
export function OpenMoji({ emoji, size }: OpenMojiProps) {
  const [failedEmoji, setFailedEmoji] = useState<string | null>(null);
  const [loadedEmoji, setLoadedEmoji] = useState<string | null>(null);
  const tweak = EMOJI_VISUAL_TWEAKS[emoji] ?? {};
  const visualSize = Math.round(size * 0.86 * (tweak.scale ?? 1));
  const transform = [
    { translateX: tweak.offsetX ?? 0 },
    { translateY: tweak.offsetY ?? 0 },
  ];

  if (failedEmoji === emoji || !emoji || FORCE_NATIVE_EMOJI.has(emoji)) {
    return (
      <View style={[styles.wrapper, { width: size, height: size }]}>
        <Text
          style={{
            fontSize: visualSize,
            lineHeight: visualSize + 2,
            transform,
          }}
        >
          {emoji}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      {loadedEmoji !== emoji ? <Text style={{ fontSize: visualSize, lineHeight: visualSize + 2, transform }}>{emoji}</Text> : null}
      <Image
        source={{ uri: getOpenMojiUrl(emoji) }}
        style={{ width: visualSize, height: visualSize, transform, opacity: loadedEmoji === emoji ? 1 : 0, position: loadedEmoji === emoji ? 'relative' : 'absolute' }}
        onLoad={() => setLoadedEmoji(emoji)}
        onError={() => setFailedEmoji(emoji)}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
});
