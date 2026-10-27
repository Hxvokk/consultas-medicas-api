import { router } from 'expo-router';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { RegistrationPayload } from '../api/authApi';
import { getApiError } from '../api/http';
import { authService } from '../services/authService';

type AuthContextValue = {
  token: string | null;
  status: 'checking' | 'authenticated' | 'not-authenticated';
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (payload: RegistrationPayload) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: React.PropsWithChildren) {
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<AuthContextValue['status']>('checking');

  useEffect(() => {
    let mounted = true;
    authService.restoreSession()
      .then((savedToken) => {
        if (!mounted) return;
        setToken(savedToken);
        setStatus(savedToken ? 'authenticated' : 'not-authenticated');
      })
      .catch(() => { if (mounted) setStatus('not-authenticated'); });
    return () => { mounted = false; };
  }, []);

  async function signIn(email: string, password: string) {
    try {
      const result = await authService.signIn(email, password);
      setToken(result.accessToken);
      setStatus('authenticated');
    } catch (error) {
      throw getApiError(error, 'No se pudo iniciar sesión.');
    }
    router.replace('/dashboard');
  }

  async function signUp(payload: RegistrationPayload) {
    try {
      const result = await authService.signUp(payload);
      setToken(result.accessToken);
      setStatus('authenticated');
    } catch (error) {
      throw getApiError(error, 'No se pudo crear la cuenta.');
    }
    router.replace('/dashboard');
  }

  async function signOut() {
    await authService.signOut();
    setToken(null);
    setStatus('not-authenticated');
    router.replace('/login');
  }

  const value = useMemo(() => ({ token, status, signIn, signUp, signOut }), [token, status]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider.');
  return context;
}
