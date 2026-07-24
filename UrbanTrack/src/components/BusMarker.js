// src/components/BusMarker.js
// Marcador personalizado para el mapa que representa una unidad de transporte.

import React from 'react';
import { Marker, Callout } from 'react-native-maps';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../styles/colors';
import { ESTADO_COLOR } from '../utils/constants';

export default function BusMarker({ unidad, onPress }) {
  const estadoColor = ESTADO_COLOR[unidad.estado] || colors.textSecondary;

  return (
    <Marker
      coordinate={{ latitude: unidad.latitud, longitude: unidad.longitud }}
      onPress={onPress}
    >
      <View style={[styles.markerContainer, { borderColor: estadoColor }]}>
        <Ionicons name="bus" size={18} color={colors.primary} />
      </View>
      <Callout tooltip>
        <View style={styles.callout}>
          <Text style={styles.calloutTitle}>{unidad.numero}</Text>
          <Text style={styles.calloutText}>Ruta {unidad.ruta}</Text>
          <View style={[styles.badge, { backgroundColor: estadoColor + '22' }]}>
            <Text style={[styles.badgeText, { color: estadoColor }]}>{unidad.estado}</Text>
          </View>
        </View>
      </Callout>
    </Marker>
  );
}

const styles = StyleSheet.create({
  markerContainer: {
    backgroundColor: colors.card,
    padding: 6,
    borderRadius: 20,
    borderWidth: 2,
  },
  callout: {
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 12,
    minWidth: 160,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  calloutTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  calloutText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
