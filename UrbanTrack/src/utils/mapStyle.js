// src/utils/mapStyle.js
// Estilo "modo noche" para Google Maps, usado en MapView (prop customMapStyle)
// para que el mapa combine con el resto de la interfaz oscura de la app.

export default [
  { elementType: 'geometry', stylers: [{ color: '#1C1830' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1C1830' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#9C97BE' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#B8B4D6' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#8B86AD' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#26493B' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#332E56' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#241F3D' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#8B86AD' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#3F3A65' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#241F3D' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#2E2A4D' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#14111F' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6C5DD3' }],
  },
];
