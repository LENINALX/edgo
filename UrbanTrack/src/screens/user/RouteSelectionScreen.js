import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import Header from '../../components/Header';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import colors from '../../styles/colors';
import { getRutas, guardarRutasSeleccionadas } from '../../firebase/firestoreService';
import { useAuth } from '../../hooks/useAuth';

const PLAN_LIMITS = { free: 1, economico: 6, plus: Infinity };
const PLAN_NAMES = { free: 'Gratis', economico: 'Económico', plus: 'Plus' };

export default function RouteSelectionScreen({ navigation, route }) {
  const { profile, refreshProfile } = useAuth();
  const [routes, setRoutes] = useState([]);
  const [selected, setSelected] = useState(profile?.rutasSeleccionadas || []);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const limit = PLAN_LIMITS[profile?.plan] || 1;

  useEffect(() => { getRutas().then(setRoutes).catch((error) => Toast.show({ type: 'error', text1: 'No se pudieron cargar las rutas', text2: error.message })).finally(() => setLoading(false)); }, []);
  const limitText = Number.isFinite(limit) ? `Puedes elegir hasta ${limit} ${limit === 1 ? 'ruta' : 'rutas'}.` : 'Puedes elegir todas las rutas que quieras.';
  const toggleRoute = (id) => {
    const routeId = String(id);
    if (selected.includes(routeId)) return setSelected(selected.filter((value) => value !== routeId));
    if (selected.length >= limit) return Toast.show({ type: 'info', text1: 'Límite del plan alcanzado', text2: 'Mejora tu plan para agregar más rutas.' });
    setSelected([...selected, routeId]);
  };
  const save = async () => {
    if (!selected.length) return Toast.show({ type: 'error', text1: 'Elige al menos una ruta para continuar' });
    setSaving(true);
    try { await guardarRutasSeleccionadas(selected); await refreshProfile(); Toast.show({ type: 'success', text1: 'Rutas guardadas correctamente' }); if (route.params?.fromProfile) navigation.goBack(); } catch (error) { Toast.show({ type: 'error', text1: 'No se pudieron guardar las rutas', text2: error.message }); } finally { setSaving(false); }
  };

  if (loading) return <Loading text="Cargando rutas disponibles..." />;
  return <View style={styles.screen}><Header title="Elige tus rutas" subtitle={`Plan ${PLAN_NAMES[profile?.plan] || 'Gratis'}`} showBack={Boolean(route.params?.fromProfile)} /><ScrollView contentContainerStyle={styles.container}>
    <View style={styles.notice}><Ionicons name="map-outline" size={20} color={colors.secondary} /><View style={{ flex: 1 }}><Text style={styles.noticeTitle}>{limitText}</Text><Text style={styles.noticeText}>Estas serán las líneas visibles en tu mapa en vivo.</Text></View></View>
    <View style={styles.counter}><Text style={styles.counterText}>{selected.length}{Number.isFinite(limit) ? ` / ${limit}` : ''} rutas seleccionadas</Text><TouchableOpacity onPress={() => limit === Infinity && setSelected(routes.map((item) => String(item.id)))}><Text style={styles.allText}>{limit === Infinity ? 'Seleccionar todas' : ''}</Text></TouchableOpacity></View>
    {routes.map((item) => { const active = selected.includes(String(item.id)); return <TouchableOpacity key={item.id} activeOpacity={0.85} onPress={() => toggleRoute(item.id)} style={[styles.routeCard, active && styles.routeCardActive]}><View style={[styles.routeIcon, active && styles.routeIconActive]}><Ionicons name="bus-outline" size={20} color={active ? colors.white : colors.primary} /></View><View style={{ flex: 1 }}><Text style={styles.routeName}>{item.name}</Text><Text style={styles.routeDetail}>{item.origin} → {item.destination}</Text></View><View style={[styles.check, active && styles.checkActive]}>{active ? <Ionicons name="checkmark" size={15} color={colors.white} /> : null}</View></TouchableOpacity>; })}
    <Button title="Guardar mis rutas" onPress={save} loading={saving} style={{ marginTop: 10 }} />
  </ScrollView></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background }, container: { padding: 20, paddingTop: 8, paddingBottom: 40 },
  notice: { flexDirection: 'row', backgroundColor: colors.secondaryLight, borderWidth: 1, borderColor: '#2C5E55', borderRadius: 16, padding: 14, marginBottom: 16 }, noticeTitle: { color: colors.secondary, fontSize: 13, fontWeight: '800', marginLeft: 10 }, noticeText: { color: colors.textSecondary, fontSize: 11, lineHeight: 16, marginLeft: 10, marginTop: 3 },
  counter: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }, counterText: { color: colors.text, fontSize: 12, fontWeight: '700' }, allText: { color: colors.primary, fontSize: 12, fontWeight: '800' },
  routeCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 13, marginBottom: 10 }, routeCardActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  routeIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: colors.input, alignItems: 'center', justifyContent: 'center', marginRight: 11 }, routeIconActive: { backgroundColor: colors.primary }, routeName: { color: colors.text, fontSize: 14, fontWeight: '800' }, routeDetail: { color: colors.textSecondary, fontSize: 11, marginTop: 4 },
  check: { width: 23, height: 23, borderRadius: 12, borderWidth: 1, borderColor: colors.border, marginLeft: 8, alignItems: 'center', justifyContent: 'center' }, checkActive: { backgroundColor: colors.primary, borderColor: colors.primary },
});
