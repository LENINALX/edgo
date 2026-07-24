// src/utils/constants.js

export const TIPOS_QUEJA = [
  'Mala conducción',
  'Exceso de velocidad',
  'No respetó la parada',
  'Unidad en mal estado',
  'Cobro indebido',
  'Otro',
];

export const ESTADOS_QUEJA = ['Pendiente', 'En revisión', 'Resuelta'];

export const ESTADOS_UNIDAD = ['En servicio', 'Fuera de servicio', 'En mantenimiento'];

export const ROLES = {
  USUARIO: 'usuario',
  ADMIN: 'admin',
  CONDUCTOR: 'conductor',
};

export const ESTADO_COLOR = {
  Pendiente: '#F9A825',
  'En revisión': '#1565C0',
  Resuelta: '#2E7D32',
  'En servicio': '#2E7D32',
  'Fuera de servicio': '#D32F2F',
  'En mantenimiento': '#F9A825',
};
