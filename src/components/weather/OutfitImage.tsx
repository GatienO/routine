import React from 'react';
import { SELECTABLE_OUTFIT_IDS, type OutfitVisualId } from '../../constants/weatherOutfits';
import { ClothingIcon } from './ClothingIcon';

export function OutfitImage({ id, size }: { id: OutfitVisualId; size: number }) {
  return <ClothingIcon code={id} size={size} variant={SELECTABLE_OUTFIT_IDS.indexOf(id)} />;
}
