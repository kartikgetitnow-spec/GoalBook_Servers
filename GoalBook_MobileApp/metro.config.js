const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Support WebAssembly files for expo-sqlite web support
config.resolver.assetExts.push('wasm');

module.exports = config;
