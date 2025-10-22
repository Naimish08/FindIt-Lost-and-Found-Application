import { Router } from "express";
import type { Response } from "express";
import type { Request } from "express";
import bcrypt from "bcrypt";
import { supabase } from "../supabaseClient.ts";

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
    const {username, email, password} = req.body as {username: string, email: string, password: string};
    if(!username || !email || !password) {
        return res.status(400).json({error: "Missing required fields"});
    }
    
    const hash =  await bcrypt.hash(password, 10);

    const {error} = await supabase.from('users').insert([{username, email, password: hash}]);
    if(error) {
        return res.status(500).json({error: error.message});
    }

    return res.status(201).json({message: "User registered successfully"});
});

export default router;