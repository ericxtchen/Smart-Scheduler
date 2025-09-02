import { Request, Response } from "express";
import { db } from "../db";
import { pdfEvents } from "../db/schema";
import { eq, sql } from "drizzle-orm";

export const getPdfEvents = async (req: Request, res: Response) => {
    const { userId } = req.params;
    try {
        const dbEvents = await db
            .select({
                id: pdfEvents.id,
                title: pdfEvents.title,
                startTime: pdfEvents.startTime,
                allDay: pdfEvents.allDay,
                backgroundColor: sql`'#3B82F6'`
            })
            .from(pdfEvents)
            .where(eq(pdfEvents.userId, userId));

        res.json(dbEvents);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch PDF events." });
    }
}