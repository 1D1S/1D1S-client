// jest.config.ts
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({ dir: './' });

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1', // ⬅️ alias 대응
    '^@component/(.*)$': '<rootDir>/src/app.component/$1',
    '^@feature/(.*)$': '<rootDir>/src/app.feature/$1',
    '^@module/(.*)$': '<rootDir>/src/app.module/$1',
    '^@constants/(.*)$': '<rootDir>/src/app.constants/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy', // 스타일 무시
  },
  testEnvironment: 'jsdom',
};

export default createJestConfig(customJestConfig);
