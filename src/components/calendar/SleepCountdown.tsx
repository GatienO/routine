import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { BounceIn } from 'react-native-reanimated';
import { CountdownEvent } from '../../types/calendar';
import { COLORS, FONT_SIZE, RADIUS, SHADOWS, SPACING } from '../../constants/theme';
import { OpenMoji } from '../ui/OpenMoji';

type SleepCountdownProps = {
  countdown?: CountdownEvent;
  compactText?: boolean;
};

export const SleepCountdown = memo(function SleepCountdown({
  countdown,
  compactText = false,
}: SleepCountdownProps) {
  if (!countdown) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyIcon} selectable={false}>🌙</Text>
        <Text style={styles.emptyText} selectable={false}>Rien de special a compter</Text>
      </View>
    );
  }

  const label = countdown.isToday
    ? "C'est aujourd'hui"
    : `${countdown.sleepCount} dodo${countdown.sleepCount > 1 ? 's' : ''}`;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: `${countdown.color}22`, borderColor: `${countdown.color}66` },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: `${countdown.color}24` }]}>
        <OpenMoji emoji={countdown.icon} size={48} />
      </View>
      <View style={styles.textWrap}>
        <Animated.Text
          entering={BounceIn.duration(520)}
          style={[styles.count, { color: countdown.color }]}
          selectable={false}
        >
          {countdown.isToday ? '0' : countdown.sleepCount}
        </Animated.Text>
        <Text style={styles.label} selectable={false}>
          {label}
        </Text>
        {!compactText ? (
          <Text style={styles.title} numberOfLines={1} selectable={false}>
            {countdown.title}
          </Text>
        ) : null}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    minHeight: 126,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    borderRadius: RADIUS.xl + 6,
    borderWidth: 1.5,
    padding: SPACING.lg,
    ...SHADOWS.md,
  },
  emptyCard: {
    minHeight: 96,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    borderRadius: RADIUS.xl,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
  },
  emptyIcon: {
    fontSize: 28,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    fontWeight: '800',
    textAlign: 'center',
  },
  iconWrap: {
    width: 78,
    height: 78,
    borderRadius: 39,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
    minWidth: 0,
  },
  count: {
    fontSize: 46,
    lineHeight: 50,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  label: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '900',
    color: COLORS.text,
  },
  title: {
    marginTop: 3,
    fontSize: FONT_SIZE.sm,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },
});
