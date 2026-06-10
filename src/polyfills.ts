/**
 * Polyfills untuk web compatibility.
 * Import ini di atas app/_layout.tsx SEBELUM apapun lainnya.
 */

// WatermelonDB DatabaseDriver.js menggunakan process.cwd() untuk SQLite path.
// Pada web (browser), process.cwd tidak tersedia — polyfill dengan return '/'.
if (typeof process !== 'undefined' && typeof process.cwd !== 'function') {
  (process as unknown as { cwd: () => string }).cwd = () => '/';
}
