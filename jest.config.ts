// Import the Config type from the '@jest/types' module.
import type { Config } from '@jest/types';

// Define the Jest configuration object.
const config: Config.InitialOptions = {
  // Use the 'ts-jest' preset for TypeScript integration.
  preset: 'ts-jest',

  // Set the test environment to Node.js.
  testEnvironment: 'node',

  // Enable verbose output during test runs.
  verbose: true,

  // Specify the directory for code coverage reports.
  coverageDirectory: 'coverage',

  // Enable code coverage collection during test runs.
  collectCoverage: true,

  // Define patterns for test files to ignore (e.g., those in '/node_modules/').
  testPathIgnorePatterns: ['/node_modules/'],

  // Configure file transformations using 'ts-jest'.
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },

  // Specify patterns for test files to include in the test run.
  testMatch: ['<rootDir>/src/**/test/*.ts'],

  // Define which files should be considered for code coverage analysis.
  collectCoverageFrom: ['src/**/*.ts', '!src/**/test/*.ts?(x)', '!**/node_modules/**'],

  // Set coverage thresholds (minimum required coverage percentages).
  coverageThreshold: {
    global: {
      branches: 1,
      functions: 1,
      lines: 1,
      statements: 1,
    },
  },

  // Specify the types of coverage reports to generate.
  coverageReporters: ['text-summary', 'lcov'],

  // Map module paths to their actual locations for custom module aliases.
  moduleNameMapper: {
    '@auth/(.*)': ['<rootDir>/src/features/auth/$1'],
    '@user/(.*)': ['<rootDir>/src/features/user/$1'],
    '@post/(.*)': ['<rootDir>/src/features/post/$1'],
    '@reaction/(.*)': ['<rootDir>/src/features/reactions/$1'],
    // '@comment/(.*)': ['<rootDir>/src/features/comments/$1'],
    // '@follower/(.*)': ['<rootDir>/src/features/followers/$1'],
    // '@notification/(.*)': ['<rootDir>/src/features/notifications/$1'],
    // '@image/(.*)': ['<rootDir>/src/features/images/$1'],
    // '@chat/(.*)': ['<rootDir>/src/features/chat/$1'],
    '@global/(.*)': ['<rootDir>/src/shared/globals/$1'],
    '@services/(.*)': ['<rootDir>/src/shared/services/$1'],
    '@socket/(.*)': ['<rootDir>/src/shared/sockets/$1'],
    '@workers/(.*)': ['<rootDir>/src/shared/workers/$1'],
    '@mock/(.*)': ['<rootDir>/src/mocks/$1'],
    '@root/(.*)': ['<rootDir>/src/$1'],
  },
};

// Export the Jest configuration object as the default export.
export default config;
