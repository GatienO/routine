import React, { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { OpenMoji } from '../../../components/ui/OpenMoji';
import { RADIUS, SPACING, type ThemeColors } from '../../../constants/theme';

type Props = {
  uri: string;
  icon: string;
  title: string;
  mobile: boolean;
  colors: ThemeColors;
};

export function StepMedia({ uri, icon, title, mobile, colors }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const size = mobile ? 156 : 180;

  return <View style={[styles.frame, { width: size, height: size, backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
    {!loaded || failed ? <View style={styles.fallback} accessibilityLabel={failed ? `Image indisponible pour ${title}` : `Image de ${title} en cours de chargement`}>
      <OpenMoji emoji={icon} size={54} />
      {failed ? <Text style={[styles.message, { color: colors.textSecondary }]}>Image indisponible</Text> : null}
    </View> : null}
    {!failed ? <Image
      source={{ uri }}
      accessibilityLabel={`Illustration de ${title}`}
      resizeMode="cover"
      onLoad={() => setLoaded(true)}
      onError={() => setFailed(true)}
      style={[styles.image, { opacity: loaded ? 1 : 0 }]}
    /> : null}
  </View>;
}

const styles = StyleSheet.create({
  frame: { marginTop: SPACING.md, borderRadius: RADIUS.xl, borderWidth: 1, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', height: '100%', position: 'absolute' },
  fallback: { alignItems: 'center', justifyContent: 'center', gap: SPACING.xs },
  message: { fontSize: 13, textAlign: 'center' },
});
