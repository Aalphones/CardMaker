export const AUTH_STORAGE_KEY = 'cardmaker.auth';

export interface AuthUser {
  id: number;
  email: string;
}

export interface StoredAuth {
  token: string;
  expiresAt: string;
  user: AuthUser;
}

// Schlüssel und Lese-/Löschzugriff liegen hier, weil Phase 5 sie schon für die
// Interceptoren braucht. Das Schreiben (Login) und die Ablauf-Prüfung gehören zu
// core/services/auth.ts aus Phase 6 — nicht hier vorwegnehmen.
export function readStoredAuth(): StoredAuth | null {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as StoredAuth;
  } catch {
    return null;
  }
}

export function clearStoredAuth(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}
