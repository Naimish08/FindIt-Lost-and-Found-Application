import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Colors, Radius, Shadow } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const auth = useAuth();
  const [uploading, setUploading] = useState(false);

  const user = auth?.session?.user ?? null;
  const avatarUrl = useMemo(() => (user?.user_metadata?.avatar_url as string) || 'https://i.pravatar.cc/100', [user]);
  const displayName = (user?.user_metadata?.full_name as string) || user?.email || 'Signed in';

  const base64ToUint8Array = (base64: string) => {
    const hasAtob = typeof globalThis.atob === 'function';
    const binaryString = hasAtob ? atob(base64) : Buffer.from(base64, 'base64').toString('binary');
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
  };

  const pickAndUploadAvatar = async () => {
    try {
      if (!user) return;
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (perm.status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow photo library access.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8, allowsMultipleSelection: false, base64: true });
      if (result.canceled || !result.assets?.[0]?.base64) return;
      setUploading(true);
      const asset = result.assets[0];
      const ext = asset.fileName?.split('.').pop() || 'jpg';
      const path = `${user.id}/${Date.now()}.${ext}`;
      const contentType = `image/${ext}`;
      const bytes = base64ToUint8Array(asset.base64);
      const { error: uploadError } = await supabase.storage.from('avatars').upload(path, bytes as any, { contentType, upsert: true });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      const publicUrl = data.publicUrl;
      const { error: updateError } = await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });
      if (updateError) throw updateError;
      Alert.alert('Updated', 'Your avatar has been updated.');
    } catch (e: any) {
      Alert.alert('Upload failed', e?.message || 'Unknown error');
    } finally {
      setUploading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleResetPassword = async () => {
    if (!user?.email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(user.email);
    if (error) Alert.alert('Reset failed', error.message); else Alert.alert('Check your email', 'Password reset link sent.');
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete account',
      'Account deletion requires a secure backend. For now, this will sign you out. See README guidance.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign out', style: 'destructive', onPress: handleSignOut },
      ],
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}> 
      <View style={[styles.card, { backgroundColor: Colors[colorScheme ?? 'light'].surface, borderColor: Colors[colorScheme ?? 'light'].border, borderRadius: Radius.lg, ...Shadow.card }]}> 
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: Colors[colorScheme ?? 'light'].text }]}>{displayName}</Text>
          <Text style={[styles.meta, { color: Colors[colorScheme ?? 'light'].textMuted }]}>{user?.email}</Text>
        </View>
        <TouchableOpacity style={[styles.editButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]} onPress={pickAndUploadAvatar} disabled={uploading}>
          {uploading ? <ActivityIndicator color="#fff" /> : <Text style={styles.editText}>Edit</Text>}
        </TouchableOpacity>
      </View>

      <View style={[styles.section, { backgroundColor: Colors[colorScheme ?? 'light'].surface, borderColor: Colors[colorScheme ?? 'light'].border, borderRadius: Radius.lg }]}> 
        <TouchableOpacity style={styles.row}> 
          <Text style={[styles.rowText, { color: Colors[colorScheme ?? 'light'].text }]}>My Posts</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row} onPress={handleResetPassword}> 
          <Text style={[styles.rowText, { color: Colors[colorScheme ?? 'light'].text }]}>Forgot/Reset password</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row} onPress={handleSignOut}> 
          <Text style={[styles.rowText, { color: Colors[colorScheme ?? 'light'].text }]}>Sign out</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row} onPress={handleDeleteAccount}> 
          <Text style={[styles.rowText, { color: Colors[colorScheme ?? 'light'].danger }]}>Delete account</Text>
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
