// Mock Supabase using manual mock
jest.mock('../../lib/supabase');

import { loginUser } from '../supabaseService';
import { supabase } from '../../lib/supabase';

// Get mock
const mockSignInWithPassword = supabase.auth.signInWithPassword as jest.MockedFunction<typeof supabase.auth.signInWithPassword>;

describe('loginUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('✅ Correct email + password', async () => {
    // Input: {email:"a@b.com", password:"1234"}
    // Expected: {success:true, userid:"1"}
    const email = 'a@b.com';
    const password = '1234';

    const mockUser = { id: '1', email: 'a@b.com' };
    const mockSession = { access_token: 'token' };

    mockSignInWithPassword.mockResolvedValueOnce({
      data: { user: mockUser, session: mockSession },
      error: null,
    });

    const result = await loginUser(email, password);
    console.log('Actual Output:', JSON.stringify(result));

    expect(result.success).toBe(true);
    expect(result.userid).toBe('1');
  });

  test('❌ Wrong password', async () => {
    // Input: password:"9999"
    // Expected: {success:false, error:"Invalid password"}
    const email = 'a@b.com';
    const password = '9999';

    const authError = {
      message: 'Invalid password',
      status: 400,
    };

    mockSignInWithPassword.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: authError,
    });

    const result = await loginUser(email, password);
    console.log('Actual Output:', JSON.stringify(result));

    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid password');
  });

  test('❌ Email not registered', async () => {
    // Input: unknown email
    // Expected: {success:false, error:"User not found"}
    const email = 'unknown@example.com';
    const password = '1234';

    const authError = {
      message: 'User not found',
      status: 400,
    };

    mockSignInWithPassword.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: authError,
    });

    const result = await loginUser(email, password);
    console.log('Actual Output:', JSON.stringify(result));

    expect(result.success).toBe(false);
    expect(result.error).toBe('User not found');
  });

  test('❌ Missing email', async () => {
    // Input: {password:"1234"}
    // Expected: {success:false, error:"Email required"}
    const email = '';
    const password = '1234';

    const authError = {
      message: 'Email required',
      status: 400,
    };

    mockSignInWithPassword.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: authError,
    });

    const result = await loginUser(email, password);
    console.log('Actual Output:', JSON.stringify(result));

    expect(result.success).toBe(false);
    expect(result.error).toBe('Email required');
  });

  test('❌ DB crash', async () => {
    // Input: valid input
    // Expected: {error:"Login failed"}
    const email = 'a@b.com';
    const password = '1234';

    const authError = {
      message: 'Login failed',
      status: 500,
    };

    mockSignInWithPassword.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: authError,
    });

    const result = await loginUser(email, password);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Login failed');
  });
});
