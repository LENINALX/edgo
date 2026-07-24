// src/screens/user/ProfileScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import colors from '../../styles/colors';
import { useAuth } from '../../hooks/useAuth';
import { updateUserProfile } from '../../firebase/authService';
import { logoutUser } from '../../firebase/authService';
import { isRequired } from '../../utils/validators';

export default function ProfileScreen({ navigation }) {
  const { profile, refreshProfile, isAdmin, isConductor } = useAuth();
  const [editando, setEditando] = useState(false);
  const [nombre, setNombre] = useState(profile?.nombre || '');
  const [loading, setLoading] = useState(false);
  const canViewPlans = navigation.getState?.().routeNames?.includes('Subscription');
  const planName = { free: 'Gratis', economico: 'Económico', plus: 'Plus' }[profile?.plan] || 'Gratis';
  const roleName = isAdmin ? 'Administrador' : isConductor ? 'Conductor' : 'Usuario EDGO';

  const handleSave = async () => {
    const error = isRequired(nombre);
    if (error) {
      Toast.show({ type: 'error', text1: error });
      return;
    }
    setLoading(true);
    try {
      await updateUserProfile(profile.id, { nombre: nombre.trim() });
      await refreshProfile();
      setEditando(false);
      Toast.show({ type: 'success', text1: 'Perfil actualizado' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'No se pudo actualizar el perfil' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Seguro que deseas salir de tu cuenta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: logoutUser },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Mi perfil" />
      <ScrollView contentContainerStyle={styles.container}>
        <Card style={styles.profileHero}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color={colors.primary} />
          </View>
          <Text style={styles.heroName}>{profile?.nombre}</Text>
          <Text style={styles.rol}>{roleName}</Text>
          <View style={styles.memberRow}><Ionicons name="shield-checkmark-outline" size={13} color={colors.textSecondary} /><Text style={styles.memberText}>Cuenta verificada EDGO</Text></View>
        </Card>

        <Card>
          <View style={styles.cardHeader}><View><Text style={styles.cardTitle}>Información personal</Text><Text style={styles.cardSubtitle}>Mantén tus datos actualizados</Text></View><View style={styles.cardIcon}><Ionicons name="person-outline" size={19} color={colors.primary} /></View></View>
          {editando ? (
            <>
              <Input label="Nombre completo" value={nombre} onChangeText={setNombre} />
              <View style={styles.buttonsRow}>
                <Button title="Cancelar" variant="outline" onPress={() => setEditando(false)} style={{ flex: 1, marginRight: 8 }} />
                <Button title="Guardar" onPress={handleSave} loading={loading} style={{ flex: 1 }} />
              </View>
            </>
          ) : (
            <>
              <InfoRow icon="person-outline" label="Nombre" value={profile?.nombre} />
              <InfoRow icon="mail-outline" label="Correo" value={profile?.correo} />
              <Button title="Editar perfil" variant="outline" onPress={() => setEditando(true)} style={{ marginTop: 16 }} />
            </>
          )}
        </Card>

        {!isAdmin && (
          <Card style={{ marginTop: 16 }}>
            <View style={styles.cardHeader}><View><Text style={styles.cardTitle}>Tu suscripción</Text><Text style={styles.cardSubtitle}>Beneficios para tus viajes</Text></View><View style={[styles.cardIcon, { backgroundColor: colors.secondaryLight }]}><Ionicons name="sparkles-outline" size={19} color={colors.secondary} /></View></View>
            <View style={styles.planRow}><View><Text style={styles.planName}>{planName}</Text><Text style={styles.planDetail}>{profile?.plan === 'plus' ? 'Rutas y reportes ilimitados' : profile?.plan === 'economico' ? 'Hasta 6 rutas disponibles' : '1 ruta disponible'}</Text></View><View style={styles.planPill}><Text style={styles.planPillText}>ACTIVO</Text></View></View>
            <Text style={styles.routesText}>{profile?.rutasSeleccionadas?.length || 0} ruta(s) elegida(s) para tu mapa</Text>
            {canViewPlans ? <Button title="Ver planes y beneficios" variant="secondary" onPress={() => navigation.navigate('Subscription')} style={{ marginTop: 16 }} /> : null}
          </Card>
        )}

        <Card style={{ marginTop: 2 }}>
          <Text style={styles.cardTitle}>Preferencias</Text>
          <InfoRow icon="notifications-outline" label="Notificaciones" value="Activadas" />
          <InfoRow icon="help-circle-outline" label="Soporte" value="Centro de ayuda" />
        </Card>

        <Button title="Cerrar sesión" variant="danger" onPress={handleLogout} style={{ marginTop: 20 }} />
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
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileHero: { alignItems: 'center', paddingVertical: 22, marginBottom: 20 },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  rol: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.secondary,
    backgroundColor: colors.secondaryLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  heroName: { fontSize: 20, fontWeight: '800', color: colors.text, marginBottom: 8 },
  memberRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  memberText: { color: colors.textSecondary, fontSize: 11, marginLeft: 5 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  cardTitle: { color: colors.text, fontSize: 15, fontWeight: '800' },
  cardSubtitle: { color: colors.textSecondary, fontSize: 11, marginTop: 3 },
  cardIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  planRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  planName: { color: colors.text, fontSize: 17, fontWeight: '800' },
  planDetail: { color: colors.textSecondary, fontSize: 11, marginTop: 4 },
  planPill: { backgroundColor: colors.secondaryLight, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 5 },
  planPillText: { color: colors.secondary, fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  routesText: { color: colors.textSecondary, fontSize: 11, marginTop: 2 },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
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
  buttonsRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
});
