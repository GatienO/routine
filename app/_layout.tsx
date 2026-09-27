import React, { useEffect, useRef, useState } from 'react';
import { Stack } from 'expo-router';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { usePathname, useRouter } from 'expo-router';
import { View } from 'react-native';
import * as Linking from 'expo-linking';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppFeedbackProvider } from '../src/components/feedback/AppFeedbackProvider';
import { LocalProfileGate } from '../src/components/profile/LocalProfileGate';
import { WebInstallHint } from '../src/components/web/WebInstallHint';
import {
  AppBottomNavigation,
  useBottomNavigationOffset,
} from '../src/components/ui/AppBottomNavigation';
import { useAppTheme } from '../src/hooks/useAppTheme';
import { AppBrandHeader } from '../src/components/ui/AppBrandHeader';
import { PastelOrbs } from '../src/components/ui/PastelOrbs';
import { useAppStore } from '../src/stores/appStore';
import { consumePinOrigin } from '../src/utils/pinNavigation';

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
      <LocalProfileGate />
      <WebInstallHint />
    </>
  );
}
