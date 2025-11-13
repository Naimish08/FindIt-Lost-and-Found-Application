module.exports = {
  verbose: true,
  projects: [
    // Service tests - use Node environment (no React Native needed)
    {
      displayName: 'services',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/services/**/*.test.(ts|tsx|js)'],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
      roots: ['<rootDir>'],
      transform: {
        '^.+\\.(ts|tsx)$': ['babel-jest', { presets: ['babel-preset-expo'] }],
      },
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
      },
      clearMocks: true,
      restoreMocks: true,
      collectCoverageFrom: [
        'services/**/*.{ts,tsx}',
        '!**/*.d.ts',
        '!**/node_modules/**',
      ],
      silent: false,
    },
    // Component/UI tests - use jest-expo preset
    {
      displayName: 'components',
      preset: 'jest-expo',
      testEnvironment: 'jsdom',
      testMatch: [
        '<rootDir>/**/__tests__/**/*.test.(ts|tsx|js)',
        '<rootDir>/**/*.test.(ts|tsx|js)',
      ],
      testPathIgnorePatterns: [
        '<rootDir>/services/',
        '<rootDir>/node_modules/',
      ],
      transformIgnorePatterns: [
        'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@supabase/supabase-js)',
      ],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
      },
      clearMocks: true,
      restoreMocks: true,
      silent: false,
    },
  ],
  collectCoverageFrom: [
    'services/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
};

