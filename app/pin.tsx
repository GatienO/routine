import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../src/stores/appStore';
import { AppPageHeader } from '../src/components/ui/AppPageHeader';
import { COLORS, SPACING, FONT_SIZE } from '../src/constants/theme';
import { backOrReplace } from '../src/utils/navigation';

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
          router.replace('/parent');
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

  const setupTitle = isConfirmStep ? 'Confirmez votre code' : 'Creez votre code';
  const setupSubtitle = isConfirmStep
    ? 'Entrez le meme code pour confirmer'
    : "Choisissez un code a 4 chiffres pour\nproteger l'espace parent";

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <AppPageHeader
          title={isSetup ? setupTitle : 'Code parent'}
          onBack={() => backOrReplace(router, '/')}
          onHome={() => router.replace('/')}
        />

        <Text style={styles.emoji}>🔒</Text>
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
    textAlign: 'center',
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
