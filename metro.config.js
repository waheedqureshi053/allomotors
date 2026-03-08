const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const { wrapWithReanimatedMetroConfig } = require("react-native-reanimated/metro-config");

// Get the default Expo Metro config
let config = getDefaultConfig(__dirname);

// Apply react-native-reanimated's Metro configuration wrapper
config = wrapWithReanimatedMetroConfig(config);

// Apply NativeWind configuration
config = withNativeWind(config, { input: "./app/global.css" });

module.exports = config;

