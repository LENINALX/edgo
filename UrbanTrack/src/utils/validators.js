// src/utils/validators.js
// Funciones de validación reutilizables con mensajes amigables.

export const isRequired = (value) => {
  if (!value || value.toString().trim().length === 0) {
    return 'Este campo es obligatorio';
  }
  return null;
};

export const isValidEmail = (value) => {
  const requiredError = isRequired(value);
  if (requiredError) return requiredError;

  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(value)) {
    return 'Ingresa un correo electrónico válido';
  }
  return null;
};

export const isValidPassword = (value) => {
  const requiredError = isRequired(value);
  if (requiredError) return requiredError;

  if (value.length < 6) {
    return 'La contraseña debe tener al menos 6 caracteres';
  }
  return null;
};

export const isValidComplaintDescription = (value) => {
  const requiredError = isRequired(value);
  if (requiredError) return requiredError;

  if (value.trim().length < 20) {
    return 'La descripción debe tener al menos 20 caracteres';
  }
  return null;
};

export const passwordsMatch = (password, confirmPassword) => {
  if (password !== confirmPassword) {
    return 'Las contraseñas no coinciden';
  }
  return null;
};
