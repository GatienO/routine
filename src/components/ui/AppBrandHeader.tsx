import React from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppTheme } from '../../hooks/useAppTheme';
import { CONTENT_MAX_WIDTH, SPACING } from '../../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeModeControl } from './ThemeModeControl';
import { useFocusRing } from '../../hooks/useFocusRing';

export function AppBrandHeader() {
  const { focusStyle, ...focusProps } = useFocusRing();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { colors } = useAppTheme();
  const narrow = width < 480;

  return (
    <View style={[styles.header, { paddingTop: insets.top }]}>
      <View style={[styles.inner, narrow && styles.innerNarrow, { maxWidth: CONTENT_MAX_WIDTH.xl }]}>
        <Pressable
          {...focusProps}
          accessibilityRole="button"
          accessibilityLabel="Revenir aux routines"
          onPress={() => router.replace('/routines')}
          style={({ pressed }) => [
            styles.logo,
            focusStyle,
            { backgroundColor: colors.actionSoft, opacity: pressed ? 0.76 : 1 },
          ]}
        >
            <Text style={[styles.logoLetter, { color: colors.action }]}>R</Text>
            <View style={styles.logoPath}><View style={[styles.dotLarge, { backgroundColor: colors.action }]} /><View style={[styles.dot, { backgroundColor: colors.action }]} /><View style={[styles.dotSmall, { backgroundColor: colors.action }]} /></View>
        </Pressable>
        <ThemeModeControl />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { minHeight: 68, justifyContent: 'center', zIndex: 20 },
  inner: { width: '100%', alignSelf: 'center', paddingHorizontal: SPACING.lg, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: SPACING.md },
  innerNarrow: { paddingHorizontal: SPACING.md },
  logo: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  logoLetter: { fontSize: 20, lineHeight: 25, fontWeight: '800' },
  logoPath: { position: 'absolute', right: 7, bottom: 6, width: 15, height: 10 },
  dotLarge: { position: 'absolute', left: 0, bottom: 0, width: 5, height: 5, borderRadius: 3 },
  dot: { position: 'absolute', left: 7, bottom: 3, width: 4, height: 4, borderRadius: 2 },
  dotSmall: { position: 'absolute', right: 0, top: 0, width: 3, height: 3, borderRadius: 2 },
});
