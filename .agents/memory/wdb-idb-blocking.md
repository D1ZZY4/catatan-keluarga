---
name: WatermelonDB IDB blocking fix
description: How to fix "Deleting database failed because it's blocked by another connection" during Expo web hot-reload with LokiJS adapter
---

## The Problem
WatermelonDB LokiJS adapter with `useIncrementalIndexedDB: true` stores data in IndexedDB.
On hot-reload in Expo web dev mode, the old page's IDB connection stays open while the new
page tries to delete/upgrade the database — triggering the "blocked by another connection"
browser error. The error is non-fatal (DB resets and works correctly), but appears as an
error in the console.

## The Fix
Pass `extraIncrementalIDBOptions.onVersionChange` to the LokiJS adapter. WatermelonDB calls
this when another connection requests a version change, allowing the current connection to
close gracefully before the delete/upgrade proceeds.

```typescript
const adapter = new LokiJSAdapter({
  schema: dbSchema,
  useWebWorker: false,
  useIncrementalIndexedDB: true,
  dbName: 'catkeu',
  extraIncrementalIDBOptions: {
    onVersionChange: (db: { close(): void }) => {
      db.close();
    },
  },
  onSetUpError: (_error: unknown) => { /* silent */ },
});
```

## What NOT to do
- Do NOT call `database.close()` — WatermelonDB `Database` class has no public `close()` method
- Do NOT use `window.addEventListener('beforeunload', ...)` to call `db.close()` for the same reason
- Do NOT use browser global types `IDBFactory`/`IDBDatabase` directly — they are DOM types not
  included in the RN TypeScript lib (`lib.dom` not in tsconfig), causing TS2304/TS2552 errors
- Do NOT use `(globalThis as any).indexedDB` with explicit IDB type casts for the same reason

**Why:** The module `hot.dispose` approach and direct IDB manipulation all fail due to missing
RN TS types and missing `close()` method. `extraIncrementalIDBOptions` is the official API.
