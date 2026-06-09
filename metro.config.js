const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.alias = {
  '@': './src',
};

// WatermelonDB: exclude Node.js native modules that aren't available on React Native / web
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Exclude Node.js-only modules that WatermelonDB might try to load
  const nodeOnlyModules = ['better-sqlite3', 'react-native-quick-sqlite'];
  if (nodeOnlyModules.some(m => moduleName === m || moduleName.startsWith(m + '/'))) {
    return { type: 'empty' };
  }
  return context.resolveRequest(context, moduleName, platform);
};

// Ensure proper file extensions for web
config.resolver.sourceExts = ['tsx', 'ts', 'jsx', 'js', 'json', 'cjs', 'mjs'];

module.exports = config;
