import { Router } from "express";
import type { Response } from "express";
import type { Request } from "express";
import { supabase } from '../supabaseClient.ts';
import type { LostItemPost } from '../types.ts';
import { authenticateSupabaseToken, optionalAuth } from '../middleware/auth.ts';

const router = Router();

// Create a lost item post (protected route)
router.post('/', authenticateSupabaseToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { description, location, images } = req.body;
    
    if (!description || !location) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get the user ID from the authenticated user
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('userid')
      .eq('email', req.user.email)
      .single();

    if (userError || !userData) {
      return res.status(404).json({ error: 'User not found' });
    }

    const postData: LostItemPost = {
      userID: userData.userid,
      description,
      location,
      images: images || [],
      datePosted: new Date()
    };

    const { error } = await supabase.from<LostItemPost>('lost_item_posts').insert([postData]);
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json({ message: 'Lost item post created' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search lost items (optional auth - allows search without login)
router.get('/search', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Missing search query' });
    }

    const { data, error } = await supabase
      .from<LostItemPost>('lost_item_posts')
      .select('*')
      .ilike('description', `%${q}%`);
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all lost items
router.get('/', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from<LostItemPost>('lost_item_posts')
      .select('*')
      .order('datePosted', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a specific item by ID
router.get('/:id', optionalAuth, async (req: Request, res: Response) => {
  try {
    const postID = Number(req.params.id);

    if (isNaN(postID)) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }

    const { data, error } = await supabase
      .from<LostItemPost>('lost_item_posts')
      .select('*')
      .eq('postID', postID)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
