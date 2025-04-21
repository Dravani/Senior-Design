export default {
    displayName: 'backend',
    testEnvironment: 'node',
    transform: {
      '^.+\\.[jt]sx?$': 'babel-jest',
    },
    transformIgnorePatterns: [
      '/node_modules/(?!(chalk)/)'
    ],
    moduleFileExtensions: ['js', 'json', 'jsx'],
    verbose: true,
  };
  