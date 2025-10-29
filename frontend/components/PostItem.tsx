import React, { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';

import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  Pressable,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';

export default function PostItem() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [error, setError] = useState('');

  const uploadPhotosAndGetUrls = async (uris: string[], userId: string | number) => {
    if (uris.length === 0) return [] as string[];
    const bucket = 'lost-item-images';
    const uploadedUrls: string[] = [];

    const base64ToUint8Array = (base64: string) => {
      const hasAtob = typeof globalThis.atob === 'function';
      const binaryString = hasAtob
        ? atob(base64)
        : Buffer.from(base64, 'base64').toString('binary');
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
    };

    for (let i = 0; i < uris.length; i++) {
      const uri = uris[i];
      try {
        const fileExtGuess = uri.split('.').pop()?.split('?')[0] || 'jpeg';
        const path = `${userId}/${Date.now()}-${i}.${fileExtGuess}`;

        // Read file as base64 and convert to raw bytes (Uint8Array)
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: 'base64' as any,
        });
        const bytes = base64ToUint8Array(base64);
        const contentType = `image/${fileExtGuess}`;
        const payload: any = bytes; // Pass Uint8Array directly to Supabase

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(path, payload, {
            contentType,
            upsert: true,
          });

        if (uploadError) {
          const scopedError = new Error(`storage.upload failed: ${uploadError.message || 'unknown error'}`);
          // Attach original for debugging
          // @ts-ignore
          scopedError.cause = uploadError;
          throw scopedError;
        }

        const { data: publicData } = supabase.storage
          .from(bucket)
          .getPublicUrl(path);

        if (publicData?.publicUrl) {
          uploadedUrls.push(publicData.publicUrl);
        }
      } catch (e: any) {
        throw new Error(e?.message || 'Failed to upload image (storage)');
      }
    }

    return uploadedUrls;
  };

  const handleAddPhoto = async () => {
  const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permissionResult.granted) {
    alert("Permission to access camera roll is required!");
    return;
  }
  let result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 1,
  });

  if (!result.canceled && result.assets && result.assets.length > 0) {
    setPhotos((prev) => [...prev, result.assets[0].uri]);
  }
};

  const handleRemovePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleSubmit = async () => {
    if (!title || !location || !date) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr) {
        setError(userErr.message);
        return;
      }
      const userId = userData.user?.id;
      if (!userId) {
        setError('You must be signed in to submit a report.');
        return;
      }
      const uploadedUrls = await uploadPhotosAndGetUrls(photos, userId);

      const { error: insertError } = await supabase
        .from('lost_item_posts')
        .insert([
          {
            userid: userId,
            item_title: title,
            description: description,
            location: location,
            dateposted: date.toISOString(),
            images: uploadedUrls.length > 0 ? uploadedUrls : null,
          },
        ]);

      if (insertError) {
        const msg = `insert lost_item_posts failed: ${insertError.message || 'unknown error'}`;
        setError(msg);
        console.error(msg, insertError);
        return;
      }

      Alert.alert('Success', 'Your lost item report has been submitted.');
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred');
      console.error('Error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };  const handleCancel = () => {
    // TODO: Navigate back
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Report a Lost Item</Text>
        <TouchableOpacity onPress={handleCancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Add Photos Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add Photos</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.photosContainer}
          >
            {/* Add Photo Button */}
            <TouchableOpacity 
              style={styles.addPhotoButton}
              onPress={handleAddPhoto}
            >
              <Ionicons name="camera-outline" size={32} color="#4A90E2" />
              <Text style={styles.addPhotoText}>Add Photo</Text>
            </TouchableOpacity>

            {/* Display added photos */}
            {photos.map((photo, index) => (
              <View key={index} style={styles.photoItem}>
                <Image source={{ uri: photo }} style={styles.photoImage} />
                <TouchableOpacity 
                  style={styles.removePhotoButton}
                  onPress={() => handleRemovePhoto(index)}
                >
                  <Ionicons name="close-circle" size={24} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Item Title */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Item Title<Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder='e.g., "Brown Leather Wallet"'
            placeholderTextColor="#999"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe the item and where you last saw it"
            placeholderTextColor="#999"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Last Seen Location */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Last Seen Location<Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.locationInputContainer}>
            <Ionicons name="location-outline" size={20} color="#999" style={styles.locationIcon} />
            <TextInput
              style={styles.locationInput}
              placeholder="Search for a location"
              placeholderTextColor="#999"
              value={location}
              onChangeText={setLocation}
            />
          </View>
        </View>

        {/* Date & Time Lost */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Date & Time Lost<Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.dateTimeContainer}>
            <Ionicons name="calendar-outline" size={20} color="#999" style={styles.dateIcon} />
            <Pressable
              style={styles.dateTimeInput}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={{ color: '#333' }}>
                {date ? date.toLocaleString() : 'Select date & time'}
              </Text>
            </Pressable>
            <Ionicons name="time-outline" size={20} color="#999" />
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="datetime"
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                onChange={handleDateChange}
              />
            )}
          </View>
        </View>

        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : null}
        
        {/* Submit Button */}
        <TouchableOpacity 
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          activeOpacity={0.8}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  cancelText: {
    fontSize: 16,
    color: '#4A90E2',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#FF3B30',
  },
  photosContainer: {
    flexDirection: 'row',
  },
  addPhotoButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#4A90E2',
    backgroundColor: '#F8FBFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addPhotoText: {
    fontSize: 12,
    color: '#4A90E2',
    marginTop: 4,
  },
  photoItem: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 12,
    position: 'relative',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#333',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  locationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  locationIcon: {
    marginRight: 8,
  },
  locationInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    padding: 0,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dateIcon: {
    marginRight: 8,
  },
  dateTimeInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    padding: 0,
  },
  submitButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonDisabled: {
    backgroundColor: '#A5C6ED',
    opacity: 0.7,
  },
});