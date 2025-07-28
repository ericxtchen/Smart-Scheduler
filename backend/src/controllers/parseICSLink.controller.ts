import { Request, Response } from 'express';
import { db } from '../db/index';
import { calendarSources, userCalendars } from '../db/schema';

export const parseICSLink = async (req: Request, res: Response) => {
  try {
    console.log(req.body);
    //const body = JSON.parse(req.body);
    const url = req.body.url;
    console.log(req.body.url);
    //console.log(req);
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

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error })
    console.log(error);
  }
}

