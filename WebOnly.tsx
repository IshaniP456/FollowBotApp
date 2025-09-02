// WebOnly.tsx
import React from 'react';
import { View, Text } from 'react-native';

export default function WebOnly() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24 }}>Hello from Web 👋</Text>
      <Text>This is a test screen with no native modules.</Text>
    </View>
  );
}
