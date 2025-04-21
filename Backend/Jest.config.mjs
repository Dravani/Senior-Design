export default {
  testEnvironment: 'node',

  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },

  moduleFileExtensions: ['js','mjs','json','jsx','ts','tsx'],

  testMatch: [
    '<rootDir>/Test/**/*.test.js',
    '<rootDir>/Test/**/*.test.mjs'
  ],

  transformIgnorePatterns: ['/node_modules/'],
};
