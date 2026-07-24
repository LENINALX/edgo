// src/context/AuthContext.js
// Contexto global de autenticación: guarda el usuario de Firebase Auth
// y su perfil de Firestore (que incluye el rol: "usuario" o "admin").

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getUserProfile, onAuthStateChanged } from '../firebase/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe = () => {};
    onAuthStateChanged((user) => {
      setFirebaseUser(user ? { uid: user.id } : null);
      setProfile(user);
      setLoading(false);
    }).then((stop) => { unsubscribe = stop; });
    return () => unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (firebaseUser) {
      const userProfile = await getUserProfile();
      setProfile(userProfile);
    }
  };

  const isAdmin = profile?.rol === 'admin';
  const isConductor = profile?.rol === 'conductor';

  return (
    <AuthContext.Provider
      value={{ firebaseUser, profile, loading, isAdmin, isConductor, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
