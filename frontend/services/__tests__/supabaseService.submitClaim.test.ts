// Mock Supabase using manual mock
jest.mock('../../lib/supabase');

import { submitClaim } from '../supabaseService';
import { supabase } from '../../lib/supabase';

// Get mocks
const mockGetUser = supabase.auth.getUser as jest.MockedFunction<typeof supabase.auth.getUser>;
const mockFrom = supabase.from as jest.MockedFunction<typeof supabase.from>;

describe('submitClaim', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('✅ Valid claim', async () => {
    // Input: {userid:1, postid:10, claimdetails:"This is mine"}
    // Expected: {success:true, claimid:50}
    const postID = 10;
    const claimDetails = 'This is mine';

    const mockUser = { id: '1' };
    const mockClaim = {
      claimid: 50,
      postid: 10,
      userid: '1',
      claimdetails: claimDetails,
      claimstatus: 'pending',
    };

    mockGetUser.mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    });

    const mockInsert = jest.fn().mockReturnValueOnce({
      select: jest.fn().mockReturnValueOnce({
        single: jest.fn().mockResolvedValueOnce({
          data: mockClaim,
          error: null,
        }),
      }),
    });
    mockFrom.mockReturnValueOnce({
      insert: mockInsert,
    } as any);

    const result = await submitClaim(postID, claimDetails);

    expect(result.success).toBe(true);
    expect(result.claimid).toBe(50);
  });
});
