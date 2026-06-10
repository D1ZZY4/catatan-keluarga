/**
 * E2E Encryption — AES-GCM 256-bit via expo-crypto + expo-secure-store.
 * Web Crypto API versi dari old-code dimigrasi ke React Native native crypto.
 *
 * Threat model: melindungi data di SQLite dari akses kasual ke device.
 * Kunci TIDAK PERNAH masuk ke AsyncStorage — hanya SecureStore.
 */

import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

const SECURE_KEY = 'catat_artha_enc_key';
const SECURE_SALT = 'catat_artha_salt';
const SECURE_PIN_HASH = 'catat_artha_pin_hash';
const IV_BYTES = 12;
const PBKDF2_ITERATIONS = 100_000;

// In-memory key cache — dikosongkan saat lock
let _cryptoKey: CryptoKey | null = null;

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
  // expo-crypto provides getRandomValues
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
    enc.encode(pin),
    'PBKDF2',
    false,
    ['deriveKey'],
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
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
  // Fallback deterministic key ketika tidak ada PIN
  const stored = await SecureStore.getItemAsync(SECURE_KEY);
  if (stored) {
    const raw = base64ToBuffer(stored);
    return crypto.subtle.importKey(
      'raw',
      raw,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt'],
    );
  }
  // Generate random device key
  const raw = randomBytes(32);
  await SecureStore.setItemAsync(SECURE_KEY, bufferToBase64(raw));
  return crypto.subtle.importKey(
    'raw',
    raw,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

export const e2e = {
  /** Unlock dengan PIN — derive key dari PIN + stored salt */
  async unlockWithPin(pin: string): Promise<boolean> {
    try {
      const saltB64 = await SecureStore.getItemAsync(SECURE_SALT);
      if (!saltB64) return false;

      const pinHashStored = await SecureStore.getItemAsync(SECURE_PIN_HASH);
      if (!pinHashStored) return false;

      // Verify PIN
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

  /** Setup PIN pertama kali — generate salt, hash PIN, derive key */
  async setupPin(pin: string): Promise<void> {
    const salt = randomBytes(16);
    const saltB64 = bufferToBase64(salt);
    await SecureStore.setItemAsync(SECURE_SALT, saltB64);

    const enc = new TextEncoder();
    const pinBytes = enc.encode(pin);
    const buf = new Uint8Array(salt.length + pinBytes.length);
    buf.set(salt, 0);
    buf.set(pinBytes, salt.length);
    const digest = await crypto.subtle.digest('SHA-256', buf);
    const pinHash = bufferToBase64(new Uint8Array(digest));
    await SecureStore.setItemAsync(SECURE_PIN_HASH, pinHash);

    _cryptoKey = await deriveKeyFromPinString(pin, saltB64);
  },

  /** Unlock tanpa PIN — gunakan device key */
  async unlockWithoutPin(): Promise<void> {
    _cryptoKey = await deriveDeviceKey();
  },

  /** Apakah sudah ada PIN yang di-setup? */
  async hasPin(): Promise<boolean> {
    const h = await SecureStore.getItemAsync(SECURE_PIN_HASH);
    return h !== null;
  },

  /** Lock — hapus key dari memori */
  lock(): void {
    _cryptoKey = null;
  },

  /** Apakah saat ini sudah unlock? */
  isUnlocked(): boolean {
    return _cryptoKey !== null;
  },

  /** Encrypt string/JSON value → base64 ciphertext dengan IV embedded */
  async encrypt(value: unknown): Promise<string> {
    if (!_cryptoKey) throw new Error('E2E not unlocked');
    const iv = randomBytes(IV_BYTES);
    const enc = new TextEncoder();
    const plaintext = enc.encode(JSON.stringify(value));
    const cipher = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      _cryptoKey,
      plaintext,
    );
    // Format: base64(iv) + ':' + base64(ciphertext)
    return `${bufferToBase64(iv)}:${bufferToBase64(new Uint8Array(cipher))}`;
  },

  /** Decrypt base64 ciphertext → original value */
  async decrypt<T>(cipherB64: string): Promise<T> {
    if (!_cryptoKey) throw new Error('E2E not unlocked');
    const [ivB64, cipherPartB64] = cipherB64.split(':');
    if (!ivB64 || !cipherPartB64) throw new Error('Invalid cipher format');
    const iv = base64ToBuffer(ivB64);
    const cipher = base64ToBuffer(cipherPartB64);
    const plain = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      _cryptoKey,
      cipher,
    );
    const dec = new TextDecoder();
    return JSON.parse(dec.decode(plain)) as T;
  },

  /** Decrypt atau return fallback (untuk field opsional) */
  async decryptOr<T>(cipherB64: string | null | undefined, fallback: T): Promise<T> {
    if (!cipherB64) return fallback;
    try {
      return await e2e.decrypt<T>(cipherB64);
    } catch {
      return fallback;
    }
  },

  /** Delete semua data enkripsi (untuk reset app) */
  async deleteAll(): Promise<void> {
    await SecureStore.deleteItemAsync(SECURE_KEY);
    await SecureStore.deleteItemAsync(SECURE_SALT);
    await SecureStore.deleteItemAsync(SECURE_PIN_HASH);
    _cryptoKey = null;
  },
};
