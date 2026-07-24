const roleToApp = { user: 'usuario', driver: 'conductor', admin: 'admin' };
const complaintStatusToApp = { pending: 'Pendiente', reviewing: 'En revisión', resolved: 'Resuelta' };
const unitStatusToApp = { in_service: 'En servicio', out_of_service: 'Fuera de servicio', maintenance: 'En mantenimiento' };

export const appToComplaintStatus = Object.fromEntries(Object.entries(complaintStatusToApp).map(([key, value]) => [value, key]));
export const appToUnitStatus = Object.fromEntries(Object.entries(unitStatusToApp).map(([key, value]) => [value, key]));

export const mapProfile = (user) => user && ({
  id: String(user.id), nombre: user.name, correo: user.email,
  rol: roleToApp[user.role] || user.role,
  unidadId: user.transport_unit?.id ? String(user.transport_unit.id) : null,
  plan: user.subscription_plan || 'free',
  rutasSeleccionadas: (user.selected_routes || []).map((route) => String(route.id)),
});

export const mapUnit = (unit) => ({
  id: String(unit.id), numero: unit.unit_number, placa: unit.plate,
  rutaId: unit.route_id ? String(unit.route_id) : null,
  conductor: unit.driver?.name || 'Sin asignar', ruta: unit.route?.name || 'Sin ruta',
  latitud: Number(unit.latitude ?? -0.1807), longitud: Number(unit.longitude ?? -78.4678),
  velocidad: Number(unit.speed ?? 0), estado: unitStatusToApp[unit.status] || unit.status,
});

export const mapComplaint = (complaint) => ({
  id: String(complaint.id), usuarioId: String(complaint.user_id), unidadId: complaint.transport_unit_id ? String(complaint.transport_unit_id) : null,
  tipo: complaint.category, descripcion: complaint.description, fecha: complaint.created_at,
  estado: complaintStatusToApp[complaint.status] || complaint.status,
  confirmaciones: Number(complaint.confirmations_count || 0),
  confirmadoPorMi: Boolean(complaint.confirmed_by_me),
  unidad: complaint.transport_unit ? mapUnit(complaint.transport_unit) : null,
  usuario: complaint.user ? mapProfile(complaint.user) : null,
});
