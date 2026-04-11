import React from 'react';
import { View, Image, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SHADOWS } from '../../constants/theme';
import { AvatarConfig } from '../../types';
import { AvatarCharacter } from '../avatar/AvatarCharacter';
import { OpenMoji } from './OpenMoji';
import { getAvatarAssetSource, getDoudouAssetSource } from '../../constants/avatarAssets';

interface AvatarProps {
  emoji: string;
  color: string;
  size?: number;
  style?: ViewStyle;
  avatarConfig?: AvatarConfig;
}

export function Avatar({ emoji, color, size = 56, style, avatarConfig }: AvatarProps) {
  const avatarAssetSource = getAvatarAssetSource(emoji);
  const innerSize = size * 0.82;

  if (avatarConfig) {
    const doudouSource = avatarConfig.doudou ? getDoudouAssetSource(avatarConfig.doudou) : null;

    return (
      <View
        style={[
          {
            position: 'relative',
          },
          style,
        ]}
      >
        <View
          style={[
            styles.avatar,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: color + '20',
              borderColor: color,
              overflow: 'visible',
            },
          ]}
        >
          <AvatarCharacter config={avatarConfig} size={size * 0.9} mode="portrait" />
        </View>
        {doudouSource && (
          <Image
            source={doudouSource}
            style={[
              styles.doudou,
              {
                width: size * 0.45,
                height: size * 0.45,
              },
            ]}
            resizeMode="contain"
          />
        )}
      </View>
    );
  }

  if (avatarAssetSource) {
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
        <View
          style={[
            styles.assetClip,
            {
              width: innerSize,
              height: innerSize,
              borderRadius: innerSize / 2,
            },
          ]}
        >
          <Image
            source={avatarAssetSource}
            style={[
              styles.assetImage,
              {
                borderRadius: innerSize / 2,
              },
            ]}
            resizeMode="cover"
          />
        </View>
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
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  assetClip: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  assetImage: {
    width: '100%',
    height: '100%',
  },
  doudou: {
    position: 'absolute',
    bottom: -8,
    right: -8,
  },
});
