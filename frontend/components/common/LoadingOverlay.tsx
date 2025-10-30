import React from 'react';
import { ActivityIndicator, StyleSheet, View, Text } from 'react-native';
import { useLoading } from '@/contexts/LoadingContext';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const LoadingOverlay: React.FC = () => {
  const { isLoading } = useLoading();
  const colorScheme = useColorScheme();

  if (!isLoading) return null;

  return (
    <View pointerEvents="auto" style={[styles.overlay, { backgroundColor: (colorScheme === 'dark') ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.35)' }]}>
      <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].primary} />
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  card: {},
  text: {},
});

export default LoadingOverlay;


