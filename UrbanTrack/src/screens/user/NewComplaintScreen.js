// src/screens/user/NewComplaintScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import Toast from 'react-native-toast-message';
import Header from '../../components/Header';
import Input from '../../components/Input';
import Button from '../../components/Button';
import colors from '../../styles/colors';
import { TIPOS_QUEJA } from '../../utils/constants';
import { isRequired, isValidComplaintDescription } from '../../utils/validators';
import { addQueja } from '../../firebase/firestoreService';
import { getUnidades } from '../../firebase/firestoreService';
import { useAuth } from '../../hooks/useAuth';

export default function NewComplaintScreen({ route, navigation }) {
  const { profile } = useAuth();
  const preselectedUnidadId = route.params?.unidadId;
  const preselectedUnidadNumero = route.params?.unidadNumero;

  const [unidades, setUnidades] = useState([]);
  const [unidadId, setUnidadId] = useState(preselectedUnidadId || null);
  const [tipo, setTipo] = useState(null);
  const [descripcion, setDescripcion] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!preselectedUnidadId) {
      getUnidades().then(setUnidades);
    }
  }, []);

  const handleSubmit = async () => {
    const newErrors = {
      unidad: isRequired(unidadId),
      tipo: isRequired(tipo),
      descripcion: isValidComplaintDescription(descripcion),
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    setLoading(true);
    try {
      await addQueja({
        usuarioId: profile.id,
        unidadId,
        tipo,
        descripcion: descripcion.trim(),
      });
      Toast.show({ type: 'success', text1: 'Queja enviada correctamente' });
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'No se pudo enviar la queja. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Nueva queja" subtitle="Cuéntanos qué sucedió" showBack />
      <ScrollView contentContainerStyle={styles.container}>
        {preselectedUnidadNumero ? (
          <View style={styles.unidadFija}>
            <Text style={styles.unidadFijaText}>Unidad: {preselectedUnidadNumero}</Text>
          </View>
        ) : (
          <>
            <Text style={styles.label}>Selecciona la unidad</Text>
            <View style={styles.chipsContainer}>
              {unidades.map((u) => (
                <TouchableOpacity
                  key={u.id}
                  style={[styles.chip, unidadId === u.id && styles.chipSelected]}
                  onPress={() => setUnidadId(u.id)}
                >
                  <Text style={[styles.chipText, unidadId === u.id && styles.chipTextSelected]}>
                    {u.numero}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.unidad ? <Text style={styles.errorText}>{errors.unidad}</Text> : null}
          </>
        )}

        <Text style={styles.label}>Tipo de queja</Text>
        <View style={styles.chipsContainer}>
          {TIPOS_QUEJA.map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.chip, tipo === t && styles.chipSelected]}
              onPress={() => setTipo(t)}
            >
              <Text style={[styles.chipText, tipo === t && styles.chipTextSelected]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.tipo ? <Text style={styles.errorText}>{errors.tipo}</Text> : null}

        <Input
          label="Descripción (mínimo 20 caracteres)"
          value={descripcion}
          onChangeText={setDescripcion}
          placeholder="Describe con detalle lo que ocurrió..."
          multiline
          error={errors.descripcion}
        />

        <Button title="Enviar queja" onPress={handleSubmit} loading={loading} style={{ marginTop: 8 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 50,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 6,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.input,
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: colors.white,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    marginBottom: 10,
  },
  unidadFija: {
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  unidadFijaText: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
});
