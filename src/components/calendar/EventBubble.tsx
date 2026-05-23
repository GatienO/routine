import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { CalendarEvent } from '../../types/calendar';
import { COLORS, FONT_SIZE, RADIUS, SHADOWS, SPACING } from '../../constants/theme';
import { OpenMoji } from '../ui/OpenMoji';
import { AnimatedPressable } from '../ui/AnimatedPressable';

type EventBubbleProps = {
  event: CalendarEvent;
  compact?: boolean;
  onPress?: () => void;
};

export const EventBubble = memo(function EventBubble({
  event,
  compact = false,
  onPress,
}: EventBubbleProps) {
  const content = (
    <Animated.View
      entering={FadeInUp.duration(260)}
      style={[
        styles.bubble,
        compact && styles.bubbleCompact,
        { backgroundColor: `${event.color}22`, borderColor: `${event.color}66` },
      ]}
    >
      <View style={[styles.iconWrap, compact && styles.iconWrapCompact, { backgroundColor: `${event.color}28` }]}>
        <OpenMoji emoji={event.icon} size={compact ? 30 : 38} />
      </View>
      <View style={styles.textWrap}>
        <Text style={[styles.title, compact && styles.titleCompact]} numberOfLines={1} selectable={false}>
          {event.title}
        </Text>
        {!compact && event.description ? (
          <Text style={styles.description} numberOfLines={2} selectable={false}>
            {event.description}
          </Text>
        ) : null}
      </View>
      {event.startTime ? (
        <View style={[styles.timePill, { backgroundColor: event.color }]}>
          <Text style={styles.timeText} selectable={false}>
            {event.startTime}
          </Text>
        </View>
      ) : null}
    </Animated.View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <AnimatedPressable onPress={onPress} scaleDown={0.97}>
      {content}
    </AnimatedPressable>
  );
});

const styles = StyleSheet.create({
  bubble: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    borderRadius: RADIUS.xl,
    borderWidth: 1.5,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  bubbleCompact: {
    minHeight: 58,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm + 2,
    borderRadius: RADIUS.lg,
  },
  iconWrap: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconWrapCompact: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  textWrap: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: FONT_SIZE.md,
    fontWeight: '900',
    color: COLORS.text,
  },
  titleCompact: {
    fontSize: FONT_SIZE.sm,
  },
  description: {
    marginTop: 3,
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    lineHeight: 17,
    color: COLORS.textSecondary,
  },
  timePill: {
    minWidth: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.full,
    paddingVertical: 6,
    paddingHorizontal: SPACING.sm,
  },
  timeText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZE.xs,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
});
