import express from 'express';
import getEvents from '../controllers/getEvents';
import getUserCalendarSources from '../controllers/getUserCalendarSources';
import { getScheduleEvents } from '../controllers/getScheduleEvents';
import { icsProxy } from '../controllers/ICSProxy';
import { getPdfEvents } from '../controllers/getPdfEvents';

const eventsRouter = express.Router();

eventsRouter.get("/user-calendar-sources/:userId", getUserCalendarSources);
eventsRouter.get("/schedule-events/:userId", getScheduleEvents);
eventsRouter.get("/pdf-events/:userId", getPdfEvents);
eventsRouter.get("/events/:calendarSourceId", getEvents);
eventsRouter.get("/ics-proxy", icsProxy)

export default eventsRouter;
