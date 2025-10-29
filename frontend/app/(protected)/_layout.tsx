// File path: /app/(protected)/_layout.tsx

import { Stack } from "expo-router";
import React from "react";

export default function ProtectedLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="(tabs)" 
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
