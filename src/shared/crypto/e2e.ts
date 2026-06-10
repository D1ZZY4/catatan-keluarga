/**
 * E2E Encryption — AES-GCM 256-bit via expo-crypto + expo-secure-store.
 * Web Crypto API versi dari old-code dimigrasi ke React Native native crypto.
 *
 * Threat model: melindungi data di SQLite dari akses kasual ke device.
 * Kunci TIDAK PERNAH masuk ke AsyncStorage — hanya SecureStore.
 *
 * Platform guard: pada web, fallback ke sessionStorage (hanya untuk dev preview).
 */

import { Platform } from 'react-native';
import * as Crypto from 'expo-crypto';

// Dynamic import untuk SecureStore — hanya pada native
import type * as SecureStoreType from 'expo-secure-store';
let SecureStore: typeof SecureStoreType | null = null;
if (Platform.OS !== 'web') {
  SecureStore = require('expo-secure-store') as typeof SecureStoreType;
}

const SECURE_KEY = 'catat_artha_enc_key';
const SECURE_SALT = 'catat_artha_salt';
const SECURE_PIN_HASH = 'catat_artha_pin_hash';
const IV_BYTES = 12;
const PBKDF2_ITERATIONS = 100_000;

// In-memory key cache — dikosongkan saat lock
let _cryptoKey: CryptoKey | null = null;

// --- Web fallback storage (sessionStorage — TIDAK AMAN, hanya untuk dev preview) ---
const webStore: Record<string, string> = {};

async function secureGetItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      return sessionStorage.getItem(key);
    } catch {
      return webStore[key] ?? null;
    }
  }
  return SecureStore!.getItemAsync(key);
}

async function secureSetItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      sessionStorage.setItem(key, value);
    } catch {
      webStore[key] = value;
    }
    return;
  }
  await SecureStore!.setItemAsync(key, value);
}

async function secureDeleteItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      sessionStorage.removeItem(key);
    } catch {
      delete webStore[key];
    }
    return;
  }
  await SecureStore!.deleteItemAsync(key);
}

function base64ToBuffer(b64: string): Uint8Array {
  const s = atob(b64);
  const buf = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) buf[i] = s.charCodeAt(i);
  return buf;
}

function bufferToBase64(buf: Uint8Array | ArrayBuffer): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s);
}

function randomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  Crypto.getRandomValues(bytes);
  return bytes;
}

async function deriveKeyFromPinString(
  pin: string,
  saltB64: string,
): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const salt = base64ToBuffer(saltB64);
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(pin) as unknown as BufferSource,
    'PBKDF2',
    false,
    ['deriveKey'],
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as unknown as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

async function deriveDeviceKey(): Promise<CryptoKey> {
  const stored = await secureGetItem(SECURE_KEY);
  if (stored) {
    const raw = base64ToBuffer(stored);
    return crypto.subtle.importKey(
      'raw',
      raw as unknown as BufferSource,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt'],
    );
  }
  const raw = randomBytes(32);
  await secureSetItem(SECURE_KEY, bufferToBase64(raw));
  return crypto.subtle.importKey(
    'raw',
    raw as unknown as BufferSource,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

export const e2e = {
  async unlockWithPin(pin: string): Promise<boolean> {
    try {
      const saltB64 = await secureGetItem(SECURE_SALT);
      if (!saltB64) return false;

      const pinHashStored = await secureGetItem(SECURE_PIN_HASH);
      if (!pinHashStored) return false;

      const key = await deriveKeyFromPinString(pin, saltB64);
      const enc = new TextEncoder();
      const saltBytes = base64ToBuffer(saltB64);
      const pinBytes = enc.encode(pin);
      const buf = new Uint8Array(saltBytes.length + pinBytes.length);
      buf.set(saltBytes, 0);
      buf.set(pinBytes, saltBytes.length);
      const digest = await crypto.subtle.digest('SHA-256', buf);
      const pinHash = bufferToBase64(new Uint8Array(digest));

      if (pinHash !== pinHashStored) return false;

      _cryptoKey = key;
      return true;
    } catch {
      return false;
    }
  },

  async setupPin(pin: string): Promise<void> {
    const salt = randomBytes(16);
    const saltB64 = bufferToBase64(salt);
    await secureSetItem(SECURE_SALT, saltB64);

    const enc = new TextEncoder();
    const pinBytes = enc.encode(pin);
    const buf = new Uint8Array(salt.length + pinBytes.length);
    buf.set(salt, 0);
    buf.set(pinBytes, salt.length);
    const digest = await crypto.subtle.digest('SHA-256', buf);
    const pinHash = bufferToBase64(new Uint8Array(digest));
    await secureSetItem(SECURE_PIN_HASH, pinHash);

    _cryptoKey = await deriveKeyFromPinString(pin, saltB64);
  },

  async unlockWithoutPin(): Promise<void> {
    _cryptoKey = await deriveDeviceKey();
  },

  async hasPin(): Promise<boolean> {
    const h = await secureGetItem(SECURE_PIN_HASH);
    return h !== null;
  },

  lock(): void {
    _cryptoKey = null;
  },

  isUnlocked(): boolean {
    return _cryptoKey !== null;
  },

  async encrypt(value: unknown): Promise<string> {
    if (!_cryptoKey) throw new Error('E2E not unlocked');
    const iv = randomBytes(IV_BYTES);
    const enc = new TextEncoder();
    const plaintext = enc.encode(JSON.stringify(value));
    const cipher = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv as unknown as BufferSource },
      _cryptoKey,
      plaintext as unknown as BufferSource,
    );
    return `${bufferToBase64(iv)}:${bufferToBase64(new Uint8Array(cipher))}`;
  },

  async decrypt<T>(cipherB64: string): Promise<T> {
    if (!_cryptoKey) throw new Error('E2E not unlocked');
    const [ivB64, cipherPartB64] = cipherB64.split(':');
    if (!ivB64 || !cipherPartB64) throw new Error('Invalid cipher format');
    const iv = base64ToBuffer(ivB64);
    const cipher = base64ToBuffer(cipherPartB64);
    const plain = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv as unknown as BufferSource },
      _cryptoKey,
      cipher as unknown as BufferSource,
    );
    const dec = new TextDecoder();
    return JSON.parse(dec.decode(plain)) as T;
  },

  async decryptOr<T>(cipherB64: string | null | undefined, fallback: T): Promise<T> {
    if (!cipherB64) return fallback;
    try {
      return await e2e.decrypt<T>(cipherB64);
    } catch {
      return fallback;
    }
  },

  async deleteAll(): Promise<void> {
    await secureDeleteItem(SECURE_KEY);
    await secureDeleteItem(SECURE_SALT);
    await secureDeleteItem(SECURE_PIN_HASH);
    _cryptoKey = null;
  },
};
