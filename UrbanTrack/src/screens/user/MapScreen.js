// src/screens/user/MapScreen.js
import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import MapView from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../styles/colors';
import mapStyle from '../../utils/mapStyle';
import BusMarker from '../../components/BusMarker';
import Loading from '../../components/Loading';
import { useUnits } from '../../hooks/useUnits';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/Button';

const DEFAULT_REGION = {
  latitude: -0.1807,
  longitude: -78.4678,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

export default function MapScreen({ navigation }) {
  const { unidades, loading } = useUnits();
  const { profile } = useAuth();
  const [region, setRegion] = useState(DEFAULT_REGION);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    (async () => {
      // Solicita permiso de ubicación; si se otorga, centra el mapa ahí.
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        try {
          const location = await Location.getCurrentPositionAsync({});
          setRegion({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.08,
            longitudeDelta: 0.08,
          });
        } catch (e) {
          // Si falla, se mantiene la región por defecto
        }
      }
    })();
  }, []);

  if (loading) return <Loading text="Cargando unidades..." />;
  const selectedRoutes = profile?.rutasSeleccionadas || [];
  const visibleUnits = unidades.filter((unit) => selectedRoutes.includes(unit.rutaId));

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <View style={styles.liveDot} />
        <View style={{ flex: 1 }}><Text style={styles.title}>Mapa en vivo</Text><Text style={styles.subtitle}>{visibleUnits.length} unidades en tus rutas disponibles</Text></View>
        <View style={styles.planPill}><Text style={styles.planText}>{profile?.plan === 'plus' ? 'PLUS' : profile?.plan === 'economico' ? 'ECO' : 'GRATIS'}</Text></View>
      </View>
      <MapView ref={mapRef} style={styles.map} initialRegion={region} showsUserLocation customMapStyle={mapStyle}>
        {visibleUnits.map((unidad) => (
          <BusMarker
            key={unidad.id}
            unidad={unidad}
            onPress={() => setSelectedUnit(unidad)}
          />
        ))}
      </MapView>
      <View style={styles.mapOverlay} pointerEvents="box-none">
        <TouchableOpacity activeOpacity={0.85} style={styles.locationButton} onPress={() => mapRef.current?.animateToRegion(region, 550)}><Ionicons name="locate" size={21} color={colors.primary} /></TouchableOpacity>
        <View style={styles.mapLegend}><View style={styles.legendDot} /><Text style={styles.legendText}>{enServicioText(visibleUnits.length)}</Text></View>
      </View>
      {selectedUnit ? <View style={styles.unitSheet}>
        <TouchableOpacity onPress={() => setSelectedUnit(null)} style={styles.closeButton}><Ionicons name="close" size={18} color={colors.textSecondary} /></TouchableOpacity>
        <View style={styles.sheetTop}><View style={styles.unitIcon}><Ionicons name="bus" size={23} color={colors.primary} /></View><View style={{ flex: 1 }}><Text style={styles.unitNumber}>{selectedUnit.numero}</Text><Text style={styles.unitRoute}>Ruta {selectedUnit.ruta}</Text></View><View style={[styles.statusBadge, { backgroundColor: selectedUnit.estado === 'En servicio' ? colors.secondaryLight : colors.warning + '22' }]}><Text style={[styles.statusText, { color: selectedUnit.estado === 'En servicio' ? colors.secondary : colors.warning }]}>{selectedUnit.estado}</Text></View></View>
        <View style={styles.sheetInfo}><Text style={styles.sheetInfoText}><Ionicons name="speedometer-outline" size={13} color={colors.textSecondary} /> {selectedUnit.velocidad || 0} km/h</Text><Text style={styles.sheetInfoText}><Ionicons name="person-outline" size={13} color={colors.textSecondary} /> {selectedUnit.conductor}</Text></View>
        <Button title="Ver detalle de unidad" onPress={() => navigation.navigate('UnitDetail', { unidadId: selectedUnit.id })} style={{ marginTop: 12 }} />
      </View> : <View style={styles.hintSheet}><Ionicons name="hand-left-outline" size={17} color={colors.primary} /><Text style={styles.hintText}>Toca una unidad para ver información en vivo</Text></View>}
    </View>
  );
}

const enServicioText = (count) => `${count} ${count === 1 ? 'unidad disponible' : 'unidades disponibles'}`;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerBar: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 21,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  map: {
    flex: 1,
  },
  liveDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.secondary, marginRight: 10, shadowColor: colors.secondary, shadowOpacity: 0.9, shadowRadius: 6 },
  planPill: { backgroundColor: colors.primaryLight, borderRadius: 9, paddingHorizontal: 8, paddingVertical: 5 },
  planText: { color: colors.accentLight, fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  mapOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'space-between', alignItems: 'flex-end', padding: 16, paddingTop: 82, paddingBottom: 144 },
  locationButton: { width: 45, height: 45, borderRadius: 15, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.22, shadowRadius: 8, elevation: 5 },
  mapLegend: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(32,30,66,0.94)', paddingHorizontal: 11, paddingVertical: 8, borderRadius: 11, borderWidth: 1, borderColor: colors.border },
  legendDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.secondary, marginRight: 6 },
  legendText: { color: colors.text, fontSize: 11, fontWeight: '700' },
  unitSheet: { position: 'absolute', left: 14, right: 14, bottom: 14, backgroundColor: colors.card, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: colors.border, shadowColor: '#000', shadowOpacity: 0.32, shadowRadius: 16, elevation: 10 },
  closeButton: { position: 'absolute', right: 12, top: 10, zIndex: 1, padding: 4 },
  sheetTop: { flexDirection: 'row', alignItems: 'center', paddingRight: 20 },
  unitIcon: { width: 43, height: 43, borderRadius: 14, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  unitNumber: { color: colors.text, fontSize: 16, fontWeight: '800' },
  unitRoute: { color: colors.textSecondary, fontSize: 11, marginTop: 3 },
  statusBadge: { borderRadius: 9, paddingHorizontal: 7, paddingVertical: 5, maxWidth: 92 },
  statusText: { fontSize: 9, fontWeight: '800', textAlign: 'center' },
  sheetInfo: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14, paddingTop: 11, borderTopWidth: 1, borderTopColor: colors.border },
  sheetInfoText: { color: colors.textSecondary, fontSize: 11 },
  hintSheet: { position: 'absolute', left: 14, right: 14, bottom: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 14, padding: 13, borderWidth: 1, borderColor: colors.border, shadowColor: '#000', shadowOpacity: 0.16, shadowRadius: 8, elevation: 5 },
  hintText: { color: colors.textSecondary, fontSize: 11, marginLeft: 8 },
});
