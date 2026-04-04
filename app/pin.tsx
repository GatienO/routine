import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../src/stores/appStore';
import { Button } from '../src/components/ui/Button';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '../src/constants/theme';

const DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];

export default function PinScreen() {
  const router = useRouter();
  const { parentPin, setParentPin, setParentMode } = useAppStore();
  const [pin, setPin] = useState('');
  const [isSetup] = useState(!parentPin);
  const [confirmPin, setConfirmPin] = useState<string | null>(null);
  const [error, setError] = useState('');

  const isConfirmStep = isSetup && confirmPin !== null;

  const handleDigit = (digit: string) => {
    if (digit === '⌫') {
      setPin((p) => p.slice(0, -1));
      setError('');
      return;
    }
    if (digit === '' || pin.length >= 4) return;

    const newPin = pin + digit;
    setPin(newPin);

    if (newPin.length === 4) {
      if (isSetup && confirmPin === null) {
        // First entry during setup — ask to confirm
        setConfirmPin(newPin);
        setPin('');
      } else if (isSetup && confirmPin !== null) {
        // Confirm step — check match
        if (newPin === confirmPin) {
          setParentPin(newPin);
          setParentMode(true);
          router.replace('/parent');
        } else {
          setError('Les codes ne correspondent pas');
          setTimeout(() => {
            setPin('');
            setConfirmPin(null);
            setError('');
          }, 1000);
        }
      } else if (newPin === parentPin) {
        setParentMode(true);
        router.replace('/parent');
      } else {
        setError('Code incorrect');
        setTimeout(() => {
          setPin('');
          setError('');
        }, 800);
      }
    }
  };

  const setupTitle = isConfirmStep
    ? 'Confirmez votre code'
    : 'Créez votre code';
  const setupSubtitle = isConfirmStep
    ? 'Entrez le même code pour confirmer'
    : 'Choisissez un code à 4 chiffres pour\nprotéger l\'espace parent';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>

        <Text style={styles.emoji}>🔒</Text>
        <Text style={styles.title}>
          {isSetup ? setupTitle : 'Code parent'}
        </Text>
        <Text style={styles.subtitle}>
          {isSetup
            ? setupSubtitle
            : 'Entrez votre code à 4 chiffres'}
        </Text>

        <View style={styles.dots}>
          {[0, 1, 2, 3].map((i) => (
            <View
              key={i}
              style={[
                styles.dot,
                pin.length > i && styles.dotFilled,
                error ? styles.dotError : null,
              ]}
            />
          ))}
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.keypad}>
          {DIGITS.map((digit, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.key, digit === '' && styles.keyEmpty]}
              onPress={() => handleDigit(digit)}
              disabled={digit === ''}
              activeOpacity={0.6}
            >
              <Text style={styles.keyText}>{digit}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: SPACING.xl,
    paddingHorizontal: SPACING.xl,
  },
  back: {
    alignSelf: 'flex-start',
    marginBottom: SPACING.xl,
  },
  backText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.secondary,
    fontWeight: '600',
  },
  emoji: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    marginBottom: SPACING.xl,
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
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyEmpty: {
    backgroundColor: 'transparent',
  },
  keyText: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
});
