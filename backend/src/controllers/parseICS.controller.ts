import ICAL from 'ical.js';
import { Request, Response } from 'express';
import { db } from '../db/index';
import { calendarSources, events, userCalendars } from '../db/schema';
import { eq, inArray } from 'drizzle-orm';

interface EventInterface {
  id?: string,
  calendarSourceId: string,
  externalId: string,
  lastModified: Date,
  createdAt?: Date,
  title: string,
  description: string,
  location: string,
  startTime: Date,
  endTime: Date,
  allDay: boolean
}

const parseICS = async (req: Request, res: Response) => {
  try {
    if (req.file) {
      // INSERT INTO CALENDAR SOURCES 
      const name = req.user!.id + Math.random().toString(36).slice(2);
      const [newCalendarSource] = await db.insert(calendarSources)
        .values({
          name: name,
          createdBy: req.user!.id,
        })
        .returning({ id: calendarSources.id });

      const calendarSourceId = newCalendarSource.id;

      // INSERT INTO USER CALENDARS
      await db.insert(userCalendars)
        .values({
          userId: req.user!.id,
          calendarSourceId: calendarSourceId,
          isVisible: true,
          color: '#4F46E5'
        });

      // PARSE ICS DATA
      const jCalEvents = ICAL.parse(req.file?.buffer.toString('utf-8'));
      const parsedEvents = new ICAL.Component(jCalEvents);
      const cal_events = parsedEvents.getAllSubcomponents('vevent').map((vevent: ICAL.Component) => {
        const event = new ICAL.Event(vevent);
        //const rruleProperty = vevent.getFirstProperty('rrule');
        return {
          uid: event.uid,
          summary: event.summary,
          description: event.description,
          location: event.location,
          start: event.startDate.toJSDate(),
          end: event.endDate.toJSDate(),
          all_day: event.startDate.isDate || event.endDate.isDate
          // status, categories, url not supported in ICAL.Event type
        };
      });
      //console.log(req.user);
      //console.log(req.body);

      // DUPLICATE CHECK AND INSERT EVENTS
      const userCalendarSourceIds = await db
        .select({ id: userCalendars.calendarSourceId })
        .from(userCalendars)
        .where(eq(userCalendars.userId, req.user!.id));

      const accessibleSourceIds = userCalendarSourceIds.map(uc => uc.id);
      let existingEventsMap = new Map<string, any>();

      if (accessibleSourceIds.length > 0) {
        const existingDbEvents = await db
          .select({
            id: events.id,
            externalId: events.externalId,
            title: events.title,
            description: events.description,
            startTime: events.startTime,
            endTime: events.endTime,
            allDay: events.allDay
          })
          .from(events)
          .where(inArray(events.calendarSourceId, accessibleSourceIds));

        existingDbEvents.forEach(event => {
          existingEventsMap.set(event.externalId!, event);
        });
      }

      for (const cal_event of cal_events) {
        console.log(cal_event);
      }

      const eventsToInsert: EventInterface[] = [];
      const eventsToUpdate: { id: string, payload: any }[] = [];
      let addedCount = 0;
      let updatedCount = 0;

      for (const cal_event of cal_events) {
        const externalId = cal_event.uid; // uid property in ical.js library is mapped to externalId
        const existingEvent = existingEventsMap.get(externalId);

        const startTime = cal_event.start;
        const endTime = cal_event.end;

        const newEventComparable = {
          title: cal_event.summary,
          description: cal_event.description,
          location: cal_event.location,
          startTime: startTime,
          endTime: endTime,
          allDay: cal_event.all_day || false
        };

        if (existingEvent) {
          const existingEventComparable = {
            title: existingEvent.title,
            description: existingEvent.description,
            location: existingEvent.location,
            startTime: new Date(existingEvent.startTime),
            endTime: new Date(existingEvent.endTime),
            allDay: existingEvent.allDay
          }

          if (JSON.stringify(newEventComparable) !== JSON.stringify(existingEventComparable)) {
            eventsToUpdate.push({
              id: existingEvent.id,
              payload: {
                calendarSourceId: calendarSourceId,
                externalId: externalId,
                lastModified: new Date(),
                ...newEventComparable
              }
            });
            updatedCount++;
          }

        } else {
          eventsToInsert.push({
            calendarSourceId: calendarSourceId,
            externalId: externalId,
            lastModified: new Date(),
            createdAt: new Date(),
            ...newEventComparable
          });
          addedCount++;
        }
      }

      console.log("Events to Insert length" + eventsToInsert.length);
      console.log("Events to Update length" + eventsToUpdate.length);

      if (eventsToInsert.length > 0) {
        console.log(`Inserting ${eventsToInsert.length} events now.`);
        await db.insert(events).values(eventsToInsert);
        console.log("Done inserting events.")
      }
      if (eventsToUpdate.length > 0) {
        console.log(`Updating ${eventsToUpdate.length} events now.`)
        for (const eventToUpdate of eventsToUpdate) {
          await db
            .update(events)
            .set(eventToUpdate.payload)
            .where(eq(events.id, eventToUpdate.id));
        }
        console.log("Done updating events.")
      }

      res.status(200).json({ sucess: true, message: 'Calendar and events imported successfully.', added_events: addedCount, updated_events: updatedCount });
    }

    // check if the body is not empty instead
    else if (req.body) { // if url is uploaded
      const url = JSON.stringify(req.body);
      console.log(req.body);
      if (!url) {
        res.status(400).json({ error: 'URL is required' });
      }

      const response = await fetch(url);

      if (!response.ok) {
        res.status(response.status).json({
          error: `Failed to fetch ICS file: ${response.statusText}`
        });
      }

      // INSERT INTO CALENDAR SOURCES
      const name = "asdasdasdasdsadas";
      const [newCalendarSourceId] = await db.insert(calendarSources)
        .values({
          name: name,
          createdBy: req.user!.id,
          url: url
        })
        .returning({ id: calendarSources.id });

      const calendarSourceId = newCalendarSourceId.id;

      // INSERT INTO USER CALENDARS
      await db.insert(userCalendars)
        .values({
          userId: req.user!.id,
          calendarSourceId: calendarSourceId,
          isVisible: true,
          color: "#4F46E5"
        })
    }

  } catch (error) {
    if (error instanceof Error) {
      console.log(error);
      res.status(500).json({ message: "Internal Server Error while parsing ICS data." });
    }
  }
}

export default parseICS;
