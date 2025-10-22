import { Router } from "express";
import type { Response } from "express";
import type { Request } from "express";
import { supabase } from '../supabaseClient.ts';
import type { Claim } from '../types.ts';

const router = Router();

router.post('/:postID', async (req: Request, res: Response) => {
  const postID = Number(req.params.postID);
  const { userID, claimDetails } = req.body as { userID: number, claimDetails: string };
  if (!userID || !claimDetails) return res.status(400).json({ error: 'Missing fields' });

  const { error } = await supabase.from<Claim>('claims').insert([{ postID, userID, claimDetails, claimStatus: 'pending', dateClaimed: new Date() }]);
  if (error) return res.status(500).json({ error: error.message });

  res.status(201).json({ message: 'Claim submitted' });
});

export default router;
