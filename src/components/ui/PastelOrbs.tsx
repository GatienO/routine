import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';

export function PastelOrbs({ quiet = false }: { quiet?: boolean }) {
  const { colors } = useAppTheme();
  return (
    <View pointerEvents="none" accessibilityElementsHidden style={[StyleSheet.absoluteFill, styles.clip]}>
      <View style={[styles.topRight, { backgroundColor: colors.timeSoft, opacity: quiet ? 0.34 : 0.58 }]} />
      <View style={[styles.bottomLeft, { backgroundColor: colors.informationSoft, opacity: quiet ? 0.3 : 0.52 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  clip: { overflow: 'hidden' },
  topRight: { position: 'absolute', width: 250, height: 250, borderRadius: 125, right: -112, top: -166 },
  bottomLeft: { position: 'absolute', width: 260, height: 260, borderRadius: 130, left: -170, bottom: 90 },
});
