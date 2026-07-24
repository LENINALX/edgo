// src/navigation/ConductorNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import colors from '../styles/colors';

import DriverRouteScreen from '../screens/conductor/DriverRouteScreen';
import ProfileScreen from '../screens/user/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function ConductorNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: { paddingBottom: 6, paddingTop: 6, height: 60, backgroundColor: colors.background, borderTopColor: colors.border },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
        tabBarIcon: ({ color, size }) => {
          const icons = {
            'Mi Recorrido': 'navigate',
            Perfil: 'person',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Mi Recorrido" component={DriverRouteScreen} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
