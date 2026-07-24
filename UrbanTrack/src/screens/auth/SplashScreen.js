// src/screens/auth/SplashScreen.js
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../../styles/colors';

export default function SplashScreen({ onFinish, loading }) {
  const scale = useRef(new Animated.Value(0.72)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 5, tension: 70, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 550, useNativeDriver: true }),
    ]).start();
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(float, { toValue: -8, duration: 1200, useNativeDriver: true }),
      Animated.timing(float, { toValue: 0, duration: 1200, useNativeDriver: true }),
    ]));
    loop.start();
    // Si Firebase ya terminó de cargar, esperamos un instante mínimo
    // para que el splash no parpadee, y luego avanzamos.
    if (!loading) {
      const timer = setTimeout(onFinish, 800);
      return () => { clearTimeout(timer); loop.stop(); };
    }
    return () => loop.stop();
  }, [loading]);

  return (
    <LinearGradient colors={['#111126', '#26204B', '#111126']} style={styles.container}>
      <View style={[styles.orb, styles.orbOne]} /><View style={[styles.orb, styles.orbTwo]} />
      <Animated.View style={{ alignItems: 'center', opacity, transform: [{ scale }, { translateY: float }] }}>
        <View style={styles.iconCircle}><Ionicons name="bus" size={48} color={colors.white} /></View>
        <Text style={styles.title}>EDGO</Text>
        <Text style={styles.subtitle}>Muévete. Conecta. Llega.</Text>
      </Animated.View>
      <View style={styles.loadingRow}><ActivityIndicator color={colors.secondary} /><Text style={styles.loadingText}>Preparando tu viaje</Text></View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  iconCircle: {
    width: 104,
    height: 104,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    shadowColor: colors.primary,
    shadowOpacity: 0.7,
    shadowRadius: 24,
    elevation: 12,
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 2,
    color: colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 6,
  },
  loadingRow: { position: 'absolute', bottom: 62, flexDirection: 'row', alignItems: 'center' },
  loadingText: { marginLeft: 10, color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
  orb: { position: 'absolute', borderRadius: 999, backgroundColor: 'rgba(124,92,252,0.16)' },
  orbOne: { width: 250, height: 250, top: -70, right: -70 },
  orbTwo: { width: 180, height: 180, bottom: 80, left: -90, backgroundColor: 'rgba(30,214,165,0.12)' },
});
