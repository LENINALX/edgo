// src/hooks/useAuth.js
// Hook para acceder fácilmente al contexto de autenticación.

import { useAuthContext } from '../context/AuthContext';

export const useAuth = () => {
  return useAuthContext();
};
