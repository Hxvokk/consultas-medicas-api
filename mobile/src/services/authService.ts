import { authApi, RegistrationPayload } from '../api/authApi';
import { secureStore } from '../lib/secureStore';

export const authService = {
  async restoreSession() {
    return secureStore.getAccessToken();
  },
  async signIn(email: string, password: string) {
    const response = await authApi.login(email, password);
    await secureStore.saveAccessToken(response.accessToken);
    return response;
  },
  async signUp(payload: RegistrationPayload) {
    await authApi.register(payload);
    return this.signIn(payload.email, payload.password);
  },
  signOut() {
    return secureStore.clearAccessToken();
  },
};
