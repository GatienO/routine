import React, { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button } from '../ui/Button';
import { FONT_SIZE, RADIUS, SHADOWS, SPACING } from '../../constants/theme';
import { useAppTheme } from '../../hooks/useAppTheme';

interface TutorialStep {
  id: string;
  emoji: string;
  title: string;
  text: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'child-profile',
    emoji: '👶',
    title: 'On commence par un enfant',
    text: 'Le premier profil enfant sert à attribuer les routines, personnaliser l’expérience et suivre les récompenses.',
  },
  {
    id: 'pin',
    emoji: '🔒',
    title: 'Le code protège l’espace parent',
    text: 'Le code parent se choisit après le premier enfant. Il protège les réglages, les routines et les récompenses.',
  },
  {
    id: 'parent',
    emoji: '👨‍👩‍👧',
    title: 'Les parents preparent les routines',
    text: 'Depuis l’espace parent, on crée les routines, les profils, les récompenses et les réglages utiles.',
  },
  {
    id: 'child',
    emoji: '✨',
    title: 'L’enfant suit son espace',
    text: 'L’espace enfant reste simple : choisir une routine, avancer et gagner des étoiles au fil des étapes.',
  },
];

export function AppTutorialModal({
  visible,
  onClose,
  onComplete,
}: {
  visible: boolean;
  onClose: () => void;
  onComplete?: () => void;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const { colors, isDark } = useAppTheme();
  const currentStep = useMemo(() => TUTORIAL_STEPS[stepIndex] ?? TUTORIAL_STEPS[0], [stepIndex]);
  const isLastStep = stepIndex === TUTORIAL_STEPS.length - 1;

  const handleClose = () => {
    setStepIndex(0);
    onClose();
  };

  const handleFinish = () => {
    setStepIndex(0);
    onComplete?.();
    onClose();
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={handleClose}>
      <Pressable accessible={false} style={[styles.backdrop, { backgroundColor: colors.overlay }]} onPress={handleClose}>
        <Pressable accessible={false} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={(event) => event.stopPropagation()}>
          <View style={[styles.hero, { backgroundColor: colors.transitionSoft }]}>
            <Text style={styles.heroEmoji}>{currentStep.emoji}</Text>
          </View>

          <Text style={[styles.eyebrow, { color: colors.transition }]}>
            Guide de démarrage {stepIndex + 1}/{TUTORIAL_STEPS.length}
          </Text>
          <Text style={[styles.title, { color: colors.text }]}>{currentStep.title}</Text>
          <Text style={[styles.text, { color: colors.textSecondary }]}>{currentStep.text}</Text>

          <View style={styles.dotsRow}>
            {TUTORIAL_STEPS.map((step, index) => (
              <View
                key={step.id}
                style={[styles.dot, { backgroundColor: index === stepIndex ? colors.transition : colors.border }, index === stepIndex && styles.dotActive]}
              />
            ))}
          </View>

          <View style={styles.actions}>
            <TouchableOpacity accessibilityRole="button" onPress={handleClose} style={[styles.secondaryAction, { backgroundColor: colors.surfaceSecondary }]} activeOpacity={0.85}>
              <Text style={[styles.secondaryActionText, { color: colors.textSecondary }]}>Fermer</Text>
            </TouchableOpacity>

            {stepIndex > 0 ? (
              <TouchableOpacity accessibilityRole="button"
                onPress={() => setStepIndex((previous) => Math.max(0, previous - 1))}
                style={[styles.secondaryAction, { backgroundColor: colors.surfaceSecondary }]}
                activeOpacity={0.85}
              >
                <Text style={[styles.secondaryActionText, { color: colors.textSecondary }]}>Précédent</Text>
              </TouchableOpacity>
            ) : null}

            <Button
              title={isLastStep ? 'Terminer' : 'Suivant'}
              onPress={() => {
                if (isLastStep) {
                  handleFinish();
                } else {
                  setStepIndex((previous) => previous + 1);
                }
              }}
              variant="primary"
              size="md"
              color={isDark ? colors.actionSoft : colors.action}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  card: {
    width: '100%',
    maxWidth: 560,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    gap: SPACING.md,
    borderWidth: 1,
    ...SHADOWS.lg,
  },
  hero: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  heroEmoji: {
    fontSize: 42,
  },
  eyebrow: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '900',
    textAlign: 'center',
  },
  text: {
    fontSize: FONT_SIZE.md,
    lineHeight: 24,
    textAlign: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotActive: {
    width: 24,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: SPACING.sm,
    flexWrap: 'wrap',
  },
  secondaryAction: {
    minHeight: 44,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryActionText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '800',
  },
});
