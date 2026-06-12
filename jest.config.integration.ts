import { Config } from 'jest';

const config: Config = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],

  collectCoverage: true,
  coverageDirectory: 'coverage/integration',
  coverageReporters: ['text', 'lcov', 'html'],

  testMatch: ['<rootDir>/tests/integration/**/*.integration.spec.ts'],
  testTimeout: 30000,

  testPathIgnorePatterns: ['/node_modules/'],

  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/tests/',
    '.module.ts$',
    '.mock.ts$',
  ],

  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
    '^@app/(.*)$': '<rootDir>/src/app/$1',
    '^@shared/(.*)$': '<rootDir>/src/app/shared/$1',
    '^@src/(.*)$': '<rootDir>/src/$1',
    '^@assets/(.*)$': '<rootDir>/src/assets/$1',
    '^@environments/(.*)$': '<rootDir>/src/environments/$1',
  },

  // TODO: Definir uma cobertura de testes e configurar
  // coverageThreshold: {
  //   global: {
  //     branches: 100,
  //     functions: 100,
  //     lines: 100,
  //     statements: 100,
  //   },
  // },
};

export default config;
