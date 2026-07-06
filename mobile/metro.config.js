const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Watch the parent directory so we can import from ../src
const root = path.resolve(__dirname, '..');
config.watchFolders = [root];

// Make sure Metro can resolve node_modules within the mobile app first
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
  path.resolve(root, 'node_modules'),
];

module.exports = config;
