module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      'babel-preset-expo',
      'nativewind/babel',
    ],
    plugins: [
      ['@babel/plugin-transform-flow-strip-types', { allowDeclareFields: true }],
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
            '@app': './app',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
