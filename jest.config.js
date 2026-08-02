module.exports = {
  preset: '@react-native/jest-preset',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|react-native-url-polyfill|@react-navigation|react-native-safe-area-context|@react-native-async-storage)/)',
  ],
  setupFiles: ['./jest.setup.js'],
  // kar-ui-kit is a `file:` dep resolved via a symlink and ships its own
  // node_modules (react, react-native, react-native-svg, etc. from its
  // devDependencies). Without this mapping, requires from inside
  // kar-ui-kit - including deep react-native/Libraries/* imports and
  // react-native-svg - resolve to that second copy instead of this repo's
  // own, causing "Invalid hook call" errors and duplicate native module
  // singletons.
  moduleNameMapper: {
    '^react$': require.resolve('react'),
    '^react/(.*)$': '<rootDir>/node_modules/react/$1',
    '^react-native$': require.resolve('react-native'),
    '^react-native/(.*)$': '<rootDir>/node_modules/react-native/$1',
    '^react-native-svg$': require.resolve('react-native-svg'),
  },
};
