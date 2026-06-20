/** Dados básicos do usuário autenticado, espelhando `GET /auth/me`. */
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}

/** Estado da sessão no cliente. `loading` enquanto o /auth/me não respondeu. */
export type AuthStatus = 'loading' | 'authenticated' | 'anonymous';
