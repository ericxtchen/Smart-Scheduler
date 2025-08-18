import { Request, Response } from "express";

export const icsProxy = async (req: Request, res: Response) => {
    try {
        const url = req.query.url;
        if(!url) {
            res.status(400).json({error: "No URL prdovided"})
        } else{
            const response = await fetch(url as string);
            const data = await response.text();
            res.setHeader('Content-Type', 'text/calendar');
            res.status(200).send(data)
        }
    } catch (error) {
        res.status(500).json({error: "Failed to fetch ICS link."});
    }
}