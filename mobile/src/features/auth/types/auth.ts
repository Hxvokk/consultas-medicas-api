export type LoginResponse = {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  usuario: { idUsuario: number; email: string; rol: string };
};

export type RegistrationPayload = {
  nombre: string;
  edad: number;
  email: string;
  password: string;
};

export type AuthStatus = 'checking' | 'authenticated' | 'not-authenticated';

export type AuthContextValue = {
  token: string | null;
  status: AuthStatus;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (payload: RegistrationPayload) => Promise<void>;
  signOut: () => Promise<void>;
};
