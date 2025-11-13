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
    console.log('Actual Output:', JSON.stringify(result));

    expect(result.success).toBe(true);
    expect(result.claimid).toBe(50);
  });

  test('❌ Missing claimdetails', async () => {
    // Input: {userid:1, postid:10}
    // Expected: {success:false, error:"Claim details required"}
    const postID = 10;
    const claimDetails = '';

    const mockUser = { id: '1' };

    mockGetUser.mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    });

    const insertError = {
      message: 'Claim details required',
      code: '23502',
    };

    const mockInsert = jest.fn().mockReturnValueOnce({
      select: jest.fn().mockReturnValueOnce({
        single: jest.fn().mockResolvedValueOnce({
          data: null,
          error: insertError,
        }),
      }),
    });
    mockFrom.mockReturnValueOnce({
      insert: mockInsert,
    } as any);

    const result = await submitClaim(postID, claimDetails);
    console.log('Actual Output:', JSON.stringify(result));

    expect(result.success).toBe(false);
    expect(result.error).toBe('Claim details required');
  });

  test('❌ Missing location', async () => {
    // Input: {userid:1, description:"Wallet"}
    // Expected: {success:false, error:"Location required"}
    const postID = 10;
    const claimDetails = 'This is mine';

    const mockUser = { id: '1' };

    mockGetUser.mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    });

    const insertError = {
      message: 'Location required',
      code: '23502',
    };

    const mockInsert = jest.fn().mockReturnValueOnce({
      select: jest.fn().mockReturnValueOnce({
        single: jest.fn().mockResolvedValueOnce({
          data: null,
          error: insertError,
        }),
      }),
    });
    mockFrom.mockReturnValueOnce({
      insert: mockInsert,
    } as any);

    const result = await submitClaim(postID, claimDetails);
    console.log('Actual Output:', JSON.stringify(result));

    expect(result.success).toBe(false);
    expect(result.error).toBe('Location required');
  });

  test('❌ Invalid postid', async () => {
    // Input: {userid:1, postid:999}
    // Expected: {success:false, error:"Post not found"}
    const postID = 999;
    const claimDetails = 'This is mine';

    const mockUser = { id: '1' };

    mockGetUser.mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    });

    const insertError = {
      message: 'Post not found',
      code: '23503',
    };

    const mockInsert = jest.fn().mockReturnValueOnce({
      select: jest.fn().mockReturnValueOnce({
        single: jest.fn().mockResolvedValueOnce({
          data: null,
          error: insertError,
        }),
      }),
    });
    mockFrom.mockReturnValueOnce({
      insert: mockInsert,
    } as any);

    const result = await submitClaim(postID, claimDetails);
    console.log('Actual Output:', JSON.stringify(result));

    expect(result.success).toBe(false);
    expect(result.error).toBe('Post not found');
  });

  test('❌ Duplicate claim', async () => {
    // Input: claim exists
    // Expected: {success:false, error:"Claim already exists"}
    const postID = 10;
    const claimDetails = 'This is mine';

    const mockUser = { id: '1' };

    mockGetUser.mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    });

    const insertError = {
      message: 'Claim already exists',
      code: '23505',
    };

    const mockInsert = jest.fn().mockReturnValueOnce({
      select: jest.fn().mockReturnValueOnce({
        single: jest.fn().mockResolvedValueOnce({
          data: null,
          error: insertError,
        }),
      }),
    });
    mockFrom.mockReturnValueOnce({
      insert: mockInsert,
    } as any);

    const result = await submitClaim(postID, claimDetails);
    console.log('Actual Output:', JSON.stringify(result));

    expect(result.success).toBe(false);
    expect(result.error).toBe('Claim already exists');
  });
});
