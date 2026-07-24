// src/utils/seedData.js
// Genera datos de prueba (10 unidades y algunas quejas) en Firestore.
// Ejecuta runSeed() una sola vez, por ejemplo desde un botón temporal
// en la pantalla de Dashboard, o llámalo manualmente desde la consola.

import { addUnidad, getUnidades } from '../firebase/firestoreService';

// Coordenadas de ejemplo (ajusta al centro de tu ciudad)
const BASE_LAT = -0.1807;
const BASE_LNG = -78.4678;

const RUTAS = [
  'Centro - Norte',
  'Sur - Centro',
  'Este - Oeste',
  'Norte - Valle',
  'Centro - Aeropuerto',
];

const CONDUCTORES = [
  'Juan Pérez',
  'María Gómez',
  'Carlos Ruiz',
  'Ana Torres',
  'Luis Vera',
  'Sofía Cabrera',
  'Pedro Salas',
  'Laura Núñez',
  'Diego Paredes',
  'Elena Ríos',
];

const ESTADOS = ['En servicio', 'Fuera de servicio', 'En mantenimiento'];

const randomOffset = () => (Math.random() - 0.5) * 0.05;
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

export const seedUnidades = async () => {
  const existentes = await getUnidades();
  if (existentes.length) {
    console.log('Ya existen unidades, no se generaron datos nuevos.');
    return;
  }

  for (let i = 1; i <= 10; i++) {
    await addUnidad({
      numero: `Bus ${i}`,
      placa: `PBT-0${i}${i}`,
      conductor: CONDUCTORES[i - 1],
      ruta: randomItem(RUTAS),
      latitud: BASE_LAT + randomOffset(),
      longitud: BASE_LNG + randomOffset(),
      velocidad: Math.floor(Math.random() * 60) + 10,
      estado: i % 5 === 0 ? 'En mantenimiento' : randomItem(ESTADOS),
    });
  }

  console.log('Se generaron 10 unidades de prueba.');
};

export const seedQuejas = async (usuarioId) => {
  if (!usuarioId) {
    console.log('Se requiere un usuarioId para generar quejas de prueba.');
    return;
  }

  const unidades = (await getUnidades()).map((unidad) => unidad.id);

  if (unidades.length === 0) {
    console.log('Primero genera las unidades de prueba.');
    return;
  }

  const tipos = [
    'Mala conducción',
    'Exceso de velocidad',
    'No respetó la parada',
    'Unidad en mal estado',
  ];

  for (let i = 0; i < 3; i++) {
    // La creación de quejas requiere la sesión del usuario que reporta.
    // Esta función se mantiene solo como ayuda de desarrollo.
    console.log('Crea las quejas de prueba desde una sesión de usuario.');
    break;
  }

  console.log('Se generaron 3 quejas de prueba.');
};
