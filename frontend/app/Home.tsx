import React, { useState, useEffect, useMemo } from 'react';
 
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Alert,
  Modal,
  Dimensions,
  Pressable,
  Platform,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Shadow } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/contexts/AuthContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface LostItemPost {
  postid: string | number;
  userid: string | number;
  description: string;
  location: string;
  images: string[];
  dateposted: string;
  item_title?: string;
}

export default function Home() {
  const [items, setItems] = useState<LostItemPost[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();
  const router = useRouter();
  const auth = useAuth();
  const user = auth?.session?.user ?? null;
  const [avatarUrl, setAvatarUrl] = useState<string>('https://i.pravatar.cc/72');

  // Load current user's avatar from users.profileimage (Supabase Storage) or auth metadata
  useEffect(() => {
    let isMounted = true;
    const loadAvatar = async () => {
      try {
        if (!user?.id) {
          setAvatarUrl('https://i.pravatar.cc/72');
          return;
        }
        const { data, error } = await supabase
          .from('users')
          .select('profileimage')
          .eq('userid', user.id)
          .single();
        if (!isMounted) return;
        if (error) {
          setAvatarUrl((user.user_metadata?.avatar_url as string) || 'https://i.pravatar.cc/72');
          return;
        }
        const profileImage: string | null | undefined = (data as any)?.profileimage;
        if (profileImage) {
          const isUrl = /^https?:\/\//i.test(profileImage);
          if (isUrl) {
            setAvatarUrl(profileImage);
          } else {
            const { data: pub } = supabase.storage.from('avatars').getPublicUrl(profileImage);
            setAvatarUrl(pub?.publicUrl || (user.user_metadata?.avatar_url as string) || 'https://i.pravatar.cc/72');
          }
        } else {
          setAvatarUrl((user.user_metadata?.avatar_url as string) || 'https://i.pravatar.cc/72');
        }
      } catch {
        if (!isMounted) return;
        setAvatarUrl((user?.user_metadata?.avatar_url as string) || 'https://i.pravatar.cc/72');
      }
    };
    loadAvatar();
    return () => { isMounted = false; };
  }, [user?.id]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      
      // Fetch items directly from Supabase
      const { data, error } = await supabase
        .from('lost_item_posts')
        .select('*')
        .order('dateposted', { ascending: false });
      
      if (error) {
        console.error('Error fetching items:', error);
        Alert.alert('Error', 'Failed to load items');
      } else {
        setItems(data || []);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
      Alert.alert('Error', 'Failed to load items');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchItems();
  };

  const handleReportItem = () => {
    if (!user) {
      router.push('/login' as any);
      return;
    }
    router.push('/(protected)/(tabs)/post' as any);
  };

  const handleSearch = () => {
    if (!user) {
      router.push('/login' as any);
      return;
    }
    router.push('/(protected)/(tabs)/search' as any);
  };

  const handleClaimItem = (item: LostItemPost) => {
    // TODO: Navigate to claim screen or show claim modal
    console.log('Claim item:', item.postid);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }] }>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={Colors[colorScheme ?? 'light'].surface} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: Colors[colorScheme ?? 'light'].surface, borderBottomColor: Colors[colorScheme ?? 'light'].border }] }>
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <Text style={[styles.logo, { color: Colors[colorScheme ?? 'light'].text }]}>FindIt</Text>
          </View>
          <TouchableOpacity style={styles.profileButton} onPress={() => router.push('/(protected)/(tabs)') as any}>
            <Image
              source={{ uri: avatarUrl }}
              style={styles.profileAvatar}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.reportButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary, ...Shadow.card, borderRadius: Radius.lg } ]}
          onPress={handleReportItem}
          activeOpacity={0.7}
        >
          <Text style={styles.reportButtonText}>Report a Lost Item</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.searchButton, { backgroundColor: Colors[colorScheme ?? 'light'].surface, borderColor: Colors[colorScheme ?? 'light'].border, borderRadius: Radius.lg } ]}
          onPress={handleSearch}
          activeOpacity={0.7}
        >
          <Text style={[styles.searchButtonText, { color: Colors[colorScheme ?? 'light'].text }]}>Search for a Lost Item</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Activity Section */}
      <View style={styles.recentActivitySection}>
        <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>Recent Activity</Text>

        <FlatList
          data={items}
          keyExtractor={(item) => item.postid.toString()}
          renderItem={({ item }) => (
            <ItemCard item={item} onClaim={() => handleClaimItem(item)} onOpen={() => router.push({ pathname: '/(protected)/item/[postid]', params: { postid: String(item.postid) } } as any)} />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={[Colors[colorScheme ?? 'light'].primary]}
              tintColor={Colors[colorScheme ?? 'light'].primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={[styles.emptyText, { color: Colors[colorScheme ?? 'light'].text } ]}>No items found</Text>
              <Text style={[styles.emptySubtext, { color: Colors[colorScheme ?? 'light'].textMuted } ]}>
                Be the first to report a lost item!
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

// Item Card Component
interface ItemCardProps {
  item: LostItemPost;
  onClaim: () => void;
  onOpen: () => void;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, onClaim, onOpen }) => {
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const colorScheme = useColorScheme();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const truncateDescription = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  const handleImagePress = () => {
    if (item.images && item.images.length > 0) {
      setCurrentImageIndex(0);
      setShowImageViewer(true);
    }
  };

  const handleNextImage = () => {
    if (item.images && currentImageIndex < item.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const handlePreviousImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  return (
    <>
      <TouchableOpacity style={[styles.card, { backgroundColor: Colors[colorScheme ?? 'light'].surface, borderColor: Colors[colorScheme ?? 'light'].border, borderRadius: Radius.md, ...Shadow.card }]} activeOpacity={0.95} onPress={onOpen}>
        <View style={styles.cardContent}>
          <View style={styles.cardLeft}>
            <Text style={[styles.locationText, { color: Colors[colorScheme ?? 'light'].textMuted }]}>{item.location}</Text>
            <Text style={[styles.statusText, { color: Colors[colorScheme ?? 'light'].text }]}>
              Lost: {truncateDescription(item.description)}
            </Text>
            <Text style={[styles.dateText, { color: Colors[colorScheme ?? 'light'].textMuted }]}>
              {formatDate(item.dateposted)}
            </Text>

            <TouchableOpacity 
              style={[styles.claimButton, { backgroundColor: Colors[colorScheme ?? 'light'].secondary }]} 
              onPress={onClaim}
              activeOpacity={0.8}
            >
              <Text style={styles.claimButtonText}>Claim Item</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.cardRight}
            onPress={handleImagePress}
            activeOpacity={0.8}
          >
            {item.images && item.images.length > 0 ? (
              <Image
                source={{ uri: item.images[0] }}
                style={styles.itemImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.placeholderImage, { borderColor: Colors[colorScheme ?? 'light'].border }]}>
                <Text style={styles.placeholderIcon}>📦</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {/* Full Screen Image Viewer Modal */}
      <Modal
        visible={showImageViewer}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImageViewer(false)}
      >
        <View style={styles.imageViewerContainer}>
          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowImageViewer(false)}
          >
          <Ionicons name="close" size={32} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Image */}
          {item.images && item.images.length > 0 && (
            <Image
              source={{ uri: item.images[currentImageIndex] }}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          )}

          {/* Navigation Arrows */}
          {item.images && item.images.length > 1 && (
            <>
              {currentImageIndex > 0 && (
                <TouchableOpacity
                  style={styles.navButtonLeft}
                  onPress={handlePreviousImage}
                >
                  <Ionicons name="chevron-back" size={32} color="#FFFFFF" />
                </TouchableOpacity>
              )}
              {currentImageIndex < item.images.length - 1 && (
                <TouchableOpacity
                  style={styles.navButtonRight}
                  onPress={handleNextImage}
                >
                  <Ionicons name="chevron-forward" size={32} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </>
          )}

          {/* Image Counter */}
          {item.images && item.images.length > 1 && (
            <View style={styles.imageCounter}>
              <Text style={styles.imageCounterText}>
                {currentImageIndex + 1} / {item.images.length}
              </Text>
            </View>
          )}
        </View>
      </Modal>
    </>
  );
};

const HEADER_TOP = Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 8 : 12;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: HEADER_TOP,
    paddingBottom: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    fontSize: 24,
  },
  logo: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    fontSize: 18,
  },
  profileAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
  },
  actionButtons: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },
  reportButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  reportButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  searchButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchButtonText: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '600',
  },
  recentActivitySection: {
    flex: 1,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 140,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLeft: {
    flex: 1,
    marginRight: 16,
    justifyContent: 'space-between',
  },
  locationText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
  },
  statusText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    lineHeight: 22,
  },
  dateText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 12,
  },
  claimButton: {
    backgroundColor: '#10B981',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  claimButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  cardRight: {
    width: 96,
    height: 96,
  },
  itemImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  placeholderIcon: {
    fontSize: 32,
  },
  emptyContainer: {
    padding: 56,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 5,
  },
  navIcon: {
    fontSize: 24,
    marginBottom: 4,
    opacity: 0.5,
  },
  navIconActive: {
    fontSize: 24,
    marginBottom: 4,
  },
  navText: {
    fontSize: 12,
    color: '#999',
  },
  navTextActive: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '600',
  },
  // Image Viewer Styles
  imageViewerContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1000,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  navButtonLeft: {
    position: 'absolute',
    left: 20,
    top: '50%',
    transform: [{ translateY: -22 }],
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonRight: {
    position: 'absolute',
    right: 20,
    top: '50%',
    transform: [{ translateY: -22 }],
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageCounter: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  imageCounterText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});