import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Toast from 'react-native-toast-message';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';
import colors from '../../styles/colors';
import { useAuth } from '../../hooks/useAuth';
import { updateSubscriptionPlan } from '../../firebase/authService';

const PLANS = [
  { id: 'free', name: 'Gratis', price: '$0', routes: '1 ruta', reports: '1 reporte al día' },
  { id: 'economico', name: 'Económico', price: '$0,99 / mes', routes: 'Hasta 6 rutas', reports: '5 reportes al día' },
  { id: 'plus', name: 'Plus', price: '$2,99 / mes', routes: 'Rutas ilimitadas', reports: 'Reportes ilimitados' },
];

export default function SubscriptionScreen({ navigation }) {
  const { profile, refreshProfile } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState(null);

  const selectPlan = async (plan) => {
    if (plan === profile?.plan) return;
    setLoadingPlan(plan);
    try {
      await updateSubscriptionPlan(plan);
      await refreshProfile();
      Toast.show({ type: 'success', text1: `Plan ${PLANS.find((item) => item.id === plan).name} activado` });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'No se pudo cambiar el plan', text2: error.message });
    } finally { setLoadingPlan(null); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Planes" subtitle="Elige cómo quieres usar EDGO" showBack />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.note}>Los cambios son de demostración; todavía no se realiza un cobro real.</Text>
        {PLANS.map((plan) => {
          const active = profile?.plan === plan.id;
          return <Card key={plan.id} style={[styles.plan, active && styles.active]}>
            <View style={styles.titleRow}><Text style={styles.name}>{plan.name}</Text><Text style={styles.price}>{plan.price}</Text></View>
            <Text style={styles.item}>• {plan.routes}</Text>
            <Text style={styles.item}>• {plan.reports}</Text>
            <Button title={active ? 'Plan actual' : `Elegir ${plan.name}`} variant={active ? 'outline' : 'primary'} disabled={active} loading={loadingPlan === plan.id} onPress={() => selectPlan(plan.id)} style={{ marginTop: 16 }} />
          </Card>;
        })}
        <Button title="Elegir las rutas de mi plan" variant="outline" onPress={() => navigation.navigate('RouteSelection', { fromProfile: true })} style={{ marginTop: 2 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  note: { color: colors.textSecondary, fontSize: 12, lineHeight: 18, marginBottom: 12 },
  plan: { marginBottom: 14 }, active: { borderWidth: 2, borderColor: colors.secondary },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  name: { fontSize: 19, fontWeight: '800', color: colors.text }, price: { fontSize: 15, fontWeight: '700', color: colors.secondary },
  item: { color: colors.textSecondary, fontSize: 13, marginVertical: 3 },
});
