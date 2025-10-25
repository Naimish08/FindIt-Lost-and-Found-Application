import { Router } from "express";
import type { Response } from "express";
import type { Request } from "express";
import { supabase } from "../supabaseClient.ts";
import { authenticateSupabaseToken } from "../middleware/auth.ts";

const router = Router();

router.post("/register", async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Use Supabase Auth to register the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username, // Store username in user_metadata
        },
      },
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({ 
      message: "User registered successfully",
      user: data.user 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Use Supabase Auth to sign in the user
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    // Return the session data with access token
    res.json({
      message: "Login successful",
      user: data.user,
      session: data.session,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get current user profile
router.get("/profile", authenticateSupabaseToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Get user data from Supabase
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", req.user.email)
      .single();

    if (error) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;