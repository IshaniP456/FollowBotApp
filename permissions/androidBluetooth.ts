// permissions/androidBluetooth.ts
import { PermissionsAndroid, Platform } from 'react-native';

/**
 * Ask for the right combo of permissions so we can scan/connect to
 * classic Bluetooth (HC-06) on Android.
 *
 * Returns true if we have everything we need, false otherwise.
 */
export async function ensureBtPermissions(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;

  const api = Number(Platform.Version); // Android API level
  try {
    if (api >= 31) {
      // Android 12+ needs the new BT permissions. Many devices still
      // require location for discovery, so we request it too.
      const scan = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN!,
        {
          title: 'Bluetooth Scan Permission',
          message: 'This app needs Bluetooth scan to find nearby devices.',
          buttonPositive: 'OK',
        }
      );

      const connect = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT!,
        {
          title: 'Bluetooth Connect Permission',
          message: 'This app needs Bluetooth connect to talk to your device.',
          buttonPositive: 'OK',
        }
      );

      const fine = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION!,
        {
          title: 'Location Permission',
          message: 'Location is needed to discover Bluetooth devices.',
          buttonPositive: 'OK',
        }
      );

      return (
        scan === PermissionsAndroid.RESULTS.GRANTED &&
        connect === PermissionsAndroid.RESULTS.GRANTED &&
        fine === PermissionsAndroid.RESULTS.GRANTED
      );
    } else {
      // Android 11 and lower: scanning requires location.
      const fine = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION!,
        {
          title: 'Location Permission',
          message:
            'Android requires location permission to scan for Bluetooth devices.',
          buttonPositive: 'OK',
        }
      );
      return fine === PermissionsAndroid.RESULTS.GRANTED;
    }
  } catch (e) {
    console.warn('Permission request error', e);
    return false;
  }
}
