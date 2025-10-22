import { Router } from "express";
import type { Response } from "express";
import type { Request } from "express";
import { supabase } from '../supabaseClient.ts';
import type { Notification } from '../types.ts';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { userID, message, status } = req.body as Notification;
  if (!userID || !message) return res.status(400).json({ error: 'Missing fields' });

  const notifStatus = status || 'unread';
  const { error } = await supabase.from<Notification>('notifications').insert([{ userID, message, status: notifStatus, dateSent: new Date() }]);
  if (error) return res.status(500).json({ error: error.message });

  res.status(201).json({ message: 'Notification sent' });
});

router.put('/:id/read', async (req: Request, res: Response) => {
  const notifID = Number(req.params.id);
  const { error } = await supabase.from<Notification>('notifications').update({ status: 'read' }).eq('notifID', notifID);
  if (error) return res.status(500).json({ error: error.message });

  res.json({ message: 'Notification marked as read' });
});

export default router;
