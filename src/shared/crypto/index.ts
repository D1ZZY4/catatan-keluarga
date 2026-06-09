import * as Crypto from 'expo-crypto';
import { SecureStorage } from '@/shared/utils/secureStorage';

const KEY_STORE_KEY = 'catkeu_enc_key';
const SALT_STORE_KEY = 'catkeu_enc_salt';

async function generateSalt(): Promise<Uint8Array> {
  const bytes = await Crypto.getRandomBytesAsync(32);
  return new Uint8Array(bytes);
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i] ?? 0);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function initEncryptionKey(pin: string): Promise<void> {
  const salt = await generateSalt();
  const saltBase64 = arrayBufferToBase64(salt.buffer as ArrayBuffer);
  await SecureStorage.setItemAsync(SALT_STORE_KEY, saltBase64);

  const pinBytes = new TextEncoder().encode(pin);
  const pinDigest = await Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA256, pinBytes);
  const keyBase64 = arrayBufferToBase64(pinDigest as ArrayBuffer);
  await SecureStorage.setItemAsync(KEY_STORE_KEY, keyBase64);
}

export async function hasEncryptionKey(): Promise<boolean> {
  try {
    const key = await SecureStorage.getItemAsync(KEY_STORE_KEY);
    return key !== null;
  } catch {
    return false;
  }
}

export async function verifyPin(pin: string): Promise<boolean> {
  try {
    const storedKey = await SecureStorage.getItemAsync(KEY_STORE_KEY);
    if (!storedKey) return false;

    const pinBytes = new TextEncoder().encode(pin);
    const pinDigest = await Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA256, pinBytes);
    const inputKey = arrayBufferToBase64(pinDigest);
    return storedKey === inputKey;
  } catch {
    return false;
  }
}

export async function encryptData(plaintext: string): Promise<string> {
  const keyBase64 = await SecureStorage.getItemAsync(KEY_STORE_KEY);
  if (!keyBase64) throw new Error('Kunci enkripsi tidak ditemukan');

  const iv = await Crypto.getRandomBytesAsync(12);
  const ivBase64 = arrayBufferToBase64(new Uint8Array(iv).buffer);

  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);

  const keyBytes = base64ToArrayBuffer(keyBase64);
  const importedKey = await globalThis.crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );

  const encrypted = await globalThis.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: new Uint8Array(iv) },
    importedKey,
    data
  );

  const encryptedBase64 = arrayBufferToBase64(encrypted);
  return `${ivBase64}:${encryptedBase64}`;
}

export async function decryptData(ciphertext: string): Promise<string> {
  const keyBase64 = await SecureStorage.getItemAsync(KEY_STORE_KEY);
  if (!keyBase64) throw new Error('Kunci enkripsi tidak ditemukan');

  const parts = ciphertext.split(':');
  if (parts.length !== 2) throw new Error('Format data terenkripsi tidak valid');

  const [ivBase64, encryptedBase64] = parts as [string, string];
  const iv = new Uint8Array(base64ToArrayBuffer(ivBase64));
  const encrypted = base64ToArrayBuffer(encryptedBase64);

  const keyBytes = base64ToArrayBuffer(keyBase64);
  const importedKey = await globalThis.crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );

  const decrypted = await globalThis.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    importedKey,
    encrypted
  );

  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

export async function clearEncryptionKey(): Promise<void> {
  await SecureStorage.deleteItemAsync(KEY_STORE_KEY);
  await SecureStorage.deleteItemAsync(SALT_STORE_KEY);
}
