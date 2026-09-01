export type ValidationResult = { ok: true } | { ok: false; error: string };

export function validateEmail(email: string): ValidationResult {
  if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
    return { ok: false, error: "Informe um e-mail válido." };
  }
  return { ok: true };
}

export function validatePassword(password: string): ValidationResult {
  if (password.length < 8) {
    return { ok: false, error: "A senha deve ter pelo menos 8 caracteres." };
  }
  return { ok: true };
}

export function validateUsername(username: string): ValidationResult {
  if (!/^[a-zA-Z0-9_]{3,24}$/.test(username)) {
    return {
      ok: false,
      error: "O nome de usuário deve ter de 3 a 24 caracteres e usar apenas letras, números ou _. ",
    };
  }
  return { ok: true };
}

export function normalizeUsername(value: string) {
  return value.trim().toLowerCase();
}
