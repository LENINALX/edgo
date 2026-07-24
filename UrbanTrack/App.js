import React from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import AmbientBubbles from './src/components/AmbientBubbles';

export default function App() {
  return (
    <SafeAreaProvider>
      <View style={{ flex: 1 }}>
        <AuthProvider>
          <StatusBar style="light" backgroundColor="#111126" translucent={false} />
          <AppNavigator />
          <Toast />
        </AuthProvider>
        <AmbientBubbles />
      </View>
    </SafeAreaProvider>
  );
}
