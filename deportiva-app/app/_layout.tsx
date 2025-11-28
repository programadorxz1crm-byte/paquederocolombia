import { Stack } from "expo-router";
import React from "react";
import { StateProvider } from "../store/state";

export default function RootLayout() {
  return (
    <StateProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="admin-reset" />
        <Stack.Screen name="logo" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </StateProvider>
  );
}
