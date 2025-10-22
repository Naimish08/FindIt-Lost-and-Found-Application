import { Router } from "express";
import type { Response } from "express";
import type { Request } from "express";
import { supabase } from '../supabaseClient.ts';
import type { LostItemPost } from '../types.ts';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { userID, description, location, images } = req.body as LostItemPost;
  if (!userID || !description || !location) return res.status(400).json({ error: 'Missing required fields' });

  const { error } = await supabase.from<LostItemPost>('lost_item_posts').insert([{ userID, description, location, images, datePosted: new Date() }]);
  if (error) return res.status(500).json({ error: error.message });

  res.status(201).json({ message: 'Lost item post created' });
});

router.get('/search', async (req: Request, res: Response) => {
  const { q } = req.query;
  if (!q || typeof q !== 'string') return res.status(400).json({ error: 'Missing search query' });

  const { data, error } = await supabase.from<LostItemPost>('lost_item_posts').select('*').ilike('description', `%${q}%`);
  if (error) return res.status(500).json({ error: error.message });

  res.json(data);
});

export default router;
