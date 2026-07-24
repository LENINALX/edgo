// src/screens/admin/ComplaintsListScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Header from '../../components/Header';
import ComplaintCard from '../../components/ComplaintCard';
import EmptyState from '../../components/EmptyState';
import Loading from '../../components/Loading';
import colors from '../../styles/colors';
import { useComplaints } from '../../hooks/useComplaints';

export default function ComplaintsListScreen({ navigation }) {
  const { quejas, loading, refreshing, onRefresh } = useComplaints(null, true);
  const [filter, setFilter] = useState('Todas');
  const filters = ['Todas', 'Pendiente', 'En revisión', 'Resuelta'];
  const visibles = filter === 'Todas' ? quejas : quejas.filter((queja) => queja.estado === filter);
  const pendientes = quejas.filter((queja) => queja.estado === 'Pendiente').length;
  const revision = quejas.filter((queja) => queja.estado === 'En revisión').length;

  if (loading) return <Loading text="Cargando quejas..." />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Quejas" subtitle={`${quejas.length} reportes recibidos`} />
      <FlatList
        data={visibles}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingTop: 4, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
        ListHeaderComponent={<>
          <LinearGradient colors={[colors.primaryDark, colors.primary, '#8C69F4']} style={styles.hero}>
            <View style={{ flex: 1 }}><Text style={styles.heroEyebrow}>CENTRO DE INCIDENCIAS</Text><Text style={styles.heroTitle}>{pendientes} reportes por atender</Text><Text style={styles.heroText}>Gestiona y da seguimiento a los reportes de los usuarios.</Text></View>
            <View style={styles.heroIcon}><Ionicons name="document-text" size={29} color={colors.white} /></View>
          </LinearGradient>
          <View style={styles.summaryRow}>
            <Summary icon="alert-circle-outline" value={pendientes} label="Pendientes" color={colors.warning} />
            <Summary icon="time-outline" value={revision} label="En revisión" color={colors.info} />
            <Summary icon="checkmark-done-outline" value={quejas.filter((q) => q.estado === 'Resuelta').length} label="Resueltas" color={colors.secondary} />
          </View>
          <Text style={styles.sectionTitle}>Filtrar reportes</Text>
          <View style={styles.filterRow}>{filters.map((item) => <TouchableOpacity key={item} onPress={() => setFilter(item)} style={[styles.filterChip, filter === item && styles.filterChipActive]}><Text style={[styles.filterText, filter === item && styles.filterTextActive]}>{item}</Text></TouchableOpacity>)}</View>
          <View style={styles.listHeading}><Text style={styles.sectionTitle}>{filter === 'Todas' ? 'Todos los reportes' : filter}</Text><Text style={styles.countText}>{visibles.length} resultados</Text></View>
        </>}
        renderItem={({ item }) => (
          <ComplaintCard queja={item} onPress={() => navigation.navigate('ComplaintDetail', { quejaId: item.id })} />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="document-text-outline"
            title="No hay quejas"
            message="Cuando los usuarios reporten incidencias, aparecerán aquí."
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
