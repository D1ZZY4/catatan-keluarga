---
name: Catat Artha Known Issues
description: Technical quirks, workarounds, and non-obvious decisions in the project
---

# Known Issues & Workarounds

## WatermelonDB Decorators (RESOLVED)
**Issue**: `import { field, Associations } from '@nozbe/watermelondb'` fails — not exported from root.
**Fix**: `import { field } from '@nozbe/watermelondb/decorators'`
**Why**: WatermelonDB separates decorators into subpath exports.
**How to apply**: Any new WatermelonDB model class.

## MMKV v3 Constructor (RESOLVED)
**Issue**: `new MMKV()` fails — TypeScript says MMKV is only a type.
**Fix**: `import { createMMKV } from 'react-native-mmkv'; const store = createMMKV({ id: '...' });`
**Why**: react-native-mmkv v3+ changed from class to factory.

## expo-file-system SDK 54 Types (RESOLVED)
**Issue**: `FileSystem.documentDirectory` and `FileSystem.writeAsStringAsync` missing from types.
**Fix**: Cast as `(FileSystem as unknown as { documentDirectory?: string }).documentDirectory`
**Why**: SDK 54 module structure differs from older versions.

## TypeScript Decorator TS1206 (RESOLVED)
**Fix**: `"experimentalDecorators": true` in tsconfig.json.

## old-code/ TS Noise (RESOLVED)
**Fix**: `"exclude": ["old-code"]` in tsconfig.json.

## Font Paths (canonical)
- `require('../node_modules/@expo-google-fonts/dm-sans/400Regular/DMSans_400Regular.ttf')`
- `require('../node_modules/@expo-google-fonts/dm-sans/500Medium/DMSans_500Medium.ttf')`
- `require('../node_modules/@expo-google-fonts/dm-sans/600SemiBold/DMSans_600SemiBold.ttf')`
- `require('../node_modules/@expo-google-fonts/instrument-serif/400Regular/InstrumentSerif_400Regular.ttf')`
- `require('../node_modules/@expo-google-fonts/jetbrains-mono/400Regular/JetBrainsMono_400Regular.ttf')`

## @shopify/react-native-skia & ccxt Postinstall
**Issue**: Blocked postinstall scripts.
**Fix**: `bun pm trust @shopify/react-native-skia ccxt` before EAS build or native runs.

## Expo Router root config (RESOLVED)
**Issue**: Moving routes to `src/app/` but using `root: 'src'` in app.config.ts causes typed route paths to include `/app/` prefix (`/app/(tabs)/wallets` instead of `/(tabs)/wallets`).
**Fix**: Use `root: 'src/app'` (NOT `root: 'src'`) in the expo-router plugin config.
**Why**: `root` option replaces the entire routes directory name. `root: 'src'` makes `src/` the routes dir (so `src/app/` is `/app/...`). `root: 'src/app'` makes `src/app/` the routes dir (correct).

## expo/tsconfig.base module:"preserve" Incompatibility (RESOLVED)
**Issue**: expo SDK 54's tsconfig.base.json uses `module: "preserve"` which TypeScript 5.3.3 doesn't support. Causes TS6046 error.
**Fix**: Do NOT use `extends: "expo/tsconfig.base"` in tsconfig.json. Use standalone tsconfig with all settings explicit.
**Prevention**: Use `EXPO_NO_TYPESCRIPT_SETUP=1` env var in the expo start command to prevent expo from re-adding `extends: "expo/tsconfig.base"` to tsconfig.json on every startup.

## Replit inotify ENOSPC (RESOLVED — node_modules patch)
**Issue**: Metro's FallbackWatcher tries to watch every directory in node_modules, hitting Replit's inotify limit of 65536 watchers.
**Fix**: Patched `node_modules/metro-file-map/src/watchers/FallbackWatcher.js` `_watchdir` method to skip `node_modules`, `.cache`, `.git`, `android`, `ios`, `old-code`, `.bun`.
**Note**: This patch is on node_modules (not committed). Must re-apply after `bun install`.

## Replit freeport-async Port Scan (RESOLVED — node_modules patch)
**Issue**: freeport-async scans ports 11000-65535 which are all blocked in Replit, causing expo start to hang.
**Fix**: Patched `node_modules/freeport-async/index.js` to scan ports 5000-5020 instead.
**Note**: This patch is on node_modules (not committed). Must re-apply after `bun install`.

## Bun + expo-cli ResolveMessage Incompatibility
**Issue**: When `bunx expo start --web` encounters a module resolution error during web bundling, Bun throws a `ResolveMessage` instance. expo-cli's `handleTooManyOpenFileErrors` uncaughtException handler re-throws it (`throw error`), causing `ResolveMessage is not constructable` crash.
**Workaround**: Don't use `--web` flag. Use `bunx expo start --port 8081` (native only). Web preview does not work in Replit for this app anyway due to native-only deps.
