import React, { useState } from 'react';
 
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
} from 'react-native';

// Mock data for demonstration - replace with your API call later
const MOCK_ITEMS = [
  {
    postid: 1,
    location: 'Near Central Park',
    description: 'Black Wallet with various cards and a driver\'s license.',
    dateposted: '2025-10-25T10:30:00Z',
    images: ['https://via.placeholder.com/100x100/333/fff?text=Wallet'],
  },
  {
    postid: 2,
    location: 'Near Main Street',
    description: 'Golden Retriever with a red collar. No tags.',
    dateposted: '2025-10-24T14:20:00Z',
    images: ['https://via.placeholder.com/100x100/f4a460/fff?text=Dog'],
  },
  {
    postid: 3,
    location: 'University Campus',
    description: 'Set of Keys on a blue lanyard with a university logo.',
    dateposted: '2025-10-23T09:15:00Z',
    images: ['https://via.placeholder.com/100x100/4a90e2/fff?text=Keys'],
  },
];

interface LostItemPost {
  postid: number;
  location: string;
  description: string;
  dateposted: string;
  images: string[];
}

export default function Home() {
  const [items, setItems] = useState<LostItemPost[]>(MOCK_ITEMS);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    // TODO: Replace with actual API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleReportItem = () => {
    // TODO: Implement navigation
  };

  const handleSearch = () => {
    // TODO: Implement navigation
  };

  const handleClaimItem = (item: LostItemPost) => {
    // TODO: Navigate to claim screen or show claim modal
    console.log('Claim item:', item.postid);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4A90E2" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>FindIt</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Text style={styles.profileIcon}>👤</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.reportButton}
          onPress={handleReportItem}
          activeOpacity={0.7}
        >
          <Text style={styles.reportButtonText}>Report a Lost Item</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearch}
          activeOpacity={0.7}
        >
          <Text style={styles.searchButtonText}>Search for a Lost Item</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Activity Section */}
      <View style={styles.recentActivitySection}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>

        <FlatList
          data={items}
          keyExtractor={(item) => item.postid.toString()}
          renderItem={({ item }) => (
            <ItemCard item={item} onClaim={() => handleClaimItem(item)} />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={['#4A90E2']}
              tintColor="#4A90E2"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyText}>No items found</Text>
              <Text style={styles.emptySubtext}>
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
}

const ItemCard: React.FC<ItemCardProps> = ({ item, onClaim }) => {
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

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.95}>
      <View style={styles.cardContent}>
        <View style={styles.cardLeft}>
          <Text style={styles.locationText}>{item.location}</Text>
          <Text style={styles.statusText}>
            Lost: {truncateDescription(item.description)}
          </Text>
          <Text style={styles.dateText}>
            {formatDate(item.dateposted)}
          </Text>

          <TouchableOpacity 
            style={styles.claimButton} 
            onPress={onClaim}
            activeOpacity={0.8}
          >
            <Text style={styles.claimButtonText}>Claim Item</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardRight}>
          {item.images && item.images.length > 0 ? (
            <Image
              source={{ uri: item.images[0] }}
              style={styles.itemImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderIcon}>📦</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#4A90E2',
    paddingTop: 15,
    paddingBottom: 15,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  profileIcon: {
    fontSize: 20,
  },
  actionButtons: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },
  reportButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  reportButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  searchButton: {
    backgroundColor: 'white',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  recentActivitySection: {
    flex: 1,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLeft: {
    flex: 1,
    marginRight: 15,
    justifyContent: 'space-between',
  },
  locationText: {
    fontSize: 12,
    color: '#888',
    marginBottom: 6,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    lineHeight: 22,
  },
  dateText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
  },
  claimButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  claimButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  cardRight: {
    width: 100,
    height: 100,
  },
  itemImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  placeholderIcon: {
    fontSize: 32,
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
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
    color: '#4A90E2',
    fontWeight: '600',
  },
});