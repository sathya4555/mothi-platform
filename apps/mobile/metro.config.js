const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Enable web support
config.resolver.platforms = ["ios", "android", "native", "web"];

// Ensure proper entry point resolution
config.resolver.alias = {
  ...config.resolver.alias,
  'react-native$': 'react-native-web',
};

module.exports = config;
