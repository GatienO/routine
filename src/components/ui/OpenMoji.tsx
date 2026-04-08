import React, { useState } from 'react';
import { Image, Text, StyleSheet } from 'react-native';
import { getOpenMojiUrl } from '../../utils/openmoji';

interface OpenMojiProps {
  emoji: string;
  size: number;
}

/**
 * Renders an emoji using OpenMoji (open-source emoji set).
 * Falls back to native text emoji if the image fails to load.
 */
export function OpenMoji({ emoji, size }: OpenMojiProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !emoji) {
    return <Text style={{ fontSize: size }}>{emoji}</Text>;
  }

  return (
    <Image
      source={{ uri: getOpenMojiUrl(emoji) }}
      style={{ width: size, height: size }}
      onError={() => setFailed(true)}
      resizeMode="contain"
    />
  );
}
