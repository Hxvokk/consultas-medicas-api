import { http } from './http';

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

export const authApi = {
  async login(email: string, password: string) {
    const response = await http.post<LoginResponse>('/api/auth/login', { email, password });
    return response.data;
  },
  async register(payload: RegistrationPayload) {
    const response = await http.post('/api/auth/registro', payload);
    return response.data;
  },
};
