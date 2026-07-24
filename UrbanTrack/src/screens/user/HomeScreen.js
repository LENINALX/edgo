// src/screens/user/HomeScreen.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import colors from '../../styles/colors';
import Card from '../../components/Card';
import { useAuth } from '../../hooks/useAuth';
import { useUnits } from '../../hooks/useUnits';

export default function HomeScreen() {
  const navigation = useNavigation();
  const { profile } = useAuth();
  const { unidades, loading } = useUnits();

  const enServicio = unidades.filter((u) => u.estado === 'En servicio').length;
  const unidadDestacada = unidades.find((u) => u.estado === 'En servicio') || unidades[0];
  const greeting = new Date().getHours() < 12 ? 'Buenos días' : new Date().getHours() < 19 ? 'Buenas tardes' : 'Buenas noches';
  const planName = { free: 'Gratis', economico: 'Económico', plus: 'Plus' }[profile?.plan] || 'Gratis';

  const shortcuts = [
    { label: 'Ver mapa', icon: 'map-outline', screen: 'Mapa', color: colors.primary },
    { label: 'Nueva queja', icon: 'document-text-outline', screen: 'Quejas', color: colors.secondary },
    { label: 'Mis quejas', icon: 'list-outline', screen: 'Quejas', color: colors.primary },
    { label: 'Mi perfil', icon: 'person-outline', screen: 'Perfil', color: colors.secondary },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingTop: 30 }}>
      <Card style={styles.hero}>
        <View style={{ flex: 1 }}>
          <Text style={styles.heroEyebrow}>BIENVENIDO A EDGO</Text>
          <Text style={styles.greeting}>{greeting}, {profile?.nombre?.split(' ')[0] || 'usuario'} 👋</Text>
          <Text style={styles.subtitle}>Tu ciudad se mueve contigo</Text>
        </View>
        <View style={styles.heroIcon}><Ionicons name="bus" size={34} color={colors.primary} /></View>
      </Card>

      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Ionicons name="bus" size={24} color={colors.primary} />
          <Text style={styles.statNumber}>{loading ? '—' : unidades.length}</Text>
          <Text style={styles.statLabel}>Unidades totales</Text>
        </Card>
        <Card style={[styles.statCard, { marginLeft: 12 }]}>
          <Ionicons name="checkmark-circle" size={24} color={colors.secondary} />
          <Text style={styles.statNumber}>{loading ? '—' : enServicio}</Text>
          <Text style={styles.statLabel}>En servicio</Text>
        </Card>
      </View>

      <View style={styles.liveBanner}>
        <View style={styles.liveDot} />
        <View style={{ flex: 1 }}><Text style={styles.liveTitle}>Servicio en vivo</Text><Text style={styles.liveText}>{enServicio ? `${enServicio} unidades están disponibles cerca de ti` : 'No hay unidades en servicio por el momento'}</Text></View>
        <Ionicons name="radio-outline" size={21} color={colors.secondary} />
      </View>

      {unidadDestacada ? <Card style={styles.featuredCard}>
        <View style={styles.featuredTop}><View style={styles.featuredIcon}><Ionicons name="bus" size={23} color={colors.primary} /></View><View style={{ flex: 1 }}><Text style={styles.featuredLabel}>UNIDAD DESTACADA</Text><Text style={styles.featuredNumber}>{unidadDestacada.numero}</Text></View><TouchableOpacity onPress={() => navigation.navigate('Mapa')} style={styles.mapButton}><Ionicons name="map-outline" size={18} color={colors.primary} /></TouchableOpacity></View>
        <View style={styles.featuredInfo}><Text style={styles.featuredRoute}>Ruta {unidadDestacada.ruta}</Text><Text style={styles.featuredMeta}>{unidadDestacada.velocidad || 0} km/h · {unidadDestacada.estado}</Text></View>
      </Card> : null}

      <Text style={styles.sectionTitle}>Accesos rápidos</Text>
      <View style={styles.grid}>
        {shortcuts.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={styles.gridItem}
            activeOpacity={0.8}
            onPress={() => navigation.navigate(item.screen)}
          >
            <View style={[styles.gridIcon, { backgroundColor: item.color + '1A' }]}>
              <Ionicons name={item.icon} size={22} color={item.color} />
            </View>
            <Text style={styles.gridLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity activeOpacity={0.85} style={styles.planBanner} onPress={() => navigation.navigate('Perfil')}>
        <View style={styles.planIcon}><Ionicons name="sparkles-outline" size={20} color={colors.warning} /></View>
        <View style={{ flex: 1 }}><Text style={styles.planTitle}>Plan {planName}</Text><Text style={styles.planText}>{profile?.plan === 'plus' ? 'Disfrutas rutas ilimitadas' : 'Explora los beneficios para tus viajes'}</Text></View>
        <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  greeting: {
    fontSize: 23,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    color: colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
  },
  hero: { padding: 20, minHeight: 132, flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  heroEyebrow: { color: colors.primary, fontSize: 10, fontWeight: '800', letterSpacing: 1.2, marginBottom: 7 },
  heroIcon: { width: 62, height: 62, borderRadius: 21, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  statCard: {
    flex: 1,
    alignItems: 'flex-start',
    paddingVertical: 20,
  },
  liveBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.secondaryLight, borderRadius: 15, borderWidth: 1, borderColor: '#2C5E55', padding: 13, marginTop: 14, marginBottom: 16 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.secondary, marginRight: 9 },
  liveTitle: { color: colors.secondary, fontSize: 12, fontWeight: '800' },
  liveText: { color: colors.textSecondary, fontSize: 11, marginTop: 3 },
  featuredCard: { padding: 15 },
  featuredTop: { flexDirection: 'row', alignItems: 'center' },
  featuredIcon: { width: 45, height: 45, borderRadius: 14, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  featuredLabel: { color: colors.textSecondary, fontSize: 9, fontWeight: '800', letterSpacing: 0.7 },
  featuredNumber: { color: colors.text, fontSize: 17, fontWeight: '800', marginTop: 2 },
  mapButton: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.input, alignItems: 'center', justifyContent: 'center' },
  featuredInfo: { marginTop: 13, paddingTop: 11, borderTopWidth: 1, borderTopColor: colors.border },
  featuredRoute: { color: colors.text, fontSize: 12, fontWeight: '700' },
  featuredMeta: { color: colors.textSecondary, fontSize: 11, marginTop: 4 },
  planBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 14, marginTop: 5, marginBottom: 20 },
  planIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.warning + '18', marginRight: 10 },
  planTitle: { color: colors.text, fontSize: 13, fontWeight: '800' },
  planText: { color: colors.textSecondary, fontSize: 11, marginTop: 3 },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginTop: 10,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  gridIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  gridLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
});
