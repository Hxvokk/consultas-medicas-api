import { http } from '../../../shared/api/http';
import type { LoginResponse, RegistrationPayload } from '../types/auth';

export type { LoginResponse, RegistrationPayload } from '../types/auth';

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
