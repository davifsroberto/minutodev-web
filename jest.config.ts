import type { Config } from 'jest';

const config: Config = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  testPathIgnorePatterns: ['/node_modules/', '/tests/integration/'],

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
