// src/hooks/useComplaints.js
// Hook para cargar quejas (de un usuario o todas, para el admin).

import { useCallback, useEffect, useState } from 'react';
import { getQuejasByUsuario, getAllQuejas } from '../firebase/firestoreService';

export const useComplaints = (usuarioId, isAdmin = false) => {
  const [quejas, setQuejas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchQuejas = useCallback(async () => {
    try {
      const data = isAdmin ? await getAllQuejas() : await getQuejasByUsuario(usuarioId);
      setQuejas(data);
    } catch (error) {
      console.log('Error cargando quejas:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [usuarioId, isAdmin]);

  useEffect(() => {
    fetchQuejas();
  }, [fetchQuejas]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchQuejas();
  };

  return { quejas, loading, refreshing, onRefresh, refetch: fetchQuejas };
};
