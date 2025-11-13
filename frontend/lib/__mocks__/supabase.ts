/**
 * Manual mock for Supabase client
 * This file is automatically used by Jest when mocking '../lib/supabase'
 */

export const supabase = {
  auth: {
    signUp: jest.fn(),
    signInWithPassword: jest.fn(),
    updateUser: jest.fn(),
    getUser: jest.fn(),
    signOut: jest.fn(),
    resetPasswordForEmail: jest.fn(),
  },
  from: jest.fn(),
};

