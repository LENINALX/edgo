// src/components/ComplaintCard.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../styles/colors';
import { ESTADO_COLOR } from '../utils/constants';

export default function ComplaintCard({ queja, unidadNumero, onPress, onConfirm, confirming = false }) {
  const estadoColor = ESTADO_COLOR[queja.estado] || colors.textSecondary;
  const fecha = queja.fecha?.toDate ? queja.fecha.toDate() : new Date(queja.fecha);

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={styles.card}>
      <View style={styles.iconContainer}>
        <Ionicons name="alert-circle-outline" size={22} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.rowBetween}>
          <Text style={styles.tipo}>{queja.tipo}</Text>
          <View style={[styles.badge, { backgroundColor: estadoColor + '22' }]}>
            <Text style={[styles.badgeText, { color: estadoColor }]}>{queja.estado}</Text>
          </View>
        </View>
        {unidadNumero ? <Text style={styles.unidad}>{unidadNumero}</Text> : null}
        <Text style={styles.descripcion} numberOfLines={2}>
          {queja.descripcion}
        </Text>
        <Text style={styles.fecha}>{fecha.toLocaleDateString()}</Text>
        {onConfirm ? <TouchableOpacity disabled={confirming} onPress={onConfirm} style={[styles.confirmButton, queja.confirmadoPorMi && styles.confirmButtonActive]}>
          <Ionicons name={queja.confirmadoPorMi ? 'checkmark-circle' : 'thumbs-up-outline'} size={15} color={queja.confirmadoPorMi ? colors.secondary : colors.primary} />
          <Text style={[styles.confirmText, queja.confirmadoPorMi && { color: colors.secondary }]}>{queja.confirmadoPorMi ? 'Confirmada por ti' : 'Me pasó también'} · {queja.confirmaciones || 0}</Text>
        </TouchableOpacity> : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tipo: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  unidad: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  descripcion: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  fecha: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  confirmButton: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', marginTop: 10, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 9, backgroundColor: colors.primaryLight },
  confirmButtonActive: { backgroundColor: colors.secondaryLight },
  confirmText: { color: colors.primary, fontSize: 10, fontWeight: '800', marginLeft: 5 },
});
