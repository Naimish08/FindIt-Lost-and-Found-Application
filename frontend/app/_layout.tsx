import { Stack } from "expo-router";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "../contexts/AuthContext";
import { LoadingProvider } from "../contexts/LoadingContext";
import LoadingOverlay from "../components/common/LoadingOverlay";

export default function RootLayout() {
  return (
    <AuthProvider>
      <LoadingProvider>
        <StatusBar style="auto" />
        <Stack>
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="login"
          options={{
            headerShown: false,
            animation: "none",
          }}
        />
        <Stack.Screen
          name="register"
          options={{
            headerShown: false,
            animation: "none",
          }}
        />
        <Stack.Screen
          name="(protected)"
          options={{
            headerShown: false,
            animation: "none",
          }}
        />
      </Stack>
      <LoadingOverlay />
      </LoadingProvider>
    </AuthProvider>
  );
}