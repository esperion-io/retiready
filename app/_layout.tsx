import { useColorScheme } from '@/hooks/use-color-scheme';
import { Stack } from 'expo-router';
import React from 'react';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="guide" />
      <Stack.Screen name="calculator" options={{ gestureEnabled: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
