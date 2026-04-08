import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SHADOWS } from '../../constants/theme';
import { AvatarConfig } from '../../types';
import { AvatarCharacter } from '../avatar/AvatarCharacter';
import { OpenMoji } from './OpenMoji';

interface AvatarProps {
  emoji: string;
  color: string;
  size?: number;
  style?: ViewStyle;
  avatarConfig?: AvatarConfig;
}

export function Avatar({ emoji, color, size = 56, style, avatarConfig }: AvatarProps) {
  if (avatarConfig) {
    return (
      <View
        style={[
          styles.avatar,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color + '20',
            borderColor: color,
            overflow: 'hidden',
          },
          style,
        ]}
      >
        <AvatarCharacter config={avatarConfig} size={size * 0.9} mode="portrait" />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color + '20',
          borderColor: color,
        },
        style,
      ]}
    >
      <OpenMoji emoji={emoji} size={size * 0.5} />
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    ...SHADOWS.sm,
  },
});
