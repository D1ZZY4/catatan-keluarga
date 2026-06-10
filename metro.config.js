const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);
config.resolver.sourceExts.push('mjs');

// Exclude nested node_modules and iOS/Android native dirs to stay within
// Replit's inotify watcher limit (65536). Without this, Metro tries to
// watch 100k+ files and crashes with ENOSPC.
config.resolver.blockList = [
  // Nested node_modules (not needed for resolution via hoisting)
  /node_modules\/.*\/node_modules\/.*/,
  // iOS native files
  /node_modules\/.*\.(xcodeproj|xcworkspace|xib|storyboard|xcassets|pbxproj|plist)(\/.*)?/,
  // Android native files
  /node_modules\/.*\/(android|ios)\/(build|\.gradle|CMakeFiles)(\/.*)?/,
  // TypeScript declaration files in node_modules
  /node_modules\/.*\.d\.ts$/,
  // Test files in node_modules
  /node_modules\/.*\/__tests__\/.*/,
  /node_modules\/.*\/__mocks__\/.*/,
  /node_modules\/.*\/test\/.*/,
  /node_modules\/.*\/tests\/.*/,
  // Documentation
  /node_modules\/.*\/(docs|examples|fixtures|demo)\/.*/,
  // Source maps
  /node_modules\/.*\.map$/,
];

module.exports = withNativeWind(config, { input: './src/shared/theme/global.css' });
