import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// En Expo Go se usa automáticamente la misma IP con la que Metro entregó la
// app al teléfono. Así el backend sigue funcionando aunque cambies de red.
// El valor de respaldo corresponde a la red Wi-Fi actual para compilaciones.
const expoHost = Constants.expoConfig?.hostUri || Constants.expoGoConfig?.debuggerHost || Constants.manifest?.debuggerHost;
const apiHost = expoHost?.split(':')[0] || '10.144.121.12';
export const API_URL = `http://${apiHost}:8000/api`;
const TOKEN_KEY = '@edgo_token';

export const getToken = () => AsyncStorage.getItem(TOKEN_KEY);
export const setToken = (token) => AsyncStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => AsyncStorage.removeItem(TOKEN_KEY);

export async function request(path, options = {}) {
  const token = await getToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = body.message || Object.values(body.errors || {}).flat().join('\n') || 'Error al comunicarse con el servidor';
    throw new Error(message);
  }
  return body;
}
