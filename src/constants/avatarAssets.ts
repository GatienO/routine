import { ImageSourcePropType } from 'react-native';

export const AVATAR_ASSET_OPTIONS = [
  { id: 'asset-avatar-1', label: 'Avatar 1', source: require('../../assets/avatars/avatar/1.png') },
  { id: 'asset-avatar-2', label: 'Avatar 2', source: require('../../assets/avatars/avatar/2.png') },
  { id: 'asset-avatar-3', label: 'Avatar 3', source: require('../../assets/avatars/avatar/3.png') },
  { id: 'asset-avatar-4', label: 'Avatar 4', source: require('../../assets/avatars/avatar/4.png') },
  { id: 'asset-avatar-5', label: 'Avatar 5', source: require('../../assets/avatars/avatar/5.png') },
] as const;

export function getAvatarAssetSource(avatarId: string): ImageSourcePropType | null {
  const option = AVATAR_ASSET_OPTIONS.find((item) => item.id === avatarId);
  return option?.source ?? null;
}
