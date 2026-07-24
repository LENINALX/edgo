// src/hooks/useUnits.js
// Hook que suscribe en tiempo real a la colección de unidades.

import { useEffect, useState } from 'react';
import { subscribeUnidades } from '../firebase/firestoreService';

export const useUnits = () => {
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeUnidades((data) => {
      setUnidades(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { unidades, loading };
};
