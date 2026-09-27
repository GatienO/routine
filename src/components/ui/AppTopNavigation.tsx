import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { ArrowLeft, House } from 'phosphor-react-native';
import { COLORS, FONT_SIZE, RADIUS, SHADOWS, SPACING, TOUCH } from '../../constants/theme';

type AppTopNavigationProps = {
  title?: string;
  onBack?: () => void;
  onHome?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function AppTopNavigation({ title, onBack, onHome, style }: AppTopNavigationProps) {
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

        <View style={[styles.navSlot, onHome && styles.homeSlot]}>
          {onHome ? (
            <TouchableOpacity
              onPress={onHome}
              activeOpacity={0.82}
              accessibilityRole="button"
              accessibilityLabel="Accueil"
              hitSlop={6}
              style={styles.homeButton}
            >
              <House size={18} weight="bold" color={COLORS.primaryDark} />
              <Text style={styles.homeButtonText}>Accueil</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.sideSpacer} />
          )}
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
  homeSlot: {
    width: 112,
    alignItems: 'flex-end',
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
  homeButton: {
    minWidth: 102,
    height: TOUCH.minHeight,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    ...SHADOWS.sm,
  },
  homeButtonText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '900',
    color: COLORS.primaryDark,
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
