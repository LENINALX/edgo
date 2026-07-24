// src/screens/admin/UnitsListScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import Header from '../../components/Header';
import EmptyState from '../../components/EmptyState';
import Loading from '../../components/Loading';
import colors from '../../styles/colors';
import { ESTADO_COLOR } from '../../utils/constants';
import { useUnits } from '../../hooks/useUnits';
import { deleteUnidad } from '../../firebase/firestoreService';

export default function UnitsListScreen({ navigation }) {
  const { unidades, loading } = useUnits();
  const [filter, setFilter] = useState('Todas');
  const filters = ['Todas', 'En servicio', 'En mantenimiento', 'Fuera de servicio'];
  const visibles = filter === 'Todas' ? unidades : unidades.filter((unidad) => unidad.estado === filter);
  const enServicio = unidades.filter((unidad) => unidad.estado === 'En servicio').length;

  const handleDelete = (unidad) => {
    Alert.alert('Eliminar unidad', `¿Seguro que deseas eliminar ${unidad.numero}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteUnidad(unidad.id);
            Toast.show({ type: 'success', text1: 'Unidad eliminada' });
          } catch (error) {
            Toast.show({ type: 'error', text1: 'No se pudo eliminar la unidad' });
          }
        },
      },
    ]);
  };

  if (loading) return <Loading text="Cargando unidades..." />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header
        title="Unidades"
        subtitle={`${unidades.length} unidades registradas`}
        rightIcon="add-circle-outline"
        onRightPress={() => navigation.navigate('UnitForm')}
      />
      <FlatList
        data={visibles}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingTop: 4, flexGrow: 1 }}
        ListHeaderComponent={<>
          <LinearGradient colors={[colors.primaryDark, colors.primary, '#8C69F4']} style={styles.hero}>
            <View style={{ flex: 1 }}><Text style={styles.heroEyebrow}>GESTIÓN DE FLOTA</Text><Text style={styles.heroTitle}>{enServicio} unidades en servicio</Text><Text style={styles.heroText}>Controla disponibilidad, conductores y estado de cada unidad.</Text></View>
            <View style={styles.heroIcon}><Ionicons name="bus" size={30} color={colors.white} /></View>
          </LinearGradient>
          <View style={styles.summaryRow}>
            <Summary icon="bus-outline" value={unidades.length} label="Total" color={colors.primary} />
            <Summary icon="checkmark-circle-outline" value={enServicio} label="Activas" color={colors.secondary} />
            <Summary icon="construct-outline" value={unidades.filter((u) => u.estado === 'En mantenimiento').length} label="Taller" color={colors.warning} />
          </View>
          <Text style={styles.sectionTitle}>Filtrar unidades</Text>
          <View style={styles.filterRow}>{filters.map((item) => <TouchableOpacity key={item} onPress={() => setFilter(item)} style={[styles.filterChip, filter === item && styles.filterChipActive]}><Text style={[styles.filterText, filter === item && styles.filterTextActive]}>{item}</Text></TouchableOpacity>)}</View>
          <View style={styles.listHeading}><Text style={styles.sectionTitle}>{filter === 'Todas' ? 'Todas las unidades' : filter}</Text><Text style={styles.countText}>{visibles.length} resultados</Text></View>
        </>}
        renderItem={({ item }) => {
          const estadoColor = ESTADO_COLOR[item.estado] || colors.textSecondary;
          return (
            <View style={styles.card}>
              <View style={styles.iconContainer}>
                <Ionicons name="bus" size={22} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.unitTopRow}><Text style={styles.numero}>{item.numero}</Text><Text style={styles.placa}>{item.placa}</Text></View>
                <Text style={styles.detalle}>Ruta {item.ruta}</Text>
                <View style={styles.driverRow}><Ionicons name="person-outline" size={12} color={colors.textSecondary} /><Text style={styles.driverText}>{item.conductor}</Text></View>
                <View style={[styles.badge, { backgroundColor: estadoColor + '22' }]}>
                  <Text style={[styles.badgeText, { color: estadoColor }]}>{item.estado}</Text>
                </View>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => navigation.navigate('UnitForm', { unidad: item })}>
                  <Ionicons name="create-outline" size={20} color={colors.primary} style={{ marginBottom: 14 }} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item)}>
                  <Ionicons name="trash-outline" size={20} color={colors.danger} />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            icon="bus-outline"
            title="Sin unidades"
            message="Agrega la primera unidad de transporte con el botón +"
          />
        }
      />
    </View>
  );
}

function Summary({ icon, value, label, color }) {
  return <View style={styles.summaryCard}><View style={[styles.summaryIcon, { backgroundColor: color + '20' }]}><Ionicons name={icon} size={18} color={color} /></View><Text style={styles.summaryValue}>{value}</Text><Text style={styles.summaryLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  numero: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  detalle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: 6,
  },
  unitTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  placa: { color: colors.textSecondary, fontSize: 10, fontWeight: '700', backgroundColor: colors.input, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  driverRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  driverText: { color: colors.textSecondary, fontSize: 11, marginLeft: 4 },
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
  actions: {
    marginLeft: 10,
  },
  hero: { borderRadius: 20, padding: 18, minHeight: 128, flexDirection: 'row', alignItems: 'center', marginBottom: 14, shadowColor: colors.primary, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  heroEyebrow: { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 6 },
  heroTitle: { color: colors.white, fontSize: 20, fontWeight: '800' },
  heroText: { color: 'rgba(255,255,255,0.82)', fontSize: 11, lineHeight: 16, marginTop: 6 },
  heroIcon: { width: 56, height: 56, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center', marginLeft: 10 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 },
  summaryCard: { width: '31%', backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 11 },
  summaryIcon: { width: 31, height: 31, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 7 },
  summaryValue: { color: colors.text, fontSize: 17, fontWeight: '800' },
  summaryLabel: { color: colors.textSecondary, fontSize: 10, marginTop: 2 },
  sectionTitle: { color: colors.text, fontSize: 15, fontWeight: '800', marginBottom: 10 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 14 },
  filterChip: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.input, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 7, marginRight: 7, marginBottom: 7 },
  filterChipActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  filterText: { color: colors.textSecondary, fontSize: 10, fontWeight: '700' },
  filterTextActive: { color: colors.accentLight },
  listHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  countText: { color: colors.textSecondary, fontSize: 11, marginBottom: 10 },
});
