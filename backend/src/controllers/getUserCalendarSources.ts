import { Request, Response } from "express"
import { db } from "../db";
import { userCalendars, calendarSources } from "../db/schema";
import { eq, sql, and } from "drizzle-orm";

const getUserCalendarSources = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const userCalendarSources = await db
    .select({
      calendarSourceId: userCalendars.calendarSourceId,
      color: userCalendars.color,
      calendarName: calendarSources.name,
      url: calendarSources.url,
      hasStoredEvents: sql`CASE WHEN ${calendarSources.url} IS NULL THEN true ELSE false END`
    })
    .from(userCalendars)
    .innerJoin(calendarSources, eq(userCalendars.calendarSourceId, calendarSources.id))
    .where(
      and(
        eq(userCalendars.userId, userId),
        eq(userCalendars.isVisible, true),
        eq(calendarSources.IsActive, true)
      )
    )

  res.json(userCalendarSources);
}

export default getUserCalendarSources;
