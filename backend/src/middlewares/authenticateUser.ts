import { createClient, User } from "@supabase/supabase-js";
import { Response, Request, NextFunction } from "express";
require("dotenv").config();

interface AuthenticatedRequest extends Request {
  user?: User;
}

export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader: string | undefined = req.headers.authorization;
  const supabase = createClient(process.env.PROJECT_URL!, process.env.ANON_KEY!);

  if (!authHeader) {
    res.status(401).json({ error: 'Authorization header missing' }).end();
    return;
  }

  const token = authHeader.split(" ")[1];

  if (!token) { res.status(401).json({ error: 'No token provided' }).end(); return; }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) { res.status(401).json({ error: 'Invalid token' }).end(); return; }

    (req as AuthenticatedRequest).user = user; // stil gives an error
    next();
    return;
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' }).end();
    return;
  }
}

