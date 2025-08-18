import { Request, Response } from "express";
import pdf from 'pdf-parse';
import { db } from "../db";
import { SyllabusEvent, extractEvents } from "../utils/extractEventsFromPdf";
import { events } from "../db/schema";

interface FullCalendarEvent {
    title: string;      // Event title (e.g., "Midterm Exam on Chapters 1-5")
    startTime: Date;      // ISO Date string (e.g., "2025-10-25")
    allDay: boolean;    // Is it an all-day event?
    lastModified: Date; 
}

const formatEventsForCalendar = (syllabusEvents: SyllabusEvent[]): FullCalendarEvent[] => {
    return syllabusEvents.map(event => {
        // Convert the Date object to a 'YYYY-MM-DD' string.

        return {
            title: event.context, // The full line is a great, descriptive title
            startTime: event.parsedDate,
            allDay: true,
            lastModified: new Date(),
        };
    });
};

export const pdfController = async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded.' });
  }

  try {
    const data = await pdf(req.file!.buffer)
    const parsedEvents = extractEvents(data.text);
    const calendarEvents = formatEventsForCalendar(parsedEvents);
    await db.insert(events).values(calendarEvents);
  } catch (error) {
    res.status(500).json({error: "Internal Server Error parsing pdf."})
  }
}
