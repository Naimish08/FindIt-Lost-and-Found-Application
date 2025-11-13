// Mock Supabase using manual mock
jest.mock('../../lib/supabase');

import { updateUserProfile } from '../supabaseService';
import { supabase } from '../../lib/supabase';

// Get mocks
const mockUpdateUser = supabase.auth.updateUser as jest.MockedFunction<typeof supabase.auth.updateUser>;
const mockFrom = supabase.from as jest.MockedFunction<typeof supabase.from>;

describe('updateUserProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('✅ Update username + profile picture', async () => {
    // Input: {userid:1, username:"Naimish S", profilepicture:"pic.jpg"}
    // Expected: {updated:true}
    const userId = '1';
    const username = 'Naimish S';
    const profilePicture = 'pic.jpg';

    mockUpdateUser.mockResolvedValueOnce({
      data: { user: null },
      error: null,
    });

    const mockUpsert = jest.fn().mockResolvedValueOnce({
      data: null,
      error: null,
    });
    mockFrom.mockReturnValueOnce({
      upsert: mockUpsert,
    } as any);

    const result = await updateUserProfile(userId, username, undefined, profilePicture);

    expect(result.updated).toBe(true);
  });

  test('❌ User not found', async () => {
    // Input: {userid:999}
    // Expected: {error:"User not found"}
    const userId = '999';
    const username = 'Naimish S';

    mockUpdateUser.mockResolvedValueOnce({
      data: { user: null },
      error: null,
    });

    const dbError = {
      message: 'User not found',
      code: 'PGRST116',
    };

    const mockUpsert = jest.fn().mockResolvedValueOnce({
      data: null,
      error: dbError,
    });
    mockFrom.mockReturnValueOnce({
      upsert: mockUpsert,
    } as any);

    const result = await updateUserProfile(userId, username);

    expect(result.updated).toBe(false);
    expect(result.error).toBe('User not found');
  });

  test('❌ Invalid email format', async () => {
    // Input: {email:"wrong"}
    // Expected: {error:"Invalid email"}
    const userId = '1';
    const email = 'wrong';

    const authError = {
      message: 'Invalid email',
      status: 400,
    };

    mockUpdateUser.mockResolvedValueOnce({
      data: { user: null },
      error: authError,
    });

    const result = await updateUserProfile(userId, undefined, email);

    expect(result.updated).toBe(false);
    expect(result.error).toBe('Invalid email');
  });

  test('❌ Empty update object', async () => {
    // Input: {userid:1}
    // Expected: {error:"No fields to update"}
    const userId = '1';

    mockUpdateUser.mockResolvedValueOnce({
      data: { user: null },
      error: null,
    });

    const dbError = {
      message: 'No fields to update',
      code: 'PGRST116',
    };

    const mockUpsert = jest.fn().mockResolvedValueOnce({
      data: null,
      error: dbError,
    });
    mockFrom.mockReturnValueOnce({
      upsert: mockUpsert,
    } as any);

    const result = await updateUserProfile(userId);

    expect(result.updated).toBe(false);
    expect(result.error).toBe('No fields to update');
  });

  test('❌ DB error', async () => {
    // Input: valid input
    // Expected: {error:"Profile update failed"}
    const userId = '1';
    const username = 'Naimish S';

    mockUpdateUser.mockResolvedValueOnce({
      data: { user: null },
      error: null,
    });

    const dbError = {
      message: 'Profile update failed',
      code: 'PGRST116',
    };

    const mockUpsert = jest.fn().mockResolvedValueOnce({
      data: null,
      error: dbError,
    });
    mockFrom.mockReturnValueOnce({
      upsert: mockUpsert,
    } as any);

    const result = await updateUserProfile(userId, username);

    expect(result.updated).toBe(false);
    expect(result.error).toBe('Profile update failed');
  });
});
