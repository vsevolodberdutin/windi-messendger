/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(gif|ttf|eot|svg|png|jpg|jpeg)$': '<rootDir>/src/test/__mocks__/fileMock.ts',
    '^nanoid$': '<rootDir>/src/test/__mocks__/nanoid.ts',
    '^(\\.{1,2}/.*)/(utils/logger)$': '<rootDir>/src/utils/__mocks__/logger.ts',
    '^.*/utils/logger$': '<rootDir>/src/utils/__mocks__/logger.ts'
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      useESM: true,
      tsconfig: 'tsconfig.test.json'
    }]
  },
  transformIgnorePatterns: [
    'node_modules/(?!(nanoid|date-fns)/)'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/test/**',
    '!src/**/index.ts',
    '!src/main.tsx'
  ],
  coverageReporters: ['text', 'json', 'html'],
  clearMocks: true,
  restoreMocks: true,
  globals: {
    'import.meta': {
      env: {
        DEV: true,
        PROD: false,
        MODE: 'test'
      }
    }
  }
};
