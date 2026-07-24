// src/screens/conductor/DriverRouteScreen.js
// Pantalla principal del conductor: inicia o detiene su recorrido.
// Mientras el recorrido está activo, se envía la ubicación real (GPS)
// del dispositivo a Firestore cada pocos segundos, para que los usuarios
// vean la unidad moverse en el mapa en tiempo real.

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import MapView, { Marker } from 'react-native-maps';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import colors from '../../styles/colors';
import mapStyle from '../../utils/mapStyle';
import { ESTADO_COLOR } from '../../utils/constants';
import { useAuth } from '../../hooks/useAuth';
import { getUnidadById, actualizarUbicacionUnidad, updateUnidadEstado } from '../../firebase/firestoreService';

export default function DriverRouteScreen() {
  const { profile } = useAuth();
  const [unidad, setUnidad] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enRecorrido, setEnRecorrido] = useState(false);
  const [miUbicacion, setMiUbicacion] = useState(null);
  const watchSubscription = useRef(null);

  const cargarUnidad = async () => {
    if (!profile?.unidadId) {
      setLoading(false);
      return;
    }
    const data = await getUnidadById(profile.unidadId);
    setUnidad(data);
    setLoading(false);
  };

  useEffect(() => {
    cargarUnidad();
    // Al desmontar la pantalla, aseguramos detener el GPS
    return () => {
      if (watchSubscription.current) {
        watchSubscription.current.remove();
      }
    };
  }, [profile?.unidadId]);

  const iniciarRecorrido = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permiso de ubicación requerido',
        'EDGO necesita acceso a tu ubicación para compartir el recorrido de la unidad.'
      );
      return;
    }

    try {
      // Marca la unidad como "En servicio"
      await updateUnidadEstado(unidad.id, 'En servicio');
      setUnidad((prev) => ({ ...prev, estado: 'En servicio' }));

      // Suscripción en tiempo real a la ubicación del dispositivo
      watchSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 4000, // cada 4 segundos
          distanceInterval: 10, // o cada 10 metros
        },
        async (location) => {
          const { latitude, longitude, speed } = location.coords;
          setMiUbicacion({ latitude, longitude });

          // speed viene en m/s; lo convertimos a km/h aproximado
          const velocidadKmH = speed && speed > 0 ? Math.round(speed * 3.6) : 0;

          try {
            await actualizarUbicacionUnidad(unidad.id, {
              latitud: latitude,
              longitud: longitude,
              velocidad: velocidadKmH,
            });
          } catch (error) {
            console.log('Error actualizando ubicación:', error);
          }
        }
      );

      setEnRecorrido(true);
      Toast.show({ type: 'success', text1: 'Recorrido iniciado', text2: 'Compartiendo tu ubicación en vivo' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'No se pudo iniciar el recorrido' });
    }
  };

  const detenerRecorrido = async () => {
    if (watchSubscription.current) {
      watchSubscription.current.remove();
      watchSubscription.current = null;
    }
    setEnRecorrido(false);

    try {
      await updateUnidadEstado(unidad.id, 'Fuera de servicio');
      setUnidad((prev) => ({ ...prev, estado: 'Fuera de servicio' }));
      Toast.show({ type: 'info', text1: 'Recorrido finalizado' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'No se pudo actualizar el estado de la unidad' });
    }
  };

  if (loading) return <Loading text="Cargando tu unidad asignada..." />;

  if (!unidad) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Header title="Mi recorrido" subtitle={profile?.nombre} />
        <EmptyState
          icon="alert-circle-outline"
          title="No tienes una unidad asignada"
          message="Pide a un administrador que te asigne una unidad de transporte para poder iniciar tu recorrido."
        />
      </View>
    );
  }

  const estadoColor = ESTADO_COLOR[unidad.estado] || colors.textSecondary;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Mi recorrido" subtitle={`Hola, ${profile?.nombre?.split(' ')[0] || 'conductor'}`} />
      <ScrollView contentContainerStyle={styles.container}>
        <Card>
          <View style={styles.rowBetween}>
            <Text style={styles.numero}>{unidad.numero}</Text>
            <View style={[styles.badge, { backgroundColor: estadoColor + '22' }]}>
              <Text style={[styles.badgeText, { color: estadoColor }]}>{unidad.estado}</Text>
            </View>
          </View>
          <Text style={styles.ruta}>Ruta {unidad.ruta}</Text>

          <View style={styles.infoRow}>
            <Ionicons name="card-outline" size={16} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={styles.infoText}>Placa: {unidad.placa}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="speedometer-outline" size={16} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={styles.infoText}>Velocidad actual: {unidad.velocidad} km/h</Text>
          </View>
        </Card>

        <View style={styles.statusBanner}>
          <Ionicons
            name={enRecorrido ? 'radio-button-on' : 'radio-button-off'}
            size={18}
            color={enRecorrido ? colors.secondary : colors.textSecondary}
          />
          <Text style={[styles.statusText, enRecorrido && { color: colors.secondary }]}>
            {enRecorrido ? 'Compartiendo ubicación en vivo' : 'No estás compartiendo tu ubicación'}
          </Text>
        </View>

        {miUbicacion && (
          <MapView
            style={styles.map}
            customMapStyle={mapStyle}
            region={{
              latitude: miUbicacion.latitude,
              longitude: miUbicacion.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker coordinate={miUbicacion} title={unidad.numero} pinColor={colors.secondary} />
          </MapView>
        )}

        {enRecorrido ? (
          <Button title="Finalizar recorrido" variant="danger" onPress={detenerRecorrido} style={{ marginTop: 16 }} />
        ) : (
          <Button title="Iniciar recorrido" variant="secondary" onPress={iniciarRecorrido} style={{ marginTop: 16 }} />
        )}

        <Text style={styles.hint}>
          Al iniciar el recorrido, tu ubicación se actualizará automáticamente para que los usuarios
          puedan verte en el mapa mientras conduces.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 50,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  numero: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  ruta: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  infoText: {
    fontSize: 13,
    color: colors.text,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    marginTop: 16,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: 8,
  },
  map: {
    height: 220,
    borderRadius: 16,
    marginTop: 16,
  },
  hint: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
  },
});
