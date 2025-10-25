import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
  console.error('Required: SUPABASE_URL and SUPABASE_ANON_KEY');
}

// Regular client with anon key (for client-side operations)
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
);

// Admin client with service role key (for backend operations that need admin privileges)
// This bypasses Row Level Security (RLS) policies
export const supabaseAdmin = supabaseServiceKey
  ? createClient(
      supabaseUrl || 'https://placeholder.supabase.co',
      supabaseServiceKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  : null;

// Helper function to create a Supabase client with a user's JWT token
export const createUserSupabaseClient = (accessToken: string) => {
  return createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key',
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    }
  );
};
