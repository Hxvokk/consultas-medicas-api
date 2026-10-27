import { create, isAxiosError } from 'axios';
import { secureStore } from '../lib/secureStore';

const baseURL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');

export const http = create({
  baseURL,
  timeout: 15000,
  headers: { Accept: 'application/json' },
});

http.interceptors.request.use(async (config) => {
  const token = await secureStore.getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function getApiError(error: unknown, fallback: string) {
  if (isAxiosError<{ error?: string }>(error)) {
    if (!error.response) return new Error('No se pudo conectar con la API. Verifica la red y la dirección configurada.');
    if (error.response.status === 401 && error.config?.url?.includes('/dashboard/')) {
      return new Error('La sesión venció. Inicia sesión nuevamente.');
    }
    return new Error(error.response.data?.error ?? fallback);
  }
  return error instanceof Error ? error : new Error(fallback);
}
