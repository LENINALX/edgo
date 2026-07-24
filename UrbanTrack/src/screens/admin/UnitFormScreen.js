// src/screens/admin/UnitFormScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Toast from 'react-native-toast-message';
import Header from '../../components/Header';
import Input from '../../components/Input';
import Button from '../../components/Button';
import colors from '../../styles/colors';
import { ESTADOS_UNIDAD } from '../../utils/constants';
import { isRequired } from '../../utils/validators';
import { addUnidad, updateUnidad } from '../../firebase/firestoreService';

export default function UnitFormScreen({ route, navigation }) {
  const unidadExistente = route.params?.unidad;
  const esEdicion = !!unidadExistente;

  const [numero, setNumero] = useState(unidadExistente?.numero || '');
  const [placa, setPlaca] = useState(unidadExistente?.placa || '');
  const [conductor, setConductor] = useState(unidadExistente?.conductor || '');
  const [ruta, setRuta] = useState(unidadExistente?.ruta || '');
  const [latitud, setLatitud] = useState(unidadExistente ? String(unidadExistente.latitud) : '-0.1807');
  const [longitud, setLongitud] = useState(unidadExistente ? String(unidadExistente.longitud) : '-78.4678');
  const [velocidad, setVelocidad] = useState(unidadExistente ? String(unidadExistente.velocidad) : '0');
  const [estado, setEstado] = useState(unidadExistente?.estado || ESTADOS_UNIDAD[0]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const newErrors = {
      numero: isRequired(numero),
      placa: isRequired(placa),
      conductor: isRequired(conductor),
      ruta: isRequired(ruta),
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    const data = {
      numero: numero.trim(),
      placa: placa.trim(),
      conductor: conductor.trim(),
      ruta: ruta.trim(),
      latitud: parseFloat(latitud) || 0,
      longitud: parseFloat(longitud) || 0,
      velocidad: parseInt(velocidad, 10) || 0,
      estado,
    };

    setLoading(true);
    try {
      if (esEdicion) {
        await updateUnidad(unidadExistente.id, data);
        Toast.show({ type: 'success', text1: 'Unidad actualizada' });
      } else {
        await addUnidad(data);
        Toast.show({ type: 'success', text1: 'Unidad creada correctamente' });
      }
      navigation.goBack();
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Ocurrió un error al guardar' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title={esEdicion ? 'Editar unidad' : 'Nueva unidad'} showBack />
      <ScrollView contentContainerStyle={styles.container}>
        <Input label="Número de unidad" value={numero} onChangeText={setNumero} placeholder="Bus 11" error={errors.numero} />
        <Input label="Placa" value={placa} onChangeText={setPlaca} placeholder="PBT-011" error={errors.placa} />
        <Input label="Conductor" value={conductor} onChangeText={setConductor} placeholder="Nombre del conductor" error={errors.conductor} />
        <Input label="Ruta" value={ruta} onChangeText={setRuta} placeholder="Centro - Norte" error={errors.ruta} />

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Input label="Latitud" value={latitud} onChangeText={setLatitud} keyboardType="numeric" />
          </View>
          <View style={{ flex: 1 }}>
            <Input label="Longitud" value={longitud} onChangeText={setLongitud} keyboardType="numeric" />
          </View>
        </View>

        <Input label="Velocidad (km/h)" value={velocidad} onChangeText={setVelocidad} keyboardType="numeric" />

        <Text style={styles.label}>Estado</Text>
        <View style={styles.chipsContainer}>
          {ESTADOS_UNIDAD.map((e) => (
            <TouchableOpacity
              key={e}
              style={[styles.chip, estado === e && styles.chipSelected]}
              onPress={() => setEstado(e)}
            >
              <Text style={[styles.chipText, estado === e && styles.chipTextSelected]}>{e}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Button
          title={esEdicion ? 'Guardar cambios' : 'Crear unidad'}
          onPress={handleSubmit}
          loading={loading}
          style={{ marginTop: 16 }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 50,
  },
  row: {
    flexDirection: 'row',
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
});
