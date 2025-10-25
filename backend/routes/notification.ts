import { Router } from "express";
import type { Response } from "express";
import type { Request } from "express";
import { supabase } from '../supabaseClient.ts';
import type { Notification } from '../types.ts';
import { authenticateSupabaseToken } from '../middleware/auth.ts';

const router = Router();

// Create a notification (protected route)
router.post('/', authenticateSupabaseToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { message, status } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Missing message' });
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

    const notifStatus = status || 'unread';
    const notifData: Notification = {
      userID: userData.userid,
      message,
      status: notifStatus,
      dateSent: new Date()
    };

    const { error } = await supabase.from<Notification>('notifications').insert([notifData]);
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json({ message: 'Notification sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all notifications for the current user
router.get('/', authenticateSupabaseToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
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

    const { data, error } = await supabase
      .from<Notification>('notifications')
      .select('*')
      .eq('userID', userData.userid)
      .order('dateSent', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark notification as read
router.put('/:id/read', authenticateSupabaseToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const notifID = Number(req.params.id);

    if (isNaN(notifID)) {
      return res.status(400).json({ error: 'Invalid notification ID' });
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

    // Verify the notification belongs to this user
    const { data: notifData, error: notifError } = await supabase
      .from('notifications')
      .select('*')
      .eq('notifID', notifID)
      .eq('userID', userData.userid)
      .single();

    if (notifError || !notifData) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    const { error } = await supabase
      .from<Notification>('notifications')
      .update({ status: 'read' })
      .eq('notifID', notifID);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
