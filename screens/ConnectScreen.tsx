// screens/ConnectScreen.tsx
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Platform,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';

import BluetoothClassic, { BluetoothDevice } from 'react-native-bluetooth-classic';
import { ensureBtPermissions } from '../permissions/androidBluetooth';

// 👇 Give navigation a concrete type from your stack
type Nav = NativeStackNavigationProp<RootStackParamList, 'Connect'>;

export default function ConnectScreen() {
  const navigation = useNavigation<Nav>();
  const isFocused = useIsFocused();

  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [status, setStatus] = useState<string>('Not Connected…');
  const [scanning, setScanning] = useState(false);

  const startScan = useCallback(async () => {
    const ok = await ensureBtPermissions();
    if (!ok) {
      setStatus('Permission denied');
      return;
    }

    if (Platform.OS === 'android') {
      try {
        const enabled = await BluetoothClassic.isBluetoothEnabled();
        if (!enabled) await BluetoothClassic.requestBluetoothEnabled();
      } catch (e) {
        console.warn('BT enable check failed', e);
      }
    }

    setScanning(true);
    setStatus('Scanning…');
    try {
      try { await BluetoothClassic.cancelDiscovery(); } catch {}
      const found = await BluetoothClassic.startDiscovery(); // classic BT (HC-06)
      setDevices(found ?? []);
      setStatus(`Found ${found?.length ?? 0} device(s)`);
    } catch (e) {
      console.warn('Discovery error', e);
      setStatus('Scan failed');
    } finally {
      setScanning(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (isFocused) {
      (async () => {
        await startScan();
        if (cancelled) return;
      })();
    }
    return () => {
      cancelled = true;
      try { BluetoothClassic.cancelDiscovery(); } catch {}
    };
  }, [isFocused, startScan]);

  const handleConnect = useCallback(async (device: BluetoothDevice) => {
    try {
      setStatus(`Connecting to ${device.name ?? device.address}…`);
      try { await BluetoothClassic.cancelDiscovery(); } catch {}
      const connected = await BluetoothClassic.connectToDevice(device.address);
      if (connected) {
        setStatus(`Connected: ${device.name ?? device.address}`);
        navigation.navigate('Control', { deviceAddress: device.address });
      } else {
        setStatus('Connection failed');
        Alert.alert('Connection', 'Failed to connect to device.');
      }
    } catch (e: any) {
      console.warn('Connect error', e);
      setStatus('Connection error');
      Alert.alert('Connection', e?.message ?? 'Unknown error');
    }
  }, [navigation]);

  const renderItem = ({ item }: { item: BluetoothDevice }) => (
    <TouchableOpacity
      disabled={scanning}
      style={styles.deviceRow}
      onPress={() => handleConnect(item)}
    >
      <Text style={styles.deviceName}>{item.name || 'Unknown'}</Text>
      <Text style={styles.deviceAddr}>{item.address}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.wrap}>
      <View style={styles.headerPill}>
        <Text style={styles.headerText}>Connect Device</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardHeaderText}>Available devices</Text>
        </View>

        <FlatList
          data={devices}
          keyExtractor={(d) => d.address}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 8 }}
          ListEmptyComponent={
            <View style={{ paddingVertical: 20, alignItems: 'center' }}>
              {scanning ? (
                <ActivityIndicator />
              ) : (
                <Text style={{ color: '#dde6f2' }}>
                  {Platform.OS === 'android'
                    ? 'No devices yet. Press Rescan.'
                    : 'Android required for scanning HC-06.'}
                </Text>
              )}
            </View>
          }
        />
      </View>

      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>Status:</Text>
        <Text style={styles.statusValue}>{status}</Text>
      </View>

      <View style={{ height: 12 }} />
      <TouchableOpacity
        onPress={startScan}
        disabled={scanning}
        style={[styles.actionBtn, scanning && { opacity: 0.6 }]}
      >
        <Text style={styles.actionText}>{scanning ? 'Scanning…' : 'Rescan'}</Text>
      </TouchableOpacity>

      <View style={{ height: 8 }} />
      <TouchableOpacity
        onPress={() => navigation.navigate('Control')}
        style={styles.secondaryBtn}
      >
        <Text style={styles.secondaryText}>Go to Control</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#425B67', paddingHorizontal: 20, paddingTop: 18 },
  headerPill: { alignSelf: 'center', backgroundColor: '#223352', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 14, marginBottom: 12 },
  headerText: { color: 'white', fontSize: 18, fontWeight: '600' },

  card: { backgroundColor: '#81A3C6', borderRadius: 16, paddingBottom: 8 },
  cardHeader: { backgroundColor: '#2D4166', margin: 12, borderRadius: 10, paddingVertical: 6, alignItems: 'center' },
  cardHeaderText: { color: '#EAF2FF', fontWeight: '600' },

  deviceRow: { backgroundColor: '#E7EEF7', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 14, marginHorizontal: 12, marginVertical: 6 },
  deviceName: { color: '#112133', fontSize: 16, fontWeight: '600' },
  deviceAddr: { color: '#415468', fontSize: 12, marginTop: 2 },

  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14, gap: 8 },
  statusLabel: { backgroundColor: '#1E2D52', color: 'white', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6, overflow: 'hidden' },
  statusValue: { backgroundColor: '#8AA9CC', color: '#0F2338', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6, overflow: 'hidden' },

  actionBtn: { alignSelf: 'center', backgroundColor: '#2D4166', paddingHorizontal: 22, paddingVertical: 12, borderRadius: 14 },
  actionText: { color: 'white', fontWeight: '700' },

  secondaryBtn: { alignSelf: 'center', backgroundColor: '#8AA9CC', paddingHorizontal: 22, paddingVertical: 12, borderRadius: 14 },
  secondaryText: { color: '#0F2338', fontWeight: '700' },
});
