import { Router } from "express";
import type { Response } from "express";
import type { Request } from "express";
import bcrypt from "bcrypt";
import { supabase } from "../supabaseClient.ts";

const router = Router();

router.post("/register", async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if email already exists
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      throw fetchError;
    }

    if (existingUser) {
      return res.status(409).json({ error: "Email already registered" });
    }

    // Hash password
    const hash = await bcrypt.hash(password, 10);

    // Insert new user
    const { error: insertError } = await supabase.from("users").insert([
      {
        username,
        email,
        password: hash,
        profilepicture: null,
      },
    ]);

    if (insertError) {
      throw insertError;
    }

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;