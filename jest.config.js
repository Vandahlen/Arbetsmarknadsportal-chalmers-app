module.exports = {
  preset: '@react-native/jest-preset',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|react-native-url-polyfill|@react-navigation|react-native-safe-area-context|@react-native-async-storage)/)',
  ],
  setupFiles: ['./jest.setup.js'],
  // kar-ui-kit is a `file:` dep resolved via a symlink and ships its own
  // node_modules/react (from its devDependencies). Without this mapping,
  // requires from inside kar-ui-kit resolve to that second copy of
  // react/react-native instead of this repo's own, causing "Invalid hook
  // call" errors.
  moduleNameMapper: {
    '^react$': require.resolve('react'),
    '^react-native$': require.resolve('react-native'),
  },
};
