import React from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { COLORS, FONT_SIZE, RADIUS, SHADOWS, SPACING } from '../../constants/theme';

type IntentCardProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  icon?: string;
  actionLabel?: string;
  tone?: string;
  onPress?: () => void;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function IntentCard({
  title,
  subtitle,
  eyebrow,
  icon,
  actionLabel,
  tone = COLORS.secondary,
  onPress,
  children,
  style,
}: IntentCardProps) {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      activeOpacity={0.86}
      onPress={onPress}
      style={[
        styles.card,
        { borderColor: `${tone}42` },
        style,
      ]}
    >
      <View style={styles.header}>
        {icon ? (
          <View style={[styles.iconWrap, { backgroundColor: `${tone}20` }]}>
            <Text style={styles.icon} selectable={false}>{icon}</Text>
          </View>
        ) : null}
        <View style={styles.copy}>
          {eyebrow ? <Text style={[styles.eyebrow, { color: tone }]}>{eyebrow}</Text> : null}
          <Text style={styles.title} numberOfLines={2}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle} numberOfLines={3}>{subtitle}</Text> : null}
        </View>
      </View>

      {children ? <View style={styles.body}>{children}</View> : null}

      {actionLabel ? (
        <View style={[styles.actionPill, { backgroundColor: `${tone}18` }]}>
          <Text style={[styles.actionText, { color: tone }]}>{actionLabel}</Text>
        </View>
      ) : null}
    </Container>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.94)',
    padding: SPACING.md,
    gap: SPACING.md,
    ...SHADOWS.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  iconWrap: {
    width: 54,
    height: 54,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 28,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  eyebrow: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: '900',
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    lineHeight: 20,
    fontWeight: '700',
  },
  body: {
    gap: SPACING.sm,
  },
  actionPill: {
    alignSelf: 'flex-start',
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.md,
  },
  actionText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '900',
  },
});
