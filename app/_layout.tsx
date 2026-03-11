import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useAuth } from '@/hooks/useAuth';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { session, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      SplashScreen.hideAsync();
      if (!session) {
        router.replace('/(auth)/login');
      } else {
        router.replace('/(tabs)/home');
      }
    }
  }, [loading, session]);

  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="plan/[id]" options={{ headerShown: true, title: 'Plan Details', presentation: 'card' }} />
        <Stack.Screen name="plan/new" options={{ headerShown: true, title: 'Create Plan', presentation: 'modal' }} />
        <Stack.Screen name="save/new" options={{ headerShown: true, title: 'Save Something', presentation: 'modal' }} />
      </Stack>
    </>
  );
}
