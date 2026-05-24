import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import * as Linking from 'expo-linking';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { COLORS } from '../src/constants/theme';
import { AppFeedbackProvider } from '../src/components/feedback/AppFeedbackProvider';
import { LocalProfileGate } from '../src/components/profile/LocalProfileGate';
import { WebInstallHint } from '../src/components/web/WebInstallHint';
import {
  AppBottomNavigation,
  useBottomNavigationOffset,
} from '../src/components/ui/AppBottomNavigation';

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
  const bottomOffset = useBottomNavigationOffset();

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
      <StatusBar style="dark" />
      <View style={{ flex: 1, paddingBottom: bottomOffset }}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: COLORS.background },
            animation: 'slide_from_right',
          }}
        />
      </View>
      <AppBottomNavigation />
      <LocalProfileGate />
      <WebInstallHint />
    </>
  );
}
