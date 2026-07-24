// src/screens/auth/ForgotPasswordScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import colors from '../../styles/colors';
import { isValidEmail } from '../../utils/validators';
import { resetPassword } from '../../firebase/authService';

export default function ForgotPasswordScreen({ navigation }) {
  const [correo, setCorreo] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const handleReset = async () => {
    const validation = isValidEmail(correo);
    setError(validation);
    if (validation) return;

    setLoading(true);
    try {
      await resetPassword(correo.trim());
      setEnviado(true);
      Toast.show({ type: 'success', text1: 'Correo de recuperación enviado' });
    } catch (err) {
      Toast.show({ type: 'error', text1: 'No se pudo enviar el correo', text2: 'Verifica que sea correcto' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recuperar contraseña</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {enviado ? (
          <View style={styles.centered}>
            <View style={styles.successCircle}>
              <Ionicons name="checkmark" size={40} color={colors.text} />
            </View>
            <Text style={styles.successTitle}>Revisa tu correo</Text>
            <Text style={styles.successMessage}>
              Te enviamos un enlace a {correo} para restablecer tu contraseña.
            </Text>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => navigation.navigate('Login')}
              style={styles.actionButton}
            >
              <Text style={styles.actionButtonText}>Volver al inicio de sesión</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.logoBox}>
              <Ionicons name="key-outline" size={30} color={colors.text} />
            </View>
            <Text style={styles.title}>¿Olvidaste tu contraseña?</Text>
            <Text style={styles.description}>
              Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
            </Text>

            <Text style={styles.label}>CORREO ELECTRÓNICO</Text>
            <View style={[styles.inputContainer, error && styles.inputError]}>
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
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleReset}
              disabled={loading}
              style={[styles.actionButton, loading && { opacity: 0.7 }]}
            >
              <Text style={styles.actionButtonText}>{loading ? 'Enviando...' : 'Enviar enlace'}</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
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
    paddingTop: 20,
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
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  description: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 26,
    lineHeight: 19,
    paddingHorizontal: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.label,
    letterSpacing: 0.5,
    marginBottom: 8,
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
  actionButton: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  actionButtonText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
  },
  successCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: colors.text,
  },
  successMessage: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
    lineHeight: 19,
  },
});
