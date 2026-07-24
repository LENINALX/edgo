// src/navigation/AdminNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import colors from '../styles/colors';

import DashboardScreen from '../screens/admin/DashboardScreen';
import UnitsListScreen from '../screens/admin/UnitsListScreen';
import UnitFormScreen from '../screens/admin/UnitFormScreen';
import ComplaintsListScreen from '../screens/admin/ComplaintsListScreen';
import ComplaintDetailScreen from '../screens/admin/ComplaintDetailScreen';
import ProfileScreen from '../screens/user/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function UnitsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade_from_bottom' }}>
      <Stack.Screen name="UnitsListPrincipal" component={UnitsListScreen} />
      <Stack.Screen name="UnitForm" component={UnitFormScreen} />
    </Stack.Navigator>
  );
}

function ComplaintsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade_from_bottom' }}>
      <Stack.Screen name="ComplaintsListPrincipal" component={ComplaintsListScreen} />
      <Stack.Screen name="ComplaintDetail" component={ComplaintDetailScreen} />
    </Stack.Navigator>
  );
}

export default function AdminNavigator() {
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
            Dashboard: 'speedometer',
            Unidades: 'bus',
            Quejas: 'document-text',
            Perfil: 'person',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Unidades" component={UnitsStack} />
      <Tab.Screen name="Quejas" component={ComplaintsStack} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
