module.exports = {
  preset: '@react-native/jest-preset',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|react-native-url-polyfill|@react-navigation|react-native-safe-area-context|@react-native-async-storage)/)',
  ],
  setupFiles: ['./jest.setup.js'],
};
