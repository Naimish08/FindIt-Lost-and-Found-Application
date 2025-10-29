import React, { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { File } from 'expo-file-system';
import { Buffer } from 'buffer';

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
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';

export default function PostItem() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [error, setError] = useState('');

  const uploadImageToSupabase = async (uri: string) => {
    try {
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;

      // Create a File object from the URI
      const file = File.fromUri(uri);

      // Read file as base64
      const fileBase64 = await file.readAsStringAsync({ encoding: 'base64' });
      const fileBuffer = Buffer.from(fileBase64, 'base64');

      const { data, error } = await supabase.storage
        .from('lost-item-images')
        .upload(fileName, fileBuffer, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('lost-item-images')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleAddPhoto = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Permission to access camera roll is required!");
      return;
    }
    
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8, // Reduced quality for better upload performance
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setIsSubmitting(true); // Show loading state while uploading
        const publicUrl = await uploadImageToSupabase(result.assets[0].uri);
        setPhotos((prev) => [...prev, publicUrl]);
      }
    } catch (error) {
      setError('Failed to upload image. Please try again.');
      console.error('Error in handleAddPhoto:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemovePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
  };

  const handleDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
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
      // The photos array now contains public URLs from Supabase Storage
      const { data, error } = await supabase
        .from('lost_item_posts')
        .insert([
          {
            userid: 1,
            item_title: title,
            description: description,
            location: location,
            dateposted: date.toISOString(),
            images: photos.length > 0 ? photos : null,
          },
        ])
        .select()
        .single();

      if (error) {
        setError(error.message);
        console.error('Error submitting form:', error);
        return;
      }

      // Navigate back after successful submission
      router.back();
    } catch (error) {
      setError('An unexpected error occurred');
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
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