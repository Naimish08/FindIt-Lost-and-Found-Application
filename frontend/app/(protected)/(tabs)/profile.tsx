import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import services from '../../../services/api';
import { ThemedView } from '../../../components/themed-view';
import { ThemedText } from '../../../components/themed-text';

export default function ProfileScreen() {
  const [processing, setProcessing] = useState(false);

  const handleLogout = async () => {
    if (processing) return;
    setProcessing(true);
    console.debug('[Profile] logout: start');

    try {
      const { error } = await supabase.auth.signOut();
      console.debug('[Profile] supabase.signOut result error:', error);
      if (error) {
        // show user-friendly message
        Alert.alert('Logout failed', error.message || 'Unknown error');
        setProcessing(false);
        return;
      }

      // Remove any stored API token used by your backend
      try {
        await services.authAPI.logout();
        console.debug('[Profile] services.authAPI.logout succeeded');
      } catch (err) {
        console.warn('[Profile] clearing token failed:', err);
      }

  // Send user back to the login screen
  router.replace('/login');
  console.debug('[Profile] router.replace to /login done');
    } catch (error) {
      console.error('[Profile] Logout error (unexpected):', error);
      Alert.alert('Logout error', String(error));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText type="title" style={styles.title}>Profile</ThemedText>

        <TouchableOpacity
          style={[styles.logoutButton, processing ? { opacity: 0.7 } : null]}
          onPress={handleLogout}
          disabled={processing}
        >
          {processing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={styles.logoutText}>Logout</ThemedText>
          )}
        </TouchableOpacity>
      </ThemedView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  title: {
    marginBottom: 20,
  },
  logoutButton: {
    marginTop: 24,
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});