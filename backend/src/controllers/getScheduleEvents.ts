import { Request, Response } from "express";
import { db } from "../db";
import { scheduleEvents } from "../db/schema";
import { sql, eq } from "drizzle-orm";

export const getScheduleEvents = async (req: Request, res: Response) => {
    const { userId } = req.params;
    try {
        const dbEvents = await db
            .select({
                id: scheduleEvents.id,
                title: scheduleEvents.courseName,
                startRecur: scheduleEvents.startRecur,
                endRecur: scheduleEvents.endRecur,
                startTime: scheduleEvents.startTime,
                endTime: scheduleEvents.endTime,
                daysOfWeek: scheduleEvents.dayOfTheWeek,
                location: scheduleEvents.location,
                backgroundColor: sql`'#10B981'`
            })
            .from(scheduleEvents)
            .where(eq(scheduleEvents.userId, userId));

        res.json(dbEvents);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch schedule events." });
    }
}