import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'session.jwt';

export const secureStore = {
  getAccessToken: () => SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
  saveAccessToken: (token: string) => SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token),
  clearAccessToken: () => SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
};
