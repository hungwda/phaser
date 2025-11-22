/**
 * Jest configuration for Phaser game testing
 */
export default {
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@scenes/(.*)$': '<rootDir>/src/scenes/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@plugins/(.*)$': '<rootDir>/src/plugins/$1',
    '^phaser$': '<rootDir>/jest.mocks.js',
    'phaser3spectorjs': '<rootDir>/jest.mocks.js',
  },
  transform: {},
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/?(*.)+(spec|test).js'
  ],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/main.js',
    '!src/**/*.config.js',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  verbose: true,
};
