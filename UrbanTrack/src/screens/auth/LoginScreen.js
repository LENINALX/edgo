// src/screens/auth/LoginScreen.js
import React, { useState } from 'react';
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
import Toast from 'react-native-toast-message';
import colors from '../../styles/colors';
import { isValidEmail, isRequired } from '../../utils/validators';
import { loginUser } from '../../firebase/authService';

export default function LoginScreen({ navigation }) {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [hiddenPass, setHiddenPass] = useState(true);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const newErrors = {
      correo: isValidEmail(correo),
      contrasena: isRequired(contrasena),
    };
    setErrors(newErrors);
    if (newErrors.correo || newErrors.contrasena) return;

    setLoading(true);
    try {
      await loginUser(correo.trim(), contrasena);
      Toast.show({ type: 'success', text1: 'Bienvenido a EDGO' });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'No se pudo iniciar sesión',
        text2: 'Verifica tu correo y contraseña',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialPress = (proveedor) => {
    Toast.show({ type: 'info', text1: `Inicio con ${proveedor} próximamente` });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.logoBox}>
          <Ionicons name="bus" size={34} color={colors.text} />
        </View>
        <Text style={styles.title}>Bienvenido</Text>
        <Text style={styles.subtitle}>Inicia sesión para continuar</Text>

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
            placeholder="••••••••"
            placeholderTextColor={colors.textSecondary}
            secureTextEntry={hiddenPass}
            style={styles.input}
          />
          <TouchableOpacity onPress={() => setHiddenPass(!hiddenPass)}>
            <Ionicons
              name={hiddenPass ? 'eye-off-outline' : 'eye-outline'}
              size={19}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
        {errors.contrasena ? <Text style={styles.errorText}>{errors.contrasena}</Text> : null}

        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={{ alignSelf: 'flex-end' }}>
          <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleLogin}
          disabled={loading}
          style={[styles.loginButton, loading && { opacity: 0.7 }]}
        >
          <Text style={styles.loginButtonText}>{loading ? 'Ingresando...' : 'Ingresar'}</Text>
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>o continúa con</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.socialRow}>
          <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialPress('Google')}>
            <Text style={styles.socialText}>Google</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialPress('Apple ID')}>
            <Text style={styles.socialText}>Apple ID</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialPress('Facebook')}>
            <Text style={styles.socialText}>Facebook</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.registerRow}>
          <Text style={styles.registerText}>¿No tienes cuenta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>Regístrate</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 40,
  },
  logoBox: {
    width: 76,
    height: 76,
    borderRadius: 20,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 18,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
    marginTop: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.label,
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 4,
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
  forgotText: {
    color: colors.accentLight,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 22,
  },
  loginButton: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 26,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    color: colors.textSecondary,
    fontSize: 11,
    marginHorizontal: 10,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  socialButton: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  socialText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 26,
  },
  registerText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  registerLink: {
    color: colors.accentLight,
    fontSize: 13,
    fontWeight: '700',
  },
});
