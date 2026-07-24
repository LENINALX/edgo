// src/screens/user/MyComplaintsScreen.js
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Header from '../../components/Header';
import ComplaintCard from '../../components/ComplaintCard';
import EmptyState from '../../components/EmptyState';
import Loading from '../../components/Loading';
import colors from '../../styles/colors';
import { useAuth } from '../../hooks/useAuth';
import { useComplaints } from '../../hooks/useComplaints';
import { getQuejasComunidad, toggleConfirmacionQueja } from '../../firebase/firestoreService';

export default function MyComplaintsScreen({ navigation }) {
  const { profile } = useAuth();
  const { quejas, loading, refreshing, onRefresh, refetch } = useComplaints(profile?.id, false);
  const [tab, setTab] = useState('mine');
  const [community, setCommunity] = useState([]);
  const [communityLoading, setCommunityLoading] = useState(true);
  const [communityRefreshing, setCommunityRefreshing] = useState(false);
  const [confirmingId, setConfirmingId] = useState(null);

  const loadCommunity = useCallback(async () => {
    try { setCommunity(await getQuejasComunidad()); } catch (error) { console.log('Error cargando comunidad:', error.message); } finally { setCommunityLoading(false); setCommunityRefreshing(false); }
  }, []);
  useEffect(() => { loadCommunity(); }, [loadCommunity]);
  // Al volver desde "Nueva queja" la pantalla no se desmonta. Esta escucha
  // asegura que el reporte recién enviado aparezca de inmediato.
  useFocusEffect(useCallback(() => {
    refetch();
    loadCommunity();
  }, [refetch, loadCommunity]));

  const handleRefresh = async () => {
    setCommunityRefreshing(true);
    onRefresh();
    await loadCommunity();
  };
  const confirmComplaint = async (id) => {
    setConfirmingId(id);
    try {
      const result = await toggleConfirmacionQueja(id);
      setCommunity((items) => items.map((item) => item.id === id ? { ...item, confirmadoPorMi: result.confirmed, confirmaciones: result.confirmations_count } : item));
    } finally { setConfirmingId(null); }
  };

  const isCommunity = tab === 'community';
  const displayed = isCommunity ? community : quejas;

  if ((loading && !isCommunity) || (communityLoading && isCommunity)) return <Loading text={isCommunity ? "Cargando reportes de la comunidad..." : "Cargando tus quejas..."} />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header
        title={isCommunity ? "Comunidad" : "Mis quejas"}
        subtitle={isCommunity ? `${community.length} reportes de otros usuarios` : `${quejas.length} reportes enviados`}
        rightIcon="add-circle-outline"
        onRightPress={() => navigation.navigate('NewComplaint')}
      />
      <View style={styles.tabs}><TouchableOpacity onPress={() => setTab('mine')} style={[styles.tab, !isCommunity && styles.tabActive]}><Ionicons name="person-outline" size={16} color={!isCommunity ? colors.primary : colors.textSecondary} /><Text style={[styles.tabText, !isCommunity && styles.tabTextActive]}>Mis reportes</Text></TouchableOpacity><TouchableOpacity onPress={() => setTab('community')} style={[styles.tab, isCommunity && styles.tabActive]}><Ionicons name="people-outline" size={16} color={isCommunity ? colors.primary : colors.textSecondary} /><Text style={[styles.tabText, isCommunity && styles.tabTextActive]}>Comunidad</Text></TouchableOpacity></View>
      <FlatList
        data={displayed}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing || communityRefreshing} onRefresh={handleRefresh} colors={[colors.primary]} />}
        renderItem={({ item }) => <ComplaintCard queja={item} onPress={() => {}} onConfirm={isCommunity ? () => confirmComplaint(item.id) : undefined} confirming={confirmingId === item.id} />}
        ListEmptyComponent={
          <EmptyState
            icon="document-text-outline"
            title={isCommunity ? "Aún no hay reportes comunitarios" : "Aún no tienes quejas"}
            message={isCommunity ? "Los reportes de otros usuarios aparecerán aquí para que puedas confirmarlos." : "Cuando reportes una incidencia sobre una unidad, aparecerá aquí."}
          />
        }
      />
      {displayed.length > 0 && (
        <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('NewComplaint')}>
          <Ionicons name="add" size={26} color={colors.white} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  tabs: { flexDirection: 'row', marginHorizontal: 20, marginTop: 8, marginBottom: 6, backgroundColor: colors.input, borderRadius: 14, padding: 4 },
  tab: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 10, borderRadius: 10 },
  tabActive: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  tabText: { color: colors.textSecondary, fontSize: 11, fontWeight: '700', marginLeft: 5 },
  tabTextActive: { color: colors.primary },
});
