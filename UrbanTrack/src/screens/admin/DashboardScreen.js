// src/screens/admin/DashboardScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';
import colors from '../../styles/colors';
import { useUnits } from '../../hooks/useUnits';
import { getAllQuejas } from '../../firebase/firestoreService';
import { seedUnidades } from '../../utils/seedData';
import { useAuth } from '../../hooks/useAuth';

export default function DashboardScreen({ navigation }) {
  const { unidades, loading } = useUnits();
  const { profile } = useAuth();
  const [quejas, setQuejas] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const cargarQuejas = async () => {
    const data = await getAllQuejas();
    setQuejas(data);
  };

  useEffect(() => {
    cargarQuejas();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await cargarQuejas();
    setRefreshing(false);
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await seedUnidades();
      Toast.show({ type: 'success', text1: 'Datos de prueba generados' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error al generar datos de prueba' });
    } finally {
      setSeeding(false);
    }
  };

  const pendientes = quejas.filter((q) => q.estado === 'Pendiente').length;
  const resueltas = quejas.filter((q) => q.estado === 'Resuelta').length;
  const enServicio = unidades.filter((u) => u.estado === 'En servicio').length;
  const mantenimiento = unidades.filter((u) => u.estado === 'En mantenimiento').length;
  const fueraServicio = unidades.filter((u) => u.estado === 'Fuera de servicio').length;
  const recientes = quejas.slice(0, 3);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Dashboard" subtitle="Resumen general de EDGO" />
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
      >
        <LinearGradient colors={[colors.primaryDark, colors.primary, '#8C69F4']} style={styles.hero}>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroEyebrow}>CENTRO DE CONTROL</Text>
            <Text style={styles.heroTitle}>Hola, {profile?.nombre?.split(' ')[0] || 'administrador'} 👋</Text>
            <Text style={styles.heroText}>Supervisa tu flota y responde a los reportes en tiempo real.</Text>
          </View>
          <View style={styles.heroIcon}><Ionicons name="analytics" size={31} color={colors.white} /></View>
        </LinearGradient>

        <View style={styles.liveRow}><View style={styles.liveDot} /><Text style={styles.liveText}>Sistema operativo · Actualizado ahora</Text></View>

        <Text style={styles.sectionTitle}>Resumen de hoy</Text>
        <View style={styles.statsGrid}>
          <StatCard icon="bus" color={colors.primary} label="Unidades" value={loading ? '—' : unidades.length} />
          <StatCard icon="document-text" color={colors.warning} label="Quejas pendientes" value={pendientes} />
          <StatCard icon="checkmark-done" color={colors.secondary} label="Quejas resueltas" value={resueltas} />
          <StatCard icon="alert-circle" color={colors.danger} label="Total quejas" value={quejas.length} />
        </View>

        <Card>
          <View style={styles.cardHeader}><View><Text style={styles.cardTitle}>Estado de la flota</Text><Text style={styles.cardSubtitle}>{unidades.length} unidades registradas</Text></View><Ionicons name="bus-outline" size={23} color={colors.primary} /></View>
          <FleetRow label="En servicio" value={enServicio} total={unidades.length} color={colors.secondary} />
          <FleetRow label="En mantenimiento" value={mantenimiento} total={unidades.length} color={colors.warning} />
          <FleetRow label="Fuera de servicio" value={fueraServicio} total={unidades.length} color={colors.danger} />
        </Card>

        <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Actividad reciente</Text><Text style={styles.sectionCaption}>{quejas.length} reportes</Text></View>
        {recientes.length ? recientes.map((queja) => (
          <Card key={queja.id} style={styles.activityCard}>
            <View style={[styles.activityIcon, { backgroundColor: queja.estado === 'Pendiente' ? colors.warning + '22' : colors.secondary + '22' }]}><Ionicons name="document-text-outline" size={20} color={queja.estado === 'Pendiente' ? colors.warning : colors.secondary} /></View>
            <View style={{ flex: 1 }}><Text style={styles.activityTitle} numberOfLines={1}>{queja.tipo}</Text><Text style={styles.activityText} numberOfLines={1}>{queja.descripcion}</Text></View>
            <View style={[styles.statusPill, { backgroundColor: queja.estado === 'Pendiente' ? colors.warning + '22' : colors.secondary + '22' }]}><Text style={[styles.statusText, { color: queja.estado === 'Pendiente' ? colors.warning : colors.secondary }]}>{queja.estado}</Text></View>
          </Card>
        )) : <Card style={styles.emptyActivity}><Ionicons name="checkmark-done-circle-outline" size={28} color={colors.secondary} /><Text style={styles.emptyText}>No hay reportes recientes. ¡Todo está en orden!</Text></Card>}

        <Text style={styles.sectionTitle}>Acciones rápidas</Text>
        <View style={styles.actionsRow}>
          <Button title="Gestionar unidades" variant="outline" onPress={() => navigation.navigate('Unidades')} style={styles.actionButton} />
          <Button title="Ver quejas" variant="secondary" onPress={() => navigation.navigate('Quejas')} style={styles.actionButton} />
        </View>

        {unidades.length === 0 && !loading && (
          <Card style={{ marginTop: 8 }}>
            <Text style={styles.seedTitle}>No hay unidades registradas</Text>
            <Text style={styles.seedText}>
              Puedes generar 10 unidades de prueba con coordenadas de ejemplo para comenzar a probar la app.
            </Text>
            <Button title="Generar datos de prueba" onPress={handleSeed} loading={seeding} style={{ marginTop: 12 }} />
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

function StatCard({ icon, color, label, value }) {
  return (
    <Card style={styles.statCard}>
      <View style={[styles.iconCircle, { backgroundColor: color + '1A' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Card>
  );
}

function FleetRow({ label, value, total, color }) {
  const width = total ? `${Math.max((value / total) * 100, value ? 8 : 0)}%` : '0%';
  return <View style={styles.fleetRow}><View style={styles.fleetLabelRow}><View style={[styles.fleetDot, { backgroundColor: color }]} /><Text style={styles.fleetLabel}>{label}</Text><Text style={styles.fleetValue}>{value}</Text></View><View style={styles.track}><View style={[styles.progress, { width, backgroundColor: color }]} /></View></View>;
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  hero: { borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center', minHeight: 138, marginBottom: 12, shadowColor: colors.primary, shadowOpacity: 0.32, shadowRadius: 12, elevation: 6 },
  heroEyebrow: { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: '800', letterSpacing: 1.1, marginBottom: 7 },
  heroTitle: { color: colors.white, fontSize: 22, fontWeight: '800' },
  heroText: { color: 'rgba(255,255,255,0.84)', fontSize: 12, lineHeight: 18, marginTop: 6 },
  heroIcon: { width: 58, height: 58, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center', marginLeft: 12 },
  liveRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, paddingHorizontal: 4 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.secondary, marginRight: 7 },
  liveText: { color: colors.textSecondary, fontSize: 11, fontWeight: '600' },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: '800', marginBottom: 11 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionCaption: { color: colors.primary, fontSize: 12, fontWeight: '700', marginBottom: 11 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 },
  cardTitle: { color: colors.text, fontSize: 15, fontWeight: '800' },
  cardSubtitle: { color: colors.textSecondary, fontSize: 11, marginTop: 3 },
  fleetRow: { marginBottom: 12 },
  fleetLabelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  fleetDot: { width: 7, height: 7, borderRadius: 4, marginRight: 7 },
  fleetLabel: { color: colors.textSecondary, fontSize: 12, flex: 1 },
  fleetValue: { color: colors.text, fontSize: 12, fontWeight: '800' },
  track: { height: 7, borderRadius: 4, backgroundColor: colors.input, overflow: 'hidden' },
  progress: { height: '100%', borderRadius: 4 },
  activityCard: { flexDirection: 'row', alignItems: 'center', padding: 13 },
  activityIcon: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  activityTitle: { color: colors.text, fontSize: 13, fontWeight: '700' },
  activityText: { color: colors.textSecondary, fontSize: 11, marginTop: 3 },
  statusPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 9, marginLeft: 8 },
  statusText: { fontSize: 9, fontWeight: '800' },
  emptyActivity: { alignItems: 'center', paddingVertical: 24 },
  emptyText: { color: colors.textSecondary, fontSize: 12, marginTop: 8, textAlign: 'center' },
  actionsRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  actionButton: { flex: 1 },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  seedTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  seedText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 6,
    lineHeight: 18,
  },
});
