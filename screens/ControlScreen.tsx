import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Slider from '@react-native-community/slider';
import * as Location from 'expo-location';

export default function ControlScreen() {
  const [distance, setDistance] = useState(6);
  const [location, setLocation] = useState({ latitude: 0, longitude: 0 });

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Permission to access location was denied');
        return;
      }

      const watcher = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        (loc) => {
          setLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
        }
      );

      return () => watcher.remove();
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Control Page</Text>

      <View style={styles.coordContainer}>
        <Text style={styles.coordLabel}>Longitude:</Text>
        <Text style={styles.coordValue}>{location.longitude.toFixed(6)}</Text>
        <Text style={styles.coordLabel}>Latitude:</Text>
        <Text style={styles.coordValue}>{location.latitude.toFixed(6)}</Text>
      </View>

      <Text style={styles.subHeader}>Follow Distance</Text>
      <Slider
        style={styles.slider}
        minimumValue={1}
        maximumValue={10}
        step={1}
        value={distance}
        onValueChange={setDistance}
        minimumTrackTintColor="#000"
        maximumTrackTintColor="#000"
        thumbTintColor="#cde"
      />
      <View style={styles.rangeLabels}>
        <Text style={styles.rangeText}>1m</Text>
        <Text style={styles.rangeText}>Distance: {distance}m</Text>
        <Text style={styles.rangeText}>10m</Text>
      </View>

      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Robot:</Text>
        <Text style={styles.statusValue}>Active</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#456377',
    padding: 20,
    alignItems: 'center',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    backgroundColor: '#2F4365',
    padding: 10,
    borderRadius: 10,
    color: 'white',
    marginBottom: 20,
  },
  coordContainer: {
    backgroundColor: '#8AA1BD',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    width: '100%',
  },
  coordLabel: {
    fontWeight: 'bold',
    fontSize: 16,
    backgroundColor: '#2F4365',
    color: 'white',
    padding: 5,
    borderRadius: 8,
    marginBottom: 5,
  },
  coordValue: {
    color: 'black',
    fontSize: 15,
    marginBottom: 10,
  },
  subHeader: {
    fontSize: 18,
    fontWeight: '600',
    backgroundColor: '#2F4365',
    color: 'white',
    padding: 8,
    borderRadius: 10,
    marginBottom: 10,
  },
  slider: {
    width: '90%',
    height: 40,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginBottom: 20,
  },
  rangeText: {
    fontSize: 14,
    color: 'white',
  },
  statusContainer: {
    flexDirection: 'row',
    backgroundColor: '#8AA1BD',
    borderRadius: 15,
    padding: 10,
    alignItems: 'center',
  },
  statusLabel: {
    color: 'white',
    fontWeight: 'bold',
    backgroundColor: '#2F4365',
    padding: 5,
    borderRadius: 10,
    marginRight: 10,
  },
  statusValue: {
    color: '#000',
  },
});
