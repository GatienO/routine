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
import { COLORS, FONT_SIZE, RADIUS, SHADOWS, SPACING } from '../../constants/theme';

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
    text: 'Le premier profil enfant sert de base pour attribuer les routines, personnaliser l experience et suivre les recompenses.',
  },
  {
    id: 'pin',
    emoji: '🔒',
    title: 'Le code protege l espace parent',
    text: 'Le code parent se choisit apres le premier enfant. Il protege les reglages, les routines et les recompenses.',
  },
  {
    id: 'parent',
    emoji: '👨‍👩‍👧',
    title: 'Les parents preparent les routines',
    text: 'Depuis l espace parent, on cree les routines, les profils, les recompenses et les reglages utiles.',
  },
  {
    id: 'child',
    emoji: '✨',
    title: 'L enfant suit son espace',
    text: 'L espace enfant reste simple : choisir une routine, avancer et gagner des etoiles au fil des etapes.',
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
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <Pressable style={styles.card} onPress={(event) => event.stopPropagation()}>
          <View style={styles.hero}>
            <Text style={styles.heroEmoji}>{currentStep.emoji}</Text>
          </View>

          <Text style={styles.eyebrow}>
            Guide de démarrage {stepIndex + 1}/{TUTORIAL_STEPS.length}
          </Text>
          <Text style={styles.title}>{currentStep.title}</Text>
          <Text style={styles.text}>{currentStep.text}</Text>

          <View style={styles.dotsRow}>
            {TUTORIAL_STEPS.map((step, index) => (
              <View
                key={step.id}
                style={[styles.dot, index === stepIndex && styles.dotActive]}
              />
            ))}
          </View>

          <View style={styles.actions}>
            <TouchableOpacity onPress={handleClose} style={styles.secondaryAction} activeOpacity={0.85}>
              <Text style={styles.secondaryActionText}>Fermer</Text>
            </TouchableOpacity>

            {stepIndex > 0 ? (
              <TouchableOpacity
                onPress={() => setStepIndex((previous) => Math.max(0, previous - 1))}
                style={styles.secondaryAction}
                activeOpacity={0.85}
              >
                <Text style={styles.secondaryActionText}>Précédent</Text>
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
              color={COLORS.secondary}
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
    backgroundColor: COLORS.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  card: {
    width: '100%',
    maxWidth: 560,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    gap: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.lg,
  },
  hero: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor: '#FFF4E8',
  },
  heroEmoji: {
    fontSize: 42,
  },
  eyebrow: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
    color: COLORS.secondaryDark,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '900',
    color: COLORS.text,
    textAlign: 'center',
  },
  text: {
    fontSize: FONT_SIZE.md,
    lineHeight: 24,
    color: COLORS.textSecondary,
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
    backgroundColor: COLORS.border,
  },
  dotActive: {
    width: 24,
    backgroundColor: COLORS.secondary,
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
    backgroundColor: `${COLORS.textLight}14`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryActionText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },
});
