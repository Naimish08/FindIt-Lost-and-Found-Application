// File path: /app/(protected)/_layout.tsx

import { Stack, router } from "expo-router";
import React, { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function ProtectedLayout() {
  const { isAuthenticated, loading } = useAuth() || { isAuthenticated: false, loading: true };

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login' as any);
    }
  }, [isAuthenticated, loading]);

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
