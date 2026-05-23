import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarEvent } from '../../types/calendar';
import { formatDayLabel } from '../../utils/calendar';
import { COLORS, FONT_SIZE, RADIUS, SHADOWS, SPACING } from '../../constants/theme';
import { EventBubble } from './EventBubble';

type CalendarDayCardProps = {
  date: Date;
  events: CalendarEvent[];
  minHeight?: number;
  compactText?: boolean;
};

export const CalendarDayCard = memo(function CalendarDayCard({
  date,
  events,
  minHeight,
  compactText = false,
}: CalendarDayCardProps) {
  return (
    <View style={[styles.card, minHeight ? { minHeight } : undefined]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow} selectable={false}>
            {format(date, 'd MMMM', { locale: fr })}
          </Text>
          <Text style={styles.title} selectable={false}>
            {formatDayLabel(date)}
          </Text>
        </View>
        <View style={styles.countPill}>
          <Text style={styles.countText} selectable={false}>
            {events.length}
          </Text>
        </View>
      </View>

      <View style={styles.events}>
        {events.length > 0 ? (
          events.map((event) => (
            <EventBubble key={event.id} event={event} compact={compactText} />
          ))
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon} selectable={false}>🌈</Text>
            <Text style={styles.emptyText} selectable={false}>
              Jour tranquille
            </Text>
          </View>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.xl + 6,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    gap: SPACING.md,
    ...SHADOWS.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  eyebrow: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '900',
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  title: {
    marginTop: 2,
    fontSize: FONT_SIZE.xl,
    fontWeight: '900',
    color: COLORS.text,
  },
  countPill: {
    minWidth: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondarySoft,
  },
  countText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '900',
    color: COLORS.secondaryDark,
    fontVariant: ['tabular-nums'],
  },
  events: {
    gap: SPACING.sm,
  },
  empty: {
    minHeight: 92,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.surfaceSecondary,
  },
  emptyIcon: {
    fontSize: 32,
  },
  emptyText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '900',
    color: COLORS.textSecondary,
  },
});
