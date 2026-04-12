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
import { COLORS, SPACING, FONT_SIZE, SHADOWS, RADIUS } from '../src/constants/theme';
import { useLocalProfileStore } from '../src/stores/localProfileStore';


export default function WelcomeScreen() {
  const router = useRouter();
  const profileName = useLocalProfileStore((state) => state.profileName);
  const [showProfileInfo, setShowProfileInfo] = useState(false);

  const heroScale = useSharedValue(0.8);

  useEffect(() => {
    heroScale.value = withSpring(1, { damping: 8, stiffness: 80 });
  }, []);

  const heroStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heroScale.value }],
  }));

  return (
    <LinearGradient
      colors={['#FFF8F0', '#FFE8D6', '#FFDCC8']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safe}>
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
              onPress={() => router.push('/pin')}
              style={[styles.bigButton, { backgroundColor: COLORS.secondary }]}
            >
              <Text style={styles.bigButtonText}>👨‍👩‍👧 Espace Parent</Text>
            </AnimatedPressable>
            <AnimatedPressable
              onPress={() => router.push('/child')}
              style={[styles.bigButton, { backgroundColor: COLORS.primary }]}
            >
              <Text style={styles.bigButtonText}>🧒 C'est parti !</Text>
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
              <Text style={styles.modalEyebrow}>Profil local</Text>
              <Text style={styles.modalTitle}>{profileName}</Text>
              <Text style={styles.modalText}>
                Vos routines, profils et reglages restent enregistres uniquement sur
                cet appareil. Aucun compte ni serveur distant ne sont utilises.
              </Text>
            </Pressable>
          </Pressable>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  infoButton: {
    position: 'absolute',
    top: SPACING.lg,
    left: SPACING.lg,
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(45, 52, 54, 0.08)',
    ...SHADOWS.md,
  },
  infoButtonText: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '900',
    color: COLORS.text,
  },
  hero: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  emoji: {
    fontSize: 90,
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
    lineHeight: 28,
  },
  buttons: {
    width: '100%',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  bigButton: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    ...SHADOWS.md,
  },
  bigButtonText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    color: '#FFF',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(33, 39, 48, 0.32)',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingTop: SPACING.xxl + 20,
    paddingLeft: SPACING.lg,
    paddingRight: SPACING.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.surfaceSecondary,
    ...SHADOWS.lg,
  },
  modalEyebrow: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
    color: COLORS.secondaryDark,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
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
});
