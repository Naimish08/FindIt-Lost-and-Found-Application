import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, ActivityIndicator, ScrollView, SafeAreaView, TextInput } from 'react-native';
import { Colors, Radius, Shadow } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useLoading } from '@/contexts/LoadingContext';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const auth = useAuth();
  const loading = useLoading();
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [postsError, setPostsError] = useState('');
  const [myPosts, setMyPosts] = useState<Array<{ id: string | number; item_title: string; dateposted: string; images: string[] | null; location?: string }>>([]);

  const user = auth?.session?.user ?? null;
  const [avatarUrl, setAvatarUrl] = useState<string>('https://i.pravatar.cc/100');
  const [displayName, setDisplayName] = useState<string>('');
  const [nameError, setNameError] = useState<string>('');
  const [editingProfile, setEditingProfile] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadUsername = async () => {
      try {
        setNameError('');
        if (!user?.id) {
          setDisplayName('');
          setAvatarUrl('https://i.pravatar.cc/100');
          return;
        }
        const { data, error } = await supabase
          .from('users')
          .select('username, profilepicture')
          .eq('userid', user.id)
          .single();
        if (!isMounted) return;
        if (error) {
          setNameError(error.message);
          // fallback to metadata/email local values
          const fallback =
            (user.user_metadata?.full_name as string) ||
            (user.email ? user.email.split('@')[0] : '') ||
            'User';
          setDisplayName(fallback);
          // avatar fallback to auth metadata or default
          setAvatarUrl((user.user_metadata?.avatar_url as string) || 'https://i.pravatar.cc/100');
          return;
        }
        setDisplayName(data?.username || 'User');
        // Resolve avatar from users.profilepicture (prefer path in bucket), then auth metadata
        const profileImage: string | null | undefined = (data as any)?.profilepicture;
        if (profileImage) {
          // If it's already a full URL use it; otherwise treat as storage path in 'avatars' bucket
          const isUrl = /^https?:\/\//i.test(profileImage);
          if (isUrl) {
            setAvatarUrl(profileImage);
          } else {
            const { data: pub } = supabase.storage.from('avatars').getPublicUrl(profileImage);
            setAvatarUrl(pub?.publicUrl || (user.user_metadata?.avatar_url as string) || 'https://i.pravatar.cc/100');
          }
        } else {
          setAvatarUrl((user.user_metadata?.avatar_url as string) || 'https://i.pravatar.cc/100');
        }
      } catch (e: any) {
        if (!isMounted) return;
        setNameError(e?.message || 'Failed to load profile');
        const fallback =
          (user?.user_metadata?.full_name as string) ||
          (user?.email ? user.email.split('@')[0] : '') ||
          'User';
        setDisplayName(fallback);
        setAvatarUrl((user?.user_metadata?.avatar_url as string) || 'https://i.pravatar.cc/100');
      }
    };
    loadUsername();
    return () => {
      isMounted = false;
    };
  }, [user]);

  useEffect(() => {
    // Initialize edit fields when we have user/display data
    if (user) {
      setNewEmail(user.email || '');
      setNewFullName((user.user_metadata?.full_name as string) || displayName || '');
    }
    setNewUsername(displayName || '');
  }, [user, displayName]);

  const loadMyPosts = useCallback(async () => {
    let cancelled = false;
    try {
      setPostsError('');
      setLoadingPosts(true);
      if (!user?.id) {
        setMyPosts([]);
        return;
      }
      const { data, error } = await supabase
        .from('lost_item_posts')
        .select('postid, item_title, dateposted, images, location')
        .eq('userid', user.id)
        .order('dateposted', { ascending: false })
        .limit(25);
      if (cancelled) return;
      if (error) {
        setPostsError(error.message);
        setMyPosts([]);
        return;
      }
      const normalized = (data || []).map((d: any) => ({
        id: d?.postid ?? d?.id,
        item_title: d?.item_title,
        dateposted: d?.dateposted,
        images: d?.images ?? null,
        location: d?.location,
      }));
      setMyPosts(normalized);
    } catch (e: any) {
      if (cancelled) return;
      setPostsError(e?.message || 'Failed to load your posts');
      setMyPosts([]);
    } finally {
      if (!cancelled) setLoadingPosts(false);
    }
    return () => { cancelled = true; };
  }, [user?.id]);

  useEffect(() => {
    loadMyPosts();
  }, [loadMyPosts]);

  useFocusEffect(
    useCallback(() => {
      loadMyPosts();
      return undefined;
    }, [loadMyPosts])
  );

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
      loading.show();
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
      if (!asset.base64) {
        throw new Error('Failed to read image data.');
      }
      const ext = asset.fileName?.split('.').pop() || 'jpg';
      const path = `${user.id}/${Date.now()}.${ext}`;
      const contentType = `image/${ext}`;
      const bytes = base64ToUint8Array(asset.base64);
      const { error: uploadError } = await supabase.storage.from('avatars').upload(path, bytes as any, { contentType, upsert: true });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      const publicUrl = data.publicUrl;
      // Update auth profile metadata for backward compatibility
      const { error: updateError } = await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });
      if (updateError) throw updateError;
      // Also persist public URL in users.profilepicture, creating row if needed
      const upsertPayload = { userid: user.id, profilepicture: publicUrl } as any;
      await supabase.from('users').upsert(upsertPayload, { onConflict: 'userid' });
      setAvatarUrl(publicUrl);
      Alert.alert('Updated', 'Your avatar has been updated.');
    } catch (e: any) {
      Alert.alert('Upload failed', e?.message || 'Unknown error');
    } finally {
      setUploading(false);
      loading.hide();
    }
  };

  const handleSignOut = async () => {
    try {
      loading.show();
      await supabase.auth.signOut();
    } finally {
      loading.hide();
    }
  };

  const handleResetPassword = async () => {
    if (!user?.email) return;
    try {
      loading.show();
      const { error } = await supabase.auth.resetPasswordForEmail(user.email);
      if (error) Alert.alert('Reset failed', error.message); else Alert.alert('Check your email', 'Password reset link sent.');
    } finally {
      loading.hide();
    }
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

  const handleSaveProfile = async () => {
    if (!user) return;
    const usernameTrimmed = (newUsername || '').trim();
    const fullNameTrimmed = (newFullName || '').trim();
    if (!usernameTrimmed) {
      Alert.alert('Validation', 'Username is required.');
      return;
    }
    try {
      setSavingProfile(true);
      // Update profile metadata (full_name) only; email cannot be changed here
      const { error: authErr } = await supabase.auth.updateUser({
        data: { full_name: fullNameTrimmed },
      });
      if (authErr) {
        Alert.alert('Update failed', authErr.message);
        return;
      }
      // Upsert users table with new username only
      const upsertPayload: any = {
        userid: user.id,
        username: usernameTrimmed,
      };
      const { error: dbErr } = await supabase.from('users').upsert(upsertPayload, { onConflict: 'userid' });
      if (dbErr) {
        Alert.alert('Update failed', dbErr.message);
        return;
      }
      setDisplayName(usernameTrimmed);
      Alert.alert('Updated', 'Profile details updated. You may need to verify email changes.');
      setEditingProfile(false);
    } catch (e: any) {
      Alert.alert('Update failed', e?.message || 'Unknown error');
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}> 
      <ScrollView
        contentContainerStyle={{ paddingBottom: 140 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
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

        {/* Edit Profile Details */}
        <View style={[styles.section, { backgroundColor: Colors[colorScheme ?? 'light'].surface, borderColor: Colors[colorScheme ?? 'light'].border, borderRadius: Radius.lg }]}> 
          <View style={[styles.row, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}> 
            <Text style={[styles.rowText, { color: Colors[colorScheme ?? 'light'].text }]}>Edit profile</Text>
            {!editingProfile ? (
              <TouchableOpacity onPress={() => setEditingProfile(true)}>
                <Text style={{ color: Colors[colorScheme ?? 'light'].primary, fontWeight: '700' }}>Edit</Text>
              </TouchableOpacity>
            ) : null}
          </View>
          {editingProfile ? (
            <View style={{ paddingHorizontal: 16, paddingBottom: 16, gap: 12 }}>
              <View>
                <Text style={[styles.inputLabel, { color: Colors[colorScheme ?? 'light'].textMuted }]}>Username</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: Colors[colorScheme ?? 'light'].surface, borderColor: Colors[colorScheme ?? 'light'].border, color: Colors[colorScheme ?? 'light'].text }]}
                  placeholder="Your username"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={newUsername}
                  onChangeText={setNewUsername}
                />
              </View>
              <View>
                <Text style={[styles.inputLabel, { color: Colors[colorScheme ?? 'light'].textMuted }]}>Name</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: Colors[colorScheme ?? 'light'].surface, borderColor: Colors[colorScheme ?? 'light'].border, color: Colors[colorScheme ?? 'light'].text }]}
                  placeholder="Your full name"
                  placeholderTextColor="#9CA3AF"
                  value={newFullName}
                  onChangeText={setNewFullName}
                />
              </View>
              <View>
                <Text style={[styles.inputLabel, { color: Colors[colorScheme ?? 'light'].textMuted }]}>Email</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: Colors[colorScheme ?? 'light'].surface, borderColor: Colors[colorScheme ?? 'light'].border, color: Colors[colorScheme ?? 'light'].text }]}
                  placeholder="you@example.com"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  editable={false}
                  value={user?.email || ''}
                />
              </View>
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 4 }}>
                <TouchableOpacity
                  style={[styles.primaryAction, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
                  onPress={handleSaveProfile}
                  disabled={savingProfile}
                >
                  {savingProfile ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.primaryActionText}>Save</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.secondaryAction, { borderColor: Colors[colorScheme ?? 'light'].border }]}
                  onPress={() => setEditingProfile(false)}
                >
                  <Text style={[styles.secondaryActionText, { color: Colors[colorScheme ?? 'light'].text }]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
        </View>

        <View style={[styles.section, { backgroundColor: Colors[colorScheme ?? 'light'].surface, borderColor: Colors[colorScheme ?? 'light'].border, borderRadius: Radius.lg }]}> 
          <View style={[styles.row, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}> 
            <Text style={[styles.rowText, { color: Colors[colorScheme ?? 'light'].text }]}>My Posts</Text>
            {loadingPosts ? <ActivityIndicator /> : null}
          </View>
          {postsError ? (
            <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
              <Text style={{ color: Colors[colorScheme ?? 'light'].danger }}>{postsError}</Text>
            </View>
          ) : null}
          {!loadingPosts && !postsError && myPosts.length === 0 ? (
            <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
              <Text style={{ color: Colors[colorScheme ?? 'light'].textMuted }}>You haven't posted anything yet.</Text>
            </View>
          ) : null}
          {!loadingPosts && myPosts.length > 0 ? (
            <View style={{ paddingHorizontal: 8, paddingBottom: 8 }}>
              {myPosts.map((p) => {
                const thumb = Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : undefined;
                const dateStr = p.dateposted ? new Date(p.dateposted).toLocaleDateString() : '';
                return (
                  <TouchableOpacity key={String(p.id)} onPress={() => router.push({ pathname: '/(protected)/item/[postid]', params: { postid: String(p.id) } } as any)}
                    style={[styles.postItem, { borderColor: Colors[colorScheme ?? 'light'].border, backgroundColor: Colors[colorScheme ?? 'light'].surface }]}> 
                    {thumb ? (
                      <Image source={{ uri: thumb }} style={styles.postThumb} />
                    ) : (
                      <View style={[styles.postThumb, { backgroundColor: '#E5E7EB' }]} />
                    )}
                    <View style={{ flex: 1 }}>
                      <Text numberOfLines={1} style={[styles.postTitle, { color: Colors[colorScheme ?? 'light'].text }]}>{p.item_title}</Text>
                      <Text style={[styles.postMeta, { color: Colors[colorScheme ?? 'light'].textMuted }]}>{dateStr}{p.location ? ` • ${p.location}` : ''}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : null}
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 20,
    // Avoid double bottom spacing above the floating tab bar; ScrollView already adds paddingBottom
    paddingBottom: 24,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 16,
    marginTop: 28,
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
    paddingVertical: 28,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  rowText: {
    color: '#111827',
    fontWeight: '600',
  },
  postItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
  },
  postThumb: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#E5E7EB',
  },
  postTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  postMeta: {
    marginTop: 2,
    fontSize: 12,
    color: '#6B7280',
  },
});
