// Setup file - handles both Node (service tests) and jest-expo (component tests) environments

// Mock React Native modules for service tests (Node environment)
// This allows lib/supabase.ts to be loaded even though it imports react-native
jest.mock('react-native', () => {
  try {
    const actualRN = jest.requireActual('react-native');
    return {
      ...actualRN,
      Platform: {
        OS: 'ios',
        select: jest.fn((obj) => obj.ios || obj.default),
      },
      Alert: {
        alert: jest.fn(),
      },
    };
  } catch (e) {
    // If react-native is not available, return a minimal mock
    return {
      Platform: {
        OS: 'ios',
        select: jest.fn((obj) => obj.ios || obj.default),
      },
      Alert: {
        alert: jest.fn(),
      },
    };
  }
}, { virtual: true });

jest.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
}), { virtual: true });

// Extend React Native Alert mock if react-native is available (only in jest-expo environment)
try {
  const RN = require('react-native');
  if (RN && typeof RN === 'object') {
    // Only add Alert if it doesn't exist or is incomplete
    if (!RN.Alert || typeof RN.Alert.alert !== 'function') {
      RN.Alert = {
        ...RN.Alert,
        alert: jest.fn(),
      };
    }
  }
} catch (e) {
  // react-native is not available in Node environment (service tests)
  // This is expected and safe to ignore
}

// Global fetch mock - will be reset in individual test files
if (typeof global !== 'undefined' && typeof global.fetch === 'undefined') {
  global.fetch = jest.fn();
}

