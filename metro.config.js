const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * Note: Some Metro versions validate config keys and will warn if unknown.
 * We start from RN's default config and only override stable, documented keys.
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  // Keep overrides empty unless you need to customize Metro.
  // (Leaving this here prevents accidental "unknown option" warnings.)
};

// Some tooling prints "unknown option" warnings for keys that are only present
// in certain Metro/RN versions (often "unstable_*" or experimental knobs).
// Removing them here is safe because the default config already contains them.
const defaultConfig = getDefaultConfig(__dirname);

// If a downstream validator complains about these keys, strip them.
// (Behavior: falls back to Metro defaults for the current version.)
if ('unstable_perfLoggerFactory' in defaultConfig) {
  delete defaultConfig.unstable_perfLoggerFactory;
}

// Strip version-gated / experimental nested options that some validators
// (or mismatched Metro versions) don't recognize.
if (defaultConfig.serializer && 'isThirdPartyModule' in defaultConfig.serializer) {
  delete defaultConfig.serializer.isThirdPartyModule;
}
if (defaultConfig.server && 'forwardClientLogs' in defaultConfig.server) {
  delete defaultConfig.server.forwardClientLogs;
}
if (defaultConfig.symbolicator && 'customizeStack' in defaultConfig.symbolicator) {
  delete defaultConfig.symbolicator.customizeStack;
}
if (defaultConfig.watcher && 'unstable_workerThreads' in defaultConfig.watcher) {
  delete defaultConfig.watcher.unstable_workerThreads;
}

module.exports = mergeConfig(defaultConfig, config);
