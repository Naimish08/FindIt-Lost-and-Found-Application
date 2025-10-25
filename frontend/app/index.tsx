import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../context/AuthContext';

export default function Index() {
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        router.replace('/(protected)/' as any);
      } else {
        router.replace('/login' as any);
      }
    }
  }, [isAuthenticated, loading]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#3B82F6" />
      <Text style={styles.text}>Loading...</Text>
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
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});
