import { Router } from "express";
import type { Response } from "express";
import type { Request } from "express";
import { supabase } from '../supabaseClient.ts';
import type { Claim } from '../types.ts';
import { authenticateSupabaseToken } from '../middleware/auth.ts';

const router = Router();

// Submit a claim for a lost item (protected route)
router.post('/:postID', authenticateSupabaseToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const postID = Number(req.params.postID);
    
    if (isNaN(postID)) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }

    const { claimDetails } = req.body;
    
    if (!claimDetails) {
      return res.status(400).json({ error: 'Missing claim details' });
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

    const claimData: Claim = {
      postID,
      userID: userData.userid,
      claimDetails,
      claimStatus: 'pending',
      dateClaimed: new Date()
    };

    const { error } = await supabase.from<Claim>('claims').insert([claimData]);
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json({ message: 'Claim submitted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get claims for a specific post
router.get('/post/:postID', authenticateSupabaseToken, async (req: Request, res: Response) => {
  try {
    const postID = Number(req.params.postID);

    if (isNaN(postID)) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }

    const { data, error } = await supabase
      .from<Claim>('claims')
      .select('*')
      .eq('postID', postID)
      .order('dateClaimed', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update claim status (for item owners to accept/reject claims)
router.put('/:claimID', authenticateSupabaseToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const claimID = Number(req.params.claimID);
    
    if (isNaN(claimID)) {
      return res.status(400).json({ error: 'Invalid claim ID' });
    }

    const { status } = req.body;
    
    if (!status || !['pending', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const { error } = await supabase
      .from<Claim>('claims')
      .update({ claimStatus: status })
      .eq('claimID', claimID);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ message: 'Claim status updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
