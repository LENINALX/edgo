// src/screens/auth/RegisterScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import colors from '../../styles/colors';
import { isRequired, isValidEmail, isValidPassword, passwordsMatch } from '../../utils/validators';
import { registerUser } from '../../firebase/authService';
import { getUnidades } from '../../firebase/firestoreService';

export default function RegisterScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [hiddenPass, setHiddenPass] = useState(true);
  const [hiddenConfirm, setHiddenConfirm] = useState(true);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Rol: 'usuario' (ciudadano) o 'conductor' (maneja una unidad y comparte su ubicación)
  const [rol, setRol] = useState('usuario');
  const [unidades, setUnidades] = useState([]);
  const [unidadId, setUnidadId] = useState(null);
  const plan = route.params?.plan || 'free';

  useEffect(() => {
    if (rol === 'conductor' && unidades.length === 0) {
      getUnidades().then(setUnidades).catch(() => {});
    }
  }, [rol]);

  const handleRegister = async () => {
    const newErrors = {
      nombre: isRequired(nombre),
      correo: isValidEmail(correo),
      contrasena: isValidPassword(contrasena),
      confirmar: passwordsMatch(contrasena, confirmar),
      unidad: rol === 'conductor' ? isRequired(unidadId) : null,
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    setLoading(true);
    try {
      await registerUser({
        nombre: nombre.trim(),
        correo: correo.trim(),
        contrasena,
        rol,
        unidadId: rol === 'conductor' ? unidadId : null,
        plan,
      });
      Toast.show({ type: 'success', text1: 'Cuenta creada correctamente' });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'No se pudo crear la cuenta',
        text2: error.message?.includes('email-already') ? 'Ese correo ya está registrado' : 'Inténtalo de nuevo',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) + 8 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crear cuenta</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.logoBox}>
          <Ionicons name="person-add" size={30} color={colors.text} />
        </View>
        <Text style={styles.title}>Regístrate</Text>
        <Text style={styles.subtitle}>Crea tu cuenta para reportar y consultar unidades</Text>

        {/* Selector de tipo de cuenta */}
        <Text style={styles.label}>TIPO DE CUENTA</Text>
        <View style={styles.roleRow}>
          <TouchableOpacity
            style={[styles.roleOption, rol === 'usuario' && styles.roleOptionSelected]}
            onPress={() => setRol('usuario')}
          >
            <Ionicons name="person-outline" size={16} color={rol === 'usuario' ? colors.text : colors.textSecondary} />
            <Text style={[styles.roleText, rol === 'usuario' && styles.roleTextSelected]}>Ciudadano</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roleOption, rol === 'conductor' && styles.roleOptionSelected]}
            onPress={() => setRol('conductor')}
          >
            <Ionicons name="bus-outline" size={16} color={rol === 'conductor' ? colors.text : colors.textSecondary} />
            <Text style={[styles.roleText, rol === 'conductor' && styles.roleTextSelected]}>Conductor</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>NOMBRE COMPLETO</Text>
        <View style={[styles.inputContainer, errors.nombre && styles.inputError]}>
          <TextInput
            value={nombre}
            onChangeText={setNombre}
            placeholder="Tu nombre"
            placeholderTextColor={colors.textSecondary}
            style={styles.input}
          />
        </View>
        {errors.nombre ? <Text style={styles.errorText}>{errors.nombre}</Text> : null}

        <Text style={styles.label}>CORREO ELECTRÓNICO</Text>
        <View style={[styles.inputContainer, errors.correo && styles.inputError]}>
          <TextInput
            value={correo}
            onChangeText={setCorreo}
            placeholder="tu@correo.com"
            placeholderTextColor={colors.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
        </View>
        {errors.correo ? <Text style={styles.errorText}>{errors.correo}</Text> : null}

        <Text style={styles.label}>CONTRASEÑA</Text>
        <View style={[styles.inputContainer, errors.contrasena && styles.inputError]}>
          <TextInput
            value={contrasena}
            onChangeText={setContrasena}
            placeholder="Mínimo 6 caracteres"
            placeholderTextColor={colors.textSecondary}
            secureTextEntry={hiddenPass}
            style={styles.input}
          />
          <TouchableOpacity onPress={() => setHiddenPass(!hiddenPass)}>
            <Ionicons name={hiddenPass ? 'eye-off-outline' : 'eye-outline'} size={19} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
        {errors.contrasena ? <Text style={styles.errorText}>{errors.contrasena}</Text> : null}

        <Text style={styles.label}>CONFIRMAR CONTRASEÑA</Text>
        <View style={[styles.inputContainer, errors.confirmar && styles.inputError]}>
          <TextInput
            value={confirmar}
            onChangeText={setConfirmar}
            placeholder="Repite tu contraseña"
            placeholderTextColor={colors.textSecondary}
            secureTextEntry={hiddenConfirm}
            style={styles.input}
          />
          <TouchableOpacity onPress={() => setHiddenConfirm(!hiddenConfirm)}>
            <Ionicons name={hiddenConfirm ? 'eye-off-outline' : 'eye-outline'} size={19} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
        {errors.confirmar ? <Text style={styles.errorText}>{errors.confirmar}</Text> : null}

        {/* Selección de unidad, solo si es conductor */}
        {rol === 'conductor' && (
          <>
            <Text style={styles.label}>UNIDAD QUE VAS A MANEJAR</Text>
            {unidades.length === 0 ? (
              <Text style={styles.helperText}>
                Aún no hay unidades registradas. Pide a un administrador que cree una unidad primero.
              </Text>
            ) : (
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
            )}
            {errors.unidad ? <Text style={styles.errorText}>{errors.unidad}</Text> : null}
          </>
        )}

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleRegister}
          disabled={loading}
          style={[styles.registerButton, loading && { opacity: 0.7 }]}
        >
          <Text style={styles.registerButtonText}>{loading ? 'Creando cuenta...' : 'Registrarme'}</Text>
        </TouchableOpacity>

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Inicia sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },
  backButton: {
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 10,
    paddingBottom: 40,
  },
  logoBox: {
    width: 70,
    height: 70,
    borderRadius: 18,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 26,
    marginTop: 4,
    paddingHorizontal: 10,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.label,
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 4,
  },
  roleRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  roleOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 12,
    marginRight: 8,
  },
  roleOptionSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  roleText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: 6,
  },
  roleTextSelected: {
    color: colors.text,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.input,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    marginBottom: 6,
  },
  inputError: {
    borderColor: '#E05C5C',
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 14,
    color: colors.text,
  },
  errorText: {
    color: '#E05C5C',
    fontSize: 11,
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 10,
    lineHeight: 17,
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
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  chipText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: colors.text,
  },
  registerButton: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  registerButtonText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 22,
  },
  loginText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  loginLink: {
    color: colors.accentLight,
    fontSize: 13,
    fontWeight: '700',
  },
});
