// src/screens/auth/WelcomeScreen.js
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Animated,
  Image,
} from 'react-native';
import MapView from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../styles/colors';
import mapStyle from '../../utils/mapStyle';
import BusMarker from '../../components/BusMarker';
import { useUnits } from '../../hooks/useUnits';
import Button from '../../components/Button';

const { height } = Dimensions.get('window');

const DEFAULT_REGION = {
  latitude: -0.1807,
  longitude: -78.4678,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

const INFO_SLIDES = [
  {
    icon: 'map-sharp',
    title: 'Monitoreo en Tiempo Real',
    description: 'Visualiza la ubicación en vivo de todos los buses en servicio sobre el mapa y optimiza tus tiempos de espera.',
  },
  {
    icon: 'warning-sharp',
    title: 'Reportes e Incidencias',
    description: 'Reporta conducción peligrosa, cobros indebidos, paradas no respetadas o unidades en mal estado al instante.',
  },
  {
    icon: 'navigate-sharp',
    title: 'Planificación Eficiente',
    description: 'Consulta los recorridos de las diferentes líneas de transporte urbano y viaja con total tranquilidad.',
  },
];

const PLANS = [
  { name: 'Gratis', price: '$0', detail: '1 ruta · 1 reporte diario', icon: 'ticket-outline', color: colors.info },
  { name: 'Económico', price: '$0,99', detail: 'Hasta 6 rutas · 5 reportes', icon: 'flash', color: colors.secondary, featured: true },
  { name: 'Plus', price: '$2,99', detail: 'Rutas y reportes ilimitados', icon: 'diamond', color: colors.warning },
];

export default function WelcomeScreen({ navigation }) {
  const { unidades, loading: loadingUnits } = useUnits();
  const [region, setRegion] = useState(DEFAULT_REGION);
  const [locationPermission, setLocationPermission] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState('free');
  const mapRef = useRef(null);

  // Valores de animación
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(15)).current;

  // Animación del bus andando y rodando
  const [isStarting, setIsStarting] = useState(false);
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
  const busTranslateX = useRef(new Animated.Value(Dimensions.get('window').width + 150)).current;
  const busTranslateY = useRef(new Animated.Value(0)).current;
  const busRotate = useRef(new Animated.Value(0)).current;

  const rotateInterpolate = busRotate.interpolate({
    inputRange: [-2, 0, 2],
    outputRange: ['-15deg', '0deg', '15deg'],
  });

  const handleEmpezar = () => {
    if (isStarting) return;
    setIsStarting(true);
    setShowLoadingOverlay(true);

    // Reiniciar valores de animación
    // El frente del bus apunta a la izquierda: entra desde la derecha y sale
    // por la izquierda para que el desplazamiento se vea natural.
    busTranslateX.setValue(Dimensions.get('window').width + 150);
    busTranslateY.setValue(0);
    busRotate.setValue(0);

      // 1. Entra a la pantalla desde la derecha
    Animated.timing(busTranslateX, {
      toValue: 0,
      duration: 700,
      useNativeDriver: true,
    }).start(() => {
      // 2. Inicia loop de vibración del motor / baches (rodando) mientras carga
      const bounceLoop = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(busTranslateY, { toValue: -4, duration: 110, useNativeDriver: true }),
            Animated.timing(busRotate, { toValue: -0.6, duration: 110, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(busTranslateY, { toValue: 4, duration: 110, useNativeDriver: true }),
            Animated.timing(busRotate, { toValue: 0.6, duration: 110, useNativeDriver: true }),
          ]),
        ])
      );
      bounceLoop.start();

      // 3. Simula la carga por 2.2 segundos y luego avanza
      setTimeout(() => {
        bounceLoop.stop();

          // 4. Acelera y se va por la izquierda, hacia donde apunta el bus
        Animated.parallel([
          Animated.timing(busTranslateX, {
            toValue: -150,
            duration: 850,
            useNativeDriver: true,
          }),
          // Efecto de rebote al avanzar
          Animated.sequence([
            Animated.timing(busTranslateY, { toValue: 6, duration: 150, useNativeDriver: true }),
            Animated.timing(busTranslateY, { toValue: -6, duration: 150, useNativeDriver: true }),
            Animated.timing(busTranslateY, { toValue: 4, duration: 150, useNativeDriver: true }),
            Animated.timing(busTranslateY, { toValue: -2, duration: 150, useNativeDriver: true }),
            Animated.timing(busTranslateY, { toValue: 0, duration: 150, useNativeDriver: true }),
          ]),
          // Inclinación por aceleración y rodado
          Animated.sequence([
            Animated.timing(busRotate, { toValue: 1.5, duration: 200, useNativeDriver: true }),
            Animated.timing(busRotate, { toValue: -0.6, duration: 200, useNativeDriver: true }),
            Animated.timing(busRotate, { toValue: 0, duration: 400, useNativeDriver: true }),
          ]),
        ]).start(() => {
          navigation.navigate('Register', { plan: selectedPlan });
          setShowLoadingOverlay(false);
          setIsStarting(false);
        });
      }, 2200);
    });
  };

  // Solicitud de localización
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');
      if (status === 'granted') {
        try {
          const location = await Location.getCurrentPositionAsync({});
          const newRegion = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.06,
            longitudeDelta: 0.06,
          };
          setRegion(newRegion);
          if (mapRef.current) {
            mapRef.current.animateToRegion(newRegion, 1000);
          }
        } catch (e) {
          // Mantiene la región por defecto
        }
      }
    })();
  }, []);

  // Animación del carrusel de información (tiempo de cambio)
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % INFO_SLIDES.length);
    }, 4500);
    return () => clearInterval(slideTimer);
  }, [currentSlide]);

  // Ejecuta la animación de transición al cambiar de slide
  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(12);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentSlide]);

  // Centrar mapa al cambiar de unidades si no hay ubicación de usuario
  useEffect(() => {
    if (unidades.length > 0 && mapRef.current) {
      if (locationPermission !== true) {
        const firstBus = unidades[0];
        if (firstBus.latitud && firstBus.longitud) {
          mapRef.current.animateToRegion({
            latitude: firstBus.latitud,
            longitude: firstBus.longitud,
            latitudeDelta: 0.06,
            longitudeDelta: 0.06,
          }, 1000);
        }
      }
    }
  }, [unidades, locationPermission]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header con el logo de la aplicación */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="bus" size={32} color={colors.white} />
          </View>
          <Text style={styles.appName}>EDGO</Text>
          <Text style={styles.tagline}>Tu transporte urbano en tiempo real</Text>
        </View>

        {/* Información general de la app (Carrusel con animación) */}
        <View style={styles.infoCard}>
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <View style={styles.infoCardHeader}>
              <View style={styles.infoIconContainer}>
                <Ionicons name={INFO_SLIDES[currentSlide].icon} size={20} color={colors.accentLight} />
              </View>
              <Text style={styles.infoTitle}>{INFO_SLIDES[currentSlide].title}</Text>
            </View>

            <Text style={styles.infoText}>
              {INFO_SLIDES[currentSlide].description}
            </Text>
          </Animated.View>

          {/* Indicadores de diapositiva */}
          <View style={styles.carouselIndicators}>
            {INFO_SLIDES.map((_, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.8}
                onPress={() => setCurrentSlide(index)}
                style={[
                  styles.carouselDot,
                  currentSlide === index && styles.carouselDotActive,
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.plansSection}>
          <View style={styles.plansHeading}>
            <View>
              <Text style={styles.plansTitle}>Elige cómo te mueves</Text>
              <Text style={styles.plansSubtitle}>Planes flexibles para cada viaje</Text>
            </View>
            <View style={styles.plansBadge}><Text style={styles.plansBadgeText}>PLANES</Text></View>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.plansRow}>
            {PLANS.map((plan) => (
              <TouchableOpacity key={plan.name} activeOpacity={0.85} onPress={() => setSelectedPlan(plan.name === 'Gratis' ? 'free' : plan.name === 'Económico' ? 'economico' : 'plus')} style={[styles.planCard, plan.featured && styles.planFeatured, selectedPlan === (plan.name === 'Gratis' ? 'free' : plan.name === 'Económico' ? 'economico' : 'plus') && styles.planSelected]}>
                {plan.featured ? <Text style={styles.recommended}>MÁS ELEGIDO</Text> : null}
                <View style={[styles.planIcon, { backgroundColor: plan.color + '22' }]}>
                  <Ionicons name={plan.icon} size={20} color={plan.color} />
                </View>
                <Text style={styles.planName}>{plan.name}</Text>
                <Text style={styles.planPrice}>{plan.price}<Text style={styles.planMonth}> / mes</Text></Text>
                <Text style={styles.planDetail}>{plan.detail}</Text>
                {selectedPlan === (plan.name === 'Gratis' ? 'free' : plan.name === 'Económico' ? 'economico' : 'plus') ? <View style={styles.selectedMark}><Ionicons name="checkmark" size={12} color={colors.white} /></View> : null}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Mapa de unidades activas */}
        <View style={styles.mapCard}>
          <View style={styles.mapHeader}>
            <View style={styles.statusIndicatorRow}>
              <View style={[styles.pulseCircle, unidades.length > 0 ? styles.pulseGreen : styles.pulseGray]} />
              <Text style={styles.mapTitle}>Mapa en vivo</Text>
            </View>
            <Text style={styles.mapSubtitle}>
              {loadingUnits ? 'Cargando...' : `${unidades.length} unidades activas`}
            </Text>
          </View>

          <View style={styles.mapContainer}>
            {loadingUnits ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color={colors.accent} />
                <Text style={styles.loaderText}>Buscando unidades activas...</Text>
              </View>
            ) : (
              <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={region}
                showsUserLocation={locationPermission === true}
                customMapStyle={mapStyle}
                zoomEnabled={true}
                pitchEnabled={false}
                rotateEnabled={false}
              >
                {unidades.map((unidad) => (
                  <BusMarker
                    key={unidad.id}
                    unidad={unidad}
                    onPress={() => {
                      // Opcional: enfocar o ver detalle si fuera necesario
                    }}
                  />
                ))}
              </MapView>
            )}
          </View>
        </View>

        {/* Botón de Empezar */}
        <View style={styles.buttonContainer}>
          <Button
            title={`Continuar con ${PLANS.find((plan) => (plan.name === 'Gratis' ? 'free' : plan.name === 'Económico' ? 'economico' : 'plus') === selectedPlan)?.name}`}
            onPress={handleEmpezar}
            disabled={isStarting}
            variant="primary"
            style={styles.btnEmpezar}
          />
          <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('Login')} style={styles.loginShortcut}>
            <Text style={styles.loginShortcutText}>¿Ya tienes una cuenta? </Text><Text style={styles.loginShortcutLink}>Iniciar sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {showLoadingOverlay && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <Animated.View
              style={{
                transform: [
                  { translateX: busTranslateX },
                  { translateY: busTranslateY },
                  { rotate: rotateInterpolate },
                ],
              }}
            >
              <Image
                source={require('../../../assets/bus_loader_transparent.png')}
                style={styles.busLoaderImage}
                resizeMode="contain"
              />
            </Animated.View>
            <Text style={styles.loadingOverlayText}>Preparando tu viaje...</Text>
            <View style={styles.loadingBarContainer}>
              <ActivityIndicator color={colors.accentLight} size="large" style={{ marginTop: 15 }} />
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 30,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 15,
  },
  logoContainer: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 18,
  },
  plansSection: { marginBottom: 18 },
  plansHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  plansTitle: { fontSize: 17, color: colors.text, fontWeight: '800' },
  plansSubtitle: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  plansBadge: { backgroundColor: colors.primaryLight, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8 },
  plansBadgeText: { color: colors.accentLight, fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },
  plansRow: { paddingRight: 20 },
  planCard: { width: 154, minHeight: 166, padding: 14, backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, borderColor: colors.border, marginRight: 10 },
  planFeatured: { borderColor: colors.secondary, backgroundColor: '#203E3B' },
  planSelected: { borderWidth: 2, borderColor: colors.primary },
  selectedMark: { position: 'absolute', top: 10, right: 10, width: 20, height: 20, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  recommended: { color: colors.secondary, fontSize: 8, fontWeight: '900', letterSpacing: 0.5, marginBottom: 6 },
  planIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  planName: { color: colors.text, fontSize: 15, fontWeight: '800' },
  planPrice: { color: colors.text, fontSize: 18, fontWeight: '800', marginTop: 4 },
  planMonth: { color: colors.textSecondary, fontSize: 10, fontWeight: '500' },
  planDetail: { color: colors.textSecondary, fontSize: 10, lineHeight: 15, marginTop: 8 },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoIconContainer: {
    backgroundColor: colors.primaryLight,
    padding: 6,
    borderRadius: 8,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  infoText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    minHeight: 36, // Asegura consistencia de altura independientemente de la longitud de texto
  },
  carouselIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
  },
  carouselDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.border,
    marginHorizontal: 4,
  },
  carouselDotActive: {
    backgroundColor: colors.accentLight,
    width: 18,
  },
  mapCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: 20,
    flex: 1,
    minHeight: height * 0.32,
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(63, 58, 101, 0.2)',
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  statusIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pulseCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  pulseGreen: {
    backgroundColor: colors.success,
  },
  pulseGray: {
    backgroundColor: colors.textSecondary,
  },
  mapTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  mapSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  mapContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  loaderContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loaderText: {
    marginTop: 10,
    fontSize: 12,
    color: colors.textSecondary,
  },
  buttonContainer: {
    marginTop: 5,
  },
  btnEmpezar: {
    width: '100%',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  loginShortcut: { flexDirection: 'row', justifyContent: 'center', marginTop: 16, paddingVertical: 6 },
  loginShortcutText: { color: colors.textSecondary, fontSize: 12 },
  loginShortcutLink: { color: colors.accentLight, fontSize: 12, fontWeight: '800' },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(28, 24, 48, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  loadingCard: {
    alignItems: 'center',
    padding: 30,
    borderRadius: 20,
    width: '80%',
  },
  busLoaderImage: {
    width: 140,
    height: 90,
    marginBottom: 20,
  },
  loadingOverlayText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: 10,
    textAlign: 'center',
  },
  loadingBarContainer: {
    marginTop: 10,
  },
});
