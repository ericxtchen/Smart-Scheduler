import { Request, Response } from 'express';
import { db } from '../db/index';
import { userCalendars, events, calendarSources } from '../db/schema';
import { eq, and } from 'drizzle-orm';

const getEvents = async (req: Request, res: Response) => {
  try {
    const uuid = req.user!.id;

    const visibleCalendars = await db
      .select({
        calendarSourceId: userCalendars.calendarSourceId,
        color: userCalendars.color,
        calendarName: calendarSources.name
      })
      .from(userCalendars)
      .innerJoin(calendarSources, eq(userCalendars.calendarSourceId, calendarSources.id))
      .where(
        and(
          eq(userCalendars.userId, uuid),
          eq(userCalendars.isVisible, true),
          eq(calendarSources.IsActive, true)
        )
      );


  } catch (error) {
    if (error instanceof Error) {
      console.log(error);
      res.send(`Error: ${error.message}`);
    }
  }
}

export { getEvents };
