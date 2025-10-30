import React, { useEffect, useMemo, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  TextInput, 
  StatusBar,
  Dimensions,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useLoading } from '@/contexts/LoadingContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const IS_SMALL_DEVICE = SCREEN_WIDTH < 375;
const HERO_HEIGHT = Math.min(SCREEN_HEIGHT * 0.4, 320);

type Post = {
  postid: string | number;
  userid: string;
  item_title: string;
  description: string | null;
  location: string | null;
  dateposted: string;
  images: string[] | null;
};

export default function PostDetailScreen() {
  const { postid } = useLocalSearchParams<{ postid: string }>();
  const colorScheme = useColorScheme();
  const router = useRouter();
  const auth = useAuth();
  const loading = useLoading();
  const userId = auth?.session?.user?.id;

  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');

  const isOwner = useMemo(() => !!(post && userId && post.userid === userId), [post, userId]);

  useEffect(() => {
    const load = async () => {
      try {
        setError('');
        loading.show();
        const { data, error } = await supabase
          .from('lost_item_posts')
          .select('postid, userid, item_title, description, location, dateposted, images')
          .eq('postid', postid)
          .single();
        if (error) {
          setError(error.message);
          return;
        }
        setPost(data as any);
        setTitle((data as any)?.item_title || '');
        setDescription((data as any)?.description || '');
        setLocation((data as any)?.location || '');
      } catch (e: any) {
        setError(e?.message || 'Failed to load post');
      } finally {
        loading.hide();
      }
    };
    load();
  }, [postid]);

  const handleDelete = async () => {
    if (!post) return;
    Alert.alert('Delete post', 'Are you sure you want to delete this post?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', 
        style: 'destructive', 
        onPress: async () => {
          try {
            loading.show();
            const { error } = await supabase
              .from('lost_item_posts')
              .delete()
              .eq('postid', post.postid)
              .eq('userid', userId);
            if (error) {
              Alert.alert('Delete failed', error.message);
              return;
            }
            Alert.alert('Deleted', 'Your post has been deleted.');
            router.back();
          } finally {
            loading.hide();
          }
        }
      }
    ]);
  };

  const handleSave = async () => {
    if (!post) return;
    if (!title?.trim()) {
      Alert.alert('Validation Error', 'Title is required.');
      return;
    }
    try {
      loading.show();
      const updates: any = {
        item_title: title.trim(),
        description: description?.trim() || null,
        location: location?.trim() || null,
      };
      const { error } = await supabase
        .from('lost_item_posts')
        .update(updates)
        .eq('postid', post.postid)
        .eq('userid', userId);
      if (error) {
        Alert.alert('Update failed', error.message);
        return;
      }
      setPost({ ...post, ...updates });
      setEditing(false);
      Alert.alert('Saved', 'Your changes have been saved.');
    } finally {
      loading.hide();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const dateStr = post?.dateposted ? formatDate(post.dateposted) : '';
  const images = Array.isArray(post?.images) ? (post?.images as string[]) : [];
  const isDark = colorScheme === 'dark';

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView 
        style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <StatusBar 
          barStyle={isDark ? 'light-content' : 'dark-content'} 
          backgroundColor="transparent"
          translucent
        />

        {/* Hero Image Section */}
        <View style={[styles.heroContainer, { height: HERO_HEIGHT }]}>
          {images[0] ? (
            <Image 
              source={{ uri: images[0] }} 
              style={styles.heroImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.heroImage, { backgroundColor: isDark ? '#374151' : '#E5E7EB' }]}>
              <Ionicons 
                name="image-outline" 
                size={IS_SMALL_DEVICE ? 48 : 64} 
                color={isDark ? '#6B7280' : '#9CA3AF'} 
              />
            </View>
          )}
          
          {/* Gradient Overlay */}
          <View style={styles.heroGradient} />
          
          {/* Back Button */}
          <View style={styles.heroHeader}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Title Overlay */}
          <View style={styles.heroTextBox}>
            <Text numberOfLines={2} style={styles.heroTitle}>
              {post?.item_title || 'Lost item'}
            </Text>
            <View style={styles.metaChips}>
              {!!dateStr && (
                <View style={styles.metaChip}>
                  <Ionicons name="time-outline" size={IS_SMALL_DEVICE ? 12 : 14} color="#fff" />
                  <Text style={styles.metaChipText}>{dateStr}</Text>
                </View>
              )}
              {!!post?.location && (
                <View style={styles.metaChip}>
                  <Ionicons name="location-outline" size={IS_SMALL_DEVICE ? 12 : 14} color="#fff" />
                  <Text style={styles.metaChipText} numberOfLines={1}>
                    {post.location}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Error Message */}
        {error ? (
          <View style={[styles.errorContainer, { backgroundColor: isDark ? '#7F1D1D' : '#FEE2E2' }]}>
            <Ionicons name="alert-circle" size={20} color={Colors[colorScheme ?? 'light'].danger} />
            <Text style={[styles.errorText, { color: Colors[colorScheme ?? 'light'].danger }]}>
              {error}
            </Text>
          </View>
        ) : null}

        {/* Content Card */}
        <View style={[
          styles.contentCard, 
          { 
            backgroundColor: Colors[colorScheme ?? 'light'].surface,
            shadowColor: isDark ? '#000' : '#000',
          }
        ]}>
          {/* Edit Title */}
          {editing && (
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: Colors[colorScheme ?? 'light'].textMuted }]}>
                Title
              </Text>
              <TextInput
                style={[
                  styles.input, 
                  { 
                    backgroundColor: isDark ? '#1F2937' : '#F9FAFB',
                    borderColor: Colors[colorScheme ?? 'light'].border,
                    color: Colors[colorScheme ?? 'light'].text 
                  }
                ]}
                value={title}
                onChangeText={setTitle}
                placeholder="Enter item title"
                placeholderTextColor={Colors[colorScheme ?? 'light'].textMuted}
              />
            </View>
          )}

          {/* Description Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: Colors[colorScheme ?? 'light'].textMuted }]}>
              Description
            </Text>
            {editing ? (
              <TextInput
                style={[
                  styles.textArea, 
                  { 
                    backgroundColor: isDark ? '#1F2937' : '#F9FAFB',
                    borderColor: Colors[colorScheme ?? 'light'].border,
                    color: Colors[colorScheme ?? 'light'].text 
                  }
                ]}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                value={description}
                onChangeText={setDescription}
                placeholder="Describe the item and where it was lost..."
                placeholderTextColor={Colors[colorScheme ?? 'light'].textMuted}
              />
            ) : (
              <Text style={[styles.bodyText, { color: Colors[colorScheme ?? 'light'].text }]}>
                {post?.description || 'No description provided.'}
              </Text>
            )}
          </View>

          {/* Location Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: Colors[colorScheme ?? 'light'].textMuted }]}>
              Location
            </Text>
            {editing ? (
              <TextInput
                style={[
                  styles.input, 
                  { 
                    backgroundColor: isDark ? '#1F2937' : '#F9FAFB',
                    borderColor: Colors[colorScheme ?? 'light'].border,
                    color: Colors[colorScheme ?? 'light'].text 
                  }
                ]}
                value={location}
                onChangeText={setLocation}
                placeholder="Where was it lost?"
                placeholderTextColor={Colors[colorScheme ?? 'light'].textMuted}
              />
            ) : (
              <View style={styles.locationRow}>
                <Ionicons 
                  name="location" 
                  size={18} 
                  color={Colors[colorScheme ?? 'light'].primary} 
                />
                <Text style={[styles.bodyText, { color: Colors[colorScheme ?? 'light'].text, marginLeft: 8 }]}>
                  {post?.location || 'Location not specified'}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Owner Actions */}
        {isOwner && (
          <View style={styles.actionsContainer}>
            {!editing ? (
              <>
                <TouchableOpacity 
                  style={[styles.primaryButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
                  onPress={() => setEditing(true)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="create-outline" size={20} color="#fff" />
                  <Text style={styles.buttonText}>Edit Post</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.dangerButton, { backgroundColor: Colors[colorScheme ?? 'light'].danger }]}
                  onPress={handleDelete}
                  activeOpacity={0.8}
                >
                  <Ionicons name="trash-outline" size={20} color="#fff" />
                  <Text style={styles.buttonText}>Delete</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity 
                  style={[styles.primaryButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
                  onPress={handleSave}
                  activeOpacity={0.8}
                >
                  <Ionicons name="checkmark-outline" size={20} color="#fff" />
                  <Text style={styles.buttonText}>Save Changes</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.secondaryButton, { 
                    backgroundColor: isDark ? '#374151' : '#F3F4F6',
                    borderColor: Colors[colorScheme ?? 'light'].border 
                  }]}
                  onPress={() => {
                    setEditing(false);
                    setTitle(post?.item_title || '');
                    setDescription(post?.description || '');
                    setLocation(post?.location || '');
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons 
                    name="close-outline" 
                    size={20} 
                    color={Colors[colorScheme ?? 'light'].text} 
                  />
                  <Text style={[styles.buttonText, { color: Colors[colorScheme ?? 'light'].text }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  heroContainer: {
    width: '100%',
    position: 'relative',
    marginBottom: 0,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '70%',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  heroHeader: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 16,
    left: 16,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    backdropFilter: 'blur(10px)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTextBox: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 20,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: IS_SMALL_DEVICE ? 22 : 26,
    fontWeight: '800',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    lineHeight: IS_SMALL_DEVICE ? 28 : 32,
  },
  metaChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    backdropFilter: 'blur(10px)',
  },
  metaChipText: {
    color: '#fff',
    fontSize: IS_SMALL_DEVICE ? 11 : 13,
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  contentCard: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: IS_SMALL_DEVICE ? 16 : 20,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    minHeight: 120,
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 22,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionsContainer: {
    flexDirection: 'column',
    gap: 12,
    paddingHorizontal: 16,
    marginTop: 20,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: IS_SMALL_DEVICE ? 15 : 16,
    fontWeight: '700',
  },
});