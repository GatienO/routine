import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { AnimatedPressable } from '../src/components/ui/AnimatedPressable';
import { AppTopNavigation } from '../src/components/ui/AppTopNavigation';
import { Button } from '../src/components/ui/Button';
import { COLORS, SPACING, FONT_SIZE, SHADOWS, RADIUS, GRADIENTS, TOUCH } from '../src/constants/theme';
import { useLocalProfileStore } from '../src/stores/localProfileStore';
import { AppTutorialModal } from '../src/components/tutorial/AppTutorialModal';


export default function WelcomeScreen() {
  const router = useRouter();
  const profileName = useLocalProfileStore((state) => state.profileName);
  const profileId = useLocalProfileStore((state) => state.profileId);
  const tutorialCompletedAt = useLocalProfileStore((state) => state.tutorialCompletedAt);
  const tutorialPromptPending = useLocalProfileStore((state) => state.tutorialPromptPending);
  const dismissTutorialPrompt = useLocalProfileStore((state) => state.dismissTutorialPrompt);
  const completeTutorial = useLocalProfileStore((state) => state.completeTutorial);
  const [showProfileInfo, setShowProfileInfo] = useState(false);
  const [showTutorialOffer, setShowTutorialOffer] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  const heroScale = useSharedValue(0.8);

  useEffect(() => {
    heroScale.value = withSpring(1, { damping: 8, stiffness: 80 });
  }, []);

  useEffect(() => {
    if (profileName && tutorialPromptPending) {
      setShowTutorialOffer(true);
    }
  }, [profileName, tutorialPromptPending]);

  const heroStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heroScale.value }],
  }));

  const shortProfileId = profileId ? profileId.slice(-6) : 'LOCAL';
  const tutorialStatus = tutorialCompletedAt
    ? `Guide termine le ${new Date(tutorialCompletedAt).toLocaleDateString('fr-FR')}`
    : 'Guide non termine pour le moment';

  return (
    <LinearGradient
      colors={GRADIENTS.warmBackground}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safe}>
        <View style={styles.navigationLayer}>
          <AppTopNavigation title="Accueil" />
        </View>

        <View style={styles.container}>
          {profileName ? (
            <TouchableOpacity
              onPress={() => setShowProfileInfo(true)}
              style={styles.infoButton}
              activeOpacity={0.85}
            >
              <Text style={styles.infoButtonText}>!</Text>
            </TouchableOpacity>
          ) : null}

          {/* Hero */}
          <Animated.View
            entering={FadeInDown.duration(600).springify()}
            style={[styles.hero, heroStyle]}
          >
            <Text style={styles.emoji}>🌟</Text>
            <Text style={styles.title}>Routine</Text>
            <Text style={styles.subtitle}>
              Transforme tes tâches{'\n'}en super aventure !
            </Text>
          </Animated.View>

          {/* Buttons */}
          <Animated.View
            entering={FadeInUp.delay(300).duration(500)}
            style={styles.buttons}
          >
            <AnimatedPressable
              onPress={() => router.push('/child')}
              style={[styles.bigButton, styles.childButton]}
              scaleDown={0.95}
            >
              <Text style={styles.bigButtonEmoji}>🧒</Text>
              <Text style={styles.bigButtonText}>C'est parti !</Text>
            </AnimatedPressable>
            <AnimatedPressable
              onPress={() => router.push('/pin')}
              style={[styles.bigButton, styles.parentButton]}
              scaleDown={0.97}
            >
              <Text style={styles.bigButtonEmoji}>👨‍👩‍👧</Text>
              <Text style={styles.parentButtonText}>Espace Parent</Text>
            </AnimatedPressable>
          </Animated.View>
        </View>

        <Modal
          transparent
          visible={showProfileInfo}
          animationType="fade"
          onRequestClose={() => setShowProfileInfo(false)}
        >
          <Pressable style={styles.modalBackdrop} onPress={() => setShowProfileInfo(false)}>
            <Pressable style={styles.modalCard} onPress={(event) => event.stopPropagation()}>
              <Text style={styles.modalEyebrow}>Profil local parent</Text>
              <Text style={styles.modalTitle}>{profileName}</Text>
              <Text style={styles.modalId}>ID {shortProfileId}</Text>
              <Text style={styles.modalText}>
                Vos routines, profils et reglages restent enregistres uniquement sur
                cet appareil. Aucun compte ni serveur distant ne sont utilises.
              </Text>
              <Text style={styles.modalHint}>{tutorialStatus}</Text>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  onPress={() => setShowProfileInfo(false)}
                  style={styles.modalSecondaryButton}
                  activeOpacity={0.85}
                >
                  <Text style={styles.modalSecondaryButtonText}>Fermer</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setShowProfileInfo(false);
                    setShowTutorial(true);
                  }}
                  style={styles.modalPrimaryButton}
                  activeOpacity={0.85}
                >
                  <Text style={styles.modalPrimaryButtonText}>Relancer le tutoriel</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Pressable>
        </Modal>

        <Modal
          transparent
          visible={showTutorialOffer}
          animationType="fade"
          onRequestClose={() => undefined}
        >
          <Pressable style={styles.centeredBackdrop}>
            <View style={styles.tutorialOfferCard}>
              <Text style={styles.tutorialOfferEyebrow}>Première visite</Text>
              <Text style={styles.tutorialOfferTitle}>Découvrir l’app pas à pas ?</Text>
              <Text style={styles.tutorialOfferText}>
                On peut te présenter le fonctionnement de Routine dans une courte visite guidée. Tu peux la passer maintenant et la relancer plus tard depuis le profil local parent.
              </Text>
              <View style={styles.tutorialOfferActions}>
                <TouchableOpacity
                  style={styles.tutorialLaterButton}
                  onPress={() => {
                    dismissTutorialPrompt();
                    setShowTutorialOffer(false);
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={styles.tutorialLaterButtonText}>Plus tard</Text>
                </TouchableOpacity>
                <Button
                  title="Commencer le guide"
                  onPress={() => {
                    setShowTutorialOffer(false);
                    setShowTutorial(true);
                  }}
                  variant="primary"
                  size="md"
                  color={COLORS.secondary}
                />
              </View>
            </View>
          </Pressable>
        </Modal>

        <AppTutorialModal
          visible={showTutorial}
          onClose={() => setShowTutorial(false)}
          onComplete={completeTutorial}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  navigationLayer: {
    position: 'absolute',
    top: SPACING.lg,
    left: SPACING.lg,
    zIndex: 20,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  infoButton: {
    position: 'absolute',
    top: SPACING.lg,
    right: SPACING.lg,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  infoButtonText: {
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '900',
    color: COLORS.text,
  },
  hero: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  emoji: {
    fontSize: 96,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.hero + 8,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    lineHeight: 30,
  },
  buttons: {
    width: '100%',
    maxWidth: 400,
    gap: SPACING.md + 4,
    marginBottom: SPACING.xl,
  },
  bigButton: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.xl + 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  childButton: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.md,
    minHeight: 72,
  },
  parentButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
    minHeight: 64,
  },
  bigButtonEmoji: {
    fontSize: 26,
  },
  bigButtonText: {
    fontSize: FONT_SIZE.lg + 2,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 0.3,
  },
  parentButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: SPACING.xxl + 20,
    paddingLeft: SPACING.lg,
    paddingRight: SPACING.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg + 4,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.lg,
  },
  modalEyebrow: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
    color: COLORS.secondaryDark,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  modalTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '900',
    color: COLORS.text,
  },
  modalText: {
    fontSize: FONT_SIZE.sm,
    lineHeight: 21,
    color: COLORS.textSecondary,
  },
  modalId: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.textLight,
  },
  modalHint: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.secondaryDark,
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    flexWrap: 'wrap',
    marginTop: SPACING.sm,
  },
  modalSecondaryButton: {
    minHeight: 44,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalSecondaryButtonText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },
  modalPrimaryButton: {
    minHeight: 44,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.secondary,
  },
  modalPrimaryButtonText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '800',
    color: '#FFF',
  },
  centeredBackdrop: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  tutorialOfferCard: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    gap: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.lg,
  },
  tutorialOfferEyebrow: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
    color: COLORS.secondaryDark,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  tutorialOfferTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '900',
    color: COLORS.text,
    textAlign: 'center',
  },
  tutorialOfferText: {
    fontSize: FONT_SIZE.md,
    lineHeight: 24,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  tutorialOfferActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
    flexWrap: 'wrap',
  },
  tutorialLaterButton: {
    minHeight: 44,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
    backgroundColor: `${COLORS.textLight}14`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tutorialLaterButtonText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },
});
