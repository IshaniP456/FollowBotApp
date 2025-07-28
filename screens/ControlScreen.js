import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import { BleManager } from 'react-native-ble-plx';

const manager = new BleManager();

export default function ControlScreen() {
  const [location, setLocation] = useState(null);
  const [connectedDevice, setConnectedDevice] = useState(null);

  useEffect(() => {
    const startLocationUpdates = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 2000,
          distanceInterval: 1,
        },
        (loc) => {
          setLocation(loc.coords);
          sendDataToBluetooth(loc.coords);
        }
      );
    };

    startLocationUpdates();
  }, []);

  const sendDataToBluetooth = async (coords) => {
    if (!connectedDevice) return;

    const data = `${coords.latitude},${coords.longitude}`;
    const serviceUUID = '0000ffe0-0000-1000-8000-00805f9b34fb';
    const charUUID = '0000ffe1-0000-1000-8000-00805f9b34fb';

    try {
      await connectedDevice.writeCharacteristicWithResponseForService(
        serviceUUID,
        charUUID,
        Buffer.from(data).toString('base64')
      );
    } catch (e) {
      console.log('Bluetooth write error:', e.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Control Screen</Text>
      <Text>Latitude: {location?.latitude || '...'}</Text>
      <Text>Longitude: {location?.longitude || '...'}</Text>
      <Button title="Connect to HC-06" onPress={async () => {
        const subscription = manager.onStateChange((state) => {
          if (state === 'PoweredOn') {
            manager.startDeviceScan(null, null, async (error, device) => {
              if (error) return console.log(error);

              if (device.name === 'HC-06') {
                manager.stopDeviceScan();
                const connected = await device.connect();
                setConnectedDevice(connected);
              }
            });
            subscription.remove();
          }
        }, true);
      }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
});

