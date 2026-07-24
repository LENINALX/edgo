// src/screens/admin/ComplaintDetailScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import colors from '../../styles/colors';
import { ESTADOS_QUEJA, ESTADO_COLOR } from '../../utils/constants';
import { getQuejaById, updateQuejaEstado } from '../../firebase/firestoreService';

// Iconos por tipo de queja (ajusta las llaves a tus valores reales de "tipo")
const TIPO_ICON = {
  Retraso: 'time-outline',
  'Mal servicio': 'sad-outline',
  Seguridad: 'shield-outline',
  Unidad: 'bus-outline',
  default: 'alert-circle-outline',
};

// Iconos por estado (ajusta las llaves a tus ESTADOS_QUEJA reales)
const ESTADO_ICON = {
  Pendiente: 'time-outline',
  'En proceso': 'sync-outline',
  Resuelta: 'checkmark-circle-outline',
  Rechazada: 'close-circle-outline',
  default: 'ellipse-outline',
};

export default function ComplaintDetailScreen({ route }) {
  const { quejaId } = route.params;
  const [queja, setQueja] = useState(null);
  const [unidad, setUnidad] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const cargarDatos = async () => {
    const data = await getQuejaById(quejaId);
    setQueja(data);
    if (data) {
      setUnidad(data.unidad);
      setUsuario(data.usuario);
    }
    setLoading(false);
  };

  useEffect(() => {
    cargarDatos();
  }, [quejaId]);

  const handleEstadoChange = async (nuevoEstado) => {
    if (nuevoEstado === queja.estado) return;
    setUpdating(true);
    try {
      await updateQuejaEstado(quejaId, nuevoEstado);
      setQueja((prev) => ({ ...prev, estado: nuevoEstado }));
      Toast.show({ type: 'success', text1: `Queja marcada como "${nuevoEstado}"` });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'No se pudo actualizar el estado' });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <Loading text="Cargando queja..." />;

  if (!queja) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Header title="Queja no encontrada" showBack />
        <View style={styles.emptyState}>
          <Ionicons name="document-text-outline" size={48} color={colors.textSecondary} />
          <Text style={styles.emptyTitle}>No encontramos esta queja</Text>
          <Text style={styles.emptySubtitle}>
            Puede que haya sido eliminada o el enlace ya no sea válido.
          </Text>
        </View>
      </View>
    );
  }

  const fecha = queja.fecha?.toDate ? queja.fecha.toDate() : new Date(queja.fecha);
  const estadoColor = ESTADO_COLOR[queja.estado] || colors.textSecondary;
  const tipoIcon = TIPO_ICON[queja.tipo] || TIPO_ICON.default;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Detalle de queja" showBack />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Encabezado principal */}
        <Card style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={[styles.iconCircle, { backgroundColor: estadoColor + '1A' }]}>
              <Ionicons name={tipoIcon} size={22} color={estadoColor} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.tipo}>{queja.tipo}</Text>
              <View style={styles.fechaRow}>
                <Ionicons name="calendar-outline" size={13} color={colors.textSecondary} />
                <Text style={styles.fecha}>
                  {fecha.toLocaleDateString()} · {fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>
            <View style={[styles.badge, { backgroundColor: estadoColor + '1A' }]}>
              <View style={[styles.badgeDot, { backgroundColor: estadoColor }]} />
              <Text style={[styles.badgeText, { color: estadoColor }]}>{queja.estado}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.descripcion}>{queja.descripcion}</Text>
        </Card>

        {/* Info secundaria en dos columnas */}
        <View style={styles.infoRow}>
          <Card style={styles.infoCard}>
            <Ionicons name="bus-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.infoLabel}>Unidad reportada</Text>
            <Text style={styles.infoValue} numberOfLines={1}>
              {unidad ? `${unidad.numero}` : '—'}
            </Text>
            <Text style={styles.infoSubvalue} numberOfLines={1}>
              {unidad ? `Ruta ${unidad.ruta}` : 'No disponible'}
            </Text>
          </Card>

          <Card style={styles.infoCard}>
            <Ionicons name="person-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.infoLabel}>Reportado por</Text>
            <Text style={styles.infoValue} numberOfLines={1}>
              {usuario ? usuario.nombre : '—'}
            </Text>
            <Text style={styles.infoSubvalue} numberOfLines={1}>
              {usuario ? usuario.correo : 'No disponible'}
            </Text>
          </Card>
        </View>

        {/* Cambio de estado */}
        <Text style={styles.sectionTitle}>Cambiar estado</Text>
        <Card style={styles.estadosCard}>
          {ESTADOS_QUEJA.map((estadoOpcion, index) => {
            const isActive = queja.estado === estadoOpcion;
            const optColor = ESTADO_COLOR[estadoOpcion] || colors.textSecondary;
            const optIcon = ESTADO_ICON[estadoOpcion] || ESTADO_ICON.default;
            return (
              <React.Fragment key={estadoOpcion}>
                <Button
                  title={estadoOpcion}
                  variant={isActive ? 'primary' : 'outline'}
                  icon={
                    <Ionicons
                      name={optIcon}
                      size={16}
                      color={isActive ? colors.white ?? '#fff' : optColor}
                      style={{ marginRight: 6 }}
                    />
                  }
                  onPress={() => handleEstadoChange(estadoOpcion)}
                  loading={updating && !isActive}
                  disabled={updating}
                  style={styles.estadoButton}
                />
                {index < ESTADOS_QUEJA.length - 1 && <View style={{ height: 8 }} />}
              </React.Fragment>
            );
          })}
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    gap: 12,
  },
  heroCard: {
    padding: 16,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  tipo: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  fechaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  fecha: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border ?? '#EEE',
    marginVertical: 14,
  },
  descripcion: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 21,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  infoCard: {
    flex: 1,
    padding: 14,
  },
  infoLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 8,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  infoSubvalue: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginTop: 4,
    marginBottom: 2,
  },
  estadosCard: {
    padding: 12,
  },
  estadoButton: {
    justifyContent: 'flex-start',
    paddingHorizontal: 14,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 19,
  },
});