import '../src/polyfills';
import '../src/global.css';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import {
  InstrumentSerif_400Regular,
} from '@expo-google-fonts/instrument-serif';
import {
  JetBrainsMono_400Regular,
} from '@expo-google-fonts/jetbrains-mono';
import { ThemeProvider } from '../src/shared/context/ThemeContext';
import { AuthProvider, useAuth } from '../src/shared/context/AuthContext';
import { AppDataProvider } from '../src/shared/context/AppDataContext';
import { CurrencyProvider } from '../src/shared/context/CurrencyContext';
import { LockScreen } from '../src/features/auth/LockScreen';

SplashScreen.preventAutoHideAsync();

function AppWithLock() {
  const { status } = useAuth();
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="pin-setup" options={{ headerShown: false }} />
        <Stack.Screen name="wallet/[id]" options={{ headerShown: false }} />
      </Stack>
      <LockScreen visible={status === 'locked'} />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'DM-Sans': DMSans_400Regular,
    'DM-Sans-Medium': DMSans_500Medium,
    'DM-Sans-SemiBold': DMSans_600SemiBold,
    'DM-Sans-Bold': DMSans_700Bold,
    'Instrument-Serif': InstrumentSerif_400Regular,
    'JetBrains-Mono': JetBrainsMono_400Regular,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <AppDataProvider>
              <CurrencyProvider>
                <StatusBar style="auto" />
                <AppWithLock />
              </CurrencyProvider>
            </AppDataProvider>
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
