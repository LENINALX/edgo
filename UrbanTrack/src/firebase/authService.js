// src/firebase/authService.js
// Funciones relacionadas con Firebase Authentication.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearToken, request, setToken } from '../api/client';
import { mapProfile } from '../api/mappers';

const PROFILE_KEY = '@edgo_profile';
const listeners = new Set();
const notify = (profile) => listeners.forEach((listener) => listener(profile));
const saveSession = async (token, user) => {
  await setToken(token);
  const profile = mapProfile(user);
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  notify(profile);
  return profile;
};

export const onAuthStateChanged = async (callback) => {
  listeners.add(callback);
  const saved = await AsyncStorage.getItem(PROFILE_KEY);
  callback(saved ? JSON.parse(saved) : null);
  return () => listeners.delete(callback);
};

// Registrar un nuevo usuario.
// rol: 'usuario' (por defecto) o 'conductor'.
// Si rol es 'conductor', unidadId indica la unidad de transporte que va a manejar.
export const registerUser = async ({ nombre, correo, contrasena, rol = 'usuario', unidadId = null, plan = 'free' }) => {
  const response = await request('/register', { method: 'POST', body: JSON.stringify({ name: nombre, email: correo, password: contrasena, role: rol === 'conductor' ? 'driver' : 'user', transport_unit_id: unidadId, subscription_plan: plan }) });
  return saveSession(response.access_token, response.user);
};

// Iniciar sesión
export const loginUser = async (correo, contrasena) => {
  const response = await request('/login', { method: 'POST', body: JSON.stringify({ email: correo, password: contrasena }) });
  await setToken(response.access_token);
  const profile = await request('/profile');
  return saveSession(response.access_token, profile.user);
};

// Cerrar sesión
export const logoutUser = async () => {
  try { await request('/logout', { method: 'POST' }); } finally {
    await clearToken(); await AsyncStorage.removeItem(PROFILE_KEY); notify(null);
  }
};

// Recuperar contraseña
export const resetPassword = async () => { throw new Error('La recuperación de contraseña aún no está disponible en el servidor'); };

// Obtener el perfil (incluyendo rol) desde Firestore
export const getUserProfile = async () => {
  const response = await request('/profile');
  const profile = mapProfile(response.user);
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  return profile;
};

// Actualizar el perfil del usuario
export const updateUserProfile = async (_uid, data) => {
  const response = await request('/profile', { method: 'PATCH', body: JSON.stringify({ name: data.nombre }) });
  const profile = mapProfile(response.user);
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  notify(profile);
};

export const updateSubscriptionPlan = async (plan) => {
  await request('/subscription/plan', { method: 'POST', body: JSON.stringify({ plan }) });
  return getUserProfile();
};
