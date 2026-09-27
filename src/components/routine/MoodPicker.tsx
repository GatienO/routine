import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, FONT_SIZE, RADIUS, SHADOWS, SPACING } from '../../constants/theme';

export type LaunchMood = 'tired' | 'good' | 'agitated';

type MoodOption = {
  mood: LaunchMood;
  label: string;
  emoji: string;
  helper: string;
};

const MOOD_OPTIONS: MoodOption[] = [
  { mood: 'good', label: 'Bien', emoji: '🙂', helper: 'Je suis pret' },
  { mood: 'tired', label: 'Fatigue', emoji: '😴', helper: 'On y va doux' },
  { mood: 'agitated', label: 'Agite', emoji: '😵‍💫', helper: 'Besoin de calme' },
];

type MoodPickerProps = {
  visible: boolean;
  onSelect: (mood: LaunchMood) => void;
  onSkip: () => void;
};

export function MoodPicker({ visible, onSelect, onSkip }: MoodPickerProps) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onSkip}>
      <View style={styles.backdrop}>
        <Pressable accessibilityRole="button" style={styles.backdropPressable} onPress={onSkip} />
        <View style={styles.card}>
          <Text style={styles.title}>Comment tu te sens ?</Text>
          <Text style={styles.subtitle}>Choisis, et on demarre tout de suite.</Text>

          <View style={styles.optionsRow}>
            {MOOD_OPTIONS.map((option) => (
              <Pressable
                key={option.mood}
                accessibilityRole="button"
                accessibilityLabel={option.label}
                onPress={() => onSelect(option.mood)}
                style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
              >
                <Text style={styles.emoji}>{option.emoji}</Text>
                <Text style={styles.optionLabel}>{option.label}</Text>
                <Text style={styles.optionHelper}>{option.helper}</Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Passer le choix de l'humeur"
            onPress={onSkip}
            hitSlop={12}
            style={({ pressed }) => [styles.skipButton, pressed && styles.skipButtonPressed]}
          >
            <Text style={styles.skipText}>Passer</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
    backgroundColor: 'rgba(63, 58, 54, 0.28)',
  },
  backdropPressable: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  card: {
    width: '100%',
    maxWidth: 520,
    borderRadius: 28,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    alignItems: 'center',
    gap: SPACING.md,
    ...SHADOWS.lg,
  },
  title: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    fontWeight: '500',
    textAlign: 'center',
  },
  optionsRow: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  option: {
    width: 132,
    minHeight: 132,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    gap: 4,
    backgroundColor: COLORS.primarySoft,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  optionPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
  emoji: {
    fontSize: 34,
  },
  optionLabel: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
  },
  optionHelper: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    fontWeight: '500',
    textAlign: 'center',
  },
  skipButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },
  skipButtonPressed: {
    opacity: 0.65,
  },
  skipText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
});
