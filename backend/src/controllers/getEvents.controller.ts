import { Request, Response } from 'express';
import { db } from '../db/index';
import { userCalendars, events, calendarSources } from '../db/schema';
import { eq, and, gte, lte, inArray } from 'drizzle-orm';

//TODO:
//Test this endpoint and functionality


type calInfo = {
  [key: string]: information
}

type information = {
  color: string | null,
  name: string
}


const getEvents = async (req: Request, res: Response) => {
  try {
    const uuid = req.user!.id;

    const startDate = req.query.start ? new Date(String(req.query.start)) : new Date();
    const endDate = req.query.end ? new Date(String(req.query.end)) : new Date();

    // Get users visible calendars
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

    if (visibleCalendars.length === 0) {
      res.json([]);
    }

    // Get calendar calendarSources
    const calendarSourceIds = visibleCalendars.map(cal => cal.calendarSourceId);

    //Get color and name of calendar (calendar property not event property)
    const calendarInfo: calInfo = {};
    visibleCalendars.forEach(cal => {
      calendarInfo[cal.calendarSourceId] = {
        color: cal.color,
        name: cal.calendarName
      };
    });

    // Get events from db from the calendar sources.
    const dbEvents = await db
      .select()
      .from(events)
      .where(
        and(
          inArray(events.calendarSourceId, calendarSourceIds),
          gte(events.endTime, startDate),
          lte(events.startTime, endDate)
        )
      )

    // Turn dbEvents into a format for FullCalendar on frontend
    const fullCalendarEvents = dbEvents.map(event => {
      const fullCalendarEvent = {
        id: event.id,
        title: event.title,
        start: event.startTime.toISOString(),
        allDay: event.allDay,

        end: event.endTime ? event.endTime.toISOString() : null,
        backgroundColor: calendarInfo.color,
        borderColor: calendarInfo.color,

        description: event.description,
        location: event.location,
        //status: event.status,
        //categories: event.categories,
        //url: event.url,
        calendarName: calendarInfo.name,
        externalId: event.externalId
      }

      if (event.allDay) {
        fullCalendarEvent.start = event.startTime.toISOString().split('T')[0];
        if (event.endTime) {
          fullCalendarEvent.end = event.endTime.toISOString().split('T')[0];
        }
      }

      return fullCalendarEvent;
    })

    res.json(fullCalendarEvents);

  } catch (error) {
    if (error instanceof Error) {
      console.log(error);
      res.send(`Error: ${error.message}`);
    }
  }
}

export { getEvents };
