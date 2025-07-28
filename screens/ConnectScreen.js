import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function ConnectScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Connect Device</Text>
      <Button
        title="Go to Control Screen"
        onPress={() => navigation.navigate('Control')}
      />
      <Text>Status: Not Connected...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4e6a80',
  },
  header: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 20,
  },
});
