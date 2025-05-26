import ICAL from 'ical.js'; //use node-ical to get ics from url as I am no longer supporting strict ics file
// or deliver the ics link to backend via http, fetch the url, validate it, save it to disk, and then use ICAL on it?
import { Request, Response } from 'express';
import { db } from '../db/index';

// TODO :
// Change this code to only get data from ics links as well.
// Maybe also support ics files that add a single event to the calendar
// Put the events into the database.
// A lot of repetitve code as the events need to be parsed and put in the database the same way regardless if it is a file or url
// Maybe put some of the code into a common function
const parseICS = async (req: Request, res: Response) => {
  try {
    if (req.file) { // if file is uploaded
      const jCalEvents = ICAL.parse(req.file?.buffer.toString('utf-8'));
      const parsedEvents = new ICAL.Component(jCalEvents);
      const events = parsedEvents.getAllSubcomponents('vevent').map((vevent: ICAL.Component) => {
        const event = new ICAL.Event(vevent);
        return {
          uid: event.uid,
          summary: event.summary,
          description: event.description,
          start: event.startDate.toJSDate(),
          end: event.endDate.toJSDate(),
          // Extract any other properties you need
        };
      });
      console.log(req.user);
      //console.log(db.select().from(users).then((allUsers) => console.log(allUsers))) // does this query the users table in the public schema? output looks generic
      res.status(200).json({ success: 'true', events });
    }

    // check if the body is not empty instead
    if (req.body) { // if url is uploaded
      const url = JSON.stringify(req.body);
      if (!url) {
        res.status(400).json({ error: 'URL is required' });
      }

      const response = await fetch(url);

      if (!response.ok) {
        res.status(response.status).json({
          error: `Failed to fetch ICS file: ${response.statusText}`
        });
      }

      const icsData = await response.text();

      // Parse with ical.js
      const jcalData = ICAL.parse(icsData);
      const comp = new ICAL.Component(jcalData);
      const vevents = comp.getAllSubcomponents('vevent');

      // Format events for response
      const formattedEvents = vevents.map(vevent => {
        const event = new ICAL.Event(vevent);

        return {
          uid: event.uid,
          summary: event.summary,
          description: event.description || '',
          location: event.location || '',
          start: event.startDate.toJSDate(),
          end: event.endDate.toJSDate(),
          isRecurring: event.isRecurring(),
          // Include additional properties as needed
        };
      });
      res.status(200).json({ success: 'true', formattedEvents });
    }

  } catch (error) {
    if (error instanceof Error) {
      console.log(error);
      res.send(`Error: ${error.message}`) // some error here?
    }
  }
}

export default parseICS;
