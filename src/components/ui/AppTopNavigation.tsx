import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { ArrowLeft } from 'phosphor-react-native';
import { COLORS, FONT_SIZE, RADIUS, SHADOWS, SPACING, TOUCH } from '../../constants/theme';

type AppTopNavigationProps = {
  title?: string;
  onBack?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function AppTopNavigation({ title, onBack, style }: AppTopNavigationProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.topRow}>
        <View style={styles.navSlot}>
          {onBack ? (
            <TouchableOpacity
              onPress={onBack}
              activeOpacity={0.82}
              accessibilityRole="button"
              accessibilityLabel="Retour"
              hitSlop={6}
              style={styles.backButton}
            >
              <ArrowLeft size={22} weight="bold" color={COLORS.textSecondary} />
            </TouchableOpacity>
          ) : (
            <View style={styles.sideSpacer} />
          )}
        </View>

        {title ? <Text style={styles.screenTitle}>{title}</Text> : <View style={styles.titleSpacer} />}

        <View style={styles.navSlot}>
          <View style={styles.sideSpacer} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  topRow: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  navSlot: {
    width: TOUCH.minHeight,
    height: TOUCH.minHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleSpacer: {
    flex: 1,
  },
  sideSpacer: {
    width: TOUCH.minHeight,
    height: TOUCH.minHeight,
  },
  backButton: {
    width: TOUCH.minHeight,
    height: TOUCH.minHeight,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  screenTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: FONT_SIZE.xl,
    fontWeight: '900',
    color: 'rgb(33, 39, 48)',
    letterSpacing: 0.2,
  },
});
