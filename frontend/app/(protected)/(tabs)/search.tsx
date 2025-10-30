import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView } from 'react-native';
import { Colors, Radius, Shadow } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function SearchScreen() {
  const colorScheme = useColorScheme();
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>Search</Text>
      <View style={styles.searchRow}>
        <TextInput
          placeholder="Search by keyword or location"
          placeholderTextColor="#9CA3AF"
          style={[styles.input, { backgroundColor: Colors[colorScheme ?? 'light'].surface, borderColor: Colors[colorScheme ?? 'light'].border, borderRadius: Radius.lg, color: Colors[colorScheme ?? 'light'].text }]}
        />
        <TouchableOpacity style={[styles.searchButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}>
          <Text style={styles.searchButtonText}>Go</Text>
        </TouchableOpacity>
      </View>
      <Text style={[styles.helper, { color: Colors[colorScheme ?? 'light'].textMuted }]}>Try: "wallet", "campus gate", "black bag"</Text>

      <View style={styles.chipsRow}>
        <TouchableOpacity style={[styles.chip, { backgroundColor: Colors[colorScheme ?? 'light'].surface, borderColor: Colors[colorScheme ?? 'light'].border }]}>
          <Text style={[styles.chipText, { color: Colors[colorScheme ?? 'light'].text }]}>Nearby</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.chip, { backgroundColor: Colors[colorScheme ?? 'light'].surface, borderColor: Colors[colorScheme ?? 'light'].border }]}>
          <Text style={[styles.chipText, { color: Colors[colorScheme ?? 'light'].text }]}>Today</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.chip, { backgroundColor: Colors[colorScheme ?? 'light'].surface, borderColor: Colors[colorScheme ?? 'light'].border }]}>
          <Text style={[styles.chipText, { color: Colors[colorScheme ?? 'light'].text }]}>With photos</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.suggestionCard, { backgroundColor: Colors[colorScheme ?? 'light'].surface, borderColor: Colors[colorScheme ?? 'light'].border }]}>
        <Text style={[styles.suggestionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>Recent searches</Text>
        <View style={styles.suggestionList}>
          <Text style={[styles.suggestionItem, { color: Colors[colorScheme ?? 'light'].textMuted }]}>wallet</Text>
          <Text style={[styles.suggestionItem, { color: Colors[colorScheme ?? 'light'].textMuted }]}>library entrance</Text>
          <Text style={[styles.suggestionItem, { color: Colors[colorScheme ?? 'light'].textMuted }]}>black bag</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    backgroundColor: '#F9FAFB',
    paddingBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#111827',
  },
  searchButton: {
    marginLeft: 8,
    backgroundColor: '#2563EB',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  helper: {
    marginTop: 12,
    color: '#6B7280',
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  chip: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  chipText: {
    fontWeight: '600',
  },
  suggestionCard: {
    marginTop: 20,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  suggestionTitle: {
    fontWeight: '700',
    marginBottom: 8,
  },
  suggestionList: {
    gap: 6,
  },
  suggestionItem: {
    fontSize: 14,
  },
});