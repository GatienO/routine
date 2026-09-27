import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Stack } from 'expo-router';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { usePathname, useRouter } from 'expo-router';
import { View } from 'react-native';
import * as Linking from 'expo-linking';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppFeedbackProvider } from '../src/components/feedback/AppFeedbackProvider';
import { WebInstallHint } from '../src/components/web/WebInstallHint';
import {
  AppBottomNavigation,
  useBottomNavigationOffset,
} from '../src/components/ui/AppBottomNavigation';
import { useAppTheme } from '../src/hooks/useAppTheme';
import { AppBrandHeader } from '../src/components/ui/AppBrandHeader';
import { PastelOrbs } from '../src/components/ui/PastelOrbs';
import { useAppStore } from '../src/stores/appStore';
import { useChildrenStore } from '../src/stores/childrenStore';
import { useLocalProfileStore } from '../src/stores/localProfileStore';
import { onboardingDestination } from '../src/features/onboarding/route';
import { consumePinOrigin } from '../src/utils/pinNavigation';

const subscribeAppHydration = (notify: () => void) => useAppStore.persist.onFinishHydration(notify);
const appHydratedSnapshot = () => useAppStore.persist.hasHydrated();

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppFeedbackProvider>
        <RootShell />
      </AppFeedbackProvider>
    </GestureHandlerRootView>
  );
}

function RootShell() {
  const router = useRouter();
  const pathname = usePathname();
  const previousPath = useRef(pathname);
  const bottomOffset = useBottomNavigationOffset();
  const [measuredBottomHeight, setMeasuredBottomHeight] = useState(bottomOffset);
  const { colors, isDark } = useAppTheme();
  const showMainShell = bottomOffset > 0;
  const appHydrated = useSyncExternalStore(subscribeAppHydration, appHydratedSnapshot, () => false);
  const parentPin = useAppStore((state) => state.parentPin);
  const childrenHydrated = useChildrenStore((state) => state.hasHydrated);
  const childCount = useChildrenStore((state) => state.children.length);
  const profileHydrated = useLocalProfileStore((state) => state.hasHydrated);
  const profileName = useLocalProfileStore((state) => state.profileName);
  const onboardingActive = useLocalProfileStore((state) => state.onboardingActive);

  useEffect(() => {
    if (!appHydrated || !childrenHydrated || !profileHydrated) return;
    const destination = onboardingDestination({ pathname, profileName, onboardingActive, parentPin, childCount });
    if (destination) router.replace(destination as '/routines');
  }, [appHydrated, childCount, childrenHydrated, onboardingActive, parentPin, pathname, profileHydrated, profileName, router]);

  useEffect(() => {
    const isParent = pathname === '/parent' || pathname.startsWith('/parent/');
    if (!isParent && pathname !== '/pin') useAppStore.getState().setParentMode(false);
    if (previousPath.current === '/pin' && pathname !== '/pin') consumePinOrigin();
    previousPath.current = pathname;
  }, [pathname]);

  useEffect(() => {
    // Handle deep links when app is already open
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    // Handle deep link that launched the app
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink(url);
    });

    return () => subscription.remove();
  }, []);

  function handleDeepLink(url: string) {
    const pathMatch = url.match(/routine:\/\/import\/([^?]+)/);
    const queryMatch = url.match(/[?&](?:code|payload)=([^&]+)/);
    const payload = pathMatch?.[1] ?? queryMatch?.[1];

    if (payload) {
      router.push(`/parent/import?code=${encodeURIComponent(payload)}`);
    }
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={{ flex: 1, paddingBottom: showMainShell ? Math.max(bottomOffset, measuredBottomHeight) : 0, backgroundColor: colors.background }}>
        <PastelOrbs quiet />
        {showMainShell ? <AppBrandHeader /> : null}
        <View style={{ flex: 1 }}>
          <ThemeProvider value={{ ...(isDark ? DarkTheme : DefaultTheme), colors: { ...(isDark ? DarkTheme.colors : DefaultTheme.colors), background: 'transparent' } }}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: 'transparent' },
              animation: 'slide_from_right',
            }}
          />
          </ThemeProvider>
        </View>
      </View>
      <AppBottomNavigation onHeightChange={setMeasuredBottomHeight} />
      {profileName && !onboardingActive ? <WebInstallHint /> : null}
    </>
  );
}
