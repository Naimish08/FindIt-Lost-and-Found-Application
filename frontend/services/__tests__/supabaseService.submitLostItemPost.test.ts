// Mock Supabase using manual mock
jest.mock('../../lib/supabase');

import { submitLostItemPost } from '../supabaseService';
import { supabase } from '../../lib/supabase';

// Get mocks
const mockGetUser = supabase.auth.getUser as jest.MockedFunction<typeof supabase.auth.getUser>;
const mockFrom = supabase.from as jest.MockedFunction<typeof supabase.from>;

describe('submitLostItemPost', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('✅ Valid lost item post', async () => {
    // Input: {userid:1, description:"Wallet", location:"Library", images:["pic.png"]}
    // Expected: {success:true, postid:10}
    const title = 'Lost Wallet';
    const description = 'Wallet';
    const location = 'Library';
    const images = ['pic.png'];

    const mockUser = { id: '1' };
    const mockPost = {
      postid: 10,
      item_title: title,
      description,
      location,
      images,
    };

    mockGetUser.mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    });

    const mockInsert = jest.fn().mockReturnValueOnce({
      select: jest.fn().mockReturnValueOnce({
        single: jest.fn().mockResolvedValueOnce({
          data: mockPost,
          error: null,
        }),
      }),
    });
    mockFrom.mockReturnValueOnce({
      insert: mockInsert,
    } as any);

    const result = await submitLostItemPost(title, description, location, images);

    expect(result.success).toBe(true);
    expect(result.postid).toBe(10);
  });

  test('❌ Missing description', async () => {
    // Input: {userid:1, location:"Library"}
    // Expected: {error:"Description required"}
    const title = '';
    const description = '';
    const location = 'Library';
    const images: string[] = [];

    const mockUser = { id: '1' };

    mockGetUser.mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    });

    const insertError = {
      message: 'Description required',
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

    const result = await submitLostItemPost(title, description, location, images);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Description required');
  });

  test('❌ Missing location', async () => {
    // Input: {userid:1, description:"Wallet"}
    // Expected: {error:"Location required"}
    const title = 'Lost Wallet';
    const description = 'Wallet';
    const location = '';
    const images: string[] = [];

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

    const result = await submitLostItemPost(title, description, location, images);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Location required');
  });

  test('❌ Wrong image datatype', async () => {
    // Input: {images:"wrong"}
    // Expected: {error:"Images must be array"}
    const title = 'Lost Wallet';
    const description = 'Wallet';
    const location = 'Library';
    const images: any = 'wrong';

    const mockUser = { id: '1' };

    mockGetUser.mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    });

    const insertError = {
      message: 'Images must be array',
      code: '22P02',
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

    const result = await submitLostItemPost(title, description, location, images);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Images must be array');
  });

  test('❌ DB error', async () => {
    // Input: valid input
    // Expected: {error:"Failed to create post"}
    const title = 'Lost Wallet';
    const description = 'Wallet';
    const location = 'Library';
    const images: string[] = [];

    const mockUser = { id: '1' };

    mockGetUser.mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    });

    const insertError = {
      message: 'Failed to create post',
      code: 'PGRST116',
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

    const result = await submitLostItemPost(title, description, location, images);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Failed to create post');
  });
});
