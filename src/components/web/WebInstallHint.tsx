import React, { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

const DISMISS_KEY = 'routine-install-hint-dismissed';
const CARD_SHADOW =
  Platform.OS === 'web'
    ? { boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.12)', elevation: 8 }
    : {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 8,
      };

function isStandaloneMode() {
  if (typeof window === 'undefined') return false;

  const iosStandalone = 'standalone' in window.navigator
    ? (window.navigator as Navigator & { standalone?: boolean }).standalone === true
    : false;

  return iosStandalone || window.matchMedia('(display-mode: standalone)').matches;
}

function isTouchDevice() {
  if (typeof window === 'undefined') return false;

  return window.matchMedia('(pointer: coarse)').matches || window.navigator.maxTouchPoints > 0;
}

export function WebInstallHint() {
  const [visible, setVisible] = useState(false);

  const isWeb = Platform.OS === 'web';

  useEffect(() => {
    if (!isWeb || typeof window === 'undefined') return;

    const dismissed = window.localStorage.getItem(DISMISS_KEY) === 'true';
    const updateVisibility = () => {
      const show = isTouchDevice() && !isStandaloneMode() && !dismissed;
      setVisible(show);
    };

    updateVisibility();

    const media = window.matchMedia('(display-mode: standalone)');
    const listener = () => updateVisibility();
    const appInstalled = () => setVisible(false);

    if (media.addEventListener) {
      media.addEventListener('change', listener);
    } else {
      media.addListener(listener);
    }
    window.addEventListener('appinstalled', appInstalled);

    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', listener);
      } else {
        media.removeListener(listener);
      }
      window.removeEventListener('appinstalled', appInstalled);
    };
  }, [isWeb]);

  const message = useMemo(() => {
    if (!isWeb) return '';

    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    const isApple = /iPhone|iPad|iPod/i.test(ua);

    return isApple
      ? "Pour un vrai mode plein écran sur iPhone ou iPad, ajoute cette page à l'écran d'accueil depuis le menu de partage du navigateur."
      : "Pour un vrai mode plein écran sur tablette ou mobile, installe l'app depuis le menu du navigateur.";
  }, [isWeb]);

  if (!isWeb || !visible) return null;

  const dismiss = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(DISMISS_KEY, 'true');
    }
    setVisible(false);
  };

  return (
    <View
      style={[
        styles.wrapper,
        Platform.OS === 'web' ? ({ pointerEvents: 'box-none' } as any) : null,
      ]}
      {...(Platform.OS === 'web' ? {} : { pointerEvents: 'box-none' })}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Mode plein écran</Text>
        <Text style={styles.body}>{message}</Text>
        <Pressable onPress={dismiss} style={styles.button}>
          <Text style={styles.buttonText}>Compris</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingBottom: 16,
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 560,
    backgroundColor: 'rgba(255, 248, 240, 0.98)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E6D9C8',
    padding: 16,
    gap: 10,
    ...CARD_SHADOW,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#443126',
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    color: '#6A5446',
  },
  button: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: '#5CC8A1',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
