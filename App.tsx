// App.tsx
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ConnectScreen from './screens/ConnectScreen';
import ControlScreen from './screens/ControlScreen';

// 👇 Export the stack's route map so other files can import the type
export type RootStackParamList = {
  Connect: undefined;
  Control: { deviceAddress?: string } | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Connect"
        screenOptions={{ headerShown: true }}
      >
        <Stack.Screen name="Connect" component={ConnectScreen} />
        <Stack.Screen name="Control" component={ControlScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
