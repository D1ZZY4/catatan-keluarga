import { Platform } from 'react-native';

// Web fallback using localStorage (not secure but functional for dev/web)
const webStorage = {
  getItemAsync: async (key: string): Promise<string | null> => {
    try { return localStorage.getItem(key); } catch { return null; }
  },
  setItemAsync: async (key: string, value: string): Promise<void> => {
    try { localStorage.setItem(key, value); } catch { /* ignore */ }
  },
  deleteItemAsync: async (key: string): Promise<void> => {
    try { localStorage.removeItem(key); } catch { /* ignore */ }
  },
};

let _SecureStore: typeof webStorage;

if (Platform.OS === 'web') {
  _SecureStore = webStorage;
} else {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  _SecureStore = require('expo-secure-store') as typeof webStorage;
}

export const SecureStorage = _SecureStore;
