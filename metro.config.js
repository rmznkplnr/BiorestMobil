const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

const defaultConfig = getDefaultConfig(__dirname);

// `extraNodeModules` ile eksik modülleri tanıtıyoruz
defaultConfig.resolver.extraNodeModules = {
  ...defaultConfig.resolver.extraNodeModules,
  buffer: require.resolve('buffer/'),
};

const config = {
  resolver: {
    extraNodeModules: defaultConfig.resolver.extraNodeModules,
  },
};

module.exports = mergeConfig(defaultConfig, config);
