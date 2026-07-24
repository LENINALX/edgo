// Capa de compatibilidad: las pantallas conservan sus nombres en español,
// pero todos los datos se leen y escriben en la API Laravel.
import { request } from '../api/client';
import { appToComplaintStatus, appToUnitStatus, mapComplaint, mapUnit } from '../api/mappers';

const unitPayload = (unidad) => ({
  unit_number: unidad.numero, plate: unidad.placa, driver_name: unidad.conductor,
  route_name: unidad.ruta, latitude: unidad.latitud, longitude: unidad.longitud,
  speed: unidad.velocidad, status: appToUnitStatus[unidad.estado] || unidad.estado,
});

export const getUnidades = async () => (await request('/units')).data.map(mapUnit);
export const getRutas = async () => (await request('/routes')).data;
export const guardarRutasSeleccionadas = async (routeIds) => request('/route-preferences', { method: 'PUT', body: JSON.stringify({ route_ids: routeIds }) });
// Laravel no ofrece sockets en este proyecto; se consulta cada 5 segundos para
// mantener actualizado el mapa y se libera el intervalo al desmontar la pantalla.
export const subscribeUnidades = (callback) => {
  let active = true;
  const load = async () => { try { const data = await getUnidades(); if (active) callback(data); } catch (error) { console.log('Error cargando unidades:', error.message); } };
  load();
  const timer = setInterval(load, 5000);
  return () => { active = false; clearInterval(timer); };
};
export const getUnidadById = async (id) => mapUnit((await request(`/units/${id}`)).data);
export const addUnidad = async (unidad) => mapUnit((await request('/units', { method: 'POST', body: JSON.stringify(unitPayload(unidad)) })).data);
export const updateUnidad = async (id, unidad) => mapUnit((await request(`/units/${id}`, { method: 'PUT', body: JSON.stringify(unitPayload(unidad)) })).data);
export const deleteUnidad = async (id) => request(`/units/${id}`, { method: 'DELETE' });
export const updateUnidadEstado = async (id, estado) => request(`/units/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: appToUnitStatus[estado] || estado }) });
export const simularMovimiento = async () => {};
export const actualizarUbicacionUnidad = async (id, ubicacion) => request(`/units/${id}/location`, { method: 'PATCH', body: JSON.stringify({ latitude: ubicacion.latitud, longitude: ubicacion.longitud, speed: ubicacion.velocidad }) });

export const addQueja = async (queja) => mapComplaint((await request('/complaints', { method: 'POST', body: JSON.stringify({ title: queja.tipo, category: queja.tipo, description: queja.descripcion, transport_unit_id: queja.unidadId }) })).data);
export const getQuejasByUsuario = async () => (await request('/complaints')).data.map(mapComplaint);
export const getAllQuejas = async () => (await request('/admin/complaints')).data.map(mapComplaint);
export const getQuejasComunidad = async () => (await request('/complaints/community')).data.map(mapComplaint);
export const toggleConfirmacionQueja = async (id) => request(`/complaints/${id}/confirm`, { method: 'POST' });
export const getQuejaById = async (id) => mapComplaint((await request(`/complaints/${id}`)).data);
export const updateQuejaEstado = async (id, estado) => request(`/admin/complaints/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: appToComplaintStatus[estado] || estado }) });
