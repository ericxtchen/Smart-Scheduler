import { Request, Response } from 'express';
import { db } from '../db/index';

const getEvents = async (req: Request, res: Response) => {
  try {
    const uuid = req.user!.id;

    
  } catch (error) {
    if (error instanceof Error) {
      console.log(error);
      res.send(`Error: ${error.message}`);
    } 
  }
}
