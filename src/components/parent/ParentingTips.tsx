import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { PARENTING_TIPS } from '../../constants/parentingTips';
import { FONT_SIZE, RADIUS, SPACING } from '../../constants/theme';
import { useAppTheme } from '../../hooks/useAppTheme';
import { getDayOfYear } from '../../utils/dateUtils';

const COLLAPSED_KEY = 'parent_tips_collapsed';

export function ParentingTips() {
  const { colors } = useAppTheme();
  const { width } = useWindowDimensions();
  const compact = width < 560;
  const [collapsed, setCollapsed] = React.useState(false);
  const [manualOffset, setManualOffset] = React.useState(0);
  const dayIndex = getDayOfYear(new Date()) % PARENTING_TIPS.length;
  const tip = PARENTING_TIPS[(dayIndex + manualOffset) % PARENTING_TIPS.length];

  React.useEffect(() => {
    let mounted = true;

    AsyncStorage.getItem(COLLAPSED_KEY)
      .then((value) => {
        if (mounted) setCollapsed(value === '1');
      })
      .catch(() => undefined);

    return () => {
      mounted = false;
    };
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((current) => {
      const next = !current;
      AsyncStorage.setItem(COLLAPSED_KEY, next ? '1' : '0').catch(() => undefined);
      return next;
    });
  };

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Idées et conseils</Text>
        <TouchableOpacity accessibilityRole="button" onPress={toggleCollapsed} activeOpacity={0.84} style={[styles.toggleButton, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.toggleText, { color: colors.textSecondary }]}>{collapsed ? 'Afficher' : 'Replier'}</Text>
        </TouchableOpacity>
      </View>

      {collapsed ? null : (
        <View style={[styles.card, compact && styles.cardCompact, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={styles.icon}>{tip.icon}</Text>
          <View style={styles.tipText}>
            <Text style={[styles.tipTitle, { color: colors.text }]} numberOfLines={compact ? 2 : 1}>{tip.title}</Text>
            <Text style={[styles.tipBody, { color: colors.textSecondary }]} numberOfLines={compact ? 4 : 3}>{tip.body}</Text>
          </View>
          <TouchableOpacity accessibilityRole="button"
            onPress={() => setManualOffset((offset) => (offset + 1) % PARENTING_TIPS.length)}
            activeOpacity={0.84}
            style={[styles.nextButton, compact && styles.nextButtonCompact, { backgroundColor: colors.timeSoft }]}
          >
            <Text style={[styles.nextText, { color: colors.time }]}>Suivant</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: SPACING.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
  },
  toggleButton: {
    minHeight: 44,
    justifyContent: 'center',
    borderRadius: RADIUS.full,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
  },
  toggleText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    padding: SPACING.md,
  },
  cardCompact: {
    flexWrap: 'wrap',
  },
  icon: {
    fontSize: 28,
  },
  tipText: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  tipTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
  },
  tipBody: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    lineHeight: 20,
  },
  nextButton: {
    minHeight: 44,
    justifyContent: 'center',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
  },
  nextButtonCompact: {
    width: '100%',
    alignItems: 'center',
  },
  nextText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '900',
  },
});
