import React, { Suspense } from 'react';
import PostItem from '@/components/PostItem';
import { View, ActivityIndicator } from 'react-native';

export default function PostScreen() {
  return (
    <Suspense 
      fallback={
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#4A90E2" />
        </View>
      }
    >
      <PostItem />
    </Suspense>
  );
}