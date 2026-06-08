import "@testing-library/jest-dom";

// Stub IndexedDB (Dexie needs it)
const idbMock = {
  open: () => ({ onupgradeneeded: null, onsuccess: null, onerror: null }),
};
Object.defineProperty(globalThis, "indexedDB", {
  value: idbMock,
  writable: true,
});

// Stub crypto.subtle for Web Crypto tests
if (!globalThis.crypto) {
  (globalThis as unknown as Record<string, unknown>).crypto = {};
}
