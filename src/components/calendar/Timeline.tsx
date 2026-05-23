import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { DayTimelineItem } from '../../types/calendar';
import { COLORS, FONT_SIZE, RADIUS, SHADOWS, SPACING } from '../../constants/theme';
import { formatTimelineTime } from '../../utils/calendar';
import { OpenMoji } from '../ui/OpenMoji';
import { AnimatedPressable } from '../ui/AnimatedPressable';

type TimelineProps = {
  items: DayTimelineItem[];
  compactText?: boolean;
  onRoutinePress?: (routineId: string) => void;
};

export const Timeline = memo(function Timeline({
  items,
  compactText = false,
  onRoutinePress,
}: TimelineProps) {
  return (
    <View style={styles.wrap}>
      {items.map((item, index) => {
        const isMarker = item.type === 'day-marker';
        const itemContent = (
          <Animated.View
            entering={FadeInRight.delay(index * 30).duration(220)}
            style={[styles.row, isMarker && styles.markerRow]}
          >
            <Text style={styles.time} selectable={false}>
              {formatTimelineTime(item.startMinutes)}
            </Text>
            <View style={styles.lineWrap}>
              <View style={[styles.node, { backgroundColor: item.color }]}>
                <OpenMoji emoji={item.icon} size={isMarker ? 20 : 26} />
              </View>
              {index < items.length - 1 ? <View style={styles.line} /> : null}
            </View>
            <View
              style={[
                styles.card,
                isMarker && styles.markerCard,
                { borderColor: `${item.color}55`, backgroundColor: isMarker ? `${item.color}22` : '#FFFFFF' },
              ]}
            >
              <Text
                style={[styles.title, isMarker && styles.markerTitle]}
                numberOfLines={compactText ? 1 : 2}
                selectable={false}
              >
                {item.title}
              </Text>
              {!compactText && item.description ? (
                <Text style={styles.description} numberOfLines={1} selectable={false}>
                  {item.description}
                </Text>
              ) : null}
              {item.type === 'routine-suggestion' ? (
                <Text style={[styles.actionHint, { color: item.color }]} selectable={false}>
                  Lancer
                </Text>
              ) : null}
            </View>
          </Animated.View>
        );

        if (item.type === 'routine-suggestion' && item.routineId && onRoutinePress) {
          return (
            <AnimatedPressable
              key={item.id}
              onPress={() => onRoutinePress(item.routineId!)}
              scaleDown={0.98}
            >
              {itemContent}
            </AnimatedPressable>
          );
        }

        return <React.Fragment key={item.id}>{itemContent}</React.Fragment>;
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    gap: 0,
  },
  row: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: SPACING.sm,
  },
  markerRow: {
    minHeight: 58,
  },
  time: {
    width: 46,
    paddingTop: SPACING.sm,
    fontSize: FONT_SIZE.xs,
    fontWeight: '900',
    color: COLORS.textLight,
    fontVariant: ['tabular-nums'],
  },
  lineWrap: {
    width: 34,
    alignItems: 'center',
  },
  node: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  line: {
    flex: 1,
    width: 3,
    backgroundColor: COLORS.border,
    marginTop: -1,
    marginBottom: -1,
    borderRadius: 2,
  },
  card: {
    flex: 1,
    marginBottom: SPACING.sm,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  markerCard: {
    paddingVertical: SPACING.xs,
    ...SHADOWS.sm,
  },
  title: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '900',
    color: COLORS.text,
  },
  markerTitle: {
    color: COLORS.textSecondary,
  },
  description: {
    marginTop: 2,
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  actionHint: {
    marginTop: 4,
    fontSize: FONT_SIZE.xs,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
});
