import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Backspace, Lock } from 'phosphor-react-native';
import { useAppStore } from '../src/stores/appStore';
import { AppPageHeader } from '../src/components/ui/AppPageHeader';
import { COLORS, SPACING, FONT_SIZE, RADIUS, SHADOWS } from '../src/constants/theme';
import { backOrReplace } from '../src/utils/navigation';

const DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '<'];

export default function PinScreen() {
  const router = useRouter();
  const { redirect } = useLocalSearchParams<{ redirect?: string | string[] }>();
  const { parentPin, setParentPin, setParentMode } = useAppStore();
  const [pin, setPin] = useState('');
  const [isSetup] = useState(!parentPin);
  const [confirmPin, setConfirmPin] = useState<string | null>(null);
  const [error, setError] = useState('');

  const isConfirmStep = isSetup && confirmPin !== null;
  const requestedRedirect = Array.isArray(redirect) ? redirect[0] : redirect;
  const parentDestination = isParentRedirect(requestedRedirect) ? requestedRedirect : '/parent';

  const goToParentDestination = () => {
    router.replace(parentDestination as any);
  };

  const handleDigit = (digit: string) => {
    if (digit === '<') {
      setPin((value) => value.slice(0, -1));
      setError('');
      return;
    }

    if (digit === '' || pin.length >= 4) return;

    const nextPin = pin + digit;
    setPin(nextPin);

    if (nextPin.length === 4) {
      if (isSetup && confirmPin === null) {
        setConfirmPin(nextPin);
        setPin('');
      } else if (isSetup && confirmPin !== null) {
        if (nextPin === confirmPin) {
          setParentPin(nextPin);
          setParentMode(true);
          goToParentDestination();
        } else {
          setError('Les codes ne correspondent pas');
          setTimeout(() => {
            setPin('');
            setConfirmPin(null);
            setError('');
          }, 1000);
        }
      } else if (nextPin === parentPin) {
        setParentMode(true);
        goToParentDestination();
      } else {
        setError('Code incorrect');
        setTimeout(() => {
          setPin('');
          setError('');
        }, 800);
      }
    }
  };

  const setupTitle = isConfirmStep ? 'Confirmez votre code' : 'Creez votre code';
  const setupSubtitle = isConfirmStep
    ? 'Entrez le meme code pour confirmer'
    : "Choisissez un code a 4 chiffres pour\nproteger l'espace parent";

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.backgroundLayer}>
        <AppPageHeader title="Espace parent" onBack={() => backOrReplace(router, '/child')} />

        <View style={styles.contextPanel}>
          <Text style={styles.contextEyebrow}>Acces protege</Text>
          <Text style={styles.contextTitle}>Les reglages parent restent securises</Text>
          <Text style={styles.contextText}>
            Saisissez le code parent pour gerer les enfants, les routines et les recompenses.
          </Text>
        </View>
      </View>

      <View style={styles.overlayLayer}>
        <View style={styles.pinCard}>
          <View style={styles.lockBadge}>
            <Lock size={34} weight="fill" color={COLORS.secondaryDark} />
          </View>
          <Text style={styles.cardTitle}>{isSetup ? setupTitle : 'Code parent'}</Text>
          <Text style={styles.subtitle}>
            {isSetup ? setupSubtitle : 'Entrez votre code a 4 chiffres'}
          </Text>

          <View style={styles.dots}>
            {[0, 1, 2, 3].map((index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  pin.length > index && styles.dotFilled,
                  error ? styles.dotError : null,
                ]}
              />
            ))}
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.keypad}>
            {DIGITS.map((digit, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.key, digit === '' && styles.keyEmpty]}
                onPress={() => handleDigit(digit)}
                disabled={digit === ''}
                activeOpacity={0.6}
              >
                {digit === '<' ? (
                  <Backspace size={25} weight="bold" color={COLORS.primary} />
                ) : (
                  <Text style={styles.keyText}>{digit}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

function isParentRedirect(value: unknown): value is string {
  return typeof value === 'string' && (value === '/parent' || value.startsWith('/parent/'));
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  backgroundLayer: {
    flex: 1,
    paddingTop: SPACING.xl,
    paddingHorizontal: SPACING.xl,
  },
  contextPanel: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  contextEyebrow: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '900',
    color: COLORS.secondaryDark,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  contextTitle: {
    maxWidth: 520,
    marginTop: SPACING.sm,
    fontSize: FONT_SIZE.xxl,
    fontWeight: '900',
    color: COLORS.text,
    textAlign: 'center',
  },
  contextText: {
    maxWidth: 500,
    marginTop: SPACING.sm,
    fontSize: FONT_SIZE.md,
    lineHeight: 24,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  overlayLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
    backgroundColor: 'rgba(33, 39, 49, 0.34)',
  },
  pinCard: {
    width: '100%',
    maxWidth: 440,
    alignItems: 'center',
    borderRadius: RADIUS.xl + 8,
    padding: SPACING.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    ...SHADOWS.lg,
  },
  lockBadge: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${COLORS.secondary}20`,
    marginBottom: SPACING.md,
  },
  cardTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '900',
    color: COLORS.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    marginBottom: SPACING.xl,
    textAlign: 'center',
    lineHeight: 24,
  },
  dots: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.textLight,
    backgroundColor: 'transparent',
  },
  dotFilled: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  dotError: {
    backgroundColor: COLORS.error,
    borderColor: COLORS.error,
  },
  error: {
    color: COLORS.error,
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    marginTop: SPACING.sm,
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: 300,
    gap: SPACING.md,
    marginTop: SPACING.xl,
  },
  key: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  keyEmpty: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
  },
  keyText: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    color: COLORS.primary,
  },
});
