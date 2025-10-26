import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import services from '../../../services/api';

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
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <TouchableOpacity
        style={[styles.logoutButton, processing ? { opacity: 0.7 } : null]}
        onPress={handleLogout}
        disabled={processing}
      >
        {processing ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.logoutText}>Logout</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f6f7fb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutButton: {
    marginTop: 24,
    backgroundColor: '#ef4444',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  logoutText: {
    color: '#fff',
    fontWeight: '600',
  },
});