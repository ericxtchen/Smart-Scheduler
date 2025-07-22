import { Request, Response } from "express";
import { db } from "../db";
import { events } from "../db/schema";
import { eq, sql } from "drizzle-orm";

const getEvents = async (req: Request, res: Response) => {
  const { calendarSourceId } = req.params;
  const dbEvents = await db
    .select({
      id: events.id,
      title: events.title,
      start: events.startTime,
      end: events.endTime,
      allDay: events.allDay,
      description: events.description,
      location: events.location,
      backgroundColor: sql`'#4F46E5'`
    })
    .from(events)
    .where(eq(events.calendarSourceId, calendarSourceId));

  res.json(dbEvents);
}

export default getEvents;
