import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';

export default function Index() {
  const { isAuthenticated, loading } = useAuth();

  // Log only when these values change (reduces noisy per-render logs)
  useEffect(() => {
    console.log("Auth:", isAuthenticated);
    console.log("Loading:", loading);
  }, [isAuthenticated, loading]);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      // If user already logged in, go to protected tabs directly
      router.replace('/(protected)/(tabs)' as any);
    }
  }, [isAuthenticated, loading]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.text}>Loading...</Text>
      </View>
    );
  }

  // If user not logged in → show welcome screen
  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Welcome to FindIt</Text>
        <Text style={styles.subtitle}>Your Lost and Found Solution</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.loginButton]}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.registerButton]}
            onPress={() => router.push('/register')}
          >
            <Text style={styles.buttonText}>Register</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // temporary fallback 
  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f6f7fb',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 30,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  loginButton: {
    backgroundColor: '#3B82F6',
  },
  registerButton: {
    backgroundColor: '#10B981',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});
