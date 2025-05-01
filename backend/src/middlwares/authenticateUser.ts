import { createClient } from "@supabase/supabase-js";
import { Response, Request, NextFunction } from "express";
require("dotenv").config();


export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader: string | undefined = req.headers.authorization;
  const supabase = createClient(process.env.PROJECT_URL!, process.env.ANON_KEY!);

  if (authHeader) {
    const token = authHeader.split(" ")[1];

    if (!token) return res.status(401).json({ error: 'No token provided' });

    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) return res.status(401).json({ error: 'Invalid token' });

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  } else {
    return res.status(401).json({ error: 'Authorization header missing' });
  }
}
