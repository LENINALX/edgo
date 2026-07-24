const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Disable the experimental package exports feature that conflicts with Firebase SDK
config.resolver.unstable_enablePackageExports = false;

// Ensure Metro can resolve .cjs files
config.resolver.sourceExts.push('cjs');

module.exports = config;
