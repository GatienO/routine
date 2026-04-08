import React from 'react';
import { Image, Text } from 'react-native';

// Association emoji -> chemin PNG (par couleur dominante)
const clothingMap: Record<string, any> = {
  // Bonnets
  '\uD83E\uDDE3': require('../../../assets/clothes/bonnet/bonnet_orange.png'),
  // Bottes
  '\uD83E\uDDFE': require('../../../assets/clothes/bottes/bottes_orange.png'),
  // Casquette
  '\uD83E\uDDE2': require('../../../assets/clothes/casquette/casquette_bleu.png'),
  // Chaussettes
  '\uD83E\uDDE6': require('../../../assets/clothes/chaussettes/chaussettes_bleu.png'),
  // Chaussures
  '\uD83D\uDC5F': require('../../../assets/clothes/chaussures/chaussures_bleu.png'),
  // Écharpe
  '\uD83E\uDDF7': require('../../../assets/clothes/echarpe/echarpe_orange.png'),
  // Gants
  '\uD83E\uDDE4': require('../../../assets/clothes/gants/gants_bleu.png'),
  // Lunettes
  '\uD83D\uDC53': require('../../../assets/clothes/lunettes/lunettes_bleu.png'),
  // Manteau
  '\uD83E\uDDF5': require('../../../assets/clothes/manteaux/manteau_beige.png'),
  // Pantalon
  '\uD83D\uDC56': require('../../../assets/clothes/pantalon/pantalon_bleu.png'),
  // Pull
  '\uD83D\uDC9B': require('../../../assets/clothes/pull/pull_orange.png'),
  // Robe
  '\uD83D\uDC57': require('../../../assets/clothes/robe/robe_orange.png'),
  // Short
  '\uD83D\uDC5C': require('../../../assets/clothes/short/short_bleu.png'),
  // T-shirt
  '\uD83D\uDC55': require('../../../assets/clothes/tshirt/tshirt_bleu.png'),
  // T-shirt ML
  '\uD83D\uDC54': require('../../../assets/clothes/tshirtML/tshirt_ML_bleu.png'),
};

export function ClothingIcon({ code, size = 36 }: { code: string; size?: number }) {
  const img = clothingMap[code];
  if (img) {
    return <Image source={img} style={{ width: size, height: size, resizeMode: 'contain' }} />;
  }
  // fallback emoji
  return <Text style={{ fontSize: size }}>{code}</Text>;
}
