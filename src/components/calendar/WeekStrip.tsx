import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { format, isSameDay, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarEvent } from '../../types/calendar';
import { COLORS, FONT_SIZE, RADIUS, SHADOWS, SPACING, TOUCH } from '../../constants/theme';
import { AnimatedPressable } from '../ui/AnimatedPressable';

type WeekStripProps = {
  days: Array<{ date: Date; events: CalendarEvent[] }>;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
};

export const WeekStrip = memo(function WeekStrip({
  days,
  selectedDate,
  onSelectDate,
}: WeekStripProps) {
  return (
    <View style={styles.strip}>
      {days.map(({ date, events }) => {
        const selected = isSameDay(date, selectedDate);
        const today = isToday(date);
        const accent = events[0]?.color ?? (today ? COLORS.primary : COLORS.secondary);

        return (
          <AnimatedPressable
            key={date.toISOString()}
            onPress={() => onSelectDate(date)}
            style={[
              styles.dayPill,
              selected && { backgroundColor: accent, borderColor: accent },
            ]}
            scaleDown={0.94}
          >
            <Text style={[styles.weekday, selected && styles.selectedText]} selectable={false}>
              {format(date, 'EEE', { locale: fr }).slice(0, 3)}
            </Text>
            <Text style={[styles.dayNumber, selected && styles.selectedText]} selectable={false}>
              {format(date, 'd')}
            </Text>
            <View style={styles.dots}>
              {events.slice(0, 3).map((event) => (
                <View
                  key={event.id}
                  style={[
                    styles.dot,
                    { backgroundColor: selected ? '#FFFFFF' : event.color },
                  ]}
                />
              ))}
            </View>
          </AnimatedPressable>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    gap: SPACING.xs,
    justifyContent: 'space-between',
  },
  dayPill: {
    flex: 1,
    minWidth: 44,
    minHeight: TOUCH.childMinHeight + 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.xl,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  weekday: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  dayNumber: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '900',
    color: COLORS.text,
    fontVariant: ['tabular-nums'],
  },
  selectedText: {
    color: '#FFFFFF',
  },
  dots: {
    height: 8,
    flexDirection: 'row',
    gap: 3,
    alignItems: 'center',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
});
