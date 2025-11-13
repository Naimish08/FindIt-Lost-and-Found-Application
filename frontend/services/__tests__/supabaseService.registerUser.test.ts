// Mock Supabase using manual mock
jest.mock('../../lib/supabase');

import { registerUser } from '../supabaseService';
import { supabase } from '../../lib/supabase';

// Get mocks
const mockSignUp = supabase.auth.signUp as jest.MockedFunction<typeof supabase.auth.signUp>;
const mockGetUser = supabase.auth.getUser as jest.MockedFunction<typeof supabase.auth.getUser>;
const mockFrom = supabase.from as jest.MockedFunction<typeof supabase.from>;

describe('registerUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('✅ Register with valid data', async () => {
    // Input: {username:"naimish", email:"a@b.com", password:"1234"}
    // Expected: {success:true, userid:1}
    const username = 'naimish';
    const email = 'a@b.com';
    const password = '1234';

    const mockUser = { id: '1', email: 'a@b.com' };

    mockSignUp.mockResolvedValueOnce({
      data: { session: null, user: mockUser },
      error: null,
    });

    mockGetUser.mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    });

    const mockInsert = jest.fn().mockResolvedValueOnce({
      data: null,
      error: null,
    });
    mockFrom.mockReturnValueOnce({
      insert: mockInsert,
    } as any);

    const result = await registerUser(username, email, password);

    expect(result.success).toBe(true);
    expect(result.userid).toBe('1');
  });

  test('❌ Email already exists', async () => {
    // Input: Same email again
    // Expected: {error:"Email already registered"}
    const username = 'naimish';
    const email = 'a@b.com';
    const password = '1234';

    const authError = {
      message: 'Email already registered',
      status: 400,
    };

    mockSignUp.mockResolvedValueOnce({
      data: { session: null, user: null },
      error: authError,
    });

    const result = await registerUser(username, email, password);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Email already registered');
  });

  test('❌ Missing password', async () => {
    // Input: {email:"a@b.com"}
    // Expected: {error:"Password required"}
    const username = 'naimish';
    const email = 'a@b.com';
    const password = '';

    const authError = {
      message: 'Password required',
      status: 400,
    };

    mockSignUp.mockResolvedValueOnce({
      data: { session: null, user: null },
      error: authError,
    });

    const result = await registerUser(username, email, password);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Password required');
  });

  test('❌ Invalid email format', async () => {
    // Input: {email:"wrong", password:"1234"}
    // Expected: {error:"Invalid email"}
    const username = 'naimish';
    const email = 'wrong';
    const password = '1234';

    const authError = {
      message: 'Invalid email',
      status: 400,
    };

    mockSignUp.mockResolvedValueOnce({
      data: { session: null, user: null },
      error: authError,
    });

    const result = await registerUser(username, email, password);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid email');
  });

  test('❌ DB Error', async () => {
    // Input: Valid input
    // Expected: {error:"Registration failed"}
    const username = 'naimish';
    const email = 'a@b.com';
    const password = '1234';

    const mockUser = { id: '1', email };

    mockSignUp.mockResolvedValueOnce({
      data: { session: null, user: mockUser },
      error: null,
    });

    mockGetUser.mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    });

    const dbError = {
      message: 'Registration failed',
      code: '23505',
    };

    const mockInsert = jest.fn().mockResolvedValueOnce({
      data: null,
      error: dbError,
    });
    mockFrom.mockReturnValueOnce({
      insert: mockInsert,
    } as any);

    const result = await registerUser(username, email, password);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Registration failed');
  });
});
