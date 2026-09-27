import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { COLORS, FONT_SIZE, RADIUS, SHADOWS, SPACING } from '../../constants/theme';
import type { DashboardAgendaItem } from '../../utils/dashboardCalendar';
import { AnimatedPressable } from '../ui/AnimatedPressable';
import { OpenMoji } from '../ui/OpenMoji';
import { useReducedMotionPreference } from '../../hooks/useReducedMotionPreference';

type TodayBannerProps = {
  item: DashboardAgendaItem;
  stateLabel: string;
  onDismiss: () => void;
  onOpen: () => void;
  onAction: () => void;
  actionLabel: string;
  actionDisabled?: boolean;
};

export function TodayBanner({
  item,
  stateLabel,
  onDismiss,
  onOpen,
  onAction,
  actionLabel,
  actionDisabled = false,
}: TodayBannerProps) {
  const reducedMotion = useReducedMotionPreference();
  const [closing, setClosing] = useState(false);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const summary = `${stateLabel} \u00B7 ${item.title} \u00B7 ${item.meta}`;

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const handleDismiss = () => {
    if (closing) return;
    setClosing(true);
    if (reducedMotion) {
      onDismiss();
      return;
    }
    translateX.value = withTiming(170, { duration: 220, easing: Easing.out(Easing.cubic) });
    translateY.value = withTiming(-76, { duration: 220, easing: Easing.out(Easing.cubic) });
    scale.value = withTiming(0.48, { duration: 220, easing: Easing.out(Easing.cubic) });
    opacity.value = withTiming(0.2, { duration: 180, easing: Easing.out(Easing.cubic) });
    setTimeout(onDismiss, 210);
  };

  return (
    <Animated.View style={animatedStyle}>
      <AnimatedPressable
        onPress={onOpen}
        style={styles.card}
        scaleDown={0.98}
        disabled={closing}
      >
        <View style={styles.cardRow}>
          <View style={[styles.routineIcon, { backgroundColor: `${item.color}22` }]}>
            <OpenMoji emoji={item.icon} size={34} />
          </View>

          <View style={styles.textBlock}>
            <Text style={styles.summary} numberOfLines={1}>{summary}</Text>
          </View>

          <View style={styles.actions}>
            <Pressable accessibilityRole="button"
              onPress={(event) => {
                event.stopPropagation();
                onOpen();
              }}
              style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
            >
              <Text style={styles.actionText}>Calendrier</Text>
            </Pressable>
            <Pressable accessibilityRole="button" aria-disabled={actionDisabled}
              onPress={(event) => {
                event.stopPropagation();
                if (!actionDisabled) {
                  onAction();
                }
              }}
              accessibilityState={{ disabled: actionDisabled }}
              style={({ pressed }) => [
                styles.launchButton,
                actionDisabled && styles.launchButtonDisabled,
                pressed && !actionDisabled && styles.actionButtonPressed,
              ]}
            >
              <Text style={[styles.launchText, actionDisabled && styles.launchTextDisabled]}>
                {actionLabel}
              </Text>
            </Pressable>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Reduire l'ordre du jour"
          onPress={(event) => {
            event.stopPropagation();
            handleDismiss();
          }}
          hitSlop={12}
          style={({ pressed }) => [styles.dismissButton, pressed && styles.dismissButtonPressed]}
        >
          <Text style={styles.dismissText}>×</Text>
        </Pressable>
      </AnimatedPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.sm,
    paddingLeft: 54,
    paddingRight: SPACING.md,
    ...SHADOWS.sm,
  },
  cardRow: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  routineIcon: {
    width: 46,
    height: 46,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
  },
  summary: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: '900',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  actionButton: {
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.full,
    backgroundColor: '#F4EAD2',
    paddingHorizontal: SPACING.md,
  },
  launchButton: {
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: SPACING.md,
  },
  launchButtonDisabled: {
    backgroundColor: '#E4DDD0',
  },
  actionButtonPressed: {
    opacity: 0.78,
  },
  actionText: {
    color: COLORS.primaryDark,
    fontSize: FONT_SIZE.xs,
    fontWeight: '900',
  },
  launchText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZE.xs,
    fontWeight: '900',
  },
  launchTextDisabled: {
    color: COLORS.textLight,
  },
  dismissButton: {
    position: 'absolute',
    top: 12,
    left: 10,
    width: 30,
    height: 30,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceSecondary,
  },
  dismissButtonPressed: {
    opacity: 0.7,
  },
  dismissText: {
    color: COLORS.textSecondary,
    fontSize: 20,
    lineHeight: 22,
    fontWeight: '600',
  },
});
