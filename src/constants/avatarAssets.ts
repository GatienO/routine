import { ImageSourcePropType } from 'react-native';

type AssetOption = {
  id: string;
  label: string;
  source: ImageSourcePropType;
};

type AvatarContext = {
  (key: string): ImageSourcePropType;
  keys: () => string[];
};

declare const require: NodeRequire & {
  context: (directory: string, useSubdirectories: boolean, regExp: RegExp) => AvatarContext;
};

function createAvatarAssetOptions(): AssetOption[] {
  const avatarContext = require.context('../../assets/avatars/avatar', false, /\.png$/);

  return avatarContext
    .keys()
    .map((key) => {
      const filename = key.replace('./', '');
      const label = filename.replace(/\.[^.]+$/, '');
      const order = Number.parseInt(label, 10);

      return {
        id: `asset-avatar-${label}`,
        label: `Avatar ${label}`,
        source: avatarContext(key),
        order: Number.isNaN(order) ? Number.MAX_SAFE_INTEGER : order,
      };
    })
    .sort((left, right) => left.order - right.order || left.label.localeCompare(right.label))
    .map(({ order, ...option }) => option);
}

export const AVATAR_ASSET_OPTIONS = createAvatarAssetOptions();

export const DOUDOU_ASSET_OPTIONS = [
  { id: 'doudou_ours', label: 'Ours', source: require('../../assets/clothes/doudous/doudou_ours.png') },
  { id: 'doudou_panda', label: 'Panda', source: require('../../assets/clothes/doudous/doudou_panda.png') },
  { id: 'doudou_lapin', label: 'Lapin', source: require('../../assets/clothes/doudous/doudou_lapin.png') },
  { id: 'doudou_chat', label: 'Chat', source: require('../../assets/clothes/doudous/doudou_chat.png') },
  { id: 'doudou_renard', label: 'Renard', source: require('../../assets/clothes/doudous/doudou_renard.png') },
  { id: 'doudou_girafe', label: 'Girafe', source: require('../../assets/clothes/doudous/doudou_girafe.png') },
  { id: 'doudou_elephant', label: 'Éléphant', source: require('../../assets/clothes/doudous/doudou_elephant.png') },
] as const;

export function getAvatarAssetSource(avatarId: string): ImageSourcePropType | null {
  const option = AVATAR_ASSET_OPTIONS.find((item) => item.id === avatarId);
  return option?.source ?? null;
}

export function getDoudouAssetSource(doudouId: string): ImageSourcePropType | null {
  const option = DOUDOU_ASSET_OPTIONS.find((item) => item.id === doudouId);
  return option?.source ?? null;
}
