import type { AuthError } from "@supabase/supabase-js";

const includesAny = (value: string, fragments: string[]) => fragments.some((fragment) => value.includes(fragment));

export const mapLoginErrorMessage = (error: AuthError) => {
  const message = error.message.toLowerCase();

  if (includesAny(message, ["invalid login credentials", "email not confirmed", "invalid email or password"])) {
    return "Credenciales incorrectas.";
  }

  if (includesAny(message, ["failed to fetch", "network"])) {
    return "Error de red. Verifica tu conexión e inténtalo de nuevo.";
  }

  return "No pudimos iniciar sesión. Inténtalo de nuevo.";
};

export const mapRegisterErrorMessage = (error: AuthError) => {
  const message = error.message.toLowerCase();

  if (includesAny(message, ["user already registered", "already been registered", "already registered"])) {
    return "Este correo ya está registrado.";
  }

  if (includesAny(message, ["password should be at least", "password", "weak password"])) {
    return "La contraseña no cumple los requisitos mínimos.";
  }

  if (includesAny(message, ["failed to fetch", "network"])) {
    return "Error de red. Verifica tu conexión e inténtalo de nuevo.";
  }

  return "Error al crear la cuenta.";
};
