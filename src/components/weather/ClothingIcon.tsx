import React from 'react';
import { Image, Text } from 'react-native';
import { OutfitVisualId } from '../../constants/weatherOutfits';

const clothingMap: Record<string, any[]> = {
  bonnet: [
    require('../../../assets/clothes/bonnet/bonnet_bleu.png'),
    require('../../../assets/clothes/bonnet/bonnet_orange.png'),
    require('../../../assets/clothes/bonnet/bonnet_rose.png'),
  ],
  bottes: [
    require('../../../assets/clothes/bottes/bottes_bleu.png'),
    require('../../../assets/clothes/bottes/bottes_orange.png'),
    require('../../../assets/clothes/bottes/bottes_rose.png'),
  ],
  casquette: [
    require('../../../assets/clothes/casquette/casquette_bleu.png'),
    require('../../../assets/clothes/casquette/casquette_orange.png'),
    require('../../../assets/clothes/casquette/casquette_rose.png'),
  ],
  chaussettes: [
    require('../../../assets/clothes/chaussettes/chaussettes_bleu.png'),
    require('../../../assets/clothes/chaussettes/chaussettes_orange.png'),
    require('../../../assets/clothes/chaussettes/chaussettes_rose.png'),
  ],
  chaussures: [
    require('../../../assets/clothes/chaussures/chaussures_bleu.png'),
    require('../../../assets/clothes/chaussures/chaussures_orange.png'),
    require('../../../assets/clothes/chaussures/chaussures_rose.png'),
  ],
  echarpe: [
    require('../../../assets/clothes/echarpe/echarpe_bleu.png'),
    require('../../../assets/clothes/echarpe/echarpe_orange.png'),
    require('../../../assets/clothes/echarpe/echarpe_rose.png'),
  ],
  gants: [
    require('../../../assets/clothes/gants/gants_bleu.png'),
    require('../../../assets/clothes/gants/gants_orange.png'),
    require('../../../assets/clothes/gants/gants_rose.png'),
  ],
  lunettes: [
    require('../../../assets/clothes/lunettes/lunettes_bleu.png'),
    require('../../../assets/clothes/lunettes/lunettes_orange.png'),
  ],
  manteau: [
    require('../../../assets/clothes/manteaux/manteau_beige.png'),
    require('../../../assets/clothes/manteaux/manteau_vert.png'),
  ],
  pantalon: [
    require('../../../assets/clothes/pantalon/pantalon_bleu.png'),
    require('../../../assets/clothes/pantalon/pantalon_orange.png'),
    require('../../../assets/clothes/pantalon/pantalon_rose.png'),
  ],
  parapluie: [require('../../../assets/clothes/plus/parapluie.png')],
  pull: [
    require('../../../assets/clothes/pull/pull_bleu.png'),
    require('../../../assets/clothes/pull/pull_orange.png'),
    require('../../../assets/clothes/pull/pull_rose.png'),
  ],
  robe: [
    require('../../../assets/clothes/robe/robe_bleu.png'),
    require('../../../assets/clothes/robe/robe_orange.png'),
    require('../../../assets/clothes/robe/robe_rose.png'),
  ],
  short: [
    require('../../../assets/clothes/short/short_bleu.png'),
    require('../../../assets/clothes/short/short_orange.png'),
    require('../../../assets/clothes/short/short_rose.png'),
  ],
  tshirt: [
    require('../../../assets/clothes/tshirt/tshirt_bleu.png'),
    require('../../../assets/clothes/tshirt/tshirt_orange.png'),
    require('../../../assets/clothes/tshirt/tshirt_rose.png'),
  ],
  tshirtML: [
    require('../../../assets/clothes/tshirtML/tshirt_ML_bleu.png'),
    require('../../../assets/clothes/tshirtML/tshirt_ML_orange.png'),
    require('../../../assets/clothes/tshirtML/tshirt_ML_rose.png'),
  ],
  pyjamaEte: [
    require('../../../assets/clothes/pyjama/ete/pyjama_ete_bleu.png'),
    require('../../../assets/clothes/pyjama/ete/pyjama_ete_orange.png'),
    require('../../../assets/clothes/pyjama/ete/pyjama_ete_rose.png'),
    require('../../../assets/clothes/pyjama/ete/pyjama_ete_vert.png'),
  ],
  pyjamaHiver: [
    require('../../../assets/clothes/pyjama/hiver/pyjama_hiver_bleu.png'),
    require('../../../assets/clothes/pyjama/hiver/pyjama_hiver_orange.png'),
    require('../../../assets/clothes/pyjama/hiver/pyjama_hiver_rose.png'),
    require('../../../assets/clothes/pyjama/hiver/pyjama_hiver_vert.png'),
  ],
  doudou: [
    require('../../../assets/clothes/doudous/doudou_ours.png'),
    require('../../../assets/clothes/doudous/doudou_panda.png'),
    require('../../../assets/clothes/doudous/doudou_lapin.png'),
    require('../../../assets/clothes/doudous/doudou_chat.png'),
    require('../../../assets/clothes/doudous/doudou_renard.png'),
    require('../../../assets/clothes/doudous/doudou_girafe.png'),
    require('../../../assets/clothes/doudous/doudou_elephant.png'),
  ],
};

const emojiFallbacks: Partial<Record<OutfitVisualId, string>> = {
  bouteille_eau: '💧',
  pluie: '🌧️',
  neige: '❄️',
};

function pickVariant(assets: any[], variant: number) {
  // Créer un seed basé sur le variant et le jour actuel pour avoir
  // une bonne diversité des couleurs tout en restant stable dans la même session
  const today = new Date().toDateString();
  const dayHash = today.split('').reduce((h, c) => h + c.charCodeAt(0), 0);
  const seed = (variant * 7 + dayHash) % assets.length; // 7 pour éviter trop de collisions
  return assets[Math.max(0, seed)];
}

export function ClothingIcon({
  code,
  size = 36,
  variant = 0,
}: {
  code: OutfitVisualId | string;
  size?: number;
  variant?: number;
}) {
  const assets = clothingMap[code];
  if (assets?.length) {
    return (
      <Image
        source={pickVariant(assets, variant)}
        resizeMode="contain"
        style={{ width: size, height: size }}
      />
    );
  }

  const fallback = emojiFallbacks[code as OutfitVisualId] ?? code;
  return <Text style={{ fontSize: size }}>{fallback}</Text>;
}
