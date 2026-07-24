// src/screens/user/UnitDetailScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import colors from '../../styles/colors';
import mapStyle from '../../utils/mapStyle';
import { ESTADO_COLOR } from '../../utils/constants';
import { getUnidadById } from '../../firebase/firestoreService';

export default function UnitDetailScreen({ route, navigation }) {
  const { unidadId } = route.params;
  const [unidad, setUnidad] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUnidad = async () => {
      const data = await getUnidadById(unidadId);
      setUnidad(data);
      setLoading(false);
    };
    fetchUnidad();
  }, [unidadId]);

  if (loading) return <Loading text="Cargando unidad..." />;
  if (!unidad) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Header title="Unidad no encontrada" showBack />
      </View>
    );
  }

  const estadoColor = ESTADO_COLOR[unidad.estado] || colors.textSecondary;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title={unidad.numero} subtitle={`Ruta ${unidad.ruta}`} showBack />
      <ScrollView contentContainerStyle={styles.container}>
        <MapView
          style={styles.map}
          customMapStyle={mapStyle}
          initialRegion={{
            latitude: unidad.latitud,
            longitude: unidad.longitud,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
        >
          <Marker coordinate={{ latitude: unidad.latitud, longitude: unidad.longitud }} />
        </MapView>

        <Card style={{ marginTop: 16 }}>
          <View style={styles.rowBetween}>
            <Text style={styles.cardTitle}>Información de la unidad</Text>
            <View style={[styles.badge, { backgroundColor: estadoColor + '22' }]}>
              <Text style={[styles.badgeText, { color: estadoColor }]}>{unidad.estado}</Text>
            </View>
          </View>

          <InfoRow icon="bus-outline" label="Número" value={unidad.numero} />
          <InfoRow icon="card-outline" label="Placa" value={unidad.placa} />
          <InfoRow icon="person-outline" label="Conductor" value={unidad.conductor} />
          <InfoRow icon="navigate-outline" label="Ruta" value={unidad.ruta} />
          <InfoRow icon="speedometer-outline" label="Velocidad" value={`${unidad.velocidad} km/h`} />
        </Card>

        <Button
          title="Reportar una queja sobre esta unidad"
          variant="secondary"
          onPress={() => navigation.navigate('NewComplaint', { unidadId: unidad.id, unidadNumero: unidad.numero })}
          style={{ marginTop: 8 }}
        />
      </ScrollView>
    </View>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={18} color={colors.primary} style={{ marginRight: 10 }} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  map: {
    height: 200,
    borderRadius: 16,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
});
