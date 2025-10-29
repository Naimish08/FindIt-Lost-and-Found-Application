import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Colors, Radius, Shadow } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <View style={[styles.card, { backgroundColor: Colors[colorScheme ?? 'light'].surface, borderColor: Colors[colorScheme ?? 'light'].border, borderRadius: Radius.lg, ...Shadow.card }]}>
        <Image
          source={{ uri: 'https://i.pravatar.cc/100' }}
          style={styles.avatar}
        />
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: Colors[colorScheme ?? 'light'].text }]}>Your Name</Text>
          <Text style={[styles.meta, { color: Colors[colorScheme ?? 'light'].textMuted }]}>Signed in</Text>
        </View>
        <TouchableOpacity style={[styles.editButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }] }>
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.section, { backgroundColor: Colors[colorScheme ?? 'light'].surface, borderColor: Colors[colorScheme ?? 'light'].border, borderRadius: Radius.lg }]}>
        <TouchableOpacity style={styles.row}> 
          <Text style={[styles.rowText, { color: Colors[colorScheme ?? 'light'].text }]}>My Posts</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row}> 
          <Text style={[styles.rowText, { color: Colors[colorScheme ?? 'light'].text }]}>Notifications</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row}> 
          <Text style={[styles.rowText, { color: Colors[colorScheme ?? 'light'].danger }]}>Sign out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 20,
    paddingBottom: 140,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
    backgroundColor: '#E5E7EB',
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  meta: {
    marginTop: 2,
    color: '#6B7280',
  },
  editButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  editText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  section: {
    marginTop: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
  },
  row: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  rowText: {
    color: '#111827',
    fontWeight: '600',
  },
});
