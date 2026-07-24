// src/navigation/UserNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import colors from '../styles/colors';

import HomeScreen from '../screens/user/HomeScreen';
import MapScreen from '../screens/user/MapScreen';
import UnitDetailScreen from '../screens/user/UnitDetailScreen';
import NewComplaintScreen from '../screens/user/NewComplaintScreen';
import MyComplaintsScreen from '../screens/user/MyComplaintsScreen';
import ProfileScreen from '../screens/user/ProfileScreen';
import SubscriptionScreen from '../screens/user/SubscriptionScreen';
import RouteSelectionScreen from '../screens/user/RouteSelectionScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack anidado para el mapa, para poder navegar al detalle de unidad y nueva queja
function MapStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade_from_bottom' }}>
      <Stack.Screen name="MapaPrincipal" component={MapScreen} />
      <Stack.Screen name="UnitDetail" component={UnitDetailScreen} />
      <Stack.Screen name="NewComplaint" component={NewComplaintScreen} />
    </Stack.Navigator>
  );
}

// Stack anidado para "Mis quejas", para poder abrir el formulario también
function ComplaintsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade_from_bottom' }}>
      <Stack.Screen name="MisQuejasPrincipal" component={MyComplaintsScreen} />
      <Stack.Screen name="NewComplaint" component={NewComplaintScreen} />
      <Stack.Screen name="UnitDetail" component={UnitDetailScreen} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade_from_bottom' }}>
    <Stack.Screen name="PerfilPrincipal" component={ProfileScreen} />
    <Stack.Screen name="Subscription" component={SubscriptionScreen} />
    <Stack.Screen name="RouteSelection" component={RouteSelectionScreen} />
  </Stack.Navigator>;
}

export default function UserNavigator() {
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
            Inicio: 'home',
            Mapa: 'map',
            Quejas: 'document-text',
            Perfil: 'person',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Inicio" component={HomeScreen} />
      <Tab.Screen name="Mapa" component={MapStack} />
      <Tab.Screen name="Quejas" component={ComplaintsStack} />
      <Tab.Screen name="Perfil" component={ProfileStack} />
    </Tab.Navigator>
  );
}
