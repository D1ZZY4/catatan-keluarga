const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'better-sqlite3': path.resolve(__dirname, 'src/mocks/empty-module.js'),
};

module.exports = withNativeWind(config, { input: './src/global.css' });
