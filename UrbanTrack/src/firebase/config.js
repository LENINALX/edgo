import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyA73qkn9eucs1AMFFnlrANObduOhluMJv0",
  authDomain: "edgo-8fe5a.firebaseapp.com",
  projectId: "edgo-8fe5a",
  storageBucket: "edgo-8fe5a.firebasestorage.app",
  messagingSenderId: "770985606253",
  appId: "1:770985606253:web:f3f0f299c2b3a999745364",
  measurementId: "G-JE1XG32MK7"
};

// 1. Inicializar la app base de Firebase de forma segura
const appAlreadyInitialized = getApps().length > 0;
const app = appAlreadyInitialized ? getApp() : initializeApp(firebaseConfig);

// 2. Inicializar Auth controlando estrictamente el estado previo
let auth;
if (!appAlreadyInitialized) {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} else {
  auth = getAuth(app);
}

// 3. Inicializar la base de datos
const db = getFirestore(app);

export { app, auth, db };