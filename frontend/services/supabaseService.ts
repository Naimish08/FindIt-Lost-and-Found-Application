/**
 * Supabase Service Functions
 * 
 * These functions wrap Supabase client calls for the frontend.
 * They are used directly by components and do not interact with the backend API.
 */

import { supabase } from '../lib/supabase';

/**
 * Register a new user
 * Uses: supabase.auth.signUp() and supabase.from('users').insert()
 */
export async function registerUser(username: string, email: string, password: string) {
  // Step 1: Sign up with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    return { success: false, error: authError.message };
  }

  // Step 2: Get the user ID
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: 'Failed to get user after registration' };
  }

  // Step 3: Insert user into users table
  const { error: dbError } = await supabase.from('users').insert({
    email,
    username,
    userid: user.id,
  });

  if (dbError) {
    return { success: false, error: dbError.message };
  }

  return { success: true, userid: user.id, user };
}

/**
 * Login a user
 * Uses: supabase.auth.signInWithPassword()
 */
export async function loginUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, userid: data.user?.id, session: data.session, user: data.user };
}

/**
 * Update user profile
 * Uses: supabase.auth.updateUser() and supabase.from('users').upsert()
 */
export async function updateUserProfile(
  userId: string,
  username?: string,
  email?: string,
  profilePicture?: string
) {
  // Update auth metadata if needed
  const updateData: any = {};
  if (email) updateData.email = email;
  if (profilePicture) updateData.data = { avatar_url: profilePicture };

  const { error: authError } = await supabase.auth.updateUser(updateData);

  if (authError) {
    return { updated: false, error: authError.message };
  }

  // Update users table
  const upsertPayload: any = { userid: userId };
  if (username) upsertPayload.username = username;
  if (profilePicture) upsertPayload.profilepicture = profilePicture;

  const { error: dbError } = await supabase
    .from('users')
    .upsert(upsertPayload, { onConflict: 'userid' });

  if (dbError) {
    return { updated: false, error: dbError.message };
  }

  return { updated: true };
}

/**
 * Submit a lost item post
 * Uses: supabase.auth.getUser() and supabase.from('lost_item_posts').insert()
 */
export async function submitLostItemPost(
  title: string,
  description: string,
  location: string,
  images: string[] = [],
  datePosted: Date = new Date()
) {
  // Get current user
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) {
    return { success: false, error: userError.message };
  }

  const userId = userData.user?.id;
  if (!userId) {
    return { success: false, error: 'You must be signed in to submit a report.' };
  }

  // Insert post
  const { data, error: insertError } = await supabase
    .from('lost_item_posts')
    .insert([
      {
        userid: userId,
        item_title: title,
        description,
        location,
        dateposted: datePosted.toISOString(),
        images: images.length > 0 ? images : null,
      },
    ])
    .select()
    .single();

  if (insertError) {
    return { success: false, error: insertError.message };
  }

  return { success: true, postid: data?.postid || data?.id, post: data };
}

/**
 * Submit a claim for a lost item
 * Uses: supabase.auth.getUser() and supabase.from('claims').insert()
 */
export async function submitClaim(postID: number, claimDetails: string) {
  // Get current user
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) {
    return { success: false, error: userError.message };
  }

  const userId = userData.user?.id;
  if (!userId) {
    return { success: false, error: 'You must be signed in to submit a claim.' };
  }

  // Insert claim
  const { data, error: insertError } = await supabase
    .from('claims')
    .insert([
      {
        postid: postID,
        userid: userId,
        claimdetails: claimDetails,
        claimstatus: 'pending',
        dateclaimed: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (insertError) {
    return { success: false, error: insertError.message };
  }

  return { success: true, claimid: data?.claimid || data?.id, claim: data };
}

