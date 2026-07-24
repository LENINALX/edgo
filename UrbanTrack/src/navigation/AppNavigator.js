// src/navigation/AppNavigator.js
// Navegador raíz: decide qué mostrar según el estado de autenticación y el rol.

import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
import SplashScreen from '../screens/auth/SplashScreen';
import AuthNavigator from './AuthNavigator';
import UserNavigator from './UserNavigator';
import AdminNavigator from './AdminNavigator';
import ConductorNavigator from './ConductorNavigator';
import RouteSelectionScreen from '../screens/user/RouteSelectionScreen';

const Stack = createNativeStackNavigator();

function RouteSetupNavigator() {
  return <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade_from_bottom' }}><Stack.Screen name="InitialRouteSelection" component={RouteSelectionScreen} /></Stack.Navigator>;
}

export default function AppNavigator() {
  const { firebaseUser, profile, loading, isAdmin, isConductor } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  // Muestra el splash mientras Firebase determina el estado de sesión
  if (loading || showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} loading={loading} />;
  }

  return (
    <NavigationContainer>
      {!firebaseUser || !profile ? (
        <AuthNavigator />
      ) : isAdmin ? (
        <AdminNavigator />
      ) : isConductor ? (
        <ConductorNavigator />
      ) : !profile?.rutasSeleccionadas?.length ? (
        <RouteSetupNavigator />
      ) : (
        <UserNavigator />
      )}
    </NavigationContainer>
  );
}
