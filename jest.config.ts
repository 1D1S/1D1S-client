// jest.config.ts
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({ dir: './' });

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1', // ⬅️ alias 대응
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy', // 스타일 무시
  },
  testEnvironment: 'jsdom',
};

export default createJestConfig(customJestConfig);
